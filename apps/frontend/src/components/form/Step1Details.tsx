'use client';

import { useState } from 'react';
import { Plus, Mic, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import QuestionTypeRow from './QuestionTypeRow';
import type { AssignmentSection } from '@vedaai/shared';

const GRADE_OPTIONS = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6',
  'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12',
];

interface Step1Data {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  sections: AssignmentSection[];
  additionalInfo: string;
}

interface Step1Props {
  initialData?: Partial<Step1Data>;
  onNext: (data: Step1Data) => void;
}

const step1Schema = z.object({
  title: z.string().min(1, 'Assignment title is required'),
  subject: z.string().min(1, 'Subject is required'),
  grade: z.string().min(1, 'Grade is required'),
  dueDate: z.string().refine((d) => !!d && new Date(d) > new Date(), 'Due date must be in the future'),
  sections: z.array(z.object({
    type: z.string().min(1, 'Select a question type'),
    numQuestions: z.number().min(1).max(50),
    marksPerQuestion: z.number().min(1).max(20),
  })).min(1, 'Add at least one question type'),
  additionalInfo: z.string().optional(),
});

export default function Step1Details({ initialData, onNext }: Step1Props) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [subject, setSubject] = useState(initialData?.subject ?? '');
  const [grade, setGrade] = useState(initialData?.grade ?? '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate ?? '');
  const [sections, setSections] = useState<AssignmentSection[]>(
    initialData?.sections ?? [{ type: '' as any, numQuestions: 5, marksPerQuestion: 2 }]
  );
  const [additionalInfo, setAdditionalInfo] = useState(initialData?.additionalInfo ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalQuestions = sections.reduce((s, r) => s + r.numQuestions, 0);
  const totalMarks = sections.reduce((s, r) => s + r.numQuestions * r.marksPerQuestion, 0);

  const addSection = () => {
    setSections((prev) => [...prev, { type: '' as any, numQuestions: 5, marksPerQuestion: 2 }]);
  };

  const removeSection = (i: number) => {
    setSections((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateSection = (i: number, key: keyof AssignmentSection, value: string | number) => {
    setSections((prev) => prev.map((s, idx) => idx === i ? { ...s, [key]: value } : s));
  };

  const handleNext = () => {
    const result = step1Schema.safeParse({ title, subject, grade, dueDate, sections, additionalInfo });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        const field = e.path[0]?.toString() ?? 'general';
        fieldErrors[field] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onNext({ title, subject, grade, dueDate, sections, additionalInfo });
  };

  const err = (field: string) => errors[field] ? (
    <p className="text-[12px] text-danger mt-1 flex items-center gap-1">
      <AlertCircle size={11} /> {errors[field]}
    </p>
  ) : null;

  return (
    <div className="bg-white rounded-form p-8 animate-fade-in">
      {/* Card Header */}
      <h2 className="font-bold text-[20px] text-primary">Assignment Details</h2>
      <p className="text-[14px] text-muted/80 mt-0.5 mb-7">
        Basic information about your assignment
      </p>

      {/* Title */}
      <div className="mb-5">
        <label className="font-bold text-[15px] text-primary block mb-2">
          Assignment Title <span className="text-danger">*</span>
        </label>
        <input
          id="assignment-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
          placeholder="e.g. CBSE Grade 8 Science — Chapter 5"
        />
        {err('title')}
      </div>

      {/* Subject + Grade — 2 column */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="font-bold text-[15px] text-primary block mb-2">
            Subject <span className="text-danger">*</span>
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="input-field"
            placeholder="e.g. Science, Mathematics"
          />
          {err('subject')}
        </div>
        <div>
          <label className="font-bold text-[15px] text-primary block mb-2">
            Grade / Class <span className="text-danger">*</span>
          </label>
          <select
            id="grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="input-field appearance-none cursor-pointer"
          >
            <option value="">Select class</option>
            {GRADE_OPTIONS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          {err('grade')}
        </div>
      </div>

      {/* Due Date */}
      <div className="mb-7">
        <label className="font-bold text-[15px] text-primary block mb-2">
          Due Date <span className="text-danger">*</span>
        </label>
        <input
          id="due-date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="input-field"
        />
        {err('dueDate')}
      </div>

      {/* Question Types Table */}
      <div className="mb-2">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-2 mb-3 items-center">
          <span className="font-bold text-[15px] text-primary">Question Type</span>
          <div className="w-4" /> {/* space for × button */}
          <span className="font-bold text-[13px] text-primary text-center w-[110px]">No. of Questions</span>
          <span className="font-bold text-[13px] text-primary text-center w-[110px]">Marks / Q</span>
        </div>

        {/* Rows */}
        {sections.map((section, i) => (
          <QuestionTypeRow
            key={i}
            index={i}
            type={section.type}
            numQuestions={section.numQuestions}
            marksPerQuestion={section.marksPerQuestion}
            onTypeChange={(v) => updateSection(i, 'type', v)}
            onNumQuestionsChange={(v) => updateSection(i, 'numQuestions', v)}
            onMarksChange={(v) => updateSection(i, 'marksPerQuestion', v)}
            onRemove={() => removeSection(i)}
          />
        ))}

        {err('sections')}

        {/* Add Question Type */}
        <button
          type="button"
          onClick={addSection}
          className="flex items-center gap-3 mt-3 mb-1 group"
          id="add-question-type"
        >
          <span className="w-8 h-8 bg-dark rounded-full flex items-center justify-center group-hover:bg-[#2a2a2a] transition-colors">
            <Plus size={15} className="text-white" />
          </span>
          <span className="text-[13px] font-medium text-muted group-hover:text-primary transition-colors">
            Add Question Type
          </span>
        </button>

        {/* Totals */}
        <div className="flex flex-col items-end gap-1 mt-4 mb-7">
          <span className="text-[13px] font-semibold text-primary">
            Total Questions: <span className="font-bold text-[15px]">{totalQuestions}</span>
          </span>
          <span className="text-[13px] font-semibold text-primary">
            Total Marks: <span className="font-bold text-[15px]">{totalMarks}</span>
          </span>
        </div>
      </div>

      {/* Additional Information */}
      <div className="relative">
        <label className="font-bold text-[15px] text-primary block mb-2">
          Additional Information{' '}
          <span className="font-normal text-muted text-[13px]">(For better output)</span>
        </label>
        <textarea
          id="additional-info"
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          className="w-full min-h-[100px] px-4 py-3 bg-bg-input border border-border-input
            rounded-[16px] text-[14px] text-primary outline-none resize-none transition-colors
            placeholder:text-faint focus:border-faint"
          placeholder="e.g. Generate a question paper for a 3 hour exam. Include diagrams where needed."
        />
        <Mic size={17} className="absolute bottom-3.5 right-3.5 text-faint cursor-pointer hover:text-muted transition-colors" />
      </div>

      {/* Footer */}
      <div className="flex justify-end mt-7">
        <button
          type="button"
          onClick={handleNext}
          id="step1-next"
          className="btn-dark"
        >
          Next
          <span className="ml-1">→</span>
        </button>
      </div>
    </div>
  );
}
