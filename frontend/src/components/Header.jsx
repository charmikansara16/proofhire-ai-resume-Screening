import React from 'react';
import { Sparkles, Shield, User, Briefcase, FileText, Award, LogOut, LogIn, PlusCircle, CheckCircle } from 'lucide-react';

export default function Header({
  mode,
  setMode,
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onLogout
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 glow-primary shadow-lg flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white">
                  Proof<span className="text-gradient">Hire</span>
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  AI Resume Intelligence
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Evidence-Based Resume Verification & Candidate Screening Platform
              </p>
            </div>
          </div>

          {/* Mode Switcher: Candidate vs Recruiter */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => { setMode('candidate'); setActiveTab('evaluator'); }}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'candidate'
                  ? 'bg-indigo-600 text-white shadow-md glow-primary'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Candidate Mode</span>
            </button>

            <button
              onClick={() => { setMode('recruiter'); setActiveTab('dashboard'); }}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'recruiter'
                  ? 'bg-purple-600 text-white shadow-md glow-accent'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Recruiter Mode</span>
            </button>
          </div>

          {/* User Auth Info / Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
                    {user.full_name}
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {user.role === 'recruiter' ? (
                      <span className="text-purple-400 font-semibold">{user.organization_name || 'Organization'}</span>
                    ) : (
                      <span className="text-indigo-400 font-semibold">Candidate Account</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Log out"
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white transition-all shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>

        </div>

        {/* Secondary Subnavigation for Active Mode */}
        <div className="flex items-center space-x-2 py-2.5 overflow-x-auto border-t border-slate-800/60 scrollbar-none">
          {mode === 'candidate' ? (
            <>
              <button
                onClick={() => setActiveTab('evaluator')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'evaluator'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Resume Analysis & Evidence</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'history'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>My Evaluated Resumes</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Org Dashboard & Metrics</span>
              </button>

              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'leaderboard'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Candidate Comparison Leaderboard</span>
              </button>

              <button
                onClick={() => setActiveTab('jobs')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'jobs'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Job Openings Manager</span>
              </button>

              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'upload'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Upload Candidate Resumes</span>
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
