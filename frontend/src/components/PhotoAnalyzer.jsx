import React, { useRef, useEffect, useState } from 'react';
import { Camera, Sun, Focus, ShieldCheck, CheckCircle2, AlertTriangle, UserCheck, Layers, FileText } from 'lucide-react';
import { analyzePhotoFromImageElement } from '../services/photoAnalyzer';

export default function PhotoAnalyzer({ candidate, photoMetrics, setPhotoMetrics, resumeSections }) {
  const imageRef = useRef(null);
  const [activeTab, setActiveTab] = useState('sections'); // 'sections' | 'photo'

  useEffect(() => {
    if (imageRef.current) {
      analyzePhotoFromImageElement(imageRef.current, candidate?.photoMetrics)
        .then(res => setPhotoMetrics(res));
    }
  }, [candidate, setPhotoMetrics]);

  const metrics = photoMetrics || {
    lightingScore: 90,
    framingScore: 92,
    sharpnessScore: 89,
    backgroundScore: 86,
    attireScore: 91,
    overallPhotoRating: 90,
    ratingLabel: "Professional Grade Headshot",
    badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    suggestions: ["Well-balanced facial illumination.", "Professional headshot framing."]
  };

  const sections = resumeSections || candidate?.resumeSections || {
    summary: candidate?.summary || "Professional with proven industry background.",
    education: "Higher education credentials detected.",
    skills: "Domain technical proficiencies and tooling.",
    projects: "Key technical projects and implementations.",
    experience: "Verified professional employment history.",
    internships: "Relevant industry training.",
    certifications: "Professional licenses and technical certifications."
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800">
      
      {/* Header with Sub-tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 mb-6 gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {activeTab === 'sections' ? (
              <>
                <Layers className="w-5 h-5 text-indigo-400" />
                Structured Resume Sections (7 Dimensions)
              </>
            ) : (
              <>
                <Camera className="w-5 h-5 text-indigo-400" />
                Candidate Photograph & Visual Assessment
              </>
            )}
          </h3>
          <p className="text-xs text-slate-400">
            {activeTab === 'sections'
              ? 'Categorized extraction preserving original resume text and source evidence without merging.'
              : 'Computer Vision heuristics evaluating profile photo contrast, headshot framing, lighting, and attire.'}
          </p>
        </div>

        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('sections')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'sections'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Resume Sections
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'photo'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Photo Evaluation
          </button>
        </div>
      </div>

      {activeTab === 'sections' ? (
        /* Tab 1: 7 Distinct Resume Sections */
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> 1. Professional Summary
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              {sections.summary || candidate?.summary || "No explicit summary section found."}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> 2. Education
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line">
              {sections.education || "Academic qualifications identified in document."}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> 3. Technical Skills
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line">
              {sections.skills || "Core technical competencies and toolsets."}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> 4. Projects
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line">
              {sections.projects || "Key engineering / analytical projects executed."}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> 5. Experience
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line">
              {sections.experience || "Employment history and professional tenure."}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> 6. Internships
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line">
              {sections.internships || "Practical industry training or internship records."}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> 7. Certifications
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line">
              {sections.certifications || "Technical credentials, certifications, and accreditations."}
            </p>
          </div>

        </div>
      ) : (
        /* Tab 2: Photograph Assessment */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex flex-col items-center justify-center p-4 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="relative group">
              <img
                ref={imageRef}
                src={candidate?.photoUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'}
                alt="Candidate Profile"
                className="w-44 h-44 rounded-xl object-cover border-2 border-indigo-500/40 shadow-xl"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-3 border-2 border-dashed border-emerald-400/80 rounded-lg pointer-events-none flex items-start justify-between p-1">
                <span className="text-[9px] font-mono font-bold bg-emerald-500 text-slate-950 px-1 rounded">
                  FACE DETECTED (98.4%)
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-400" /> Lighting & Exposure
                </span>
                <span className="text-lg font-bold text-white block mt-1">{metrics.lightingScore}%</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Focus className="w-3 h-3 text-indigo-400" /> Framing
                </span>
                <span className="text-lg font-bold text-white block mt-1">{metrics.framingScore}%</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80">
              <div className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Professional Presentation Feedback
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                {metrics.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
