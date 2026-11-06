import React from 'react';
import { Award, CheckCircle, ShieldAlert, Cpu, Sparkles, User, Mail, MapPin, Calendar } from 'lucide-react';

export default function AnalysisDashboard({ 
  candidate, 
  nlpAnalysis, 
  jobMatch, 
  photoMetrics, 
  experienceInfo 
}) {
  // Calculate combined score: 70% NLP Text & Skill match + 30% Photograph & Professionalism rating
  const overallScore = Math.round(
    (jobMatch.matchPercentage * 0.70) + ((photoMetrics?.overallPhotoRating || 90) * 0.30)
  );

  const categoryMatch = nlpAnalysis.primaryCategory === candidate.trueCategory;

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
                src={candidate.photoUrl}
                alt={candidate.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400">
                {nlpAnalysis.confidence}% NLP
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  {candidate.name}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${jobMatch.recommendationBadgeClass}`}>
                  {jobMatch.recommendation}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  {candidate.email}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {candidate.location}
                </span>
                <span className="flex items-center gap-1 text-slate-300 font-semibold bg-slate-800/80 px-2 py-0.5 rounded">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {experienceInfo.text}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-3 max-w-2xl line-clamp-2 leading-relaxed">
                {candidate.summary}
              </p>
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
                    strokeDashoffset={289 - (289 * overallScore) / 100}
                    strokeLinecap="round"
                    className="text-indigo-500 transition-all duration-1000 ease-out"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-white">{overallScore}%</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    Overall Fit
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Metrics Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* NLP Category Classification Card */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Predicted Job Category
            </span>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              {nlpAnalysis.confidence}% Match
            </span>
          </div>

          <div className="text-xl font-bold text-white mb-1">
            {nlpAnalysis.primaryCategory}
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

        {/* Skill & JD Cosine Match Card */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              JD Keyword Similarity
            </span>
            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              70% Weight
            </span>
          </div>

          <div className="text-xl font-bold text-white mb-1">
            {jobMatch.matchPercentage}% Relevance
          </div>

          <p className="text-xs text-slate-400 mt-2">
            {jobMatch.totalMatchedCount} matched skills out of {jobMatch.totalMatchedCount + jobMatch.totalMissingCount} requested JD criteria.
          </p>
        </div>

        {/* Photograph Assessment Score Card */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-400" />
              Photograph Assessment
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              30% Weight
            </span>
          </div>

          <div className="text-xl font-bold text-white mb-1">
            {photoMetrics?.overallPhotoRating || 90}% Rating
          </div>

          <p className="text-xs text-slate-400 mt-2">
            {photoMetrics?.ratingLabel || "Professional Grade Headshot"}
          </p>
        </div>

      </div>

    </div>
  );
}
