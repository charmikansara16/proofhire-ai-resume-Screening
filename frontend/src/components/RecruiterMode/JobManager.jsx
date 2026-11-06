import React, { useState } from 'react';
import { Briefcase, PlusCircle, CheckCircle2, AlertCircle, X, Users, Calendar, Sparkles } from 'lucide-react';

export default function JobManager({ jobs = [], onCreateJob, loading = false }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [description, setDescription] = useState('');
  const [requiredSkillsStr, setRequiredSkillsStr] = useState('');
  const [preferredSkillsStr, setPreferredSkillsStr] = useState('');
  const [minExp, setMinExp] = useState(3);
  const [targetCategory, setTargetCategory] = useState('Data Science');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Job Title and Job Description are required.");
      return;
    }

    const reqSkills = requiredSkillsStr.split(',').map(s => s.trim()).filter(Boolean);
    const prefSkills = preferredSkillsStr.split(',').map(s => s.trim()).filter(Boolean);

    try {
      await onCreateJob({
        title: title.trim(),
        department: department.trim(),
        description: description.trim(),
        required_skills: reqSkills,
        preferred_skills: prefSkills,
        min_experience_years: parseInt(minExp, 10) || 0,
        target_category: targetCategory
      });
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setRequiredSkillsStr('');
      setPreferredSkillsStr('');
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to create job opening');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Create Button */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-400" />
            Active Job Openings & Requirements
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your organization's open positions, core skills benchmarks, and applicant screening thresholds.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md glow-accent transition-all self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Job Opening</span>
        </button>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length > 0 ? (
          jobs.map((j) => (
            <div key={j.id} className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between hover:border-purple-500/50 transition-all">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                    {j.department}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    {j.applicant_count || 0} Applicants
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2">{j.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                  {j.description}
                </p>

                {/* Required Skills Chips */}
                <div className="mb-4">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                    Required Core Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(j.required_skills || []).map((s, idx) => (
                      <span key={idx} className="text-[11px] font-semibold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Min Experience: <strong className="text-white">{j.min_experience_years}+ Yrs</strong></span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full glass-panel rounded-2xl p-12 text-center border border-slate-800">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Active Job Openings Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Post your first job opening to start automatically screening candidate resumes and ranking applicants.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-md glow-accent"
            >
              Post First Job
            </button>
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-purple-400" />
              Post New Job Opening
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Define the role requirements and competencies for automated AI evidence matching.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Machine Learning Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Artificial Intelligence"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Required Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Python, PyTorch, FastAPI, Kubernetes, SQL"
                  value={requiredSkillsStr}
                  onChange={(e) => setRequiredSkillsStr(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Preferred / Nice-to-Have Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Docker, AWS, Spark, Git"
                  value={preferredSkillsStr}
                  onChange={(e) => setPreferredSkillsStr(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum Experience (Years)</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={minExp}
                    onChange={(e) => setMinExp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Category</label>
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Data Science">Data Science</option>
                    <option value="Java Developer">Java Developer</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Full Stack / Web">Full Stack / Web</option>
                    <option value="Python Developer">Python Developer</option>
                    <option value="HR & Recruitment">HR & Recruitment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Job Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste complete job description detailing responsibilities and qualifications..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-md glow-accent"
                >
                  Create Job Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
