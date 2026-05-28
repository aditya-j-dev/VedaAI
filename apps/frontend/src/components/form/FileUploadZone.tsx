'use client';

import { useRef, useState } from 'react';
import { UploadCloud, FileText, X, Loader2, AlertCircle } from 'lucide-react';
import { useFileExtract } from '@/hooks/useFileExtract';

interface FileUploadZoneProps {
  onFileSelected: (file: File | null, extractedText: string) => void;
}

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.txt';
const MAX_SIZE_MB = 10;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUploadZone({ onFileSelected }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { extractFromFile, status, error: extractError } = useFileExtract();

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return 'Unsupported file type. Please upload PDF, PNG, JPG, or TXT.';
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large. Maximum size is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFile = async (file: File) => {
    const err = validateFile(file);
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    setSelectedFile(file);

    try {
      const result = await extractFromFile(file);
      onFileSelected(file, result.text);
    } catch {
      onFileSelected(file, '');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setValidationError(null);
    onFileSelected(null, '');
    if (inputRef.current) inputRef.current.value = '';
  };

  // ── Selected File State ────────────────────────────────────────────────────
  if (selectedFile) {
    return (
      <div className="border-2 border-border-input rounded-[16px] p-5 bg-bg-input/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-[10px] shadow-card flex items-center justify-center flex-shrink-0">
              <FileText size={20} className="text-orange" />
            </div>
            <div>
              <p className="font-medium text-[14px] text-primary truncate max-w-[200px]">
                {selectedFile.name}
              </p>
              <p className="text-[12px] text-muted">
                {formatBytes(selectedFile.size)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {status === 'extracting' && (
              <div className="flex items-center gap-1.5 text-muted">
                <Loader2 size={14} className="spin-loader" />
                <span className="text-[12px]">Extracting text...</span>
              </div>
            )}
            {status === 'done' && (
              <span className="text-[12px] text-green font-medium">✓ Text extracted</span>
            )}
            {(selectedFile.type.startsWith('image/') || status === 'done') && selectedFile.type.startsWith('image/') && (
              <span className="text-[12px] text-muted">Image uploaded</span>
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="w-7 h-7 flex items-center justify-center text-faint hover:text-danger transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {extractError && (
          <p className="text-[12px] text-danger mt-2 flex items-center gap-1">
            <AlertCircle size={12} />
            {extractError}
          </p>
        )}
      </div>
    );
  }

  // ── Empty / Drag State ────────────────────────────────────────────────────
  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-[16px] p-8 flex flex-col items-center gap-3
          cursor-pointer transition-all duration-200
          ${dragging
            ? 'border-orange bg-orange/5 scale-[1.01]'
            : 'border-border-light hover:border-faint hover:bg-bg-input/30'
          }`}
      >
        <div className={`w-12 h-12 flex items-center justify-center transition-colors ${dragging ? 'text-orange' : 'text-faint'}`}>
          <UploadCloud size={36} />
        </div>
        <div className="text-center">
          <p className="font-medium text-[15px] text-primary">
            {dragging ? 'Drop it here!' : 'Choose a file or drag & drop it here'}
          </p>
          <p className="text-[13px] text-muted mt-1">PDF, PNG, JPG, TXT — up to 10MB</p>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          className="px-5 h-9 border border-border-light rounded-pill
            text-[13px] font-medium text-primary hover:bg-bg-input transition-colors"
        >
          Browse Files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleInputChange}
          className="hidden"
          id="file-upload-input"
        />
      </div>

      {validationError && (
        <p className="text-[12px] text-danger mt-2 flex items-center gap-1">
          <AlertCircle size={12} />
          {validationError}
        </p>
      )}
    </div>
  );
}
