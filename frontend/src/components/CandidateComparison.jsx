import React from 'react';
import { SAMPLE_CANDIDATES, SAMPLE_JOB_DESCRIPTIONS } from '../services/sampleData';
import { calculateJobMatch, classifyResumeCategory } from '../services/nlpEngine';
import { Award, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';

export default function CandidateComparison({ onSelectCandidate, targetCategory }) {
  const currentJd = SAMPLE_JOB_DESCRIPTIONS[targetCategory] || SAMPLE_JOB_DESCRIPTIONS['Data Science'];

  const rankedCandidates = SAMPLE_CANDIDATES.map(cand => {
    const nlp = classifyResumeCategory(cand.resumeText);
    const match = calculateJobMatch(cand.resumeText, currentJd);
    const photoScore = cand.photoMetrics?.overallPhotoRating || 90;
    const overall = Math.round((match.matchPercentage * 0.7) + (photoScore * 0.3));

    return {
      candidate: cand,
      nlp,
      match,
      photoScore,
      overall
    };
  }).sort((a, b) => b.overall - a.overall);

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
      
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            Candidate Leaderboard & Comparative Ranking
          </h3>
          <p className="text-xs text-slate-400">
            Comparing candidate suitability for role: <span className="text-indigo-400 font-semibold">{targetCategory}</span>
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900/60">
              <th className="py-3 px-4">Rank & Candidate</th>
              <th className="py-3 px-4">Predicted Category</th>
              <th className="py-3 px-4">JD Match</th>
              <th className="py-3 px-4">Photo Rating</th>
              <th className="py-3 px-4">Overall Score</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-xs">
            {rankedCandidates.map((item, idx) => (
              <tr key={item.candidate.id} className="hover:bg-slate-900/40 transition-all">
                <td className="py-3.5 px-4 flex items-center space-x-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    idx === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    #{idx + 1}
                  </span>
                  <img
                    src={item.candidate.photoUrl}
                    alt={item.candidate.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <span className="font-bold text-slate-200 block">{item.candidate.name}</span>
                    <span className="text-[10px] text-slate-400">{item.candidate.experienceYears} Yrs Exp</span>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full font-semibold">
                    {item.nlp.primaryCategory}
                  </span>
                </td>

                <td className="py-3.5 px-4 font-bold text-indigo-400">
                  {item.match.matchPercentage}%
                </td>

                <td className="py-3.5 px-4 font-bold text-emerald-400">
                  {item.photoScore}%
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-white text-sm">{item.overall}%</span>
                    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${item.overall}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => onSelectCandidate(item.candidate)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition-all"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
