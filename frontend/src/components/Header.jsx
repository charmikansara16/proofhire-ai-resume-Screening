import React from 'react';
import { Sparkles, Database, FileText, Award, User, Briefcase, LogIn, LogOut, ShieldCheck } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  mode, 
  setMode, 
  user, 
  onOpenAuth, 
  onLogout 
}) {
  const handleModeSwitch = (newMode) => {
    if (newMode === 'recruiter' && (!user || user.role !== 'recruiter')) {
      // Require recruiter login
      onOpenAuth('recruiter');
      return;
    }
    setMode(newMode);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Project Title */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 glow-primary shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  ProofHire <span className="text-gradient">Screener</span>
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  AI Resume Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated Resume Intelligence & Evidence-Based Screening System • Kaggle Benchmark
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-3">
            <nav className="hidden md:flex items-center space-x-1 sm:space-x-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('evaluator')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'evaluator'
                    ? 'bg-indigo-600 text-white shadow-md glow-primary'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Live Evaluator</span>
              </button>

              <button
                onClick={() => setActiveTab('comparison')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'comparison'
                    ? 'bg-indigo-600 text-white shadow-md glow-primary'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Candidate Leaderboard</span>
              </button>

              <button
                onClick={() => setActiveTab('dataset')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'dataset'
                    ? 'bg-indigo-600 text-white shadow-md glow-primary'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Kaggle Dataset Specs</span>
              </button>
            </nav>

            {/* Mode Switcher Pill */}
            <div className="flex items-center bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => handleModeSwitch('candidate')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'candidate'
                    ? 'bg-indigo-600 text-white shadow-md glow-primary'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Candidate</span>
              </button>
              <button
                onClick={() => handleModeSwitch('recruiter')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'recruiter'
                    ? 'bg-purple-600 text-white shadow-md glow-accent'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Recruiter</span>
              </button>
            </div>

            {/* Auth Action */}
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="text-right hidden lg:block">
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
                  title="Sign out"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth('candidate')}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white transition-all shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sign In</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
