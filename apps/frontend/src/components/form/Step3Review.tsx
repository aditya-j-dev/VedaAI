'use client';

import { useState } from 'react';
import { ArrowLeft, Sparkles, Loader2, Calendar, FileText, BookOpen } from 'lucide-react';
import type { AssignmentSection } from '@vedaai/shared';

interface ReviewData {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  sections: AssignmentSection[];
  additionalInfo?: string;
  file: File | null;
  extractedText: string;
}

interface Step3Props {
  data: ReviewData;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function Step3Review({ data, onPrev, onSubmit, isSubmitting }: Step3Props) {
  const totalQuestions = data.sections.reduce((s, r) => s + r.numQuestions, 0);
  const totalMarks = data.sections.reduce((s, r) => s + r.numQuestions * r.marksPerQuestion, 0);

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-form p-8 animate-fade-in">
      {/* Card Header */}
      <h2 className="font-bold text-[20px] text-primary">Review & Generate</h2>
      <p className="text-[14px] text-muted/80 mt-0.5 mb-7">
        Review your assignment details before generating the question paper
      </p>

      {/* Summary Card */}
      <div className="border border-border-input rounded-[20px] p-6 mb-6 space-y-5">

        {/* Basic Info */}
        <div>
          <h3 className="font-bold text-[15px] text-primary mb-3 flex items-center gap-2">
            <BookOpen size={16} className="text-orange" />
            Assignment Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-bg-input rounded-[12px] px-4 py-3">
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-0.5">Title</p>
              <p className="text-[14px] font-semibold text-primary">{data.title}</p>
            </div>
            <div className="bg-bg-input rounded-[12px] px-4 py-3">
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-0.5">Subject</p>
              <p className="text-[14px] font-semibold text-primary">{data.subject}</p>
            </div>
            <div className="bg-bg-input rounded-[12px] px-4 py-3">
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-0.5">Grade</p>
              <p className="text-[14px] font-semibold text-primary">{data.grade}</p>
            </div>
            <div className="bg-bg-input rounded-[12px] px-4 py-3">
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-0.5">Due Date</p>
              <p className="text-[14px] font-semibold text-primary flex items-center gap-1.5">
                <Calendar size={13} className="text-muted" />
                {formatDate(data.dueDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Question Sections Table */}
        <div>
          <h3 className="font-bold text-[15px] text-primary mb-3">Question Breakdown</h3>
          <div className="border border-border-input rounded-[12px] overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-bg-input border-b border-border-input">
                  <th className="text-left px-4 py-2.5 font-semibold text-muted">Section</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-muted">Type</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-muted">Questions</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-muted">Marks/Q</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-muted">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {data.sections.map((s, i) => (
                  <tr key={i} className="border-b border-border-input last:border-0">
                    <td className="px-4 py-3 font-bold text-primary">
                      Section {String.fromCharCode(65 + i)}
                    </td>
                    <td className="px-4 py-3 text-muted">{s.type}</td>
                    <td className="px-4 py-3 text-center font-medium text-primary">{s.numQuestions}</td>
                    <td className="px-4 py-3 text-center font-medium text-primary">{s.marksPerQuestion}</td>
                    <td className="px-4 py-3 text-center font-bold text-primary">
                      {s.numQuestions * s.marksPerQuestion}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-bg-input border-t border-border-input">
                  <td colSpan={2} className="px-4 py-2.5 font-bold text-primary">Total</td>
                  <td className="px-4 py-2.5 text-center font-bold text-primary">{totalQuestions}</td>
                  <td />
                  <td className="px-4 py-2.5 text-center font-bold text-primary">{totalMarks}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Uploaded File */}
        {data.file && (
          <div className="flex items-center gap-3 bg-bg-input rounded-[12px] px-4 py-3">
            <FileText size={16} className="text-orange flex-shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">Source Material</p>
              <p className="text-[13px] font-medium text-primary">{data.file.name}</p>
            </div>
          </div>
        )}

        {/* Additional Info */}
        {data.additionalInfo && (
          <div className="bg-bg-input rounded-[12px] px-4 py-3">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">Additional Instructions</p>
            <p className="text-[13px] text-muted leading-relaxed">{data.additionalInfo}</p>
          </div>
        )}
      </div>

      {/* Generation hint */}
      <div className="flex items-start gap-2 bg-orange/5 border border-orange/20 rounded-[12px] px-4 py-3 mb-7">
        <Sparkles size={15} className="text-orange mt-0.5 flex-shrink-0" />
        <p className="text-[13px] text-muted leading-relaxed">
          AI will generate a structured question paper with{' '}
          <strong className="text-primary">{totalQuestions} questions</strong> across{' '}
          <strong className="text-primary">{data.sections.length} sections</strong> totaling{' '}
          <strong className="text-primary">{totalMarks} marks</strong>.
          You can regenerate or download as PDF once complete.
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={isSubmitting}
          className="btn-outline disabled:opacity-50"
          id="step3-prev"
        >
          <ArrowLeft size={16} />
          Previous
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="btn-dark disabled:opacity-70 min-w-[200px] justify-center"
          id="generate-paper"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="spin-loader" />
              Submitting...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate Question Paper
            </>
          )}
        </button>
      </div>
    </div>
  );
}
