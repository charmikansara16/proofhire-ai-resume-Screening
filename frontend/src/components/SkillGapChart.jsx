import React from 'react';
import { Tag, AlertCircle, CheckCircle2, XCircle, Award, Sparkles, ArrowRight, BookOpen } from 'lucide-react';

export default function SkillGapChart({ jobMatch }) {
  const directMatches = jobMatch?.direct_matches || [];
  const transferableSkills = jobMatch?.transferable_skills || [];
  const missingEvidence = jobMatch?.missing_evidence || [];

  // Fallback for simple string arrays if direct_matches not present
  const simpleMatched = jobMatch?.matchedSkills || [];
  const simpleMissing = jobMatch?.missingSkills || [];

  return (
    <div id="skill-gap-section" className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-400" />
            Evidence-Based Skill & Requirement Analysis
          </h3>
          <p className="text-xs text-slate-400">
            Explicit supporting resume quotes, transferable skill mapping, and gap detection.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
          <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            {directMatches.length || simpleMatched.length} Direct Matches
          </span>
          <span className="text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
            {transferableSkills.length} Transferable Skills
          </span>
          <span className="text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
            {missingEvidence.length || simpleMissing.length} Unverified Criteria
          </span>
        </div>
      </div>

      {/* Grid: 3 Categories of Evidence Matching */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Verified Direct Matches */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Direct Matches
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">100% Match Weight</span>
          </div>

          {directMatches.length > 0 ? (
            <div className="space-y-2.5">
              {directMatches.map((m, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-950/70 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300">{m.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      {m.classification || 'Mandatory'}
                    </span>
                  </div>
                  {m.evidence && (
                    <blockquote className="text-[11px] text-slate-300 italic border-l-2 border-emerald-500/40 pl-2 mt-1 font-mono">
                      "{m.evidence}"
                    </blockquote>
                  )}
                  <p className="text-[10px] text-slate-400">{m.explanation}</p>
                </div>
              ))}
            </div>
          ) : simpleMatched.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {simpleMatched.map((s, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {typeof s === 'string' ? s : s.skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No direct requirement matches found.</p>
          )}
        </div>

        {/* 2. Related / Transferable Analytical Skills */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Transferable Analytical Skills
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">60% Match Weight</span>
          </div>

          <p className="text-[10px] text-slate-400">
            Python, SQL & quantitative tools are classified as transferable analytical skills, not direct financial expertise.
          </p>

          {transferableSkills.length > 0 ? (
            <div className="space-y-2.5">
              {transferableSkills.map((t, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-950/70 border border-sky-500/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-300">{t.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20">
                      Transferable Skill
                    </span>
                  </div>
                  {t.evidence && (
                    <blockquote className="text-[11px] text-slate-300 italic border-l-2 border-sky-500/40 pl-2 mt-1 font-mono">
                      "{t.evidence}"
                    </blockquote>
                  )}
                  <p className="text-[10px] text-slate-400">{t.explanation}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 italic">
              No transferable analytical tools identified for this evaluation.
            </div>
          )}
        </div>

        {/* 3. Missing Requirements / Gaps */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              Not Found in Resume
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">0% Match Weight</span>
          </div>

          <p className="text-[10px] text-slate-400 italic">
            * Missing evidence in resume does not necessarily mean the candidate lacks this skill.
          </p>

          {missingEvidence.length > 0 ? (
            <div className="space-y-2.5">
              {missingEvidence.map((g, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-950/70 border border-rose-500/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-300">{g.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/20">
                      {g.classification || 'Mandatory'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300">{g.explanation}</p>
                </div>
              ))}
            </div>
          ) : simpleMissing.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {simpleMissing.map((s, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  {typeof s === 'string' ? s : s.skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-400 italic font-medium">100% requirement coverage achieved!</p>
          )}
        </div>

      </div>

    </div>
  );
}
