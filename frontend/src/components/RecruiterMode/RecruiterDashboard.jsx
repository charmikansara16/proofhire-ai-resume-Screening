import React from 'react';
import { Award, Users, FileCheck, Calendar, Briefcase, PlusCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function RecruiterDashboard({ stats, onNavigate, orgName }) {
  const metricCards = [
    {
      title: "Total Applicants Screened",
      value: stats?.total_candidates ?? 0,
      sub: "In your organization pipeline",
      icon: Users,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
    },
    {
      title: "Average Match Score",
      value: `${stats?.average_score ?? 0}%`,
      sub: "Across all active openings",
      icon: Award,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    },
    {
      title: "Shortlisted Candidates",
      value: stats?.shortlisted_count ?? 0,
      sub: "Ready for hiring manager sync",
      icon: FileCheck,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      title: "Interviews Scheduled",
      value: stats?.interview_count ?? 0,
      sub: "Confirmed on calendar",
      icon: Calendar,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Panel */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                Tenant: {orgName || "Enterprise Workspace"}
              </span>
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Org Isolation Enforced
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Recruiter Screening & Candidate Intelligence Hub
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Evidence-based ranking, verified competencies, and audited hiring decisions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('jobs')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md glow-accent transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Job Opening</span>
            </button>

            <button
              onClick={() => onNavigate('upload')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white transition-all shadow-sm"
            >
              <Briefcase className="w-3.5 h-3.5 text-purple-400" />
              <span>Upload Resumes</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="glass-panel rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {c.title}
                </span>
                <div className={`p-2 rounded-xl border ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white tracking-tight">{c.value}</div>
              <div className="text-[11px] text-slate-500 mt-1">{c.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => onNavigate('leaderboard')}
          className="glass-card-interactive rounded-2xl p-6 border border-slate-800 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              Candidate Comparison & Ranked Leaderboard
            </h3>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sort candidates across all job openings by evidence-based match score, inspect verified quotes, and record hiring decisions (Shortlist, Interview, Accept, Reject).
          </p>
        </div>

        <div 
          onClick={() => onNavigate('jobs')}
          className="glass-card-interactive rounded-2xl p-6 border border-slate-800 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-400" />
              Manage Job Openings & Requirements
            </h3>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Configure required core technical skills, preferred qualifications, and minimum experience thresholds for automated resume matching.
          </p>
        </div>
      </div>

    </div>
  );
}
