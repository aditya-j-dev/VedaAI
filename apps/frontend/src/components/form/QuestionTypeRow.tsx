'use client';

import { useState, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';
import Stepper from './Stepper';
import { QUESTION_TYPES, type QuestionType } from '@vedaai/shared';

interface QuestionTypeRowProps {
  index: number;
  type: string;
  numQuestions: number;
  marksPerQuestion: number;
  onTypeChange: (type: string) => void;
  onNumQuestionsChange: (n: number) => void;
  onMarksChange: (m: number) => void;
  onRemove: () => void;
}

export default function QuestionTypeRow({
  index,
  type,
  numQuestions,
  marksPerQuestion,
  onTypeChange,
  onNumQuestionsChange,
  onMarksChange,
  onRemove,
}: QuestionTypeRowProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:p-0 bg-[#fbfbfc] sm:bg-transparent border border-border-input/50 sm:border-0 rounded-[16px] sm:rounded-none mb-3 sm:mb-2" id={`question-type-row-${index}`}>
      <div className="flex items-center gap-2 w-full sm:flex-1">
        {/* Type Dropdown */}
        <div className="relative flex-1" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full h-12 px-4 border border-border-input rounded-[12px] bg-white
              flex items-center justify-between text-[14px] text-primary
              hover:border-faint transition-colors"
          >
            <span className={type ? 'text-primary' : 'text-faint'}>
              {type || 'Select question type'}
            </span>
            <ChevronDown
              size={16}
              className={`text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white rounded-[12px] shadow-dropdown
              border border-border-input z-20 py-1 max-h-56 overflow-y-auto animate-fade-in">
              {QUESTION_TYPES.map((qt) => (
                <button
                  key={qt}
                  type="button"
                  onClick={() => {
                    onTypeChange(qt);
                    setDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-[13px] transition-colors
                    ${type === qt ? 'bg-nav-active text-primary font-medium' : 'text-muted hover:bg-bg-input'}`}
                >
                  {qt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={onRemove}
          className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-faint
            hover:text-danger hover:bg-[#ffebee] sm:hover:bg-transparent rounded-full sm:rounded-none transition-colors flex-shrink-0"
          aria-label="Remove question type"
        >
          <X size={16} />
        </button>
      </div>

      {/* Steppers container */}
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-2 w-full sm:w-auto">
        <div className="flex flex-col sm:block">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1 block sm:hidden">No. of Questions</span>
          <Stepper
            value={numQuestions}
            onChange={onNumQuestionsChange}
            min={1}
            max={50}
            id={`questions-${index}`}
          />
        </div>

        <div className="flex flex-col sm:block">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1 block sm:hidden">Marks per Question</span>
          <Stepper
            value={marksPerQuestion}
            onChange={onMarksChange}
            min={1}
            max={20}
            id={`marks-${index}`}
          />
        </div>
      </div>
    </div>
  );
}
