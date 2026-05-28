'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import FileUploadZone from './FileUploadZone';

interface Step2Data {
  file: File | null;
  extractedText: string;
}

interface Step2Props {
  initialData?: Partial<Step2Data>;
  onNext: (data: Step2Data) => void;
  onPrev: () => void;
}

export default function Step2Upload({ initialData, onNext, onPrev }: Step2Props) {
  const [file, setFile] = useState<File | null>(initialData?.file ?? null);
  const [extractedText, setExtractedText] = useState(initialData?.extractedText ?? '');
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelected = (f: File | null, text: string) => {
    setFile(f);
    setExtractedText(text);
  };

  const handleNext = () => {
    onNext({ file, extractedText });
  };

  const handleSkip = () => {
    onNext({ file: null, extractedText: '' });
  };

  return (
    <div className="bg-white rounded-form p-8 animate-fade-in">
      {/* Card Header */}
      <h2 className="font-bold text-[20px] text-primary">Upload Material</h2>
      <p className="text-[14px] text-muted/80 mt-0.5 mb-2">
        Optionally upload source material to generate topic-specific questions
      </p>
      <p className="text-[13px] text-muted mb-7 bg-bg-input rounded-[10px] px-3 py-2 inline-block">
        💡 Supported: PDF (text extracted automatically), PNG, JPG, TXT — up to 10MB
      </p>

      {/* Upload Zone */}
      <FileUploadZone onFileSelected={handleFileSelected} />

      {/* Extracted Text Preview */}
      {extractedText && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-primary">Extracted Text Preview</span>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-[12px] text-muted hover:text-primary transition-colors"
            >
              {showPreview ? 'Hide' : 'Show'}
            </button>
          </div>
          {showPreview && (
            <div className="bg-bg-input rounded-[12px] p-4 max-h-48 overflow-y-auto">
              <p className="text-[12px] text-muted leading-relaxed whitespace-pre-wrap">
                {extractedText.slice(0, 500)}
                {extractedText.length > 500 && (
                  <span className="text-faint italic"> ...({extractedText.length - 500} more chars)</span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-8">
        <button
          type="button"
          onClick={onPrev}
          className="btn-outline"
          id="step2-prev"
        >
          <ArrowLeft size={16} />
          Previous
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="flex items-center gap-2 text-[14px] text-muted hover:text-primary transition-colors"
            id="step2-skip"
          >
            <SkipForward size={15} />
            Skip this step
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="btn-dark"
            id="step2-next"
          >
            Next
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
