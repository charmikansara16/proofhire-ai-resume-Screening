import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Briefcase, Plus, X } from 'lucide-react';
import { uploadCandidateForJob } from '../../services/api';

export default function ResumeBatchUploader({ jobs = [], onUploadSuccess }) {
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || '');
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      if (f.size > 10 * 1024 * 1024) {
        alert("Maximum allowed file size is 10MB");
        return;
      }
      setFile(f);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJobId) {
      setError("Please select a target job opening.");
      return;
    }
    if (!candidateName.trim()) {
      setError("Please enter the candidate's name.");
      return;
    }
    if (!file) {
      setError("Please select a resume file (.pdf, .docx, .txt).");
      return;
    }

    setError('');
    setStatusMsg(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("job_id", selectedJobId);
      formData.append("candidate_name", candidateName.trim());
      if (candidateEmail.trim()) formData.append("candidate_email", candidateEmail.trim());
      formData.append("resume_file", file);

      const res = await uploadCandidateForJob(formData);
      setStatusMsg(`Successfully screened ${res.candidate_name}! Overall Match: ${res.match_score}%`);
      setCandidateName('');
      setCandidateEmail('');
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      onUploadSuccess();
    } catch (err) {
      setError(err.message || 'Failed to upload and screen candidate resume.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
      
      <div className="pb-4 border-b border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-purple-400" />
          Candidate Resume Intake & Screening
        </h3>
        <p className="text-xs text-slate-400">
          Upload resumes (PDF/DOCX) for applicants to automatically extract text, verify evidence, and calculate ranking against job criteria.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Target Job Opening
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(parseInt(e.target.value, 10))}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            {jobs.length === 0 && <option value="">No active jobs found — Create a job opening first</option>}
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.department})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Candidate Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jordan Miller"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Candidate Email (Optional)
            </label>
            <input
              type="email"
              placeholder="jordan.miller@example.com"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Upload Candidate Resume (PDF, DOCX, TXT)
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-slate-800 hover:border-purple-500/60 rounded-xl p-6 text-center cursor-pointer bg-slate-900/40 transition-all"
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-6 h-6 text-purple-400 mb-2" />
                <span className="text-xs font-semibold text-slate-300">
                  Select resume file from computer
                </span>
                <span className="text-[11px] text-slate-500">Max size 10MB</span>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !file || !candidateName.trim() || jobs.length === 0}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 transition-all shadow-md glow-accent flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Parsing & Screening Candidate...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Upload & Screen Candidate
            </>
          )}
        </button>

      </form>
    </div>
  );
}
