import React, { useState } from 'react';
import { Award, CheckCircle2, AlertCircle, FileText, Download, ChevronRight, X, Sparkles, MessageSquare, UserCheck, Clock, Quote } from 'lucide-react';
import { getRecruiterReportUrl, updateRecruiterDecision } from '../../services/api';

export default function CandidateComparison({
  candidates = [],
  jobs = [],
  selectedJobId,
  setSelectedJobId,
  onRefresh,
  loading = false
}) {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [decisionUpdating, setDecisionUpdating] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCandidates = candidates.filter(c => {
    if (selectedJobId && c.job_id !== selectedJobId) return false;
    if (statusFilter !== 'all' && c.recruiter_decision !== statusFilter) return false;
    return true;
  });

  const handleOpenDetail = (cand) => {
    setSelectedCandidate(cand);
    setDecisionNotes(cand.recruiter_notes || '');
  };

  const handleUpdateDecision = async (newDecision) => {
    if (!selectedCandidate) return;
    setDecisionUpdating(true);
    try {
      const updated = await updateRecruiterDecision(selectedCandidate.id, newDecision, decisionNotes);
      setSelectedCandidate(updated);
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to update candidate decision');
    } finally {
      setDecisionUpdating(false);
    }
  };

  const handleDownloadJobReport = () => {
    if (!selectedJobId) {
      alert("Please select a specific job opening to download its comparative dossier report.");
      return;
    }
    window.open(getRecruiterReportUrl(selectedJobId), '_blank');
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
      
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            Candidate Comparison Leaderboard
          </h3>
          <p className="text-xs text-slate-400">
            Automated ranking based on verified skill evidence, requirement coverage, and career timeline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Job Filter */}
          <select
            value={selectedJobId || ''}
            onChange={(e) => setSelectedJobId(e.target.value ? parseInt(e.target.value, 10) : null)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="">All Job Openings ({candidates.length} total)</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Decisions</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interview Scheduled</option>
            <option value="accepted">Accepted / Offer</option>
            <option value="rejected">Rejected</option>
            <option value="pending">Pending Review</option>
          </select>

          {/* Export Report */}
          {selectedJobId && (
            <button
              onClick={handleDownloadJobReport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span>Export Job Dossier (PDF)</span>
            </button>
          )}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900/60">
              <th className="py-3 px-4">Rank & Candidate</th>
              <th className="py-3 px-4">Target Job</th>
              <th className="py-3 px-4">Evidence Match</th>
              <th className="py-3 px-4">Experience</th>
              <th className="py-3 px-4">Hiring Decision</th>
              <th className="py-3 px-4 text-right">Audit Dossier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-xs">
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map((cand, idx) => (
                <tr key={cand.id} className="hover:bg-slate-900/40 transition-all group">
                  <td className="py-3.5 px-4 flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      idx === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-white block group-hover:text-purple-400 transition-colors">
                        {cand.candidate_name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {cand.resume_filename}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300 font-medium">
                    {cand.job_title || "General Application"}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-white">{cand.match_score}%</span>
                      <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            cand.match_score >= 80 ? 'bg-emerald-500' :
                            cand.match_score >= 65 ? 'bg-purple-500' :
                            'bg-amber-500'
                          }`}
                          style={{ width: `${cand.match_score}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    {cand.experience_years_detected} Yrs Detected
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      cand.recruiter_decision === 'shortlisted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      cand.recruiter_decision === 'interview' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                      cand.recruiter_decision === 'accepted' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      cand.recruiter_decision === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {cand.recruiter_decision}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenDetail(cand)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 transition-all inline-flex items-center gap-1"
                    >
                      <span>Inspect Evidence</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No candidate applications found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Candidate Detail Modal / Dossier */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 border border-slate-800 shadow-2xl relative">
            
            <button
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Candidate Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                  Candidate Dossier • {selectedCandidate.job_title}
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  {selectedCandidate.candidate_name}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedCandidate.candidate_email || "No email specified"} • File: {selectedCandidate.resume_filename}
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-purple-400">{selectedCandidate.match_score}%</span>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Match Score</span>
              </div>
            </div>

            {/* Recruiter Decision Panel */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Hiring Decision & Status
              </h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {['shortlisted', 'interview', 'accepted', 'rejected', 'pending'].map((dec) => (
                  <button
                    key={dec}
                    type="button"
                    disabled={decisionUpdating}
                    onClick={() => handleUpdateDecision(dec)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                      selectedCandidate.recruiter_decision === dec
                        ? dec === 'shortlisted' ? 'bg-emerald-600 text-white shadow' :
                          dec === 'interview' ? 'bg-cyan-600 text-white shadow' :
                          dec === 'accepted' ? 'bg-purple-600 text-white shadow' :
                          dec === 'rejected' ? 'bg-rose-600 text-white shadow' :
                          'bg-slate-700 text-white'
                        : 'bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    {dec}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Recruiter Screening Notes
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    placeholder="e.g. Strong PyTorch evidence, schedule technical round for next Tuesday"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdateDecision(selectedCandidate.recruiter_decision)}
                    disabled={decisionUpdating}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>

            {/* AI-Generated Tailored Interview Questions */}
            <div className="bg-purple-950/20 border border-purple-500/30 p-4 rounded-xl mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                AI-Suggested Tailored Interview Inquiries
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                Questions generated by ProofHire to audit missing skills and test verified evidence:
              </p>
              <div className="space-y-2">
                {(selectedCandidate.recruiter_report?.suggested_interview_questions || []).map((q, i) => (
                  <div key={i} className="text-xs text-purple-200 bg-slate-950/60 p-2.5 rounded-lg border border-purple-500/20">
                    • {q}
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Evidence Sentences */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Verified Textual Evidence Excerpts
              </h4>
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {(selectedCandidate.matched_skills || []).map((m, idx) => (
                  <div key={idx} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs">
                    <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded text-[11px] mr-2">
                      {m.skill}
                    </span>
                    <span className="text-slate-300 font-mono">
                      "{m.evidence}"
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
