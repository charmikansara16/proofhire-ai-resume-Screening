import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, FileCode, Briefcase, Camera, Loader2, Sparkles, X } from 'lucide-react';

export default function ResumeUploader({
  jobs = [],
  onAnalyze,
  loading = false,
  targetCategory,
  setTargetCategory,
  jobDescription,
  setJobDescription,
  selectedJobId,
  setSelectedJobId
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [rawText, setRawText] = useState('');
  const [isPasteMode, setIsPasteMode] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const name = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => name.endsWith(ext));
    if (!isValid) {
      alert("Please upload a valid .pdf, .docx, or .txt resume file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB maximum limit.");
      return;
    }
    setSelectedFile(file);
    setIsPasteMode(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleJobSelect = (e) => {
    const val = e.target.value;
    if (val === 'custom') {
      setSelectedJobId(null);
    } else {
      const jId = parseInt(val, 10);
      setSelectedJobId(jId);
      const matchedJob = jobs.find(j => j.id === jId);
      if (matchedJob) {
        setJobDescription(matchedJob.description);
        setTargetCategory(matchedJob.target_category || 'General');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile && !rawText.trim()) {
      alert("Please upload a resume file or paste resume text.");
      return;
    }

    const formData = new FormData();
    if (selectedFile) {
      formData.append("resume_file", selectedFile);
    } else {
      formData.append("raw_text", rawText.trim());
    }

    if (candidateName.trim()) formData.append("candidate_name", candidateName.trim());
    if (candidateEmail.trim()) formData.append("candidate_email", candidateEmail.trim());
    if (selectedJobId) formData.append("job_id", selectedJobId);
    if (jobDescription.trim()) formData.append("job_description", jobDescription.trim());
    if (targetCategory) formData.append("target_category", targetCategory);

    onAnalyze(formData);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Resume Upload & Target Job Alignment
          </h2>
          <p className="text-xs text-slate-400">
            Upload candidate resume (PDF, DOCX, TXT) for multi-page parsing and evidence extraction.
          </p>
        </div>

        {/* File vs Paste Toggle */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setIsPasteMode(false)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !isPasteMode ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            File Upload (PDF/DOCX)
          </button>
          <button
            type="button"
            onClick={() => setIsPasteMode(true)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isPasteMode ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Raw Text Paste
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        
        {/* Basic Candidate Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Candidate Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Maria Chen"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Candidate Email (Optional)
            </label>
            <input
              type="email"
              placeholder="e.g. maria.chen@example.com"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Mode 1: Drag & Drop File Upload */}
        {!isPasteMode ? (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Resume Document (PDF, DOCX, TXT — Max 10MB)
            </label>
            
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : selectedFile
                  ? 'border-emerald-500/60 bg-emerald-500/5'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-white mb-1">{selectedFile.name}</span>
                  <span className="text-xs text-slate-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready for AI Parsing
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    className="mt-3 text-xs text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Remove file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-slate-200 mb-1">
                    Click to select resume or drag and drop file here
                  </span>
                  <span className="text-xs text-slate-500">
                    Supports native PDF, Microsoft Word (.docx), or plain text (.txt)
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Mode 2: Paste Raw Text */
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Paste Resume Content
            </label>
            <textarea
              rows={6}
              placeholder="Paste candidate resume text here (Summary, Technical Skills, Experience, Education)..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>
        )}

        {/* Target Job Selection */}
        <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              Target Position / Opening
            </label>
            <select
              value={selectedJobId ? selectedJobId : 'custom'}
              onChange={handleJobSelect}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="custom">-- Custom Job Description Criteria --</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.department})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-2">
              Select an active opening from our database or paste custom requirements on the right.
            </p>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-indigo-400" />
              Target Job Description Criteria
            </label>
            <textarea
              rows={3}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="e.g. Senior Machine Learning Engineer with 3+ years experience in Python, PyTorch, FastAPI, and Kubernetes..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading || (!selectedFile && !rawText.trim())}
          className="w-full py-3 px-6 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl glow-primary flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Extracting Document & Verifying Evidence...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Run Evidence-Based AI Resume Verification
            </>
          )}
        </button>

      </form>
    </div>
  );
}
