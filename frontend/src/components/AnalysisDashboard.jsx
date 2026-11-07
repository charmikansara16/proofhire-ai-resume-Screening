import React, { useState } from 'react';
import { 
  Award, CheckCircle, ShieldAlert, Cpu, Sparkles, User, Mail, MapPin, 
  Calendar, Eye, EyeOff, Check, X, Clock, HelpCircle, FileDown, 
  ChevronRight, ArrowRight, MessageSquare, BookOpen, AlertCircle
} from 'lucide-react';
import { updateRecruiterDecision, getCandidatePdfUrl } from '../services/api';

export default function AnalysisDashboard({ 
  candidate, 
  nlpAnalysis, 
  jobMatch, 
  photoMetrics, 
  experienceInfo,
  mode,
  user,
  blindMode,
  setBlindMode,
  onCandidateAction
}) {
  const [internalNote, setInternalNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [recruiterDecision, setRecruiterDecision] = useState(candidate?.decision || null);
  const [decisionNotes, setDecisionNotes] = useState(candidate?.recruiterNotes || []);
  const [activeCandidateModal, setActiveCandidateModal] = useState(null); // 'interview' | 'improvements' | 'recommendations' | null

  // Check if analysis is incomplete
  const isIncomplete = jobMatch?.status === 'Analysis Incomplete' || jobMatch?.match_score === null || jobMatch?.matchPercentage === null;

  // Calculate combined score if not marked incomplete
  const overallScore = isIncomplete 
    ? null 
    : (jobMatch.match_score ?? jobMatch.matchPercentage ?? 0);

  const categoryMatch = nlpAnalysis?.primaryCategory === candidate?.trueCategory;

  const handleDecision = async (decision) => {
    setRecruiterDecision(decision);
    if (candidate?.applicationId) {
      try {
        await updateRecruiterDecision(candidate.applicationId, decision, internalNote);
        if (internalNote.trim()) {
          setDecisionNotes(prev => [
            { text: internalNote, author: user?.full_name || 'Recruiter', timestamp: new Date().toLocaleTimeString() },
            ...prev
          ]);
          setInternalNote('');
        }
      } catch (e) {
        console.error("Failed to update decision in backend:", e);
      }
    }
  };

  const handleSaveNote = async () => {
    if (!internalNote.trim()) return;
    setSavingNote(true);
    try {
      if (candidate?.applicationId) {
        await updateRecruiterDecision(candidate.applicationId, recruiterDecision || 'reviewed', internalNote);
      }
      setDecisionNotes(prev => [
        { text: internalNote, author: user?.full_name || 'Recruiter', timestamp: new Date().toLocaleTimeString() },
        ...prev
      ]);
      setInternalNote('');
    } catch (e) {
      console.error("Failed to save note:", e);
    } finally {
      setSavingNote(false);
    }
  };

  const handleDownloadPdf = () => {
    if (candidate?.applicationId) {
      window.open(getCandidatePdfUrl(candidate.applicationId), '_blank');
    } else {
      // Generate client-side text summary download if no applicationId yet
      const reportText = `PROOFHIRE CANDIDATE READINESS REPORT\nCandidate: ${candidate.name}\nOverall Match: ${overallScore}%\nRecommendation: ${jobMatch.recommendation}\n\nKey Strengths:\n${(jobMatch.direct_matches || []).map(m => `- ${m.name}: ${m.evidence}`).join('\n')}\n\nTransferable Skills:\n${(jobMatch.transferable_skills || []).map(t => `- ${t.name}: ${t.explanation}`).join('\n')}\n\nMissing Evidence:\n${(jobMatch.missing_evidence || []).map(g => `- ${g.name}: ${g.explanation}`).join('\n')}`;
      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${candidate.name.replace(/\s+/g, '_')}_ProofHire_Report.txt`;
      a.click();
    }
  };

  // Determine displayed candidate details (respecting Blind Mode in Recruiter Mode)
  const isBlind = mode === 'recruiter' && blindMode;
  const displayName = isBlind ? `Candidate #${(candidate?.id || '482').toString().slice(-4).toUpperCase()}` : candidate?.name;
  const displayEmail = isBlind ? 'anonymized@proofhire.internal' : candidate?.email;
  const displayLocation = isBlind ? 'Location Hidden (Blind Mode)' : candidate?.location;
  const displayPhoto = isBlind 
    ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' 
    : (candidate?.photoUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80');

  return (
    <div className="space-y-6">
      
      {/* Top Banner Card */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Candidate Profile summary */}
          <div className="flex items-start space-x-4">
            <div className="relative">
              <img
                src={displayPhoto}
                alt={displayName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400">
                {nlpAnalysis?.confidence || 92}% NLP
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  {displayName}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${jobMatch?.recommendationBadgeClass || jobMatch?.recommendation_badge || 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'}`}>
                  {isIncomplete ? 'Analysis Incomplete' : (jobMatch?.recommendation || 'Evaluated')}
                </span>

                {/* Recruiter Decision Status Pill (Recruiter Mode Only) */}
                {mode === 'recruiter' && recruiterDecision && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    recruiterDecision === 'shortlist' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                    recruiterDecision === 'hold' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    recruiterDecision === 'reject' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                    'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  }`}>
                    Status: {recruiterDecision}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  {displayEmail}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {displayLocation}
                </span>
                <span className="flex items-center gap-1 text-slate-300 font-semibold bg-slate-800/80 px-2 py-0.5 rounded">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {experienceInfo?.text || jobMatch?.experience_label || '~3 Years Experience'}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-3 max-w-2xl line-clamp-2 leading-relaxed">
                {candidate?.summary || jobMatch?.summary || "Comprehensive candidate evaluation with verified resume evidence and transferable skill mapping."}
              </p>

              {/* Mode-Specific Action Toolbars */}
              {mode === 'candidate' ? (
                /* Candidate Mode Actions */
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <button
                    onClick={() => setActiveCandidateModal('improvements')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Improve My Resume
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById('skill-gap-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                  >
                    View Skill Gaps
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById('skill-gap-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                  >
                    View Strengths
                  </button>
                  <button
                    onClick={() => setActiveCandidateModal('recommendations')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                  >
                    View Recommendations
                  </button>
                  <button
                    onClick={() => setActiveCandidateModal('interview')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 transition-all flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                    Prepare for Interview
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1"
                  >
                    <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                    Download Report
                  </button>
                </div>
              ) : (
                /* Recruiter Mode Controls */
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Recruiter Decision:
                  </span>
                  <button
                    onClick={() => handleDecision('shortlist')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                      recruiterDecision === 'shortlist'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Shortlist
                  </button>
                  <button
                    onClick={() => handleDecision('hold')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                      recruiterDecision === 'hold'
                        ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                        : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Hold
                  </button>
                  <button
                    onClick={() => handleDecision('reject')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                      recruiterDecision === 'reject'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                        : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleDecision('select')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                      recruiterDecision === 'select'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    Select
                  </button>

                  {/* Blind Mode Toggle */}
                  <button
                    onClick={() => setBlindMode(!blindMode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ml-2 border transition-all flex items-center gap-1 ${
                      blindMode
                        ? 'bg-purple-600 text-white border-purple-400 shadow'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    {blindMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    Blind Mode: {blindMode ? 'ON' : 'OFF'}
                  </button>

                  <button
                    onClick={handleDownloadPdf}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    Dossier PDF
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Combined Score Gauge */}
          <div className="flex items-center justify-center lg:border-l border-slate-800 lg:pl-8">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-800"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={289}
                    strokeDashoffset={isIncomplete ? 289 : 289 - (289 * (overallScore || 0)) / 100}
                    strokeLinecap="round"
                    className={`${isIncomplete ? 'text-slate-600' : 'text-indigo-500'} transition-all duration-1000 ease-out`}
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  {isIncomplete ? (
                    <>
                      <span className="text-sm font-extrabold text-amber-400">Incomplete</span>
                      <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest text-center px-1">
                        Review Data
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl font-black text-white">{overallScore}%</span>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                        Overall Fit
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Recruiter Internal Notes & Review History Box (Recruiter Mode Only) */}
        {mode === 'recruiter' && (
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                  Internal Recruiter Notes (Organization-Private)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add confidential evaluation note, interview observations, or compensation considerations..."
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleSaveNote}
                    disabled={savingNote || !internalNote.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white transition-all shadow"
                  >
                    {savingNote ? 'Saving...' : 'Save Note'}
                  </button>
                </div>
              </div>

              {decisionNotes.length > 0 && (
                <div className="md:w-72 bg-slate-900/60 p-3 rounded-xl border border-slate-800 max-h-28 overflow-y-auto">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Audit Log & Review Notes:
                  </div>
                  {decisionNotes.map((n, i) => (
                    <div key={i} className="text-[11px] text-slate-300 border-b border-slate-800/60 pb-1 mb-1 last:border-0">
                      <span className="font-semibold text-purple-400">{n.author}:</span> {n.text}
                      <span className="text-[9px] text-slate-400 block">{n.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Metrics Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1: Predicted Domain / Category */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Predicted Job Category
            </span>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              {nlpAnalysis?.confidence || 90}% Match
            </span>
          </div>

          <div className="text-xl font-bold text-white mb-1">
            {nlpAnalysis?.primaryCategory || candidate?.trueCategory || 'Technology'}
          </div>

          <div className="flex items-center gap-1.5 text-xs mt-2">
            {categoryMatch ? (
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> Matches candidate background
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1 font-medium">
                <ShieldAlert className="w-3.5 h-3.5" /> Multi-domain skill overlap
              </span>
            )}
          </div>
        </div>

        {/* Metric 2: Evidence-Based Requirement Relevance */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Requirement Evidence
            </span>
            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              70% Weight
            </span>
          </div>

          <div className="text-xl font-bold text-white mb-1">
            {isIncomplete ? 'Analysis Incomplete' : `${jobMatch?.skills_score ?? jobMatch?.matchPercentage ?? 0}% Relevance`}
          </div>

          <p className="text-xs text-slate-400 mt-2">
            {jobMatch?.direct_matches?.length || jobMatch?.totalMatchedCount || 0} direct matches, {jobMatch?.transferable_skills?.length || 0} transferable skills, {jobMatch?.missing_evidence?.length || jobMatch?.totalMissingCount || 0} missing evidence.
          </p>
        </div>

        {/* Metric 3: Scoring Formula & Explanation */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              Scoring Methodology
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Verified
            </span>
          </div>

          <div className="text-sm font-bold text-white mb-1 truncate">
            {jobMatch?.scoring_formula || "70% Skills + 30% Experience Fit"}
          </div>

          <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
            {jobMatch?.scoring_explanation || "Computed across complete verified requirement set. Direct matches receive 100%, transferable skills 60%."}
          </p>
        </div>

      </div>

      {/* Candidate Action Modals (Candidate Mode Only) */}
      {activeCandidateModal === 'interview' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                Tailored Interview Preparation Questions
              </h3>
              <button
                onClick={() => setActiveCandidateModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              These questions are specifically generated based on your exact resume evidence and transferable skills:
            </p>
            <div className="space-y-3">
              {(jobMatch?.candidate_report?.actionable_recommendations || []).map((rec, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200">
                  <span className="text-purple-400 font-bold mr-1">Q{i + 1}:</span> {rec}
                </div>
              ))}
              {(jobMatch?.transferable_skills || []).map((t, i) => (
                <div key={`t-${i}`} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200">
                  <span className="text-sky-400 font-bold mr-1">Transferable Skill Prompt:</span> 
                  Explain how you leveraged your background in <span className="font-semibold">{t.name}</span> to deliver financial or business impact: "{t.evidence}"
                </div>
              ))}
            </div>
            <button
              onClick={() => setActiveCandidateModal(null)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Close Interview Prep
            </button>
          </div>
        </div>
      )}

      {activeCandidateModal === 'improvements' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Resume Improvement Action Plan
              </h3>
              <button
                onClick={() => setActiveCandidateModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {(jobMatch?.missing_evidence || []).map((g, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-rose-500/20 text-xs">
                  <div className="font-bold text-rose-300 mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    Target Area: {g.name}
                  </div>
                  <p className="text-slate-300">{g.explanation}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setActiveCandidateModal(null)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {activeCandidateModal === 'recommendations' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                Candidate Career Recommendations
              </h3>
              <button
                onClick={() => setActiveCandidateModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {(jobMatch?.candidate_report?.actionable_recommendations || []).map((r, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20 text-xs text-slate-300">
                  <span className="font-bold text-emerald-400 mr-1">Recommendation {i + 1}:</span> {r}
                </div>
              ))}
            </div>
            <button
              onClick={() => setActiveCandidateModal(null)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
