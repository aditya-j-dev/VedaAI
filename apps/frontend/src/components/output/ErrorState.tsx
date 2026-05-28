'use client';
import { XCircle, RefreshCw, AlertTriangle, Calendar, BookOpen, Layers, FileText } from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import type { Assignment } from '@vedaai/shared';

interface ErrorStateProps {
  assignmentId: string;
  onRetry: () => void;
  assignment?: Assignment | null;
}

export default function ErrorState({ assignmentId, onRetry, assignment }: ErrorStateProps) {
  const { progressMessage, resetGeneration, generationStatus } = useAssignmentStore();
  const isRateLimited = generationStatus === 'rate_limited';

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isRateLimited ? 'bg-orange/10' : 'bg-danger/10'}`}>
        {isRateLimited ? (
          <AlertTriangle size={32} className="text-orange" />
        ) : (
          <XCircle size={32} className="text-danger" />
        )}
      </div>

      <h2 className="font-bold text-[20px] text-primary mb-2 text-center">
        {isRateLimited ? 'AI Quota Limit Reached' : 'Generation Failed'}
      </h2>
      <p className="text-[14px] text-muted text-center max-w-md mb-2 leading-relaxed">
        {isRateLimited ? (
          <span>
            We couldn't generate your assignment because your Google Gemini AI API key has exceeded its quota. 
            Please <strong>upgrade your plan to pay-as-you-go</strong> on Google AI Studio to increase your limits, then click retry.
          </span>
        ) : (
          progressMessage || 'Something went wrong while generating your question paper.'
        )}
      </p>
      <p className="text-[13px] text-faint text-center mb-8">
        Assignment ID: {assignmentId}
      </p>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => {
            resetGeneration();
            window.history.back();
          }}
          className="btn-outline"
          id="error-go-back"
        >
          Go Back
        </button>
        <button
          onClick={onRetry}
          className="btn-dark"
          id="error-retry"
        >
          <RefreshCw size={16} />
          Retry Generation
        </button>
      </div>

      {assignment && (
        <div className="w-full max-w-lg mt-4 p-6 bg-white border border-[#e8eaed] rounded-[24px] shadow-sm text-left animate-slide-up">
          <h3 className="font-bold text-[16px] text-primary mb-4 pb-3 border-b border-border-input/50 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers size={16} className="text-orange" />
              Assignment Specifications
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              isRateLimited ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
            }`}>
              {isRateLimited ? 'rate limited' : 'failed'}
            </span>
          </h3>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-5">
            <div className="flex items-start gap-2.5">
              <BookOpen size={16} className="text-muted flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">Subject & Class</span>
                <span className="text-[13px] font-semibold text-primary block mt-0.5">
                  {assignment.subject} · {assignment.grade}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar size={16} className="text-muted flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">Due Date</span>
                <span className="text-[13px] font-semibold text-primary block mt-0.5">
                  {new Date(assignment.dueDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {assignment.fileName && (
              <div className="flex items-start gap-2.5 col-span-2 bg-[#f8f9fa] p-3 rounded-[12px] border border-[#e8eaed]/50">
                <FileText size={16} className="text-muted flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">Reference Source</span>
                  <span className="text-[13px] font-semibold text-primary block mt-0.5 truncate">
                    {assignment.fileName}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mb-5">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-2.5">
              Question Setup ({assignment.sections.length} Section{assignment.sections.length > 1 ? 's' : ''})
            </span>
            <div className="flex flex-col gap-2">
              {assignment.sections.map((sec, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-[#f8f9fa] border border-[#e8eaed]/50 px-4 py-3 rounded-[16px] text-[13px] hover:border-orange/20 transition-all duration-200"
                >
                  <span className="font-semibold text-primary">{sec.type}</span>
                  <span className="text-muted text-[12px] font-medium bg-white border border-[#e8eaed] px-2 py-0.5 rounded-[8px]">
                    {sec.numQuestions} Qs · {sec.marksPerQuestion}M each
                  </span>
                </div>
              ))}
            </div>
          </div>

          {assignment.additionalInfo && (
            <div className="bg-[#fcf8f6] border border-orange/10 rounded-[16px] p-4 text-[13px]">
              <span className="text-[11px] font-bold text-orange uppercase tracking-wider block mb-1">
                Additional Prompt Guidelines
              </span>
              <p className="text-muted-dark leading-relaxed italic font-medium">
                "{assignment.additionalInfo}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
