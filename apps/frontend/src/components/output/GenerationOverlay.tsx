'use client';

import { Sparkles, Loader2 } from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';

const STEP_MESSAGES = [
  'Analyzing your assignment details...',
  'Building AI prompt...',
  'Generating questions with AI...',
  'Structuring sections and questions...',
  'Saving your question paper...',
];

export default function GenerationOverlay() {
  const { generationStatus, generationProgress, progressMessage } = useAssignmentStore();

  if (generationStatus !== 'queued' && generationStatus !== 'processing') {
    return null;
  }

  return (
    <div className="overlay-backdrop animate-fade-in" role="dialog" aria-label="Generating question paper">
      <div className="bg-white rounded-[24px] p-10 mx-4 w-full max-w-md shadow-dropdown animate-slide-up">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16">
            <div className="w-16 h-16 rounded-full border-4 border-border-input" />
            <div
              className="absolute inset-0 w-16 h-16 rounded-full border-4 border-orange border-t-transparent spin-loader"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles size={22} className="text-orange animate-pulse" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-[20px] text-primary text-center mb-1">
          Generating Question Paper
        </h3>
        <p className="text-[14px] text-muted text-center mb-8">
          Our AI is crafting your assessment. Please wait...
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[13px] font-medium text-muted">Progress</span>
            <span className="text-[13px] font-bold text-primary">{generationProgress}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="h-full bg-dark rounded-full transition-all duration-700 ease-out progress-pulse"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
        </div>

        {/* Live Message */}
        <div className="flex items-center gap-2 bg-bg-input rounded-[12px] px-4 py-3">
          <Loader2 size={14} className="spin-loader text-orange flex-shrink-0" />
          <p className="text-[13px] text-muted">
            {progressMessage || 'Initializing...'}
          </p>
        </div>

        {/* Steps indicator */}
        <div className="mt-5 flex justify-center gap-1.5">
          {[10, 25, 45, 70, 85].map((threshold, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-all duration-500 
                ${generationProgress >= threshold ? 'bg-dark' : 'bg-border-input'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
