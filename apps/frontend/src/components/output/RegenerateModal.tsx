'use client';

import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { assignmentApi } from '@/lib/api';
import { useAssignmentStore } from '@/store/assignmentStore';
import toast from 'react-hot-toast';

interface RegenerateModalProps {
  assignmentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function RegenerateModal({ assignmentId, isOpen, onClose }: RegenerateModalProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { setGenerationStatus, setCurrentResult } = useAssignmentStore();

  if (!isOpen) return null;

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await assignmentApi.regenerate(assignmentId);
      setCurrentResult(null);
      setGenerationStatus('queued', 5, 'Re-queuing generation...');
      toast.success('Regeneration started!');
      onClose();
    } catch (err) {
      toast.error('Failed to start regeneration. Please try again.');
      setIsRegenerating(false);
    }
  };

  return (
    <div className="overlay-backdrop animate-fade-in" role="dialog" aria-modal="true">
      <div className="bg-white rounded-[24px] p-8 mx-4 w-full max-w-sm shadow-dropdown animate-slide-up">
        {/* Icon */}
        <div className="w-12 h-12 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={22} className="text-orange" />
        </div>

        <h3 className="font-bold text-[18px] text-primary text-center mb-2">
          Regenerate Question Paper?
        </h3>
        <p className="text-[14px] text-muted text-center mb-7 leading-relaxed">
          This will replace the current question paper with a newly generated one. This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isRegenerating}
            className="btn-outline flex-1 justify-center"
            id="regenerate-cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="btn-dark flex-1 justify-center disabled:opacity-70"
            id="regenerate-confirm"
          >
            {isRegenerating ? (
              <>
                <Loader2 size={16} className="spin-loader" />
                Starting...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Regenerate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
