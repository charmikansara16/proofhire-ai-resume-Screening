import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AuthModal from './components/AuthModal';

// Candidate Mode Components
import ResumeUploader from './components/CandidateMode/ResumeUploader';
import EvidenceViewer from './components/CandidateMode/EvidenceViewer';
import CandidateHistory from './components/CandidateMode/CandidateHistory';
import PhotoAnalyzer from './components/PhotoAnalyzer';

// Recruiter Mode Components
import RecruiterDashboard from './components/RecruiterMode/RecruiterDashboard';
import JobManager from './components/RecruiterMode/JobManager';
import CandidateComparison from './components/RecruiterMode/CandidateComparison';
import ResumeBatchUploader from './components/RecruiterMode/ResumeBatchUploader';

import {
  getCurrentUser,
  clearAuthSession,
  getProfile,
  getJobs,
  createJob,
  analyzeResume,
  getCandidateApplications,
  getRecruiterDashboard,
  getRecruiterCandidates
} from './services/api';

export default function App() {
  const [mode, setMode] = useState('candidate'); // 'candidate' | 'recruiter'
  const [activeTab, setActiveTab] = useState('evaluator'); // candidate: evaluator | history; recruiter: dashboard | leaderboard | jobs | upload
  const [user, setUser] = useState(getCurrentUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState('candidate');

  // Candidate State
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [targetCategory, setTargetCategory] = useState('Data Science');
  const [jobDescription, setJobDescription] = useState(
    'Senior Machine Learning Scientist / AI Engineer\nRequirements: 3+ years experience with Python, PyTorch, Scikit-learn, SQL, and FastAPI. Experience with NLP, Large Language Models (LLM), and Docker.'
  );
  const [analysisResult, setAnalysisResult] = useState(null);
  const [candidateApplications, setCandidateApplications] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  // Recruiter State
  const [recruiterStats, setRecruiterStats] = useState(null);
  const [recruiterCandidates, setRecruiterCandidates] = useState([]);
  const [recruiterJobFilter, setRecruiterJobFilter] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    loadJobs();
    if (user) {
      if (user.role === 'recruiter') {
        loadRecruiterData();
      } else {
        loadCandidateHistory();
      }
    }
  }, [user]);

  const loadJobs = async () => {
    try {
      const data = await getJobs();
      setJobs(data);
      if (data.length > 0 && !selectedJobId) {
        // Pre-fill target category and description from first job if available
        setSelectedJobId(data[0].id);
        setJobDescription(data[0].description);
        setTargetCategory(data[0].target_category || 'Data Science');
      }
    } catch (e) {
      console.error("Failed to load jobs:", e);
    }
  };

  const loadCandidateHistory = async () => {
    try {
      const apps = await getCandidateApplications();
      setCandidateApplications(apps);
    } catch (e) {
      console.error("Failed to load candidate applications:", e);
    }
  };

  const loadRecruiterData = async () => {
    setLoadingData(true);
    try {
      const [stats, cands] = await Promise.all([
        getRecruiterDashboard(),
        getRecruiterCandidates()
      ]);
      setRecruiterStats(stats);
      setRecruiterCandidates(cands);
    } catch (e) {
      console.error("Failed to load recruiter data:", e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleOpenAuth = (role = 'candidate') => {
    setAuthModalRole(role);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    if (authenticatedUser.role === 'recruiter') {
      setMode('recruiter');
      setActiveTab('dashboard');
    } else {
      setMode('candidate');
      setActiveTab('evaluator');
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    setMode('candidate');
    setActiveTab('evaluator');
    setCandidateApplications([]);
    setRecruiterCandidates([]);
    setRecruiterStats(null);
  };

  const handleAnalyzeResume = async (formData) => {
    setAnalyzing(true);
    try {
      const result = await analyzeResume(formData);
      setAnalysisResult(result);
      if (user && user.role === 'candidate') {
        loadCandidateHistory();
      }
    } catch (err) {
      alert(err.message || "Failed to analyze resume.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreateJob = async (jobData) => {
    await createJob(jobData);
    await loadJobs();
    if (user && user.role === 'recruiter') {
      await loadRecruiterData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Top sticky navigation */}
      <Header
        mode={mode}
        setMode={setMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => handleOpenAuth(mode)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* CANDIDATE MODE */}
        {mode === 'candidate' && (
          <>
            {activeTab === 'evaluator' && (
              <div className="space-y-8 animate-fade-in">
                <ResumeUploader
                  jobs={jobs}
                  onAnalyze={handleAnalyzeResume}
                  loading={analyzing}
                  targetCategory={targetCategory}
                  setTargetCategory={setTargetCategory}
                  jobDescription={jobDescription}
                  setJobDescription={setJobDescription}
                  selectedJobId={selectedJobId}
                  setSelectedJobId={setSelectedJobId}
                />

                {analysisResult && (
                  <EvidenceViewer analysis={analysisResult} />
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="animate-fade-in">
                {user ? (
                  <CandidateHistory
                    applications={candidateApplications}
                    onSelectApplication={(app) => {
                      setAnalysisResult(app);
                      setActiveTab('evaluator');
                    }}
                  />
                ) : (
                  <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800">
                    <h3 className="text-base font-bold text-white mb-2">Sign In to View Application History</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                      Create a free candidate account to securely preserve your evaluated resumes, evidence breakdowns, and downloadable PDF reports.
                    </p>
                    <button
                      onClick={() => handleOpenAuth('candidate')}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md glow-primary transition-all"
                    >
                      Sign In / Register as Candidate
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* RECRUITER MODE */}
        {mode === 'recruiter' && (
          <>
            {!user || user.role !== 'recruiter' ? (
              <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 animate-fade-in max-w-xl mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">🏢</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Recruiter & Organization Access Required
                </h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  ProofHire Recruiter Mode enforces multi-tenant organization data isolation. Sign in or register your organization to manage job postings, review ranked leaderboards, and audit hiring decisions.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => handleOpenAuth('recruiter')}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md glow-accent transition-all"
                  >
                    Register / Sign In as Recruiter
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                {activeTab === 'dashboard' && (
                  <RecruiterDashboard
                    stats={recruiterStats}
                    orgName={user.organization_name}
                    onNavigate={(tab) => setActiveTab(tab)}
                  />
                )}

                {activeTab === 'leaderboard' && (
                  <CandidateComparison
                    candidates={recruiterCandidates}
                    jobs={jobs}
                    selectedJobId={recruiterJobFilter}
                    setSelectedJobId={setRecruiterJobFilter}
                    onRefresh={loadRecruiterData}
                    loading={loadingData}
                  />
                )}

                {activeTab === 'jobs' && (
                  <JobManager
                    jobs={jobs}
                    onCreateJob={handleCreateJob}
                    loading={loadingData}
                  />
                )}

                {activeTab === 'upload' && (
                  <ResumeBatchUploader
                    jobs={jobs}
                    onUploadSuccess={() => {
                      loadRecruiterData();
                      setActiveTab('leaderboard');
                    }}
                  />
                )}
              </div>
            )}
          </>
        )}

      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole={authModalRole}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          ProofHire AI Resume Intelligence Platform • Production Portfolio • Built with FastAPI, PostgreSQL, and React
        </div>
      </footer>

    </div>
  );
}
