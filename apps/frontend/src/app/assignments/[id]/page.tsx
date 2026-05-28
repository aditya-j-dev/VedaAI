'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Download, RefreshCw, Sparkles } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import QuestionPaper from '@/components/output/QuestionPaper';
import GenerationOverlay from '@/components/output/GenerationOverlay';
import RegenerateModal from '@/components/output/RegenerateModal';
import ErrorState from '@/components/output/ErrorState';
import { useAssignmentSocket } from '@/hooks/useAssignmentSocket';
import { useAssignmentStore } from '@/store/assignmentStore';
import { assignmentApi } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Assignment } from '@vedaai/shared';

export default function AssignmentOutputPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const isGenerating = searchParams?.get('generating') === 'true';

  const {
    generationStatus,
    currentResult,
    setCurrentResult,
    setGenerationStatus,
    resetGeneration,
  } = useAssignmentStore();

  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [summaryMessage, setSummaryMessage] = useState('');
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  // Connect WebSocket for real-time updates
  useAssignmentSocket(id);

  // On mount: fetch assignment details + set status appropriately
  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      try {
        const res = await assignmentApi.get(id);
        const assignmentData = res.data.data;
        setAssignment(assignmentData);

        // If not actively generating from url redirection, set correct status based on fetched assignment
        if (!isGenerating && !currentResult) {
          if (assignmentData.status === 'rate_limited') {
            setGenerationStatus('rate_limited', 0, 'Gemini API quota exceeded.');
          } else if (assignmentData.status === 'failed') {
            setGenerationStatus('failed', 0, 'Generation failed.');
          } else if (assignmentData.status === 'processing' || assignmentData.status === 'queued') {
            setGenerationStatus(assignmentData.status, assignmentData.status === 'queued' ? 5 : 45, 'Connecting to generation service...');
          }
        }
      } catch (err) {
        console.error('Failed to fetch assignment details:', err);
      }
    };

    fetchAssignmentDetails();

    if (isGenerating) {
      setGenerationStatus('queued', 5, 'Connecting to generation service...');
    } else {
      fetchExistingResult();
    }

    return () => {
      resetGeneration();
    };
  }, [id]);

  // When generation completes, the WS hook already fetches result via setCurrentResult
  // Also build a summary message for the dark banner
  useEffect(() => {
    if (currentResult) {
      const totalQ = currentResult.sections.reduce((s, sec) => s + sec.questions.length, 0);
      setSummaryMessage(
        `Here is your customized question paper for ${currentResult.subject} — ${currentResult.grade} with ${totalQ} questions across ${currentResult.sections.length} sections, totaling ${currentResult.totalMarks} marks.`
      );
    }
  }, [currentResult]);

  const fetchExistingResult = async () => {
    try {
      const res = await assignmentApi.getResult(id);
      setCurrentResult(res.data.data);
      setGenerationStatus('completed', 100, 'Done');
    } catch {
      // Wait for WS or dynamic check inside useEffect
    }
  };

  const handleRetry = () => {
    setShowRegenerateModal(true);
  };

  const handleDownloadPDF = () => {
    const pdfUrl = assignmentApi.getPDFUrl(id, showDifficulty);
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `question-paper-${id}.pdf`;
    a.click();
  };

  // ── Error State ────────────────────────────────────────────────────────
  if (generationStatus === 'failed' || generationStatus === 'rate_limited') {
    return (
      <AppShell showBack showSparkle breadcrumb="Create New">
        <ErrorState assignmentId={id} onRetry={handleRetry} assignment={assignment} />
        <RegenerateModal
          assignmentId={id}
          isOpen={showRegenerateModal}
          onClose={() => setShowRegenerateModal(false)}
        />
      </AppShell>
    );
  }

  return (
    <AppShell showBack>
      {/* Generation Overlay — rendered over everything while generating */}
      <GenerationOverlay />

      <div className="max-w-3xl mx-auto animate-fade-in">
        {currentResult && (
          <>
            {/* ── Dark Banner ── */}
            <div className="bg-banner rounded-[16px] p-5 sm:p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <p className="text-white text-[14px] font-medium leading-relaxed flex-1">
                <Sparkles size={14} className="inline mr-1.5 text-orange" />
                {summaryMessage}
              </p>
              <div className="flex flex-wrap items-center gap-3 md:flex-shrink-0">
                {/* Difficulty Toggle */}
                <label className="flex items-center gap-2 cursor-pointer mr-2">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={showDifficulty}
                      onChange={() => setShowDifficulty(!showDifficulty)}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${showDifficulty ? 'bg-orange' : 'bg-white/20'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showDifficulty ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <span className="text-[13px] text-white font-medium select-none">Show Difficulty</span>
                </label>
                
                {/* Regenerate */}
                <button
                  onClick={() => setShowRegenerateModal(true)}
                  className="flex items-center gap-1.5 px-3 h-9 border border-white/30 rounded-[8px]
                    text-white text-[13px] hover:bg-white/10 transition-colors"
                  id="regenerate-btn"
                >
                  <RefreshCw size={13} />
                  Regenerate
                </button>

                {/* Download PDF */}
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1.5 px-3 h-9 border border-white/40 rounded-[8px]
                    text-white text-[13px] hover:bg-white/10 transition-colors"
                  id="download-pdf-btn"
                >
                  <Download size={13} />
                  Download as PDF
                </button>
              </div>
            </div>

            {/* ── Question Paper ── */}
            <QuestionPaper result={currentResult} showDifficulty={showDifficulty} />
          </>
        )}

        {/* While generating but no result yet — overlay handles display */}
        {!currentResult && (
          <div className="h-96 flex items-center justify-center">
            <p className="text-muted text-[14px]">Waiting for generation to complete...</p>
          </div>
        )}
      </div>

      {/* Regenerate Modal */}
      <RegenerateModal
        assignmentId={id}
        isOpen={showRegenerateModal}
        onClose={() => setShowRegenerateModal(false)}
      />
    </AppShell>
  );
}
