'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import Step1Details from '@/components/form/Step1Details';
import Step2Upload from '@/components/form/Step2Upload';
import Step3Review from '@/components/form/Step3Review';
import { assignmentApi } from '@/lib/api';
import { useAssignmentStore } from '@/store/assignmentStore';
import type { AssignmentSection } from '@vedaai/shared';
import toast from 'react-hot-toast';

interface FormAccumulator {
  // Step 1
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  sections: AssignmentSection[];
  additionalInfo: string;
  // Step 2
  file: File | null;
  extractedText: string;
}

const STEPS = ['Assignment Details', 'Upload Material', 'Review & Generate'];

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { addAssignment, setGenerationStatus } = useAssignmentStore();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<FormAccumulator>>({});

  // ── Progress Bar ────────────────────────────────────────────────────────
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  const handleStep1Next = (data: {
    title: string; subject: string; grade: string;
    dueDate: string; sections: AssignmentSection[]; additionalInfo: string;
  }) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2Next = (data: { file: File | null; extractedText: string }) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2Prev = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep3Prev = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Build multipart form data
      const fd = new FormData();
      fd.append('title', formData.title ?? '');
      fd.append('subject', formData.subject ?? '');
      fd.append('grade', formData.grade ?? '');
      fd.append('dueDate', formData.dueDate ?? '');
      fd.append('sections', JSON.stringify(formData.sections ?? []));
      if (formData.additionalInfo) fd.append('additionalInfo', formData.additionalInfo);
      if (formData.file) fd.append('file', formData.file); // field name: 'file'

      const res = await assignmentApi.create(fd);
      const assignment = res.data.data;

      addAssignment(assignment);
      setGenerationStatus('queued', 5, 'Job queued...');
      toast.success('Assignment created! Generating question paper...');

      // Navigate to output page with generating flag
      router.push(`/assignments/${assignment._id}?generating=true`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create assignment');
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell showBack breadcrumb="Create Assignment">
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-3 h-3 bg-green rounded-full flex-shrink-0" />
          <div>
            <h1 className="font-bold text-[20px] text-primary">Create Assignment</h1>
            <p className="text-[13px] text-muted">Set up a new assignment for your students</p>
          </div>
        </div>

        {/* Step Labels */}
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((label, i) => {
            const stepNum = (i + 1) as 1 | 2 | 3;
            return (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold
                  transition-colors ${currentStep > stepNum
                    ? 'bg-green text-white'
                    : currentStep === stepNum
                    ? 'bg-dark text-white'
                    : 'bg-border-input text-faint'
                  }`}>
                  {currentStep > stepNum ? '✓' : stepNum}
                </div>
                <span className={`text-[12px] font-medium hidden sm:block transition-colors
                  ${currentStep === stepNum ? 'text-primary' : 'text-faint'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* 3-Segment Progress Bar */}
        <div className="w-full h-1.5 bg-border-input rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-dark rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <Step1Details
            initialData={formData}
            onNext={handleStep1Next}
          />
        )}
        {currentStep === 2 && (
          <Step2Upload
            initialData={{ file: formData.file ?? null, extractedText: formData.extractedText ?? '' }}
            onNext={handleStep2Next}
            onPrev={handleStep2Prev}
          />
        )}
        {currentStep === 3 && (
          <Step3Review
            data={{
              title: formData.title ?? '',
              subject: formData.subject ?? '',
              grade: formData.grade ?? '',
              dueDate: formData.dueDate ?? '',
              sections: formData.sections ?? [],
              additionalInfo: formData.additionalInfo,
              file: formData.file ?? null,
              extractedText: formData.extractedText ?? '',
            }}
            onPrev={handleStep3Prev}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </AppShell>
  );
}
