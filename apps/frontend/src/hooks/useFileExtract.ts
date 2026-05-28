'use client';

import { useState, useCallback } from 'react';

export type ExtractionStatus = 'idle' | 'extracting' | 'done' | 'error';

export interface FileExtractResult {
  text: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Client-side file text extraction hook.
 * - PDF: uses pdfjs-dist to extract text page by page
 * - TXT: uses FileReader.readAsText
 * - Images: returns empty text (backend/AI handles from file)
 */
export function useFileExtract() {
  const [status, setStatus] = useState<ExtractionStatus>('idle');
  const [result, setResult] = useState<FileExtractResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extractFromFile = useCallback(async (file: File): Promise<FileExtractResult> => {
    setStatus('extracting');
    setError(null);

    try {
      let text = '';

      if (file.type === 'application/pdf') {
        // Dynamic import to avoid SSR issues
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

        const textParts: string[] = [];
        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items
            .filter((item): item is any => 'str' in item)
            .map((item: any) => item.str)
            .join(' ');
          textParts.push(pageText);
        }
        text = textParts.join('\n\n').slice(0, 5000);

      } else if (file.type === 'text/plain') {
        text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string).slice(0, 5000));
          reader.onerror = reject;
          reader.readAsText(file);
        });

      } else if (file.type.startsWith('image/')) {
        // Image files — AI will use the file directly on backend
        text = '';
      }

      const extractResult: FileExtractResult = {
        text,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      };

      setResult(extractResult);
      setStatus('done');
      return extractResult;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to extract text';
      setError(message);
      setStatus('error');
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return { extractFromFile, status, result, error, reset };
}
