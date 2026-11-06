import React from 'react';
import { FileText, Download, Award, Calendar, CheckCircle2, ChevronRight, Clock } from 'lucide-react';
import { getCandidatePdfUrl } from '../../services/api';

export default function CandidateHistory({ applications = [], onSelectApplication }) {
  if (applications.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-1">No Evaluated Resumes Yet</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
          Once you upload and analyze resumes, your past performance dossiers and official PDF reports will be preserved here.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            My Evaluated Resumes & Performance Dossiers
          </h3>
          <p className="text-xs text-slate-400">
            Review previous AI resume screening runs and download signed evaluation reports.
          </p>
        </div>
        <span className="text-xs text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 font-bold">
          {applications.length} Records
        </span>
      </div>

      <div className="divide-y divide-slate-800/80">
        {applications.map((app) => (
          <div key={app.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/30 px-3 rounded-xl transition-all">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-white">
                    {app.job_title || "Direct Resume Screening"}
                  </h4>
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {app.organization_name || "Independent"}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    app.match_score >= 80 ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' :
                    app.match_score >= 65 ? 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10' :
                    'text-amber-400 border-amber-500/20 bg-amber-500/10'
                  }`}>
                    {app.match_score}% Match
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {new Date(app.created_at).toLocaleDateString()}
                  </span>
                  <span>
                    File: <strong className="text-slate-300 font-mono text-[11px]">{app.resume_filename}</strong>
                  </span>
                  <span>
                    Verified Skills: <strong className="text-emerald-400">{app.matched_skills?.length || 0}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <a
                href={getCandidatePdfUrl(app.id)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>PDF Report</span>
              </a>

              <button
                onClick={() => onSelectApplication(app)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md glow-primary"
              >
                <span>View Evidence</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
