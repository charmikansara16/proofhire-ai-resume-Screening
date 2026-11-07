import React, { useState, useEffect } from 'react';
import { SAMPLE_CANDIDATES, SAMPLE_JOB_DESCRIPTIONS } from '../services/sampleData';
import { calculateJobMatch, classifyResumeCategory } from '../services/nlpEngine';
import { getRecruiterCandidates } from '../services/api';
import { Award, ArrowRight, Eye, EyeOff, ShieldCheck, User } from 'lucide-react';

export default function CandidateComparison({ 
  onSelectCandidate, 
  targetCategory, 
  mode, 
  user,
  blindMode 
}) {
  const [candidatesList, setCandidatesList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If in recruiter mode and user is logged in, attempt to fetch organization candidates
    if (mode === 'recruiter' && user?.role === 'recruiter') {
      fetchRecruiterCandidates();
    } else {
      // Use benchmark candidates ranked against current target role
      loadBenchmarkCandidates();
    }
  }, [mode, user, targetCategory]);

  const loadBenchmarkCandidates = () => {
    const currentJd = SAMPLE_JOB_DESCRIPTIONS[targetCategory] || SAMPLE_JOB_DESCRIPTIONS['Data Science'];
    const ranked = SAMPLE_CANDIDATES.map(cand => {
      const nlp = classifyResumeCategory(cand.resumeText);
      const match = calculateJobMatch(cand.resumeText, currentJd);
      const photoScore = cand.photoMetrics?.overallPhotoRating || 90;
      const overall = Math.round((match.matchPercentage * 0.7) + (photoScore * 0.3));

      return {
        candidate: cand,
        id: cand.id,
        name: cand.name,
        photoUrl: cand.photoUrl,
        experienceYears: cand.experienceYears,
        primaryCategory: nlp.primaryCategory,
        matchPercentage: match.matchPercentage,
        photoScore: photoScore,
        overall: overall,
        decision: cand.decision || null
      };
    }).sort((a, b) => b.overall - a.overall);

    setCandidatesList(ranked);
  };

  const fetchRecruiterCandidates = async () => {
    setLoading(true);
    try {
      const liveCands = await getRecruiterCandidates();
      if (liveCands && liveCands.length > 0) {
        const formatted = liveCands.map(c => ({
          candidate: {
            id: c.id,
            name: c.candidate_name,
            email: c.candidate_email,
            resumeText: c.raw_text,
            applicationId: c.id,
            decision: c.recruiter_decision,
            photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            experienceYears: c.experience_years_detected || 3,
            location: 'Remote'
          },
          id: c.id,
          name: c.candidate_name,
          photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          experienceYears: c.experience_years_detected || 3,
          primaryCategory: c.predicted_category || targetCategory,
          matchPercentage: c.match_score,
          photoScore: 90,
          overall: c.match_score,
          decision: c.recruiter_decision
        }));
        setCandidatesList(formatted);
      } else {
        loadBenchmarkCandidates();
      }
    } catch (e) {
      console.error("Error fetching recruiter candidates:", e);
      loadBenchmarkCandidates();
    } finally {
      setLoading(false);
    }
  };

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
            {blindMode && mode === 'recruiter' && (
              <span className="ml-2 text-purple-400 font-semibold">(Blind Screening Active)</span>
            )}
          </p>
        </div>

        {mode === 'recruiter' && user && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
            Org: {user.organization_name || 'Organization Private'}
          </span>
        )}
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
              {mode === 'recruiter' && <th className="py-3 px-4">Decision</th>}
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-xs">
            {candidatesList.map((item, idx) => {
              const isBlind = mode === 'recruiter' && blindMode;
              const displayName = isBlind ? `Candidate #${(item.id || idx + 101).toString().slice(-4).toUpperCase()}` : item.name;
              const displayPhoto = isBlind 
                ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
                : item.photoUrl;

              return (
                <tr key={item.id || idx} className="hover:bg-slate-900/40 transition-all">
                  <td className="py-3.5 px-4 flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      idx === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}>
                      #{idx + 1}
                    </span>
                    <img
                      src={displayPhoto}
                      alt={displayName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <span className="font-bold text-slate-200 block">{displayName}</span>
                      <span className="text-[10px] text-slate-400">{item.experienceYears} Yrs Exp</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full font-semibold">
                      {item.primaryCategory}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-indigo-400">
                    {item.matchPercentage}%
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

                  {mode === 'recruiter' && (
                    <td className="py-3.5 px-4">
                      {item.decision ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.decision === 'shortlist' ? 'bg-emerald-500/20 text-emerald-300' :
                          item.decision === 'hold' ? 'bg-amber-500/20 text-amber-300' :
                          item.decision === 'reject' ? 'bg-rose-500/20 text-rose-300' :
                          'bg-indigo-500/20 text-indigo-300'
                        }`}>
                          {item.decision}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Pending</span>
                      )}
                    </td>
                  )}

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectCandidate(item.candidate)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition-all"
                    >
                      View Details <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
