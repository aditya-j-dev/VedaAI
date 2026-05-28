'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sparkles, FileText, Download, BookOpen, CheckCircle, ArrowRight, Zap, Shield, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { signInWithGoogle } from '@/lib/auth';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/assignments');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <main className="min-h-screen bg-[#f8f9fa] font-sans overflow-x-hidden selection:bg-orange-500 selection:text-white">
      {/* ─── Navbar ───────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-[#e8eaed]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="VedaAI Logo"
              className="h-15 w-auto object-contain pt-6 hover:scale-105 transition-transform duration-200"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-[22px] text-[#171717] tracking-tight leading-none">VedaAI</span>
              <span className="text-[9px] text-orange-600 font-semibold tracking-widest uppercase mt-0.5">Academic System</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="h-10 px-5 border border-[#dddddd] rounded-full text-[#2f2f2f] font-medium text-sm hover:bg-[#f6f6f6] transition-all flex items-center"
            >
              Sign in
            </Link>
            <Link
              href="/auth"
              className="h-10 px-5 bg-[#171717] rounded-full text-white font-medium text-sm hover:bg-[#2a2a2a] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles size={14} className="text-orange-400" />
              Try Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-16 md:pt-24 text-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200/60 rounded-full px-4.5 py-1.5 mb-8 shadow-sm hover:shadow transition-shadow">
          <Zap size={12} className="text-orange-500 animate-pulse" />
          <span className="text-orange-700 text-[11px] font-bold tracking-wider uppercase">Trusted by Educators</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-[64px] font-extrabold text-[#171717] leading-[1.25] mb-6 tracking-tight max-w-4xl mx-auto">
          AI Academic Assessment &
          <span className="block mt-4.5">
            <span className="inline-block bg-[#ffe8db] text-[#ff5623] px-6 py-2.5 rounded-2xl shadow-sm border border-orange-100/50">
              Intelligence System
            </span>
          </span>
        </h1>

        {/* Tailored Hero Caption */}
        <p className="text-[#5d5d5d] text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          An AI academic assessment system designed for teachers and schools. Instantly generate structured,
          curriculum-aligned question papers and worksheets to improve student outcomes, save prep time,
          and elevate academic standards.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center">
          <button
            onClick={signInWithGoogle}
            className="h-14 px-8 bg-[#171717] rounded-full text-white font-semibold text-base hover:bg-[#2a2a2a] transition-all active:scale-95 flex items-center justify-center gap-2.5 shadow-lg shadow-black/10 hover:shadow-orange-500/5"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
          <Link
            href="/auth"
            className="h-14 px-8 bg-white border border-[#dddddd] rounded-full text-[#2f2f2f] font-semibold text-base hover:bg-[#f6f6f6] hover:border-[#cccccc] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Sign up with Email
            <ArrowRight size={16} />
          </Link>
        </div>

        <p className="text-[#a9a9a9] text-xs mt-4">Free to start. No credit card required.</p>

        {/* ─── Mock Dashboard Browser Visual (Customized Home Screen Visual) ─── */}
        <div className="max-w-5xl mx-auto mt-16 rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden relative group">
          {/* Browser Title Bar */}
          <div className="bg-[#f6f6f8] px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <div className="bg-white px-3 py-1 rounded-md text-[11px] text-gray-400 border border-gray-100 w-80 text-center font-mono select-none hidden md:block">
              vedaai.com/assignments
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#4bc16c] animate-pulse" />
              Delhi Public School
            </div>
          </div>

          {/* Dashboard Interface */}
          <div className="flex flex-col md:flex-row h-auto md:h-[480px] text-left bg-[#f8f9fa] font-sans">
            {/* Left Sidebar (Hidden on mobile) */}
            <div className="hidden md:flex w-52 bg-white border-r border-gray-200 p-4 flex-col justify-between flex-shrink-0">
              <div className="space-y-6">
                <div className="flex items-center gap-2 px-2">
                  <img src="/logo.png" alt="VedaAI Logo" className="h-7 w-auto object-contain" />
                  <span className="font-bold text-sm text-gray-800">VedaAI</span>
                </div>

                <div className="space-y-1">
                  {[
                    { label: 'Home', icon: <Sparkles size={13} /> },
                    { label: 'My Groups', icon: <BookOpen size={13} /> },
                    { label: 'Assignments', icon: <FileText size={13} />, active: true },
                    { label: 'My Library', icon: <Download size={13} /> },
                    { label: 'AI Toolkit', icon: <Sparkles size={13} /> },
                    { label: 'Settings', icon: <Clock size={13} /> }
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${item.active
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      {item.icon}
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center font-bold text-xs text-orange-700">
                    LS
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-800">Lakshya Sharma</p>
                    <p className="text-[9px] text-gray-400">Teacher</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* Welcome header & quick actions */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Welcome, Lakshya Sharma</h3>
                  <p className="text-xs text-gray-500">Delhi Public School • Bokaro Steel City</p>
                </div>
                <button className="h-8 px-3.5 bg-[#171717] rounded-full text-white font-medium text-xs hover:bg-[#2a2a2a] transition-all flex items-center gap-1">
                  <Sparkles size={11} className="text-orange-400" />
                  Create Paper
                </button>
              </div>

              {/* Stats Cards Row */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Papers Generated', val: '23', trend: '+4 this week', bg: 'from-orange-500/5 to-orange-500/0' },
                  { label: 'Active Classes', val: '12', trend: 'Grade 6-12', bg: 'from-blue-500/5 to-blue-500/0' },
                  { label: 'AI Acceptance', val: '98%', trend: 'Teacher validated', bg: 'from-green-500/5 to-green-500/0' }
                ].map((stat) => (
                  <div key={stat.label} className={`bg-white p-3 rounded-xl border border-gray-200/80 shadow-sm relative overflow-hidden bg-gradient-to-br ${stat.bg}`}>
                    <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider block">{stat.label}</span>
                    <span className="text-xl font-bold text-gray-900 mt-1 block">{stat.val}</span>
                    <span className="text-[9px] text-gray-500 mt-0.5 block">{stat.trend}</span>
                  </div>
                ))}
              </div>

              {/* Split details view */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Recent Assignments Table */}
                <div className="lg:col-span-3 bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-gray-800">Recent Question Papers</h4>
                  <div className="space-y-2">
                    {[
                      { title: 'Class 8th Science Mid-Term', subject: 'Science', q: 15, status: 'completed' },
                      { title: 'Grade 10th Quadratic Equations', subject: 'Math', q: 10, status: 'processing' },
                      { title: 'Class 9th Structure of Atom', subject: 'Chemistry', q: 12, status: 'queued' }
                    ].map((paper) => (
                      <div key={paper.title} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50/80 border border-gray-100 hover:border-gray-200 transition-colors">
                        <div>
                          <p className="text-[11px] font-semibold text-gray-800">{paper.title}</p>
                          <p className="text-[9px] text-gray-400">{paper.subject} • {paper.q} Questions</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${paper.status === 'completed'
                          ? 'bg-green-50 text-green-600 border border-green-100'
                          : paper.status === 'processing'
                            ? 'bg-orange-50 text-orange-600 border border-orange-100 animate-pulse'
                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                          {paper.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Queue Worker Monitor (BullMQ representation) */}
                <div className="lg:col-span-2 bg-[#171717] text-white p-4 rounded-xl border border-gray-800 shadow-sm space-y-3 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-orange-400 font-bold uppercase tracking-wider">Queue Worker Status</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  </div>
                  <div className="text-[10px] space-y-1.5 text-gray-300">
                    <p className="text-gray-500 text-[9px]">// Redis + BullMQ active</p>
                    <p><span className="text-blue-400">[QUEUE]</span> Job added. size: 2</p>
                    <p className="animate-pulse"><span className="text-orange-400">[WORKER]</span> Processing GenJob...</p>
                    <div className="w-full bg-gray-800 h-1 rounded overflow-hidden mt-1">
                      <div className="bg-orange-500 h-full w-3/5 animate-pulse" />
                    </div>
                    <p className="text-gray-500 text-[9px]">// Concurrency thread level: 5</p>
                    <p><span className="text-green-400">[COMPLETED]</span> GenJob in 3492ms</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────────────── */}
      <section className="bg-[#171717] py-12 mt-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { num: '< 60s', label: 'To generate a full question paper' },
            { num: '7', label: 'Question types supported' },
            { num: '100%', label: 'CBSE / ICSE curriculum aligned' },
          ].map(({ num, label }) => (
            <div key={label}>
              <p className="text-4xl font-bold text-white mb-1">{num}</p>
              <p className="text-[#a9a9a9] text-xs md:text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-[#171717] mb-3">How VedaAI Works</h2>
          <p className="text-[#5d5d5d] text-base">Three steps from a blank page to a printed question paper</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              icon: <FileText size={22} className="text-orange-500" />,
              title: 'Set Assignment Details',
              desc: 'Enter subject, grade, and due date. Choose question types — MCQ, Short Answer, Long Answer, Fill in the Blanks, and more. Set marks per question.',
            },
            {
              step: '02',
              icon: <BookOpen size={22} className="text-orange-500" />,
              title: 'Upload Study Material (Optional)',
              desc: 'Upload a PDF, image, or text file of your chapter or notes. VedaAI uses it to generate topic-specific questions relevant to exactly what you taught.',
            },
            {
              step: '03',
              icon: <Download size={22} className="text-orange-500" />,
              title: 'Get Your Question Paper',
              desc: 'AI generates a fully structured paper with sections, difficulty labels, marks, and an answer key. Download as a formatted PDF ready to print.',
            },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="bg-white rounded-2xl p-7 border border-[#e8eaed] shadow-sm hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[#e8eaed] font-extrabold text-3xl leading-none">{step}</span>
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">{icon}</div>
              </div>
              <h3 className="font-bold text-[#2f2f2f] text-base mb-2">{title}</h3>
              <p className="text-[#5d5d5d] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────── */}
      <section className="bg-white border-y border-[#e8eaed] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#171717] mb-3">Built for Indian School Teachers</h2>
            <p className="text-[#5d5d5d] text-base">Every feature designed around how you actually teach and assess</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <Sparkles size={18} className="text-orange-500" />,
                title: '7 Question Types',
                desc: 'MCQ, Short Answer, Long Answer, Fill in the Blanks, True/False, Match the Following, Assertion & Reasoning',
              },
              {
                icon: <Shield size={18} className="text-orange-500" />,
                title: 'Difficulty Levels',
                desc: 'Each question is tagged Easy, Moderate, or Challenging. Balanced mix across sections automatically.',
              },
              {
                icon: <Download size={18} className="text-orange-500" />,
                title: 'Print-Ready PDF',
                desc: 'School name, subject, class, marks breakdown, answer key — everything formatted exactly as an exam paper should be.',
              },
              {
                icon: <Clock size={18} className="text-orange-500" />,
                title: 'One-Click Regenerate',
                desc: "Not happy with a section? Regenerate the entire paper or specific questions without starting from scratch.",
              },
              {
                icon: <BookOpen size={18} className="text-orange-500" />,
                title: 'Topic-Specific Questions',
                desc: 'Upload your chapter PDF and get questions pulled from exactly that content — not generic questions from the internet.',
              },
              {
                icon: <FileText size={18} className="text-orange-500" />,
                title: 'Assignment Dashboard',
                desc: 'All your past papers in one place. Search by subject or title. Regenerate or download any time.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 rounded-xl hover:bg-[#f6f6f6] transition-all duration-200">
                <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">{icon}</div>
                <div>
                  <h3 className="font-semibold text-[#2f2f2f] text-sm mb-1">{title}</h3>
                  <p className="text-[#5d5d5d] text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="bg-[#171717] rounded-3xl p-8 md:p-14 shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start Creating Smarter Assessments
          </h2>
          <p className="text-[#a9a9a9] text-base md:text-lg mb-8 max-w-xl mx-auto">
            Join teachers who have stopped wasting weekends on question paper formatting.
          </p>
          <button
            onClick={signInWithGoogle}
            className="h-14 px-10 bg-white rounded-full text-[#171717] font-semibold text-base hover:bg-[#f6f6f6] transition-all active:scale-95 inline-flex items-center gap-2.5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Get Started Free
          </button>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
            {['No credit card needed', 'Free to start', 'CBSE & ICSE aligned'].map((f) => (
              <div key={f} className="flex items-center gap-1.5 text-[#a9a9a9] text-xs md:text-sm">
                <CheckCircle size={13} className="text-[#4bc16c]" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-[#e8eaed] py-8 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="VedaAI Logo" className="h-10 w-auto object-contain" />
            <span className="font-bold text-[#171717] text-sm">VedaAI</span>
          </div>
          <p className="text-[#a9a9a9] text-xs">© {new Date().getFullYear()} VedaAI. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
