'use client';

import { useAssignmentStore } from '@/store/assignmentStore';
import type { Result } from '@vedaai/shared';

interface QuestionPaperProps {
  result: Result;
  showDifficulty?: boolean;
}

export default function QuestionPaper({ result, showDifficulty = false }: QuestionPaperProps) {
  const profile = useAssignmentStore((s) => s.profile);
  const schoolName = profile?.school.name ?? 'Delhi Public School';
  const schoolLocation = profile?.school.location ?? '';

  return (
    // Inter font for authentic exam paper feel
    <div
      id="question-paper"
      className="bg-white rounded-[16px] border border-border-input px-6 py-8 sm:px-12 sm:py-10 font-inter max-w-3xl mx-auto"
    >
      {/* ── School Header ── */}
      <div className="text-center mb-6">
        <h1 className="font-bold text-[22px] text-primary leading-tight">
          {schoolName}{schoolLocation ? `, ${schoolLocation}` : ''}
        </h1>
        <p className="font-semibold text-[15px] mt-2 text-primary">Subject: {result.subject}</p>
        <p className="font-semibold text-[15px] text-primary">Class: {result.grade.replace(/class/i, '').trim()}</p>
      </div>

      {/* ── Time / Marks Row ── */}
      <div className="border-t border-b border-border-input py-3 mb-5 flex items-center justify-between">
        <span className="text-[13px] font-medium text-primary">
          Time Allowed: {result.duration} minutes
        </span>
        <span className="text-[13px] font-medium text-primary">
          Maximum Marks: {result.totalMarks}
        </span>
      </div>

      {/* ── General Instruction ── */}
      <p className="font-bold text-[13px] text-primary mb-5">
        All questions are compulsory unless stated otherwise.
      </p>

      {/* ── Student Info Lines ── */}
      <div className="space-y-3 mb-10 max-w-md">
        <div className="flex items-end gap-2">
          <span className="text-[13px] font-medium text-primary whitespace-nowrap">Name:</span>
          <div className="flex-1 border-b border-primary h-5 min-w-[100px]" />
        </div>
        <div className="flex items-end gap-2">
          <span className="text-[13px] font-medium text-primary whitespace-nowrap">Roll Number:</span>
          <div className="flex-1 max-w-[200px] border-b border-primary h-5 min-w-[80px]" />
        </div>
        <div className="flex items-end gap-2 flex-wrap sm:flex-nowrap">
          <span className="text-[13px] font-medium text-primary whitespace-nowrap">
            Class: {result.grade.replace(/class/i, '').trim()} &nbsp;&nbsp;&nbsp; Section:
          </span>
          <div className="flex-1 max-w-[120px] border-b border-primary h-5 min-w-[60px]" />
        </div>
      </div>

      {/* ── Sections ── */}
      {result.sections.map((section) => (
        <div key={section.sectionName} className="mb-8">
          {/* Section Title — centered */}
          <h2 className="font-bold text-[17px] text-center text-primary mb-3">
            Section {section.sectionName}
          </h2>

          {/* Question Type with Marks Calculation */}
          <p className="font-bold text-[14px] text-primary mb-1">
            {section.title} 
            <span className="ml-1 text-muted font-normal text-[13px]">
              ({section.questions.length} &times; {section.questions[0]?.marks || 0} = {section.totalMarks} Marks)
            </span>
          </p>

          {/* Instruction — italic */}
          <p className="italic text-[12px] text-muted mb-5">{section.instruction}</p>

          {/* Questions */}
          <ol className="space-y-4">
            {section.questions.map((q) => (
              <li key={q.questionNumber} className="flex items-start gap-2 text-[13px]">
                <span className="font-bold flex-shrink-0 text-primary">{q.questionNumber}.</span>
                <div className="flex-1">
                  <span className="text-primary leading-relaxed">
                    {showDifficulty && (
                      <span className="inline-block mr-2 px-1.5 py-0.5 align-middle rounded-[4px] bg-bg-input border border-border-input text-[10px] font-bold text-muted uppercase tracking-wider">
                        {q.difficulty}
                      </span>
                    )}
                    {q.questionText}
                    <span className="font-bold ml-1 whitespace-nowrap text-primary">
                      [{q.marks} Mark{q.marks > 1 ? 's' : ''}]
                    </span>
                  </span>

                  {/* MCQ Options */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-2 gap-1 mt-2 pl-1">
                      {q.options.map((opt, i) => (
                        <span key={i} className="text-[12px] text-primary">{opt}</span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}

      {/* ── End of Paper ── */}
      <p className="font-bold text-[13px] text-center text-primary my-8">
        — End of Question Paper —
      </p>

      {/* ── Answer Key ── */}
      {result.sections.some(s => s.questions.some(q => q.answer)) && (
        <div className="border-t border-border-input pt-6">
          <h3 className="font-bold text-[15px] text-primary mb-4">Answer Key</h3>
          <ol className="space-y-2">
            {result.sections
              .flatMap((s) => s.questions)
              .filter((q) => q.answer)
              .map((q, i) => (
                <li key={i} className="text-[12px] text-primary flex gap-2">
                  <span className="font-bold flex-shrink-0">{q.questionNumber}.</span>
                  <span className="text-muted">{q.answer}</span>
                </li>
              ))}
          </ol>
        </div>
      )}
    </div>
  );
}
