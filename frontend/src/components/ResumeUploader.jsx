import React, { useState } from 'react';
import { SAMPLE_CANDIDATES, SAMPLE_JOB_DESCRIPTIONS, KAGGLE_CATEGORIES } from '../services/sampleData';
import { Upload, UserCheck, Briefcase, FileCode, CheckCircle2, Image as ImageIcon } from 'lucide-react';

export default function ResumeUploader({ 
  selectedCandidate, 
  setSelectedCandidate, 
  targetCategory, 
  setTargetCategory, 
  jobDescription, 
  setJobDescription,
  onCustomAnalyze 
}) {
  const [customName, setCustomName] = useState('');
  const [customText, setCustomText] = useState('');
  const [customPhoto, setCustomPhoto] = useState(null);
  const [activeInputMode, setActiveInputMode] = useState('preset'); // 'preset' | 'custom'

  const handlePresetSelect = (cand) => {
    setSelectedCandidate(cand);
    setTargetCategory(cand.trueCategory);
    setJobDescription(SAMPLE_JOB_DESCRIPTIONS[cand.trueCategory] || SAMPLE_JOB_DESCRIPTIONS['Data Science']);
  };

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setTargetCategory(cat);
    if (SAMPLE_JOB_DESCRIPTIONS[cat]) {
      setJobDescription(SAMPLE_JOB_DESCRIPTIONS[cat]);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customText.trim()) return;

    const newCandidate = {
      id: `custom-${Date.now()}`,
      name: customName.trim() || 'Uploaded Candidate',
      photoUrl: customPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      trueCategory: targetCategory,
      experienceYears: 3,
      email: 'candidate@example.com',
      location: 'Remote',
      summary: customText.substring(0, 180) + '...',
      resumeText: customText,
      photoMetrics: null // Will be dynamically computed by Canvas
    };

    setSelectedCandidate(newCandidate);
    onCustomAnalyze(newCandidate);
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
            Select a benchmark resume from the Kaggle Dataset or enter a custom resume & photograph.
          </p>
        </div>

        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800">
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
          <button
            onClick={() => setActiveInputMode('custom')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeInputMode === 'custom'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Custom Upload / Paste
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
              const isSelected = selectedCandidate.id === cand.id;
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

      {/* Mode 2: Custom Text & Photo Upload */}
      {activeInputMode === 'custom' && (
        <form onSubmit={handleCustomSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Candidate Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                Upload Candidate Profile Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Resume Raw Text / CV Content
            </label>
            <textarea
              rows={4}
              placeholder="Paste candidate resume text here (Summary, Technical Skills, Experience, Education)..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={!customText.trim()}
            className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-lg glow-primary"
          >
            <Upload className="w-4 h-4" />
            Analyze Custom Candidate & Photograph
          </button>
        </form>
      )}

      {/* Target Job Category & Description Controls */}
      <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            Target Job Category (Kaggle Standard)
          </label>
          <select
            value={targetCategory}
            onChange={handleCategoryChange}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {KAGGLE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-2">
            NLP model evaluates TF-IDF keyword weights against this domain requirement.
          </p>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-indigo-400" />
            Target Job Description (JD Criteria)
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
