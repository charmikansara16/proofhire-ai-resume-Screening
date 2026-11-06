import React from 'react';
import { Award, CheckCircle2, AlertTriangle, Download, FileText, Sparkles, Check, ChevronRight, BookOpen, Quote } from 'lucide-react';
import { getCandidatePdfUrl } from '../../services/api';

export default function EvidenceViewer({ analysis }) {
  if (!analysis) return null;

  const {
    match_score = 0,
    skills_score = 0,
    experience_score = 0,
    predicted_category = "General",
    category_confidence = 80,
    experience_label = "Mid-Level",
    experience_years_detected = 0,
    recommendation = "Screening Completed",
    recommendation_badge = "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    matched_skills = [],
    missing_skills = [],
    candidate_name = "Candidate",
    application_id = null
  } = analysis;

  const handleDownloadPdf = () => {
    if (application_id) {
      window.open(getCandidatePdfUrl(application_id), '_blank');
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Card */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-slate-800">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-black text-white tracking-tight">
                {candidate_name}
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${recommendation_badge}`}>
                {recommendation}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
              <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                Primary Domain: <strong className="text-indigo-400">{predicted_category}</strong> ({category_confidence}% match)
              </span>
              <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                Detected Experience: <strong className="text-indigo-400">{experience_label}</strong>
              </span>
            </div>
          </div>

          {/* Action: Download PDF Report */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white transition-all shadow-md"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              Download Candidate PDF Report
            </button>

            {/* Score Ring */}
            <div className="flex items-center space-x-3 bg-slate-900/90 px-4 py-3 rounded-2xl border border-slate-800">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-indigo-500"
                    strokeDasharray={`${match_score}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-sm font-extrabold text-white">
                  {match_score}%
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Overall Score</span>
                <span className="text-xs text-slate-300 font-medium">Ready for Review</span>
              </div>
            </div>

          </div>

        </div>

        {/* 3 Metric Subcards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Skills Alignment</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-extrabold text-emerald-400">{skills_score}%</span>
              <span className="text-xs text-slate-500">{matched_skills.length} Skills Verified</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${skills_score}%` }} />
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Experience Alignment</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-extrabold text-indigo-400">{experience_score}%</span>
              <span className="text-xs text-slate-500">{experience_years_detected} Yrs Detected</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${experience_score}%` }} />
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Requirement Coverage</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-extrabold text-purple-400">
                {matched_skills.length}/{matched_skills.length + missing_skills.length}
              </span>
              <span className="text-xs text-slate-500">{missing_skills.length} Gaps Flagged</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-purple-500 h-full rounded-full" 
                style={{ width: `${Math.round((matched_skills.length / Math.max(matched_skills.length + missing_skills.length, 1)) * 100)}%` }} 
              />
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Evidence Portfolio + Missing Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Verified Evidence Portfolio */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Evidence-Based Skill Verification</h3>
            </div>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              {matched_skills.length} Verified
            </span>
          </div>

          <p className="text-xs text-slate-400">
            ProofHire audited the uploaded resume text and located verbatim sentences proving each competency:
          </p>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {matched_skills.map((item, idx) => (
              <div key={idx} className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">
                      {item.skill}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      {(item.confidence * 100).toFixed(0)}% Evidence Confidence
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {item.importance}
                  </span>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-xs text-slate-300 font-mono leading-relaxed relative pl-7">
                  <Quote className="w-3.5 h-3.5 text-indigo-400 absolute top-2.5 left-2 opacity-70" />
                  "{item.evidence}"
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Missing Requirements & Recommendations */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h3 className="text-base font-bold text-white">Missing Criteria & Action Plan</h3>
            </div>
            <span className="text-xs text-rose-400 font-semibold bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
              {missing_skills.length} Gaps
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Target requirements where no verifiable proof was detected, with tailored advice to bridge the gap:
          </p>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {missing_skills.length > 0 ? (
              missing_skills.map((item, idx) => (
                <div key={idx} className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-md">
                      {item.skill}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      item.importance === 'Must-Have' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.importance}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-2">
                    {item.reason}
                  </p>

                  <div className="bg-indigo-950/30 border border-indigo-500/20 p-2.5 rounded-lg text-xs text-indigo-300 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Action Plan:</strong> {item.recommendation}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <span className="font-bold text-white block">100% Core Requirements Met!</span>
                <span className="text-xs text-slate-400">The resume fully satisfies every criterion requested.</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
