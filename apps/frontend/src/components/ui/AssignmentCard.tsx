'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreVertical, Eye, Trash2 } from 'lucide-react';
import type { Assignment } from '@vedaai/shared';

interface AssignmentCardProps {
  assignment: Assignment;
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StatusBadge({ status }: { status: Assignment['status'] }) {
  const styles: Record<Assignment['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    queued: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    rate_limited: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize whitespace-nowrap ${styles[status]}`}>
      {status === 'rate_limited' ? 'rate limited' : status}
    </span>
  );
}

export default function AssignmentCard({ assignment, onDelete }: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-white rounded-[16px] border border-border-input p-5 relative hover-lift shadow-card animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <Link
            href={`/assignments/${assignment._id}`}
            className="font-bold text-[15px] text-primary underline hover:text-orange transition-colors truncate block"
          >
            {assignment.title}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[12px] text-muted">{assignment.subject}</span>
            <span className="text-faint">·</span>
            <span className="text-[12px] text-muted">{assignment.grade}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={assignment.status} />

          {/* 3-dot menu */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="w-8 h-8 flex items-center justify-center text-faint hover:text-primary
                hover:bg-bg-input rounded-[8px] transition-colors"
              id={`assignment-menu-${assignment._id}`}
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-9 bg-white rounded-[12px] shadow-dropdown
                  border border-border-input py-1 z-20 min-w-[160px] animate-fade-in">
                  <Link
                    href={`/assignments/${assignment._id}`}
                    className="w-full px-4 py-2.5 text-left text-[13px] text-muted hover:bg-bg-input
                      flex items-center gap-2 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Eye size={14} />
                    View Assignment
                  </Link>
                  <button
                    onClick={() => { onDelete(assignment._id); setMenuOpen(false); }}
                    className="w-full px-4 py-2.5 text-left text-[13px] text-danger hover:bg-bg-input
                      flex items-center gap-2 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 mt-3 pt-3 border-t border-border-input/50">
        <span className="text-[12px]">
          <span className="font-semibold text-primary">Assigned on</span>
          <span className="text-muted"> : {formatDate(assignment.createdAt)}</span>
        </span>
        <span className="text-[12px]">
          <span className="font-semibold text-primary">Due</span>
          <span className="text-muted"> : {formatDate(assignment.dueDate)}</span>
        </span>
      </div>
    </div>
  );
}
