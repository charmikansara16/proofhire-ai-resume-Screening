import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import ResumeUploader from './components/ResumeUploader';
import AnalysisDashboard from './components/AnalysisDashboard';
import PhotoAnalyzer from './components/PhotoAnalyzer';
import SkillGapChart from './components/SkillGapChart';
import KaggleDatasetViewer from './components/KaggleDatasetViewer';
import CandidateComparison from './components/CandidateComparison';
import AuthModal from './components/AuthModal';

import { SAMPLE_CANDIDATES, SAMPLE_JOB_DESCRIPTIONS } from './services/sampleData';
import { classifyResumeCategory, calculateJobMatch, extractExperience } from './services/nlpEngine';
import { analyzeResume, getCurrentUser, clearAuthSession } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('evaluator'); // 'evaluator' | 'comparison' | 'dataset'
  const [mode, setMode] = useState('candidate'); // 'candidate' | 'recruiter'
  const [user, setUser] = useState(getCurrentUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState('candidate');
  const [blindMode, setBlindMode] = useState(false);

  // Active Candidate State
  const [selectedCandidate, setSelectedCandidate] = useState(SAMPLE_CANDIDATES[0]);
  const [targetCategory, setTargetCategory] = useState(SAMPLE_CANDIDATES[0].trueCategory);
  const [jobDescription, setJobDescription] = useState(SAMPLE_JOB_DESCRIPTIONS['Data Science']);
  const [photoMetrics, setPhotoMetrics] = useState(null);
  const [customRequirements, setCustomRequirements] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  // Live Backend Analysis Result (if candidate ran backend analysis)
  const [liveAnalysis, setLiveAnalysis] = useState(null);

  // Compute fallback NLP metrics if live analysis not yet run
  const nlpAnalysis = useMemo(() => {
    if (liveAnalysis?.predicted_category) {
      return {
        primaryCategory: liveAnalysis.predicted_category,
        confidence: liveAnalysis.category_confidence || 92
      };
    }
    return classifyResumeCategory(selectedCandidate.resumeText);
  }, [selectedCandidate, liveAnalysis]);

  const jobMatch = useMemo(() => {
    if (liveAnalysis) {
      return {
        status: liveAnalysis.status,
        matchPercentage: liveAnalysis.match_score,
        match_score: liveAnalysis.match_score,
        skills_score: liveAnalysis.skills_score,
        scoring_formula: liveAnalysis.scoring_formula,
        scoring_explanation: liveAnalysis.scoring_explanation,
        totalMatchedCount: (liveAnalysis.direct_matches?.length || 0) + (liveAnalysis.transferable_skills?.length || 0),
        totalMissingCount: liveAnalysis.missing_evidence?.length || 0,
        matchedSkills: liveAnalysis.matched_skills || [],
        missingSkills: liveAnalysis.missing_skills || [],
        direct_matches: liveAnalysis.direct_matches || [],
        transferable_skills: liveAnalysis.transferable_skills || [],
        missing_evidence: liveAnalysis.missing_evidence || [],
        recommendation: liveAnalysis.recommendation || 'Evaluated',
        recommendationBadgeClass: liveAnalysis.recommendation_badge || 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        candidate_report: liveAnalysis.candidate_report,
        recruiter_report: liveAnalysis.recruiter_report,
        resume_sections: liveAnalysis.resume_sections
      };
    }
    return calculateJobMatch(selectedCandidate.resumeText, jobDescription);
  }, [selectedCandidate, jobDescription, liveAnalysis]);

  const experienceInfo = useMemo(() => {
    if (liveAnalysis?.experience_label) {
      return { text: liveAnalysis.experience_label };
    }
    return extractExperience(selectedCandidate.resumeText);
  }, [selectedCandidate, liveAnalysis]);

  const handleCustomAnalyze = async (newCandidateData) => {
    setAnalyzing(true);
    try {
      const formData = new FormData();
      if (newCandidateData.file) {
        formData.append('resume_file', newCandidateData.file);
      } else if (newCandidateData.rawText) {
        formData.append('raw_text', newCandidateData.rawText);
      }

      formData.append('candidate_name', newCandidateData.name);
      formData.append('candidate_email', newCandidateData.email || 'candidate@example.com');
      formData.append('target_category', newCandidateData.roleTitle || targetCategory);
      formData.append('job_description', jobDescription);

      const result = await analyzeResume(formData);
      setLiveAnalysis(result);

      const newCandidate = {
        id: result.application_id || `cand-${Date.now()}`,
        applicationId: result.application_id,
        name: newCandidateData.name,
        photoUrl: newCandidateData.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        trueCategory: newCandidateData.roleTitle || targetCategory,
        experienceYears: result.experience_years_detected || 3,
        email: newCandidateData.email || 'candidate@example.com',
        location: 'Remote / Direct Submission',
        summary: result.summary || (newCandidateData.rawText ? newCandidateData.rawText.substring(0, 180) + '...' : 'Candidate profile with verified resume credentials.'),
        resumeText: newCandidateData.rawText || '',
        resumeSections: result.resume_sections || null,
        photoMetrics: null
      };

      setSelectedCandidate(newCandidate);
      setTargetCategory(newCandidateData.roleTitle || targetCategory);
      setPhotoMetrics(null);
    } catch (e) {
      console.error("Backend analysis error, falling back to client engine:", e);
      // Fallback to client NLP analysis
      const newCandidate = {
        id: `custom-${Date.now()}`,
        name: newCandidateData.name,
        photoUrl: newCandidateData.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        trueCategory: newCandidateData.roleTitle || targetCategory,
        experienceYears: 3,
        email: newCandidateData.email || 'candidate@example.com',
        location: 'Remote',
        summary: newCandidateData.rawText ? newCandidateData.rawText.substring(0, 180) + '...' : 'Uploaded Candidate',
        resumeText: newCandidateData.rawText || '',
        photoMetrics: null
      };
      setSelectedCandidate(newCandidate);
      setLiveAnalysis(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectFromLeaderboard = (cand) => {
    setSelectedCandidate(cand);
    setLiveAnalysis(null);
    setTargetCategory(cand.trueCategory);
    if (SAMPLE_JOB_DESCRIPTIONS[cand.trueCategory]) {
      setJobDescription(SAMPLE_JOB_DESCRIPTIONS[cand.trueCategory]);
    }
    setActiveTab('evaluator');
  };

  const handleOpenAuth = (role = 'candidate') => {
    setAuthModalRole(role);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    setMode('candidate');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top sticky navigation */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        mode={mode}
        setMode={setMode}
        user={user}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Tab 1: Live Candidate Evaluator */}
        {activeTab === 'evaluator' && (
          <div className="space-y-8">
            <ResumeUploader
              selectedCandidate={selectedCandidate}
              setSelectedCandidate={setSelectedCandidate}
              targetCategory={targetCategory}
              setTargetCategory={setTargetCategory}
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              onCustomAnalyze={handleCustomAnalyze}
              mode={mode}
              analyzing={analyzing}
              customRequirements={customRequirements}
              setCustomRequirements={setCustomRequirements}
            />

            <AnalysisDashboard
              candidate={selectedCandidate}
              nlpAnalysis={nlpAnalysis}
              jobMatch={jobMatch}
              photoMetrics={photoMetrics}
              experienceInfo={experienceInfo}
              mode={mode}
              user={user}
              blindMode={blindMode}
              setBlindMode={setBlindMode}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PhotoAnalyzer
                candidate={selectedCandidate}
                photoMetrics={photoMetrics}
                setPhotoMetrics={setPhotoMetrics}
                resumeSections={jobMatch?.resume_sections}
              />
              <SkillGapChart jobMatch={jobMatch} />
            </div>
          </div>
        )}

        {/* Tab 2: Leaderboard */}
        {activeTab === 'comparison' && (
          <CandidateComparison
            onSelectCandidate={handleSelectFromLeaderboard}
            targetCategory={targetCategory}
            mode={mode}
            user={user}
            blindMode={blindMode}
          />
        )}

        {/* Tab 3: Kaggle Dataset Specs */}
        {activeTab === 'dataset' && (
          <KaggleDatasetViewer />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ProofHire • AI Resume Intelligence & Evidence-Based Screening System</p>
          <p className="text-slate-400">
            Powered by Scikit-Learn NLP benchmarks & Kaggle Resume Dataset
          </p>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole={authModalRole}
        onAuthSuccess={(u) => {
          setUser(u);
          if (u.role === 'recruiter') {
            setMode('recruiter');
          }
        }}
      />
    </div>
  );
}
