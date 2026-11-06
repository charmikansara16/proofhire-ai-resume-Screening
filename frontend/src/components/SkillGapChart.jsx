import React from 'react';
import { Tag, AlertCircle, CheckCircle2, XCircle, Award } from 'lucide-react';

export default function SkillGapChart({ jobMatch }) {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-400" />
            Skill Gap & Keyword Relevance Analysis
          </h3>
          <p className="text-xs text-slate-400">
            NLP Cosine keyword matching between candidate resume and target Job Description.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            {jobMatch.totalMatchedCount} Skills Matched
          </span>
          <span className="text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
            {jobMatch.totalMissingCount} Skill Gaps
          </span>
        </div>
      </div>

      {/* Matched & Missing Chips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Matched Skills */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Verified Matching Skills
          </h4>

          {jobMatch.matchedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {jobMatch.matchedSkills.map((skill, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No direct skill matches found.</p>
          )}
        </div>

        {/* Missing Skills / Gaps */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-1.5">
            <XCircle className="w-4 h-4" />
            Missing / Desired JD Skill Gaps
          </h4>

          {jobMatch.missingSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {jobMatch.missingSkills.map((skill, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20"
                >
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-400 italic font-medium">100% skill coverage achieved!</p>
          )}
        </div>

      </div>

    </div>
  );
}
