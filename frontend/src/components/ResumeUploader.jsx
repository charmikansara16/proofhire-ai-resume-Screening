import React, { useState, useEffect } from 'react';
import { SAMPLE_CANDIDATES, SAMPLE_JOB_DESCRIPTIONS, KAGGLE_CATEGORIES } from '../services/sampleData';
import { generateGeneralRole } from '../services/api';
import { 
  Upload, UserCheck, Briefcase, FileCode, CheckCircle2, Image as ImageIcon, 
  FileText, Sparkles, Plus, Trash2, Edit3, AlertCircle, RefreshCw 
} from 'lucide-react';

export default function ResumeUploader({ 
  selectedCandidate, 
  setSelectedCandidate, 
  targetCategory, 
  setTargetCategory, 
  jobDescription, 
  setJobDescription,
  onCustomAnalyze,
  mode,
  analyzing,
  customRequirements,
  setCustomRequirements
}) {
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customText, setCustomText] = useState('');
  const [customPhoto, setCustomPhoto] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [activeInputMode, setActiveInputMode] = useState('custom'); // 'custom' | 'preset'

  // General Role Analysis Profile
  const [roleTitle, setRoleTitle] = useState('Financial Analyst');
  const [generalProfile, setGeneralProfile] = useState(null);
  const [loadingRole, setLoadingRole] = useState(false);
  const [showRoleEditor, setShowRoleEditor] = useState(false);

  // Auto-fetch general role profile on mount or when roleTitle changes
  useEffect(() => {
    fetchGeneralRole(roleTitle);
  }, [roleTitle]);

  const fetchGeneralRole = async (title) => {
    setLoadingRole(true);
    try {
      const profile = await generateGeneralRole(title);
      setGeneralProfile(profile);
      
      // Flatten skills into customRequirements if not already customized
      const allSkills = [];
      if (profile.categories) {
        profile.categories.forEach(cat => {
          cat.skills.forEach(s => allSkills.push(s));
        });
      }
      if (setCustomRequirements) {
        setCustomRequirements(allSkills);
      }
    } catch (e) {
      console.error("Failed to generate role profile:", e);
    } finally {
      setLoadingRole(false);
    }
  };

  const handlePresetSelect = (cand) => {
    setSelectedCandidate(cand);
    setTargetCategory(cand.trueCategory);
    setJobDescription(SAMPLE_JOB_DESCRIPTIONS[cand.trueCategory] || SAMPLE_JOB_DESCRIPTIONS['Data Science']);
    setRoleTitle(cand.trueCategory);
  };

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setTargetCategory(cat);
    setRoleTitle(cat);
    if (SAMPLE_JOB_DESCRIPTIONS[cat]) {
      setJobDescription(SAMPLE_JOB_DESCRIPTIONS[cat]);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      if (!customName) {
        // Derive candidate name from filename
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setCustomName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSkillToCategory = (catId, newSkill) => {
    if (!newSkill.trim() || !generalProfile) return;
    const updated = { ...generalProfile };
    const targetCat = updated.categories.find(c => c.category_id === catId);
    if (targetCat) {
      targetCat.skills.push(newSkill.trim());
      setGeneralProfile(updated);
      
      const flat = [];
      updated.categories.forEach(c => c.skills.forEach(s => flat.push(s)));
      setCustomRequirements(flat);
    }
  };

  const handleRemoveSkill = (catId, skillIndex) => {
    if (!generalProfile) return;
    const updated = { ...generalProfile };
    const targetCat = updated.categories.find(c => c.category_id === catId);
    if (targetCat) {
      targetCat.skills.splice(skillIndex, 1);
      setGeneralProfile(updated);
      
      const flat = [];
      updated.categories.forEach(c => c.skills.forEach(s => flat.push(s)));
      setCustomRequirements(flat);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!uploadedFile && !customText.trim()) return;

    onCustomAnalyze({
      name: customName.trim() || (uploadedFile ? uploadedFile.name : 'Candidate Applicant'),
      email: customEmail.trim() || 'candidate@example.com',
      photoUrl: customPhoto,
      rawText: customText,
      file: uploadedFile,
      roleTitle: roleTitle,
      requirements: customRequirements
    });
  };

  return (
    <div className="glass-panel rounded-2xl p-6 mb-8">
      
      {/* Top Header & Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            Candidate & Job Specification Selector
          </h2>
          <p className="text-sm text-slate-400">
            {mode === 'candidate' 
              ? 'Upload your resume (PDF/DOCX/Text) and verify your match against general role expectations.'
              : 'Screen candidates against organizational role requirements with evidence verification.'}
          </p>
        </div>

        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveInputMode('custom')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeInputMode === 'custom'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Upload Resume (PDF/DOCX/Text)
          </button>
          <button
            onClick={() => setActiveInputMode('preset')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeInputMode === 'preset'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Kaggle Benchmarks (1-Click)
          </button>
        </div>
      </div>

      {/* Mode 1: Preset Kaggle Candidates */}
      {activeInputMode === 'preset' && (
        <div className="mt-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Select Test Candidate Profile from Kaggle Dataset:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {SAMPLE_CANDIDATES.map((cand) => {
              const isSelected = selectedCandidate?.id === cand.id;
              return (
                <button
                  key={cand.id}
                  onClick={() => handlePresetSelect(cand)}
                  className={`flex flex-col items-center p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="relative mb-2">
                    <img
                      src={cand.photoUrl}
                      alt={cand.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500/30 shadow-md"
                    />
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-400 absolute -top-1 -right-1 bg-slate-950 rounded-full" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-200 text-center line-clamp-1">
                    {cand.name}
                  </span>
                  <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full mt-1 border border-indigo-500/20">
                    {cand.trueCategory}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 2: Custom File Upload / Text */}
      {activeInputMode === 'custom' && (
        <form onSubmit={handleCustomSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Candidate Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Alex Morgan"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Candidate Email (Optional)
              </label>
              <input
                type="email"
                placeholder="candidate@domain.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Upload Resume Document (.pdf, .docx, .txt)
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
              />
              {uploadedFile && (
                <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Selected: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Or Paste Raw Resume Text / CV Content</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Structured into Summary, Skills, Experience, Education, Projects
              </span>
            </label>
            <textarea
              rows={4}
              placeholder="Paste candidate resume text here (Summary, Technical Skills, Experience, Education, Projects)..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={(!uploadedFile && !customText.trim()) || analyzing}
            className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-lg glow-primary"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Extracting & Verifying Evidence...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Analyze Candidate Resume & Verify Evidence
              </>
            )}
          </button>
        </form>
      )}

      {/* Target Job Category & General Role Expectations */}
      <div className="mt-6 pt-6 border-t border-slate-800/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              Target Role Specification & General Role Profile
            </label>
            <p className="text-xs text-slate-400 mt-1">
              Enter any role title (e.g. <span className="text-indigo-400 font-medium">Financial Analyst</span>) to generate structured expectations across 6 distinct categories.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="Enter role (e.g. Financial Analyst)"
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => fetchGeneralRole(roleTitle)}
              disabled={loadingRole}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingRole ? 'animate-spin' : ''}`} />
              Generate Expectations
            </button>
            <button
              type="button"
              onClick={() => setShowRoleEditor(!showRoleEditor)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {showRoleEditor ? 'Hide Criteria' : 'Review & Edit Criteria'}
            </button>
          </div>
        </div>

        {/* General Role Disclaimer Badge */}
        {generalProfile && (
          <div className="mb-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs text-indigo-300">
            <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>
              <strong>General Role Expectations:</strong> {generalProfile.disclaimer} You can review and edit each individual criterion below before evaluation.
            </span>
          </div>
        )}

        {/* Structured 6-Category Role Expectations Viewer/Editor */}
        {showRoleEditor && generalProfile?.categories && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 mb-4">
            {generalProfile.categories.map((cat) => (
              <div key={cat.category_id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200">{cat.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{cat.skills.length} criteria</span>
                </div>
                <p className="text-[10px] text-slate-400">{cat.description}</p>
                <div className="space-y-1 mt-1">
                  {cat.skills.map((skill, sIdx) => (
                    <div key={sIdx} className="flex items-center justify-between py-1 px-2 rounded bg-slate-900 text-slate-300 text-[11px] border border-slate-800">
                      <span className="truncate">{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(cat.category_id, sIdx)}
                        className="text-slate-400 hover:text-rose-400 ml-1"
                        title="Remove requirement"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Raw Job Description Criteria Box */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-indigo-400" />
            Combined Requirement Context / JD Criteria
          </label>
          <textarea
            rows={3}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>
      </div>

    </div>
  );
}
