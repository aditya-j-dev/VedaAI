'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, FileSearch, ChevronDown, Check } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import AssignmentCard from '@/components/ui/AssignmentCard';
import { assignmentApi } from '@/lib/api';
import { useAssignmentStore } from '@/store/assignmentStore';
import type { Assignment } from '@vedaai/shared';
import toast from 'react-hot-toast';

// ── Empty State illustration (SVG) ───────────────────────────────────────────
function EmptyIllustration() {
  return (
    <div className="w-64 h-64 flex items-center justify-center">
      <div className="relative">
        <div className="w-40 h-48 bg-bg-input rounded-[16px] border-2 border-border-input flex items-center justify-center">
          <FileSearch size={56} className="text-faint" />
        </div>
        <div className="absolute -top-3 -right-3 w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center border-2 border-danger/20">
          <span className="text-danger font-bold text-lg">×</span>
        </div>
        <div className="absolute -bottom-2 -left-4 w-16 h-10 bg-orange/10 rounded-[8px] border border-orange/20 flex items-center justify-center">
          <span className="text-[10px] text-orange font-medium">No data</span>
        </div>
      </div>
    </div>
  );
}

export default function AssignmentsPage() {
  const router = useRouter();
  const { assignments, setAssignments, removeAssignment, searchQuery, setSearchQuery } = useAssignmentStore();
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filtering & Sorting State
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [subjectFilter, setSubjectFilter] = useState<string>('All');
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAssignments = useCallback(async (search?: string) => {
    try {
      const res = await assignmentApi.list({ search, limit: 50 });
      setAssignments(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [setAssignments]);

  useEffect(() => {
    fetchAssignments(searchQuery);
  }, [fetchAssignments]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssignments(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchAssignments]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assignment? This cannot be undone.')) return;
    try {
      await assignmentApi.delete(id);
      removeAssignment(id);
      toast.success('Assignment deleted');
    } catch {
      toast.error('Failed to delete assignment');
    }
  };

  // Derived state for filtering
  const uniqueSubjects = Array.from(new Set(assignments.map(a => a.subject).filter(Boolean)));
  
  const filteredAssignments = assignments
    .filter(a => subjectFilter === 'All' || a.subject === subjectFilter)
    .sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
    });

  // ── Empty State ─────────────────────────────────────────────────────────
  if (!loading && assignments.length === 0 && !searchQuery) {
    return (
      <AppShell breadcrumb="Assignments">
        <div className="flex flex-col items-center justify-center h-full min-h-[70vh] gap-6 animate-fade-in">
          <EmptyIllustration />
          <div className="text-center space-y-2">
            <h2 className="font-bold text-[20px] text-primary">No assignments yet</h2>
            <p className="text-[14px] text-muted max-w-[360px] text-center leading-relaxed">
              Create your first assignment to start collecting and grading student submissions.
              Let AI assist with question generation.
            </p>
          </div>
          <button
            onClick={() => router.push('/assignments/create')}
            className="btn-dark"
            id="create-first-assignment"
          >
            <Plus size={18} />
            Create Your First Assignment
          </button>
        </div>
      </AppShell>
    );
  }

  // ── Filled State ────────────────────────────────────────────────────────
  return (
    <AppShell breadcrumb="Assignments">
      <div className="animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <span className="w-3 h-3 bg-green rounded-full flex-shrink-0" />
          <div>
            <h1 className="font-bold text-[26px] text-primary leading-tight">Assignments</h1>
            <p className="text-[13px] text-muted">
              {total > 0 ? `${total} assignment${total > 1 ? 's' : ''} created` : 'Manage and create assignments for your classes.'}
            </p>
          </div>
        </div>

        {/* Filter + Search Bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-4 h-10 border border-border-input rounded-pill text-[13px] text-muted font-medium hover:bg-bg-input transition-colors flex-shrink-0"
            >
              <Filter size={14} />
              Filter By
              <ChevronDown size={14} className={`transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Filter Dropdown */}
            {filterOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#e8eaed] py-2 z-40 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-1">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Sort Order</p>
                  <button onClick={() => setSortBy('newest')} className="w-full flex items-center justify-between py-1.5 text-sm text-[#2f2f2f] hover:text-orange-500 transition-colors">
                    Newest First {sortBy === 'newest' && <Check size={14} className="text-orange-500" />}
                  </button>
                  <button onClick={() => setSortBy('oldest')} className="w-full flex items-center justify-between py-1.5 text-sm text-[#2f2f2f] hover:text-orange-500 transition-colors">
                    Oldest First {sortBy === 'oldest' && <Check size={14} className="text-orange-500" />}
                  </button>
                </div>
                
                {uniqueSubjects.length > 0 && (
                  <>
                    <div className="h-px bg-[#e8eaed] my-2" />
                    <div className="px-4 py-1">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Subject</p>
                      <button onClick={() => setSubjectFilter('All')} className="w-full flex items-center justify-between py-1.5 text-sm text-[#2f2f2f] hover:text-orange-500 transition-colors truncate">
                        All Subjects {subjectFilter === 'All' && <Check size={14} className="text-orange-500" />}
                      </button>
                      {uniqueSubjects.map(sub => (
                        <button key={sub} onClick={() => setSubjectFilter(sub)} className="w-full flex items-center justify-between py-1.5 text-sm text-[#2f2f2f] hover:text-orange-500 transition-colors truncate">
                          {sub} {subjectFilter === sub && <Check size={14} className="text-orange-500" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input
              id="search-assignments"
              className="w-full h-10 pl-9 pr-4 bg-white border border-border-input rounded-pill
                text-[13px] placeholder:text-faint outline-none focus:border-faint transition-colors"
              placeholder="Search Assignment"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-[16px] border border-border-input p-5 h-28 animate-pulse">
                <div className="h-4 bg-bg-input rounded w-3/4 mb-3" />
                <div className="h-3 bg-bg-input rounded w-1/2 mb-5" />
                <div className="h-3 bg-bg-input rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-border-input">
            <p className="text-muted text-[14px]">No assignments match your filters.</p>
            <button onClick={() => { setSubjectFilter('All'); setSearchQuery(''); }} className="mt-4 text-orange-500 text-sm font-medium hover:underline">Clear Filters</button>
          </div>
        ) : (
          /* Assignment Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-24">
            {filteredAssignments.map((a) => (
              <AssignmentCard key={a._id} assignment={a} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* Sticky Create Button */}
        <div className="sticky bottom-4 flex justify-center pointer-events-none">
          <button
            onClick={() => router.push('/assignments/create')}
            className="btn-dark shadow-lg pointer-events-auto"
            id="create-assignment-fab"
          >
            <Plus size={18} />
            Create Assignment
          </button>
        </div>
      </div>
    </AppShell>
  );
}
