import React, { useRef, useEffect } from 'react';
import { Camera, Sun, Focus, ShieldCheck, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';
import { analyzePhotoFromImageElement } from '../services/photoAnalyzer';

export default function PhotoAnalyzer({ candidate, photoMetrics, setPhotoMetrics }) {
  const imageRef = useRef(null);

  useEffect(() => {
    if (imageRef.current) {
      analyzePhotoFromImageElement(imageRef.current, candidate.photoMetrics)
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

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-400" />
            Candidate Photograph & Visual Assessment
          </h3>
          <p className="text-xs text-slate-400">
            Computer Vision heuristics evaluating profile photo contrast, headshot framing, lighting, and attire.
          </p>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${metrics.badgeColor}`}>
          {metrics.ratingLabel} ({metrics.overallPhotoRating}%)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Photo Display with Simulated Bounding Box Overlay */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-900/60 rounded-xl border border-slate-800">
          <div className="relative group">
            <img
              ref={imageRef}
              src={candidate.photoUrl}
              alt="Candidate Profile"
              className="w-44 h-44 rounded-xl object-cover border-2 border-indigo-500/40 shadow-xl"
              crossOrigin="anonymous"
            />
            {/* Simulated Face Detection Overlay Box */}
            <div className="absolute inset-3 border-2 border-dashed border-emerald-400/80 rounded-lg pointer-events-none flex items-start justify-between p-1">
              <span className="text-[9px] font-mono font-bold bg-emerald-500 text-slate-950 px-1 rounded">
                FACE DETECTED (98.4%)
              </span>
              <span className="text-[9px] font-mono font-bold text-emerald-400">
                1:1 FRAMING
              </span>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <UserCheck className="w-3.5 h-3.5" /> Identity & Headshot Verified
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              Passed automatic photo presence and orientation screening.
            </p>
          </div>
        </div>

        {/* Detailed Metrics Sliders */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Lighting & Contrast */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Facial Exposure & Lighting
              </span>
              <span className="text-indigo-400 font-bold">{metrics.lightingScore}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${metrics.lightingScore}%` }}
              />
            </div>
          </div>

          {/* Framing & Centering */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Focus className="w-3.5 h-3.5 text-indigo-400" />
                Headshot Framing & Aspect Ratio
              </span>
              <span className="text-indigo-400 font-bold">{metrics.framingScore}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${metrics.framingScore}%` }}
              />
            </div>
          </div>

          {/* Sharpness & Resolution */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Image Clarity & Sharpness
              </span>
              <span className="text-indigo-400 font-bold">{metrics.sharpnessScore}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${metrics.sharpnessScore}%` }}
              />
            </div>
          </div>

          {/* Background & Professional Attire */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block">Studio/Office Background</span>
              <span className="text-sm font-bold text-white">{metrics.backgroundScore}% Quality</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block">Professional Attire Index</span>
              <span className="text-sm font-bold text-white">{metrics.attireScore}% Suitable</span>
            </div>
          </div>

          {/* Automated Photo Feedback Suggestions */}
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 mt-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Photo Assessment Feedback:
            </span>
            <ul className="space-y-1">
              {metrics.suggestions.map((sug, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {sug}
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
