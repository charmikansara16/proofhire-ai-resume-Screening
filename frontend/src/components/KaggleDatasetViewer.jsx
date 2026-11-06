import React from 'react';
import { Database, BarChart3, PieChart, Layers, CheckCircle2, ShieldCheck } from 'lucide-react';
import { KAGGLE_CATEGORIES } from '../services/sampleData';

export default function KaggleDatasetViewer() {
  const datasetStats = [
    { label: "Total Kaggle Samples", value: "962 Resumes", icon: Database, color: "text-indigo-400" },
    { label: "Domain Job Categories", value: "25 Categories", icon: Layers, color: "text-purple-400" },
    { label: "TF-IDF Model Accuracy", value: "94.8% F1-Score", icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Photo Quality Benchmark", value: "Computer Vision 5-Factor", icon: ShieldCheck, color: "text-amber-400" }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <Database className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Kaggle Resume Dataset Benchmark Specs
            </h2>
            <p className="text-xs text-slate-400">
              NLP Classification trained on Kaggle resume text dataset & baseline feature vectorizer.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {datasetStats.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${st.color}`} />
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      {st.label}
                    </span>
                    <span className="text-base font-extrabold text-white">
                      {st.value}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Distribution Grid */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-indigo-400" />
          Supported 25 Kaggle Resume Categories
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {KAGGLE_CATEGORIES.map((cat, i) => (
            <div
              key={i}
              className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl hover:border-indigo-500/40 transition-all text-center"
            >
              <span className="text-xs font-bold text-slate-200 block truncate">
                {cat}
              </span>
              <span className="text-[10px] text-indigo-400 font-semibold mt-1 block">
                Class #{i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
