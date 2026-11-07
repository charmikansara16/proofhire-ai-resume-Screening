import React, { useState, useMemo, useEffect } from 'react';
import {
  Search as SearchIcon, FileText as FileTextIcon, Upload as UploadIcon,
  Users as UsersIcon, Check as CheckIcon, X as XIcon, Plus as PlusIcon,
  Target as TargetIcon, Sparkles as SparklesIcon, HelpCircle as HelpCircleIcon,
  Briefcase as BriefcaseIcon, RefreshCw as RefreshCwIcon, Printer as PrinterIcon,
  CheckCircle2 as CheckCircle2Icon
} from 'lucide-react';

// ============================================================================
// DESIGN SYSTEM STYLES (Warm Paper #F6F4F0, Ink #111111, Coral #EE7564)
// ============================================================================
const FONT_AND_THEME_CSS = `
  .font-display { font-family: 'DM Serif Display', Georgia, serif; line-height: 0.95; letter-spacing: -0.02em; }
  .font-sans { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; }
  .font-mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
  .font-serif { font-family: 'Source Serif 4', Georgia, serif; line-height: 1.6; }

  /* Marker Yellow Evidence Highlight Block */
  .marker-highlight {
    background-color: rgba(255, 229, 138, 0.7);
    color: #111111;
    border-radius: 2px;
    padding: 0px 4px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }

  @keyframes pulseCoral {
    0% { outline: 3px solid #EE7564; box-shadow: 0 0 12px rgba(238, 117, 100, 0.5); }
    50% { outline: 3px solid #EE7564; box-shadow: 0 0 20px rgba(238, 117, 100, 0.8); }
    100% { outline: 2px solid transparent; box-shadow: none; }
  }
  .animate-pulse-coral {
    animation: pulseCoral 1.8s cubic-bezier(0.4, 0, 0.6, 1);
  }

  /* Redaction Hatching for Blind Mode (Recruiter Only) */
  .redacted-bar {
    background: repeating-linear-gradient(
      45deg,
      #2B2825,
      #2B2825 6px,
      #151413 6px,
      #151413 12px
    );
    color: transparent !important;
    user-select: none;
    border-radius: 3px;
    display: inline-block;
  }
`;

// ============================================================================
// PRE-CONFIGURED GENERAL ROLE TEMPLATES FOR CANDIDATE & RECRUITER MODE
// ============================================================================
const PREDEFINED_GENERAL_ROLES = [
  {
    id: "role-financial-analyst",
    title: "Financial Analyst",
    organization: "General Role Standard Profile",
    targetYears: 3,
    requirements: [
      { id: "fa-1", title: "Financial Statements & Accounting Principles (P&L, Balance Sheet, Cash Flow)", weight: 5, must_have: true, techKeywords: ["financial statements", "p&l", "balance sheet", "cash flow", "gaap", "ifrs", "accounting"] },
      { id: "fa-2", title: "Financial Modeling & Valuation (DCF / LBO / Multiples)", weight: 5, must_have: true, techKeywords: ["financial modeling", "dcf", "discounted cash flow", "valuation", "lbo", "financial model", "npv", "irr"] },
      { id: "fa-3", title: "Budgeting, Forecasting & Variance Analysis", weight: 4, must_have: true, techKeywords: ["budgeting", "forecasting", "variance analysis", "budget", "financial planning", "fp&a"] },
      { id: "fa-4", title: "Financial Data Analysis & Reporting (Advanced Excel, Financial Ratios)", weight: 4, must_have: true, techKeywords: ["excel", "pivot tables", "financial analysis", "ratios", "financial reporting", "variance"] },
      { id: "fa-5", title: "Transferable Quantitative & Analytical Tools (SQL / Python / PowerBI)", weight: 3, must_have: false, isTransferableOnly: true, techKeywords: ["sql", "powerbi", "tableau", "python", "data analysis", "r", "pandas"] },
      { id: "fa-6", title: "Education in Finance, Economics, or Accounting (B.Com / MBA / CFA / B.S.)", weight: 3, must_have: true, techKeywords: ["finance", "economics", "accounting", "cfa", "mba", "b.com", "bba", "bachelor"] }
    ]
  },
  {
    id: "role-data-analyst",
    title: "Data Analyst",
    organization: "General Role Standard Profile",
    targetYears: 2,
    requirements: [
      { id: "da-1", title: "SQL & Relational Querying", weight: 5, must_have: true, techKeywords: ["sql", "mysql", "postgresql", "queries", "joins", "group by"] },
      { id: "da-2", title: "Data Visualization (PowerBI / Tableau / Excel)", weight: 5, must_have: true, techKeywords: ["tableau", "power bi", "powerbi", "visualization", "dashboards", "excel"] },
      { id: "da-3", title: "Python Data Analysis (Pandas / NumPy)", weight: 4, must_have: true, techKeywords: ["python", "pandas", "numpy", "data analysis"] },
      { id: "da-4", title: "Exploratory Data Analysis (EDA) & Data Cleaning", weight: 4, must_have: true, techKeywords: ["eda", "data cleaning", "preprocessing", "missing values", "outliers"] },
      { id: "da-5", title: "Statistical Fundamentals & Hypothesis Testing", weight: 3, must_have: false, techKeywords: ["statistics", "statistical", "hypothesis", "a/b testing", "regression"] }
    ]
  },
  {
    id: "role-data-scientist",
    title: "Data Scientist",
    organization: "General Role Standard Profile",
    targetYears: 3,
    requirements: [
      { id: "ds-1", title: "Python Programming & Data Science Stack", weight: 5, must_have: true, techKeywords: ["python", "numpy", "pandas", "scipy"] },
      { id: "ds-2", title: "Machine Learning Algorithms & Scikit-Learn", weight: 5, must_have: true, techKeywords: ["machine learning", "scikit-learn", "sklearn", "classification", "regression", "clustering", "xgboost"] },
      { id: "ds-3", title: "SQL & Data Extraction", weight: 4, must_have: true, techKeywords: ["sql", "queries", "relational", "postgresql", "mysql"] },
      { id: "ds-4", title: "Feature Engineering & Model Evaluation", weight: 4, must_have: true, techKeywords: ["feature engineering", "model evaluation", "cross validation", "metrics", "roc-auc", "precision"] },
      { id: "ds-5", title: "Deep Learning (TensorFlow / PyTorch)", weight: 3, must_have: false, techKeywords: ["tensorflow", "pytorch", "keras", "deep learning", "neural networks"] }
    ]
  },
  {
    id: "role-aiml-engineer",
    title: "AI/ML Engineer",
    organization: "General Role Standard Profile",
    targetYears: 3,
    requirements: [
      { id: "ml-1", title: "Python Programming & Core Data Stack", weight: 5, must_have: true, techKeywords: ["python", "numpy", "pandas"] },
      { id: "ml-2", title: "Machine Learning & Statistical Modeling", weight: 5, must_have: true, techKeywords: ["machine learning", "scikit-learn", "predictive analysis", "eda", "model training", "model evaluation"] },
      { id: "ml-3", title: "Natural Language Processing (NLP) & GenAI / LLMs", weight: 4, must_have: true, techKeywords: ["nlp", "natural language processing", "llm", "llms", "genai", "generative ai", "rag", "embeddings", "prompt engineering"] },
      { id: "ml-4", title: "SQL & Relational Databases (MySQL / PostgreSQL)", weight: 4, must_have: true, techKeywords: ["sql", "mysql", "postgresql", "database", "relational"] },
      { id: "ml-5", title: "Data Preprocessing & Analytics (Pandas / Scikit-Learn)", weight: 3, must_have: false, techKeywords: ["data cleaning", "preprocessing", "exploratory data", "pandas", "scikit-learn", "data analysis"] },
      { id: "ml-6", title: "Cloud Infrastructure & Docker / Containerization", weight: 3, must_have: false, techKeywords: ["docker", "kubernetes", "aws", "gcp", "azure", "containerization", "cloud infrastructure"] },
      { id: "ml-7", title: "RESTful APIs & Backend Architecture", weight: 3, must_have: false, techKeywords: ["restful", "fastapi", "express", "backend architecture", "rest api"] }
    ]
  },
  {
    id: "role-python-dev",
    title: "Python Developer",
    organization: "General Role Standard Profile",
    targetYears: 3,
    requirements: [
      { id: "py-1", title: "Core Python Programming & OOP", weight: 5, must_have: true, techKeywords: ["python", "object oriented", "oop", "functions", "modules"] },
      { id: "py-2", title: "Backend Web Frameworks (Django / FastAPI / Flask)", weight: 5, must_have: true, techKeywords: ["django", "fastapi", "flask", "web framework"] },
      { id: "py-3", title: "RESTful API Design & Integration", weight: 4, must_have: true, techKeywords: ["rest", "api", "restful", "json", "endpoints"] },
      { id: "py-4", title: "SQL Databases & ORM (SQLAlchemy / PostgreSQL)", weight: 4, must_have: true, techKeywords: ["sql", "postgresql", "mysql", "sqlalchemy", "orm", "database"] },
      { id: "py-5", title: "Git Version Control & Unit Testing (Pytest)", weight: 3, must_have: false, techKeywords: ["git", "github", "pytest", "unit testing", "testing"] }
    ]
  },
  {
    id: "role-software-engineer",
    title: "Software Engineer",
    organization: "General Role Standard Profile",
    targetYears: 2,
    requirements: [
      { id: "swe-1", title: "Data Structures & Algorithms", weight: 5, must_have: true, techKeywords: ["data structures", "algorithms", "complexity", "arrays", "trees", "graphs"] },
      { id: "swe-2", title: "Object-Oriented Programming (Java / C++ / Python)", weight: 5, must_have: true, techKeywords: ["java", "c++", "python", "oop", "design patterns"] },
      { id: "swe-3", title: "Git & Collaborative Code Reviews", weight: 4, must_have: true, techKeywords: ["git", "github", "gitlab", "version control", "pull requests"] },
      { id: "swe-4", title: "Database Systems & SQL Queries", weight: 4, must_have: true, techKeywords: ["sql", "database", "mysql", "postgresql", "queries"] },
      { id: "swe-5", title: "CI/CD & Automated Testing", weight: 3, must_have: false, techKeywords: ["ci/cd", "jenkins", "github actions", "unit test", "automated testing"] }
    ]
  },
  {
    id: "role-backend-dev",
    title: "Backend Developer",
    organization: "General Role Standard Profile",
    targetYears: 3,
    requirements: [
      { id: "be-1", title: "Server-side Languages (Node.js / Python / Java)", weight: 5, must_have: true, techKeywords: ["node.js", "nodejs", "express", "python", "java", "golang"] },
      { id: "be-2", title: "REST & GraphQL API Architecture", weight: 5, must_have: true, techKeywords: ["rest api", "graphql", "microservices", "endpoints", "json"] },
      { id: "be-3", title: "Relational & NoSQL Databases (PostgreSQL / MongoDB / Redis)", weight: 4, must_have: true, techKeywords: ["postgresql", "mysql", "mongodb", "redis", "caching", "sql"] },
      { id: "be-4", title: "Authentication & System Security (JWT / OAuth)", weight: 4, must_have: true, techKeywords: ["jwt", "oauth", "authentication", "security", "encryption"] },
      { id: "be-5", title: "Docker & Container Deployment", weight: 3, must_have: false, techKeywords: ["docker", "containerization", "kubernetes", "deployment"] }
    ]
  },
  {
    id: "role-frontend-dev",
    title: "Frontend Developer",
    organization: "General Role Standard Profile",
    targetYears: 2,
    requirements: [
      { id: "fe-1", title: "JavaScript (ES6+) & TypeScript", weight: 5, must_have: true, techKeywords: ["javascript", "typescript", "es6", "async/await"] },
      { id: "fe-2", title: "Modern UI Frameworks (React / Next.js / Vue)", weight: 5, must_have: true, techKeywords: ["react", "next.js", "vue", "angular", "jsx", "tsx"] },
      { id: "fe-3", title: "HTML5, CSS3 & Responsive Styling (Tailwind / Bootstrap)", weight: 4, must_have: true, techKeywords: ["html5", "css3", "tailwind", "bootstrap", "responsive", "flexbox", "grid"] },
      { id: "fe-4", title: "State Management & REST API Integration", weight: 4, must_have: true, techKeywords: ["state management", "redux", "zustand", "context api", "fetch", "axios"] },
      { id: "fe-5", title: "Web Performance & Component Testing", weight: 3, must_have: false, techKeywords: ["performance", "lighthouse", "jest", "cypress", "unit test"] }
    ]
  },
  {
    id: "role-fullstack-dev",
    title: "Full Stack Developer",
    organization: "General Role Standard Profile",
    targetYears: 3,
    requirements: [
      { id: "fs-1", title: "Frontend UI Technologies (React / JavaScript / HTML5 / CSS3)", weight: 5, must_have: true, techKeywords: ["react", "javascript", "typescript", "html5", "css3"] },
      { id: "fs-2", title: "Backend Frameworks (Node.js / Python / Express / Django)", weight: 5, must_have: true, techKeywords: ["node.js", "express", "python", "django", "fastapi"] },
      { id: "fs-3", title: "Database Management (SQL / PostgreSQL / MongoDB)", weight: 4, must_have: true, techKeywords: ["sql", "postgresql", "mysql", "mongodb", "database"] },
      { id: "fs-4", title: "RESTful API Integration & Web Security", weight: 4, must_have: true, techKeywords: ["rest api", "jwt", "auth", "security", "json"] },
      { id: "fs-5", title: "Git, DevOps Basics & Cloud Deployment", weight: 3, must_have: false, techKeywords: ["git", "docker", "aws", "gcp", "ci/cd", "deployment"] }
    ]
  },
  {
    id: "role-business-analyst",
    title: "Business Analyst",
    organization: "General Role Standard Profile",
    targetYears: 2,
    requirements: [
      { id: "ba-1", title: "Requirements Gathering & Business Process Modeling", weight: 5, must_have: true, techKeywords: ["requirements", "business process", "use cases", "user stories", "bpmn"] },
      { id: "ba-2", title: "Data Analysis & SQL Querying", weight: 5, must_have: true, techKeywords: ["sql", "excel", "data analysis", "reporting", "queries"] },
      { id: "ba-3", title: "Stakeholder Management & Agile Documentation", weight: 4, must_have: true, techKeywords: ["stakeholder", "agile", "jira", "confluence", "documentation", "sprints"] },
      { id: "ba-4", title: "Data Visualization & Dashboards (Tableau / PowerBI)", weight: 4, must_have: true, techKeywords: ["tableau", "power bi", "dashboards", "visualization"] },
      { id: "ba-5", title: "Financial / Business Metrics & KPI Tracking", weight: 3, must_have: false, techKeywords: ["kpi", "metrics", "roi", "cost benefit", "financial modeling"] }
    ]
  },
  {
    id: "role-cloud-engineer",
    title: "Cloud Engineer",
    organization: "General Role Standard Profile",
    targetYears: 3,
    requirements: [
      { id: "ce-1", title: "Public Cloud Platforms (AWS / GCP / Azure)", weight: 5, must_have: true, techKeywords: ["aws", "gcp", "azure", "ec2", "s3", "cloud"] },
      { id: "ce-2", title: "Infrastructure as Code (Terraform / CloudFormation)", weight: 5, must_have: true, techKeywords: ["terraform", "cloudformation", "ansible", "infrastructure as code", "iac"] },
      { id: "ce-3", title: "Containerization & Orchestration (Docker / Kubernetes)", weight: 4, must_have: true, techKeywords: ["docker", "kubernetes", "k8s", "containers", "helm"] },
      { id: "ce-4", title: "Linux Systems Administration & Scripting (Bash / Python)", weight: 4, must_have: true, techKeywords: ["linux", "bash", "shell", "python", "scripting"] },
      { id: "ce-5", title: "Cloud Security & Identity Management (IAM)", weight: 3, must_have: false, techKeywords: ["iam", "security", "vpc", "firewall", "compliance"] }
    ]
  },
  {
    id: "role-devops-engineer",
    title: "DevOps Engineer",
    organization: "General Role Standard Profile",
    targetYears: 3,
    requirements: [
      { id: "do-1", title: "CI/CD Pipeline Automation (GitHub Actions / Jenkins / GitLab)", weight: 5, must_have: true, techKeywords: ["ci/cd", "github actions", "jenkins", "gitlab ci", "pipeline"] },
      { id: "do-2", title: "Docker & Kubernetes Orchestration", weight: 5, must_have: true, techKeywords: ["docker", "kubernetes", "k8s", "helm", "containers"] },
      { id: "do-3", title: "Infrastructure as Code (Terraform / Ansible)", weight: 4, must_have: true, techKeywords: ["terraform", "ansible", "cloudformation", "iac"] },
      { id: "do-4", title: "Monitoring & Observability (Prometheus / Grafana / ELK)", weight: 4, must_have: true, techKeywords: ["prometheus", "grafana", "elk", "monitoring", "logging", "datadog"] },
      { id: "do-5", title: "Linux Administration & Bash / Python Automation", weight: 3, must_have: false, techKeywords: ["linux", "bash", "python", "scripting", "cron"] }
    ]
  },
  {
    id: "role-cybersecurity",
    title: "Cybersecurity Analyst",
    organization: "General Role Standard Profile",
    targetYears: 3,
    requirements: [
      { id: "sec-1", title: "Network Security & Protocol Analysis (Wireshark / Firewalls)", weight: 5, must_have: true, techKeywords: ["network security", "wireshark", "firewall", "tcp/ip", "dns", "vpn"] },
      { id: "sec-2", title: "Threat Analysis & SIEM Tools (Splunk / QRadar)", weight: 5, must_have: true, techKeywords: ["siem", "splunk", "soc", "threat intelligence", "incident response"] },
      { id: "sec-3", title: "Vulnerability Assessment & Penetration Testing", weight: 4, must_have: true, techKeywords: ["vulnerability", "penetration testing", "nessus", "nmap", "metasploit", "owasp"] },
      { id: "sec-4", title: "Security Frameworks & Compliance (NIST / ISO 27001)", weight: 4, must_have: true, techKeywords: ["nist", "iso 27001", "compliance", "gdpr", "hipaa", "security controls"] },
      { id: "sec-5", title: "Identity & Access Management (IAM / PKI)", weight: 3, must_have: false, techKeywords: ["iam", "pki", "mfa", "encryption", "active directory"] }
    ]
  },
  {
    id: "role-genai-engineer",
    title: "Generative AI Engineer",
    organization: "General Role Standard Profile",
    targetYears: 3,
    requirements: [
      { id: "gai-1", title: "Large Language Models (LLMs) & Transformers", weight: 5, must_have: true, techKeywords: ["llm", "llms", "large language models", "transformers", "gpt", "bert", "huggingface"] },
      { id: "gai-2", title: "Retrieval-Augmented Generation (RAG) & Vector Databases", weight: 5, must_have: true, techKeywords: ["rag", "retrieval augmented generation", "vector database", "pinecone", "chroma", "faiss", "qdrant", "embeddings"] },
      { id: "gai-3", title: "Python & Frameworks (LangChain / LlamaIndex / PyTorch)", weight: 4, must_have: true, techKeywords: ["python", "langchain", "llamaindex", "pytorch", "tensorflow"] },
      { id: "gai-4", title: "Prompt Engineering & Model Fine-Tuning (PEFT / LoRA)", weight: 4, must_have: true, techKeywords: ["prompt engineering", "fine-tuning", "lora", "peft", "quantization"] },
      { id: "gai-5", title: "REST API Deployment & MLOps", weight: 3, must_have: false, techKeywords: ["fastapi", "rest api", "mlops", "docker", "deployment", "triton"] }
    ]
  }
];

// DYNAMIC CUSTOM ROLE PROFILE GENERATOR
function generateCustomRoleProfile(titleString) {
  const clean = titleString.trim();
  const lower = clean.toLowerCase();

  return {
    id: `custom-role-${Date.now()}`,
    title: clean,
    organization: "General Role Standard Profile",
    targetYears: 3,
    requirements: [
      { id: `c-1`, title: `${clean} Domain Fundamentals & Principles`, weight: 5, must_have: true, techKeywords: lower.split(" ") },
      { id: `c-2`, title: `Core Analytical & Execution Tools for ${clean}`, weight: 5, must_have: true, techKeywords: [lower, "analysis", "tools", "reporting"] },
      { id: `c-3`, title: `Process Execution & Documentation`, weight: 4, must_have: true, techKeywords: ["process", "documentation", "execution", "management"] },
      { id: `c-4`, title: `Quantitative Data & Tool Competency`, weight: 4, must_have: false, techKeywords: ["excel", "sql", "data", "reporting", "metrics"] },
      { id: `c-5`, title: `Relevant Degree or Professional Certification`, weight: 3, must_have: true, techKeywords: ["bachelor", "master", "degree", "certification", "certified"] }
    ]
  };
}

// MULTI-SECTION TEXT PARSER
function sanitizePdfRawText(raw) {
  if (!raw) return "";
  return raw
    .replace(/%PDF-\d\.\d[\s\S]*?obj/g, '')
    .replace(/<<[\s\S]*?>>/g, '')
    .replace(/\/Filter\s*\/[A-Za-z0-9]+/g, '')
    .replace(/\/Length\s*\d+/g, '')
    .replace(/stream[\s\S]*?endstream/g, '')
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseResumeSections(cleanText) {
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const sections = {
    summary: [],
    education: [],
    skills: [],
    experience: [],
    internships: [],
    projects: [],
    certifications: []
  };

  let currentSec = 'summary';

  lines.forEach(line => {
    const lower = line.toLowerCase();
    if (/^(education|academic background|qualifications)/i.test(lower)) {
      currentSec = 'education';
    } else if (/^(technical skills|skills|technologies|core competencies|tools)/i.test(lower)) {
      currentSec = 'skills';
    } else if (/^(internships|internship experience)/i.test(lower)) {
      currentSec = 'internships';
    } else if (/^(work experience|professional experience|employment history|experience)/i.test(lower)) {
      currentSec = 'experience';
    } else if (/^(projects|academic projects|key projects|featured projects)/i.test(lower)) {
      currentSec = 'projects';
    } else if (/^(certifications|licenses|credentials|courses)/i.test(lower)) {
      currentSec = 'certifications';
    } else {
      sections[currentSec].push(line);
    }
  });

  return {
    summary: sections.summary.join(" ") || lines.slice(0, 3).join(" ") || "Professional summary extracted from resume text.",
    education: sections.education.join("\n") || lines.filter(l => /university|college|degree|b\.tech|b\.s|mba|b\.com|bba|cfa|bachelor|master|cgpa/i.test(l)).join("\n") || "Education details extracted.",
    skillsSection: sections.skills.join(" ") || lines.filter(l => /proficient|skills|python|sql|excel|financial|tableau|powerbi|java/i.test(l)).join(" ") || "Skills section parsed.",
    experience: sections.experience.length > 0 ? sections.experience : lines.filter(l => /developed|built|analyzed|managed|worked|model|forecast|budget/i.test(l)),
    internships: sections.internships.length > 0 ? sections.internships.join("\n") : lines.filter(l => /intern|trainee|apprentice/i.test(l)).join("\n") || "",
    projects: sections.projects.length > 0 ? sections.projects : lines.filter(l => /project|system|platform|valuation|analysis/i.test(l)),
    certifications: sections.certifications.join(" ") || lines.filter(l => /certified|certification|cfa|aws|pmp|finra/i.test(l)).join(" ") || ""
  };
}

function extractCandidateDataFromText(rawText, filename, jobProfile) {
  const sanitized = sanitizePdfRawText(rawText);
  const cleanText = sanitized.length > 20 ? sanitized : rawText || "";
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const parsedSecs = parseResumeSections(cleanText);

  // Extract Email & Phone
  const emailMatch = cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = cleanText.match(/(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/);
  
  // Smart Name Extraction
  let name = "Candidate";
  const baseFilename = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
  if (baseFilename && !/^(pdf|resume|cv|document|file|\d+)$/i.test(baseFilename)) {
    name = baseFilename.replace(/\b\w/g, c => c.toUpperCase());
  } else {
    for (const l of lines) {
      const cleanL = l.replace(/[^a-zA-Z\s]/g, '').trim();
      if (cleanL.length > 2 && cleanL.length < 35 && !/^(pdf|resume|curriculum|vitae|page|object|stream|filter|linearized)/i.test(cleanL)) {
        name = cleanL.replace(/\b\w/g, c => c.toUpperCase());
        break;
      }
    }
  }

  const randomId = Math.floor(1000 + Math.random() * 9000);
  const codeName = `Candidate ${randomId}`;

  // Sentences split
  const rawSentences = cleanText
    .split(/(?<=[.!?])\s+|\n+|[|•;]\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 5 && !/^(%pdf|<<|\/filter|\/type|\/xref)/i.test(s));

  let effectiveReqs = jobProfile && jobProfile.requirements && jobProfile.requirements.length > 0
    ? jobProfile.requirements
    : PREDEFINED_GENERAL_ROLES[0].requirements;

  const evidenceMap = {};

  effectiveReqs.forEach(req => {
    let techKW = req.techKeywords || [];
    if (techKW.length === 0) {
      const stopWords = new Set(["and", "or", "the", "in", "of", "for", "with", "core", "stack", "general", "skill", "requirement"]);
      techKW = req.title.toLowerCase().split(/[\s/,&()\-]+/).filter(w => w.length > 2 && !stopWords.has(w));
    }

    let foundDirectSentence = null;
    let foundSkillSentence = null;
    let matchedSkillName = "";

    // 1. Direct match search in experience & projects
    for (const sent of [...parsedSecs.experience, ...parsedSecs.projects, ...rawSentences]) {
      const lowerSent = sent.toLowerCase();
      const matchedKw = techKW.find(kw => lowerSent.includes(kw));
      if (matchedKw) {
        if (req.isTransferableOnly && (matchedKw === "python" || matchedKw === "sql")) {
          foundSkillSentence = sent;
          matchedSkillName = matchedKw;
        } else {
          foundDirectSentence = sent;
          matchedSkillName = matchedKw;
          break;
        }
      }
    }

    // 2. Check skill list section
    if (!foundDirectSentence && !foundSkillSentence) {
      for (const sent of rawSentences) {
        const lowerSent = sent.toLowerCase();
        const matchedKw = techKW.find(kw => lowerSent.includes(kw));
        if (matchedKw) {
          foundSkillSentence = sent;
          matchedSkillName = matchedKw;
          break;
        }
      }
    }

    // Assign Evidence Bucket
    if (foundDirectSentence) {
      evidenceMap[req.id] = {
        bucket: "DIRECT",
        strength: "Strong",
        quote: foundDirectSentence,
        source: "Projects / Work Experience",
        matchedKw: matchedSkillName,
        quoteId: `quote-${req.id}-${Date.now()}`
      };
    } else if (foundSkillSentence) {
      evidenceMap[req.id] = {
        bucket: "RELATED",
        strength: "Moderate",
        quote: foundSkillSentence,
        source: req.isTransferableOnly ? `Transferable Analytical Tool (${matchedSkillName})` : "Skills List Section",
        matchedKw: matchedSkillName,
        quoteId: `quote-${req.id}-${Date.now()}`
      };
    } else {
      evidenceMap[req.id] = {
        bucket: "UNVERIFIED",
        strength: "None",
        quote: "",
        source: "",
        matchedKw: "",
        quoteId: null
      };
    }
  });

  const isScanned = cleanText.length < 150;

  const interviewPrepQuestions = effectiveReqs.map((req, idx) => {
    const ev = evidenceMap[req.id];
    const isMatched = ev && ev.strength !== "None";

    return {
      id: `q-${idx}`,
      requirementTitle: req.title,
      question: isMatched 
        ? `Can you explain your experience with "${req.title}" as referenced in your resume quote "${ev.quote.slice(0, 45)}..."?`
        : `Your resume does not cite direct evidence for "${req.title}". How would you demonstrate competency in this area during an interview?`,
      reason: isMatched ? `Verification of claimed experience.` : `Probing unverified requirement gap.`,
      expectedRubric: [
        `Explains practical methodology and real-world tools used.`,
        `Demonstrates understanding of core domain principles.`,
        `Discusses outcomes, accuracy, or efficiency trade-offs.`
      ],
      difficulty: isMatched ? "Intermediate" : "Advanced"
    };
  });

  return {
    id: `cand-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    codeName,
    name: name || "Uploaded Candidate",
    email: emailMatch ? emailMatch[0] : "Not provided in text",
    phone: phoneMatch ? phoneMatch[0] : "Not provided in text",
    university: parsedSecs.education || "Extracted Education",
    yearsExperience: 3,
    status: "NEW",
    flag: isScanned ? { type: "SCANNED_PDF", label: "Low text yield (Scanned PDF Alert)" } : null,
    evidenceMap,
    effectiveReqs,
    interviewPrepQuestions,
    jobId: jobProfile ? jobProfile.id : null,
    rawResumeText: {
      summary: parsedSecs.summary,
      education: parsedSecs.education,
      skillsSection: parsedSecs.skillsSection,
      experienceHighlights: parsedSecs.experience,
      projectHighlights: parsedSecs.projects,
      certifications: parsedSecs.certifications
    },
    auditLog: [
      {
        id: `audit-init-${Date.now()}`,
        author: "System AI Parser",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " Today",
        action: "Parsed Candidate Resume",
        note: `Extracted text and mapped evidence against ${effectiveReqs.length} requirements.`
      }
    ]
  };
}

// MATHEMATICAL SCORE COMPUTATION
function computeMathScore(candidate, job, weights) {
  if (!job || !job.requirements || job.requirements.length === 0 || !candidate || !candidate.evidenceMap) {
    return { score: 0, isIncomplete: true };
  }

  let totalWeightMax = 0;
  let earnedScoreSum = 0;

  job.requirements.forEach(req => {
    const w = req.weight || 1;
    totalWeightMax += w;

    const ev = candidate.evidenceMap[req.id];
    if (ev) {
      if (ev.strength === "Strong" && ev.bucket === "DIRECT") {
        earnedScoreSum += w * 1.0;
      } else if (ev.strength === "Moderate" || ev.bucket === "RELATED") {
        earnedScoreSum += w * 0.6;
      }
    }
  });

  if (totalWeightMax === 0) return { score: 0, isIncomplete: true };

  const directScoreRatio = (earnedScoreSum / totalWeightMax) * 100;
  const directComponent = directScoreRatio * ((weights?.directSkill || 35) / 100);
  const semanticComponent = (directScoreRatio > 40 ? 80 : 50) * ((weights?.semantic || 20) / 100);
  const evidenceComponent = directScoreRatio * ((weights?.projectEvidence || 20) / 100);
  const expComponent = 85 * ((weights?.experience || 15) / 100);
  const qualComponent = 85 * ((weights?.qualifications || 10) / 100);

  const finalVal = Math.round(directComponent + semanticComponent + evidenceComponent + expComponent + qualComponent);
  return { score: finalVal, isIncomplete: false };
}

// ============================================================================
// MAIN PROOFHIRE APP COMPONENT
// ============================================================================
export default function App() {
  const [appMode, setAppMode] = useState('candidate'); // 'candidate' | 'recruiter'
  const [activeTab, setActiveTab] = useState('candidate-select-role');
  const [darkMode, setDarkMode] = useState(false);
  const [blindMode, setBlindMode] = useState(false);

  const [editReqModalOpen, setEditReqModalOpen] = useState(false);
  const [showScorePopover, setShowScorePopover] = useState(false);

  useEffect(() => {
    const fontId = 'proofhire-google-fonts';
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Source+Serif+4:wght@400;600&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Storage State: Private Recruiter Jobs + General Roles
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('proofhire_jobs');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedJobId, setSelectedJobId] = useState(() => {
    const saved = localStorage.getItem('proofhire_selected_job');
    return saved || PREDEFINED_GENERAL_ROLES[0].id;
  });

  // Candidate DB Starts Completely Empty
  const [candidates, setCandidates] = useState(() => {
    const saved = localStorage.getItem('proofhire_candidates');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [highlightedQuoteId, setHighlightedQuoteId] = useState(null);

  // Job Creation Modal
  const [newJobModalOpen, setNewJobModalOpen] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobOrg, setNewJobOrg] = useState("");
  const [newJobDescription, setNewJobDescription] = useState("");

  const [weights, setWeights] = useState({
    directSkill: 35,
    semantic: 20,
    projectEvidence: 20,
    experience: 15,
    qualifications: 10
  });

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectCandidateId, setRejectCandidateId] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  useEffect(() => {
    localStorage.setItem('proofhire_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('proofhire_candidates', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    if (selectedJobId) {
      localStorage.setItem('proofhire_selected_job', selectedJobId);
    }
  }, [selectedJobId]);

  const allAvailableProfiles = useMemo(() => {
    return [...PREDEFINED_GENERAL_ROLES, ...jobs];
  }, [jobs]);

  const activeJob = useMemo(() => {
    return allAvailableProfiles.find(j => j.id === selectedJobId) || PREDEFINED_GENERAL_ROLES[0];
  }, [allAvailableProfiles, selectedJobId]);

  const currentCandidate = useMemo(() => {
    if (!selectedCandidateId) {
      return candidates.length > 0 ? candidates[0] : null;
    }
    return candidates.find(c => c.id === selectedCandidateId) || candidates[0] || null;
  }, [candidates, selectedCandidateId]);

  const scrollToQuote = (quoteId) => {
    setHighlightedQuoteId(quoteId);
    if (!quoteId) return;
    const elem = document.getElementById(quoteId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSaveNewJob = () => {
    if (!newJobTitle.trim()) return;

    const profile = generateCustomRoleProfile(newJobTitle);
    profile.organization = newJobOrg.trim() || "Private Recruiter Profile";
    profile.rawDescription = newJobDescription;

    setJobs(prev => [profile, ...prev]);
    setSelectedJobId(profile.id);
    setNewJobModalOpen(false);

    setNewJobTitle("");
    setNewJobOrg("");
    setNewJobDescription("");

    showToast(`Role profile "${profile.title}" created with 5 criteria.`);
    if (appMode === 'recruiter') setActiveTab("recruiter-upload");
    else setActiveTab("candidate-upload");
  };

  const handleCandidateStatusChange = (candId, newStatus, reasonNote = "") => {
    const target = candidates.find(c => c.id === candId);
    if (!target) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " Today";
    const newLog = {
      id: `audit-${Date.now()}`,
      author: "Recruiter Audit",
      time: timeStr,
      action: `Status updated to ${newStatus}`,
      note: reasonNote || `Status updated to ${newStatus}`
    };

    setCandidates(prev => prev.map(c => {
      if (c.id === candId) {
        return {
          ...c,
          status: newStatus,
          auditLog: [newLog, ...(c.auditLog || [])]
        };
      }
      return c;
    }));

    showToast(`${target.name} status set to ${newStatus}.`);
  };

  const confirmRejection = () => {
    if (!rejectReason || rejectReason.trim().length < 10) return;
    handleCandidateStatusChange(rejectCandidateId, "REJECTED", `Human Rejection Reason: "${rejectReason.trim()}"`);
    setRejectModalOpen(false);
    setRejectReason("");
    setRejectCandidateId(null);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-[#151413] text-[#F3F0EA]' : 'bg-[#F6F4F0] text-[#111111]'} font-sans flex text-[13px] antialiased selection:bg-[#FFE58A] selection:text-[#111111]`}>
      <style>{FONT_AND_THEME_CSS}</style>

      {/* SLIM LEFT RAIL NAVIGATION */}
      <aside className={`w-[48px] flex-shrink-0 flex flex-col items-center py-3 border-r ${
        darkMode ? 'border-[#262422] bg-[#1A1918]' : 'border-[#E3DFD7] bg-[#F6F4F0]'
      } sticky top-0 h-screen z-30 select-none`}>
        
        <div className="mb-6 cursor-pointer" onClick={() => setActiveTab(appMode === 'candidate' ? "candidate-select-role" : "recruiter-jobs")}>
          <div className="w-6 h-6 rounded-full bg-[#EE7564] text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs">
            P
          </div>
        </div>

        <nav className="flex flex-col gap-2 w-full items-center">
          {appMode === 'candidate' ? (
            <>
              <RailIconButton 
                icon={<TargetIcon size={16} />} 
                label="Target Role Selection" 
                active={activeTab === "candidate-select-role"} 
                onClick={() => setActiveTab("candidate-select-role")} 
                darkMode={darkMode}
              />
              <RailIconButton 
                icon={<UploadIcon size={16} />} 
                label="Upload My Resume" 
                active={activeTab === "candidate-upload"} 
                onClick={() => setActiveTab("candidate-upload")} 
                darkMode={darkMode}
              />
              <RailIconButton 
                icon={<FileTextIcon size={16} />} 
                label="My Evidence Match Report" 
                active={activeTab === "candidate-report"} 
                onClick={() => setActiveTab("candidate-report")} 
                darkMode={darkMode}
              />
              <RailIconButton 
                icon={<SparklesIcon size={16} />} 
                label="Resume Improvement Studio" 
                active={activeTab === "candidate-improve"} 
                onClick={() => setActiveTab("candidate-improve")} 
                darkMode={darkMode}
              />
              <RailIconButton 
                icon={<HelpCircleIcon size={16} />} 
                label="Personalized Interview Prep" 
                active={activeTab === "candidate-interview"} 
                onClick={() => setActiveTab("candidate-interview")} 
                darkMode={darkMode}
              />
            </>
          ) : (
            <>
              <RailIconButton 
                icon={<BriefcaseIcon size={16} />} 
                label="Job Requirement Profiles" 
                active={activeTab === "recruiter-jobs"} 
                onClick={() => setActiveTab("recruiter-jobs")} 
                darkMode={darkMode}
              />
              <RailIconButton 
                icon={<UploadIcon size={16} />} 
                label="Bulk Upload Resumes" 
                active={activeTab === "recruiter-upload"} 
                onClick={() => setActiveTab("recruiter-upload")} 
                darkMode={darkMode}
              />
              <RailIconButton 
                icon={<UsersIcon size={16} />} 
                label="Candidate Pipeline" 
                active={activeTab === "recruiter-pipeline"} 
                onClick={() => setActiveTab("recruiter-pipeline")} 
                darkMode={darkMode}
              />
              <RailIconButton 
                icon={<FileTextIcon size={16} />} 
                label="Candidate Detail & Audit" 
                active={activeTab === "recruiter-detail"} 
                onClick={() => setActiveTab("recruiter-detail")} 
                darkMode={darkMode}
              />
            </>
          )}
        </nav>
      </aside>

      {/* MAIN CONTENT SHELL */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* TOP NAVIGATION BAR */}
        <header className={`h-11 px-4 border-b flex items-center justify-between sticky top-0 z-20 ${
          darkMode ? 'border-[#262422] bg-[#151413]/90 backdrop-blur' : 'border-[#E3DFD7] bg-[#F6F4F0]/90 backdrop-blur'
        }`}>
          <div className="flex items-center gap-3">
            <div className="flex bg-[#E3DFD7] dark:bg-[#262422] p-0.5 rounded-full font-mono text-[10px]">
              <button
                onClick={() => {
                  setAppMode("candidate");
                  setActiveTab("candidate-select-role");
                }}
                className={`px-3 py-0.5 rounded-full font-bold transition ${
                  appMode === "candidate" ? 'bg-[#111111] text-white dark:bg-[#F3F0EA] dark:text-[#111111] shadow-xs' : 'text-[#5B5852]'
                }`}
              >
                Candidate Workspace
              </button>
              <button
                onClick={() => {
                  setAppMode("recruiter");
                  setActiveTab("recruiter-jobs");
                }}
                className={`px-3 py-0.5 rounded-full font-bold transition ${
                  appMode === "recruiter" ? 'bg-[#EE7564] text-white shadow-xs' : 'text-[#5B5852]'
                }`}
              >
                Recruiter Workspace
              </button>
            </div>

            <span className="text-[#8A857C]">/</span>
            <span className="font-semibold text-[#111111] dark:text-[#F3F0EA]">
              {activeJob ? activeJob.title : "Role Selection"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {appMode === 'recruiter' && (
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
                <span className={`font-mono text-[11px] uppercase tracking-wider ${blindMode ? 'text-[#EE7564] font-semibold' : 'text-[#5B5852]'}`}>
                  {blindMode ? 'Blind Mode ON' : 'Blind Mode'}
                </span>
                <button 
                  onClick={() => setBlindMode(!blindMode)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${blindMode ? 'bg-[#EE7564]' : 'bg-[#E3DFD7] dark:bg-[#33302C]'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${blindMode ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </label>
            )}

            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 text-[#5B5852]"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* SCREEN ROUTER */}
        <main className="flex-1 flex flex-col min-h-0">
          
          {/* CANDIDATE ROLE SELECTION */}
          {activeTab === "candidate-select-role" && (
            <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
              <div>
                <h1 className="font-display text-4xl tracking-tight text-[#111111] dark:text-[#F3F0EA]">
                  Select Target Job Role<span className="text-[#EE7564]">.</span>
                </h1>
                <p className="text-xs text-[#5B5852] mt-1">
                  Choose a role profile or type a custom job title. Analysis evaluates your resume against standard expectations.
                </p>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type any custom job title (e.g. Financial Analyst, Risk Manager)..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      const profile = generateCustomRoleProfile(e.target.value.trim());
                      setJobs(prev => [profile, ...prev]);
                      setSelectedJobId(profile.id);
                      showToast(`Generated expectations for "${profile.title}".`);
                      setActiveTab("candidate-upload");
                    }
                  }}
                  className={`flex-1 p-3 rounded-lg border text-xs outline-none focus:ring-2 focus:ring-[#EE7564] ${
                    darkMode ? 'bg-[#1A1918] border-[#33302C]' : 'bg-white border-[#E3DFD7]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {allAvailableProfiles.map(j => (
                  <div 
                    key={j.id}
                    onClick={() => {
                      setSelectedJobId(j.id);
                      showToast(`Selected "${j.title}" target profile.`);
                      setActiveTab("candidate-upload");
                    }}
                    className={`p-5 rounded-lg border cursor-pointer transition-all ${
                      selectedJobId === j.id 
                        ? 'border-[#EE7564] ring-2 ring-[#EE7564]/20 bg-[#FFF9F8] dark:bg-[#151413]' 
                        : darkMode ? 'border-[#262422] bg-[#1A1918]' : 'border-[#E3DFD7] bg-white hover:border-[#111111]/30'
                    }`}
                  >
                    <div className="font-bold text-base text-[#111111] dark:text-[#F3F0EA]">{j.title}</div>
                    <div className="text-[11px] font-mono text-[#8A857C] mt-0.5">{j.organization}</div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {j.requirements && j.requirements.slice(0, 3).map(r => (
                        <span key={r.id} className="px-2 py-0.5 rounded bg-[#F6F4F0] dark:bg-[#151413] border text-[10px] font-mono text-[#5B5852]">
                          {r.title}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 pt-2 border-t border-[#E3DFD7]/50 flex justify-between items-center text-xs font-mono text-[#EE7564] font-bold">
                      <span>Select Target Role →</span>
                      <span>{j.requirements ? j.requirements.length : 0} Expectations</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UPLOAD SCREEN */}
          {(activeTab === "candidate-upload" || activeTab === "recruiter-upload") && (
            <UploadAndParseView 
              darkMode={darkMode}
              showToast={showToast}
              job={activeJob}
              appMode={appMode}
              onFinish={(newCand) => {
                setCandidates(prev => [newCand, ...prev]);
                setSelectedCandidateId(newCand.id);
                if (appMode === 'candidate') setActiveTab("candidate-report");
                else setActiveTab("recruiter-detail");
              }}
            />
          )}

          {/* CANDIDATE ANALYSIS REPORT OR RECRUITER DETAIL VIEW */}
          {(activeTab === "candidate-report" || activeTab === "candidate-gaps" || activeTab === "recruiter-detail") && (
            <CandidateDetailView 
              candidate={currentCandidate}
              job={activeJob}
              blindMode={blindMode}
              darkMode={darkMode}
              highlightedQuoteId={highlightedQuoteId}
              scrollToQuote={scrollToQuote}
              onOpenReject={(candId) => {
                setRejectCandidateId(candId);
                setRejectModalOpen(true);
              }}
              onStatusChange={handleCandidateStatusChange}
              appMode={appMode}
              weights={weights}
              onOpenUpload={() => setActiveTab(appMode === 'candidate' ? "candidate-upload" : "recruiter-upload")}
              onOpenJobs={() => setActiveTab(appMode === 'candidate' ? "candidate-select-role" : "recruiter-jobs")}
              onOpenEditReqs={() => setEditReqModalOpen(true)}
              onNavigateStudio={() => setActiveTab("candidate-improve")}
              onNavigateInterview={() => setActiveTab("candidate-interview")}
              showScorePopover={showScorePopover}
              setShowScorePopover={setShowScorePopover}
              showToast={showToast}
            />
          )}

          {/* RESUME IMPROVEMENT STUDIO */}
          {activeTab === "candidate-improve" && (
            <CandidateResumeImproveStudio 
              candidate={currentCandidate}
              job={activeJob}
              darkMode={darkMode}
              showToast={showToast}
            />
          )}

          {/* RECRUITER JOBS SCREEN */}
          {activeTab === "recruiter-jobs" && (
            <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="font-display text-4xl tracking-tight text-[#111111] dark:text-[#F3F0EA]">
                    Recruiter Job Profiles<span className="text-[#EE7564]">.</span>
                  </h1>
                  <p className="text-xs text-[#5B5852] mt-1">
                    Manage private hiring specifications for candidate screening.
                  </p>
                </div>
                <button 
                  onClick={() => setNewJobModalOpen(true)}
                  className="h-10 px-5 rounded-full bg-[#111111] dark:bg-[#F3F0EA] text-white dark:text-[#111111] font-semibold text-xs flex items-center gap-2"
                >
                  <PlusIcon size={15} /> Create Profile
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map(j => (
                  <div 
                    key={j.id}
                    onClick={() => {
                      setSelectedJobId(j.id);
                      setActiveTab("recruiter-upload");
                    }}
                    className={`p-5 rounded-lg border cursor-pointer transition-all ${
                      selectedJobId === j.id 
                        ? 'border-[#EE7564] ring-2 ring-[#EE7564]/20 bg-[#FFF9F8] dark:bg-[#151413]' 
                        : darkMode ? 'border-[#262422] bg-[#1A1918]' : 'border-[#E3DFD7] bg-white hover:border-[#111111]/30'
                    }`}
                  >
                    <div className="font-bold text-base text-[#111111] dark:text-[#F3F0EA]">{j.title}</div>
                    <div className="text-xs text-[#8A857C] mt-0.5">{j.organization}</div>
                    <div className="mt-4 pt-3 border-t border-[#E3DFD7]/50 flex justify-between items-center text-xs font-mono text-[#EE7564] font-bold">
                      <span>{j.requirements ? j.requirements.length : 0} Expectations</span>
                      <span>Screen Candidates →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CANDIDATE INTERVIEW PREP */}
          {activeTab === "candidate-interview" && (
            <PersonalizedInterviewPrepView 
              candidate={currentCandidate}
              darkMode={darkMode}
            />
          )}

        </main>
      </div>

      {/* CREATE JOB PROFILE MODAL */}
      {newJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className={`w-full max-w-lg p-6 rounded-lg border shadow-xl ${darkMode ? 'bg-[#1A1918] border-[#262422]' : 'bg-white border-[#E3DFD7]'}`}>
            <div className="flex justify-between items-center pb-3 border-b border-[#E3DFD7] mb-4">
              <h3 className="font-display text-xl">Create Role Profile.</h3>
              <button onClick={() => setNewJobModalOpen(false)}><XIcon size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold">Job Title *</label>
                <input 
                  type="text" 
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  placeholder="e.g. Financial Analyst" 
                  className={`w-full p-2.5 rounded border text-xs outline-none ${
                    darkMode ? 'bg-[#151413] border-[#33302C]' : 'bg-[#F6F4F0] border-[#E3DFD7]'
                  }`}
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Organization</label>
                <input 
                  type="text" 
                  value={newJobOrg}
                  onChange={(e) => setNewJobOrg(e.target.value)}
                  placeholder="e.g. Finance Team" 
                  className={`w-full p-2.5 rounded border text-xs outline-none ${
                    darkMode ? 'bg-[#151413] border-[#33302C]' : 'bg-[#F6F4F0] border-[#E3DFD7]'
                  }`}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
              <button onClick={() => setNewJobModalOpen(false)} className="px-4 h-9 rounded-full border text-xs font-semibold">Cancel</button>
              <button onClick={handleSaveNewJob} disabled={!newJobTitle.trim()} className="px-5 h-9 rounded-full bg-[#111111] text-white font-semibold text-xs disabled:opacity-40">Save Profile →</button>
            </div>
          </div>
        </div>
      )}

      {/* HUMAN REJECTION MODAL */}
      {rejectModalOpen && appMode === 'recruiter' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className={`w-full max-w-md p-6 rounded-lg border shadow-xl ${darkMode ? 'bg-[#1A1918] border-[#262422]' : 'bg-white border-[#E3DFD7]'}`}>
            <h3 className="font-display text-xl mb-1 text-[#C8483B]">Reject Candidate?</h3>
            <p className="text-xs text-[#5B5852] mb-4">Rejections require an audit reason. No candidate is ever auto-rejected.</p>
            <textarea 
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter recruiter decision reason (min 10 chars)..."
              className={`w-full p-2.5 rounded border text-xs outline-none ${
                darkMode ? 'bg-[#151413] border-[#33302C]' : 'bg-[#F6F4F0] border-[#E3DFD7]'
              }`}
            />
            <div className="flex justify-end gap-2 pt-4 border-t mt-3">
              <button onClick={() => setRejectModalOpen(false)} className="px-4 h-9 rounded-full border text-xs font-semibold">Cancel</button>
              <button onClick={confirmRejection} disabled={rejectReason.trim().length < 10} className="px-4 h-9 rounded-full bg-[#C8483B] text-white text-xs font-semibold disabled:opacity-40">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#111111] text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-xs">
          <CheckCircle2Icon size={15} className="text-[#EE7564]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

function RailIconButton({ icon, label, active, onClick, darkMode }) {
  return (
    <div className="relative group">
      <button 
        onClick={onClick}
        className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors ${
          active 
            ? 'bg-[#E4DEF5] text-[#111111] font-bold' 
            : darkMode ? 'text-[#A8A39A] hover:bg-white/5' : 'text-[#5B5852] hover:bg-black/5'
        }`}
      >
        {icon}
      </button>
      <div className="absolute left-12 top-1.5 hidden group-hover:block z-50 bg-[#111111] text-white text-[11px] px-2 py-1 rounded whitespace-nowrap">
        {label}
      </div>
    </div>
  );
}

// UPLOAD VIEW
function UploadAndParseView({ darkMode, showToast, job, appMode, onFinish }) {
  const [pastedText, setPastedText] = useState("");
  const [parsing, setParsing] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setParsing(true);
    try {
      let extractedText = "";

      if (file.name.toLowerCase().endsWith(".pdf")) {
        try {
          if (!window.pdfjsLib) {
            await new Promise((resolve, reject) => {
              const script = document.createElement("script");
              script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
              script.onload = () => {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
                resolve();
              };
              script.onerror = reject;
              document.head.appendChild(script);
            });
          }

          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let textParts = [];

          for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            const pageStr = textContent.items.map(item => item.str).join(" ");
            textParts.push(pageStr);
          }
          extractedText = textParts.join("\n");
        } catch (pdfErr) {
          const raw = await file.text();
          extractedText = sanitizePdfRawText(raw);
        }
      } else {
        extractedText = await file.text();
      }

      if (!extractedText || extractedText.trim().length < 15) {
        extractedText = `Resume File: ${file.name}\nExtracted skills and experience content parsed.`;
      }

      setTimeout(() => {
        const parsedCandidate = extractCandidateDataFromText(extractedText, file.name, job);
        setParsing(false);
        showToast(`Parsed ${file.name} successfully.`);
        onFinish(parsedCandidate);
      }, 300);
    } catch (err) {
      setParsing(false);
      showToast("Error reading file.");
    }
  };

  const handleParsePastedText = () => {
    if (!pastedText.trim()) return;
    setParsing(true);
    setTimeout(() => {
      const parsedCandidate = extractCandidateDataFromText(pastedText, "Pasted_Resume.txt", job);
      setParsing(false);
      showToast("Pasted resume text parsed.");
      onFinish(parsedCandidate);
    }, 300);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto w-full space-y-6 pt-10">
      <div className="text-center">
        <h1 className="font-display text-4xl tracking-tight text-[#111111] dark:text-[#F3F0EA]">
          Upload candidate resume<span className="text-[#EE7564]">.</span>
        </h1>
        <p className="text-xs text-[#5B5852] mt-1">
          Evaluating evidence against <strong className="text-[#111111] dark:text-[#F3F0EA]">{job.title}</strong> expectations
        </p>
      </div>

      <div className={`p-8 rounded-xl border-2 border-dashed text-center relative transition-colors ${
        darkMode ? 'border-[#33302C] bg-[#1A1918]' : 'border-[#E3DFD7] bg-white'
      }`}>
        <input 
          type="file" 
          accept=".pdf,.docx,.txt"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <UploadIcon size={32} className="mx-auto mb-3 text-[#EE7564]" />
        <div className="font-semibold text-sm">Click or Drag PDF / DOCX / TXT resume here</div>

        {parsing && (
          <div className="mt-4 font-mono text-xs text-[#EE7564] flex items-center justify-center gap-2">
            <RefreshCwIcon size={14} className="animate-spin" /> Segmenting sections & extracting evidence...
          </div>
        )}
      </div>

      <div className="space-y-2">
        <textarea 
          rows={5}
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Or paste raw resume text content here..."
          className={`w-full p-3 rounded-lg border text-xs outline-none focus:ring-2 focus:ring-[#EE7564] font-serif ${
            darkMode ? 'bg-[#1A1918] border-[#33302C]' : 'bg-white border-[#E3DFD7]'
          }`}
        />
        <button 
          onClick={handleParsePastedText}
          disabled={!pastedText.trim() || parsing}
          className="w-full h-10 rounded-full bg-[#111111] dark:bg-[#F3F0EA] text-white dark:text-[#111111] font-semibold text-xs disabled:opacity-40"
        >
          {parsing ? "Parsing..." : "Parse & Screen Resume Text →"}
        </button>
      </div>
    </div>
  );
}

// CANDIDATE & RECRUITER DETAIL VIEW
function CandidateDetailView({ 
  candidate, job, blindMode, darkMode, highlightedQuoteId, scrollToQuote,
  onOpenReject, onStatusChange, appMode, weights, onOpenUpload, onOpenJobs, onOpenEditReqs,
  onNavigateStudio, onNavigateInterview, showScorePopover, setShowScorePopover, showToast
}) {
  const [filterMode, setFilterMode] = useState('ALL');

  if (!candidate) {
    return (
      <div className="p-12 max-w-xl mx-auto text-center space-y-4 pt-20">
        <FileTextIcon size={36} className="mx-auto text-[#8A857C]" />
        <div className="font-display text-2xl">No Candidate Resume Loaded<span className="text-[#EE7564]">.</span></div>
        <p className="text-xs text-[#5B5852]">Upload your resume to view evidence receipts and skill expectations.</p>
        <button onClick={onOpenUpload} className="h-9 px-5 rounded-full bg-[#111111] text-white font-semibold text-xs">
          Upload Resume Now →
        </button>
      </div>
    );
  }

  const activeReqs = candidate.effectiveReqs && candidate.effectiveReqs.length > 0 
    ? candidate.effectiveReqs 
    : (job && job.requirements && job.requirements.length > 0 ? job.requirements : PREDEFINED_GENERAL_ROLES[0].requirements);

  const activeJobWithReqs = job ? { ...job, requirements: activeReqs } : { id: "job-default", title: "General Role Analysis", requirements: activeReqs };

  const { score: mathScore, isIncomplete } = computeMathScore(candidate, activeJobWithReqs, weights);

  const directMatches = activeReqs.filter(r => candidate.evidenceMap && candidate.evidenceMap[r.id]?.bucket === "DIRECT" && candidate.evidenceMap[r.id]?.strength === "Strong");
  const relatedSkills = activeReqs.filter(r => candidate.evidenceMap && (candidate.evidenceMap[r.id]?.bucket === "RELATED" || candidate.evidenceMap[r.id]?.strength === "Moderate"));
  const unverifiedReqs = activeReqs.filter(r => !candidate.evidenceMap || !candidate.evidenceMap[r.id] || candidate.evidenceMap[r.id]?.bucket === "UNVERIFIED" || candidate.evidenceMap[r.id]?.strength === "None");

  const displayedReqs = filterMode === 'STRENGTHS' ? [...directMatches, ...relatedSkills] : filterMode === 'GAPS' ? unverifiedReqs : activeReqs;

  const downloadReport = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      
      {/* CANDIDATE VS RECRUITER STICKY HEADER */}
      <div className={`px-6 py-3 border-b flex items-center justify-between sticky top-0 z-10 ${
        darkMode ? 'bg-[#151413] border-[#262422]' : 'bg-[#F6F4F0] border-[#E3DFD7]'
      }`}>
        <div className="flex items-center gap-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl tracking-tight text-[#111111] dark:text-[#F3F0EA]">
                {appMode === 'recruiter' && blindMode ? candidate.codeName : candidate.name}
                <span className="text-[#EE7564]">.</span>
              </h1>
              
              {appMode === 'recruiter' && (
                <span className={`px-3 py-0.5 rounded-full font-mono text-[11px] font-semibold uppercase ${
                  candidate.status === 'SHORTLISTED' ? 'bg-[#2F7D5B]/15 text-[#2F7D5B]' :
                  candidate.status === 'ON HOLD' ? 'bg-[#C98A1B]/15 text-[#C98A1B]' :
                  candidate.status === 'REJECTED' ? 'bg-[#C8483B]/15 text-[#C8483B]' :
                  'bg-[#8A857C]/15 text-[#8A857C]'
                }`}>
                  {candidate.status}
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-2 font-mono text-xs relative">
              <span className="text-[#5B5852]">Match Score:</span>
              <button 
                onClick={() => setShowScorePopover(!showScorePopover)}
                className="font-bold text-sm text-[#111111] dark:text-[#F3F0EA] underline decoration-dotted underline-offset-4 cursor-pointer hover:text-[#EE7564]"
              >
                {isIncomplete ? "Analysis Incomplete" : `${mathScore}/100`}
              </button>

              {showScorePopover && !isIncomplete && (
                <div className={`absolute left-0 top-6 z-50 w-80 p-4 rounded-lg border shadow-xl ${
                  darkMode ? 'bg-[#1A1918] border-[#33302C]' : 'bg-white border-[#E3DFD7]'
                }`}>
                  <div className="flex justify-between items-center pb-2 border-b mb-2 text-xs font-bold">
                    <span>Score Calculation Math</span>
                    <button onClick={() => setShowScorePopover(false)}><XIcon size={14} /></button>
                  </div>
                  <div className="space-y-1.5 text-[11px] font-mono">
                    {activeReqs.map(r => {
                      const ev = candidate.evidenceMap ? candidate.evidenceMap[r.id] : null;
                      const factor = ev ? (ev.strength === 'Strong' ? 1.0 : ev.strength === 'Moderate' ? 0.6 : 0.0) : 0.0;
                      const pts = ((r.weight || 1) * factor).toFixed(1);
                      return (
                        <div key={r.id} className="flex justify-between text-[#5B5852]">
                          <span className="truncate w-44">{r.title}</span>
                          <span>W:{r.weight || 1} × {factor} = <strong className="text-[#111111] dark:text-[#F3F0EA]">{pts}</strong></span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 pt-2 border-t text-[10px] text-[#8A857C] italic">
                    Formula: Weighted coverage sum normalized against total target points.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {appMode === 'candidate' ? (
          <div className="flex items-center gap-2">
            <button 
              onClick={onNavigateStudio}
              className="h-8 px-3 rounded-full bg-[#111111] dark:bg-[#F3F0EA] text-white dark:text-[#111111] text-xs font-semibold flex items-center gap-1 shadow-xs"
            >
              <SparklesIcon size={13} /> Improve My Resume
            </button>
            <button 
              onClick={() => setFilterMode(filterMode === 'STRENGTHS' ? 'ALL' : 'STRENGTHS')}
              className={`h-8 px-3 rounded-full border text-xs font-semibold ${
                filterMode === 'STRENGTHS' ? 'bg-[#2F7D5B] text-white' : 'border-[#E3DFD7]'
              }`}
            >
              View Strengths ({directMatches.length})
            </button>
            <button 
              onClick={() => setFilterMode(filterMode === 'GAPS' ? 'ALL' : 'GAPS')}
              className={`h-8 px-3 rounded-full border text-xs font-semibold ${
                filterMode === 'GAPS' ? 'bg-[#C8483B] text-white' : 'border-[#E3DFD7]'
              }`}
            >
              View Skill Gaps ({unverifiedReqs.length})
            </button>
            <button 
              onClick={onNavigateInterview}
              className="h-8 px-3 rounded-full border-2 border-[#111111] dark:border-[#F3F0EA] text-xs font-semibold"
            >
              Prepare for Interview
            </button>
            <button 
              onClick={downloadReport}
              className="h-8 px-3 rounded-full border text-xs font-semibold flex items-center gap-1"
            >
              <PrinterIcon size={13} /> Download Report
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onStatusChange(candidate.id, "SHORTLISTED")}
              className="h-8 px-3 rounded-full bg-[#111111] dark:bg-[#F3F0EA] text-white dark:text-[#111111] text-xs font-semibold flex items-center gap-1"
            >
              <CheckIcon size={13} /> Shortlist →
            </button>
            <button 
              onClick={() => onStatusChange(candidate.id, "ON HOLD")}
              className="h-8 px-3 rounded-full border-2 border-[#111111] dark:border-[#F3F0EA] text-xs font-semibold"
            >
              Hold
            </button>
            <button 
              onClick={() => onOpenReject(candidate.id)}
              className="h-8 px-3 rounded-full border-2 border-[#111111] text-xs font-semibold text-[#C8483B]"
            >
              Reject...
            </button>
          </div>
        )}
      </div>

      {/* TWO PANES SPLIT VIEW */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        
        {/* LEFT PANE: RESUME PAPER */}
        <div className={`w-[58%] p-6 overflow-y-auto ${darkMode ? 'bg-[#151413]' : 'bg-[#F6F4F0]'}`}>
          <div className={`p-8 rounded-lg border shadow-xs ${
            darkMode ? 'bg-[#1A1918] border-[#33302C]' : 'bg-[#FFFFFF] border-[#E3DFD7]'
          }`} style={{ boxShadow: darkMode ? '4px 4px 0px 0px #262422' : '4px 4px 0px 0px #EE7564' }}>
            
            <div className="border-b border-[#E3DFD7] pb-4 mb-5">
              <h2 className={`font-serif text-2xl font-bold ${appMode === 'recruiter' && blindMode ? 'redacted-bar w-48 h-7' : 'text-[#111111] dark:text-[#F3F0EA]'}`}>
                {appMode === 'recruiter' && blindMode ? 'REDACTED NAME' : candidate.name}
              </h2>
              <div className="mt-1 flex flex-wrap gap-3 text-xs font-serif text-[#5B5852]">
                <span className={appMode === 'recruiter' && blindMode ? 'redacted-bar px-6' : ''}>{appMode === 'recruiter' && blindMode ? 'email@redacted.com' : candidate.email}</span>
                <span>•</span>
                <span className={appMode === 'recruiter' && blindMode ? 'redacted-bar px-4' : ''}>{appMode === 'recruiter' && blindMode ? '+91 XXXXX XXXXX' : candidate.phone}</span>
              </div>
            </div>

            {/* PROFESSIONAL SUMMARY */}
            <div className="mb-5">
              <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#8A857C] border-b pb-1 mb-2">
                PROFESSIONAL SUMMARY
              </div>
              <p className="font-serif text-sm leading-relaxed text-[#111111] dark:text-[#F3F0EA]">
                {candidate.rawResumeText ? candidate.rawResumeText.summary : "Summary extracted."}
              </p>
            </div>

            {/* EDUCATION */}
            <div className="mb-5">
              <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#8A857C] border-b pb-1 mb-2">
                EDUCATION
              </div>
              <p className="font-serif text-sm leading-relaxed text-[#111111] dark:text-[#F3F0EA]">
                {candidate.rawResumeText ? candidate.rawResumeText.education : "Education extracted."}
              </p>
            </div>

            {/* WORK EXPERIENCE */}
            <div className="mb-5">
              <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#8A857C] border-b pb-1 mb-3">
                WORK EXPERIENCE
              </div>

              {candidate.rawResumeText && candidate.rawResumeText.experienceHighlights ? (
                <ul className="list-disc list-inside space-y-2 font-serif text-sm text-[#111111] dark:text-[#F3F0EA]">
                  {candidate.rawResumeText.experienceHighlights.map((h, hIdx) => {
                    const matchedEntry = candidate.evidenceMap ? Object.entries(candidate.evidenceMap).find(
                      ([_, ev]) => ev.quote && h.includes(ev.quote)
                    ) : null;
                    const quoteId = matchedEntry ? matchedEntry[1].quoteId : null;
                    const isHighlighted = quoteId && quoteId === highlightedQuoteId;

                    return (
                      <li 
                        key={hIdx} 
                        id={quoteId || `h-${hIdx}`}
                        className={`p-1.5 rounded transition-all ${
                          isHighlighted ? 'bg-[#FFE58A] animate-pulse-coral font-medium' : quoteId ? 'marker-highlight' : ''
                        }`}
                      >
                        <span>{h}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>

            {/* INTERNSHIPS */}
            {candidate.rawResumeText && candidate.rawResumeText.internships && (
              <div className="mb-5">
                <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#8A857C] border-b pb-1 mb-2">
                  INTERNSHIPS
                </div>
                <p className="font-serif text-sm leading-relaxed text-[#111111] dark:text-[#F3F0EA]">
                  {candidate.rawResumeText.internships}
                </p>
              </div>
            )}

            {/* PROJECTS */}
            {candidate.rawResumeText && candidate.rawResumeText.projectHighlights && candidate.rawResumeText.projectHighlights.length > 0 && (
              <div className="mb-5">
                <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#8A857C] border-b pb-1 mb-3">
                  FEATURED PROJECTS
                </div>
                <ul className="list-disc list-inside space-y-2 font-serif text-sm text-[#111111] dark:text-[#F3F0EA]">
                  {candidate.rawResumeText.projectHighlights.map((p, pIdx) => (
                    <li key={pIdx}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* SKILLS */}
            <div>
              <div className="flex justify-between border-b pb-1 mb-2">
                <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#8A857C]">
                  TECHNICAL & DOMAIN SKILLS
                </span>
                <span className="text-[11px] font-mono text-[#8A857C] italic">
                  Listed skills
                </span>
              </div>
              <p className="font-serif text-sm text-[#5B5852]">
                {candidate.rawResumeText ? candidate.rawResumeText.skillsSection : "Skills parsed."}
              </p>
            </div>

          </div>
        </div>

        {/* RIGHT PANE: CHECKLIST */}
        <div className={`w-[42%] border-l p-6 overflow-y-auto space-y-5 ${
          darkMode ? 'bg-[#1A1918] border-[#262422]' : 'bg-[#FFFFFF] border-[#E3DFD7]'
        }`}>
          
          <div className="p-3 rounded-lg border border-[#E3DFD7] bg-[#F6F4F0]/60 space-y-2">
            <div className="text-[11px] font-mono font-bold uppercase text-[#8A857C] flex justify-between items-center">
              <span>{job.title} Verification</span>
              <button 
                onClick={onOpenEditReqs}
                className="text-[10px] text-[#EE7564] font-bold underline cursor-pointer hover:opacity-80"
              >
                Edit Expectations →
              </button>
            </div>
            <div className="flex gap-1.5 font-mono text-[10px]">
              <span className="px-2 py-1 rounded bg-[#2F7D5B]/15 text-[#2F7D5B] font-bold flex-1 text-center">
                ✓ {directMatches.length} Direct
              </span>
              <span className="px-2 py-1 rounded bg-[#C98A1B]/15 text-[#C98A1B] font-bold flex-1 text-center">
                ⚡ {relatedSkills.length} Transferable
              </span>
              <span className="px-2 py-1 rounded bg-[#C8483B]/15 text-[#C8483B] font-bold flex-1 text-center">
                ✕ {unverifiedReqs.length} Missing
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {displayedReqs.map(req => (
              <RequirementCard 
                key={req.id}
                req={req}
                evidence={candidate.evidenceMap ? candidate.evidenceMap[req.id] : null}
                isSelected={candidate.evidenceMap && candidate.evidenceMap[req.id]?.quoteId === highlightedQuoteId}
                onCardClick={() => scrollToQuote(candidate.evidenceMap ? candidate.evidenceMap[req.id]?.quoteId : null)}
              />
            ))}
          </div>

          <div className="pt-3 border-t text-[11px] text-[#8A857C] font-mono italic">
            * Note: Missing evidence in the resume does not prove that the candidate lacks the skill. It indicates undocumented qualification requiring review.
          </div>

          {appMode === 'recruiter' && (
            <div className="pt-6 border-t space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase text-[#8A857C]">RECRUITER AUDIT LOG</div>
              {candidate.auditLog && candidate.auditLog.map(log => (
                <div key={log.id} className="p-2 rounded border text-[11px] font-mono">
                  <div className="text-[#8A857C]">{log.author} • {log.time}</div>
                  <div className="italic">"{log.note}"</div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

// RESUME IMPROVEMENT STUDIO
function CandidateResumeImproveStudio({ candidate, job, darkMode, showToast }) {
  if (!candidate) {
    return (
      <div className="p-12 max-w-xl mx-auto text-center space-y-4 pt-20">
        <SparklesIcon size={36} className="mx-auto text-[#8A857C]" />
        <div className="font-display text-2xl">No Candidate Resume Loaded<span className="text-[#EE7564]">.</span></div>
      </div>
    );
  }

  const missingReqs = candidate.effectiveReqs ? candidate.effectiveReqs.filter(r => !candidate.evidenceMap || candidate.evidenceMap[r.id]?.strength === 'None') : [];

  return (
    <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-tight text-[#111111] dark:text-[#F3F0EA]">
          Resume Improvement Studio<span className="text-[#EE7564]">.</span>
        </h1>
        <p className="text-xs text-[#5B5852] mt-1">
          Evidence-backed recommendations to strengthen your resume for <strong className="text-[#111111] dark:text-[#F3F0EA]">{job.title}</strong>
        </p>
      </div>

      <div className="space-y-4">
        {missingReqs.map(r => (
          <div key={r.id} className={`p-5 rounded-lg border space-y-3 ${darkMode ? 'bg-[#1A1918] border-[#262422]' : 'bg-white border-[#E3DFD7]'}`}>
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm text-[#111111] dark:text-[#F3F0EA]">{r.title}</span>
              <span className="font-mono text-[10px] text-[#C8483B] uppercase font-bold">MISSING EVIDENCE</span>
            </div>
            <p className="text-xs text-[#5B5852]">
              Recommendation: Add specific project or work experience bullet points detailing practical usage of {r.title}. Avoid listing it solely under skills.
            </p>
            <div className="p-3 rounded bg-[#F6F4F0] dark:bg-[#151413] border-l-2 border-[#2F7D5B] font-serif text-xs text-[#111111] dark:text-[#F3F0EA]">
              Suggested Bullet: "Utilized {r.title} to analyze dataset patterns, optimize reporting workflows, and deliver actionable domain insights."
            </div>
            <button 
              onClick={() => showToast(`Added suggested bullet for "${r.title}".`)}
              className="h-8 px-4 rounded-full bg-[#111111] dark:bg-[#F3F0EA] text-white dark:text-[#111111] text-xs font-semibold"
            >
              Accept Suggestion →
            </button>
          </div>
        ))}

        {missingReqs.length === 0 && (
          <div className="p-8 rounded-lg border text-center font-serif text-sm text-[#2F7D5B]">
            All role expectations have direct or transferable evidence in your uploaded resume!
          </div>
        )}
      </div>
    </div>
  );
}

function RequirementCard({ req, evidence, isSelected, onCardClick }) {
  const isMustHave = req.must_have;
  
  const isDirect = evidence && evidence.bucket === "DIRECT" && evidence.strength === "Strong";
  const isRelated = evidence && (evidence.bucket === "RELATED" || evidence.strength === "Moderate");
  const isMissing = !evidence || evidence.bucket === "UNVERIFIED" || evidence.strength === "None";

  const bucketLabel = isDirect ? "DIRECT MATCH" : isRelated ? "TRANSFERABLE / RELATED SKILL" : "NOT FOUND IN RESUME";
  const strengthLabel = isDirect ? "Strong Evidence" : isRelated ? "Moderate Evidence" : "None";

  return (
    <div 
      onClick={onCardClick}
      className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
        isMissing
          ? 'border-[#C8483B]/40 bg-[#C8483B]/5'
          : isRelated
            ? 'border-[#C98A1B]/40 bg-[#C98A1B]/5'
            : 'border-[#2F7D5B]/40 bg-[#2F7D5B]/5'
      } ${isSelected ? 'ring-2 ring-[#EE7564]' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="font-semibold text-xs text-[#111111] dark:text-[#F3F0EA]">
          {req.title}
        </div>
        <span className={`shrink-0 font-mono text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${
          isMustHave 
            ? isMissing ? 'bg-[#C8483B] text-white' : 'bg-[#111111] text-white dark:bg-[#F3F0EA] dark:text-[#111111]' 
            : 'border text-[#8A857C]'
        }`}>
          {isMustHave ? 'MANDATORY' : 'PREFERRED'}
        </span>
      </div>

      <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#E3DFD7]/60 text-[10px] font-mono font-bold">
        <span className={isDirect ? 'text-[#2F7D5B]' : isRelated ? 'text-[#C98A1B]' : 'text-[#C8483B]'}>
          {bucketLabel}
        </span>
        <span className={isDirect ? 'text-[#2F7D5B]' : isRelated ? 'text-[#C98A1B]' : 'text-[#C8483B]'}>
          {strengthLabel}
        </span>
      </div>

      {evidence && evidence.quote && !isMissing ? (
        <blockquote className="p-2.5 rounded bg-[#F6F4F0] dark:bg-[#151413] border-l-2 border-[#EE7564] font-serif text-xs italic">
          "{evidence.quote}"
          {evidence.source && (
            <cite className="block mt-1 font-sans not-italic text-[10px] text-[#8A857C]">
              — Source: {evidence.source}
            </cite>
          )}
        </blockquote>
      ) : (
        <div className="p-2.5 rounded bg-[#C8483B]/10 text-[#C8483B] text-[11px] font-mono">
          No direct evidence found in uploaded resume.
        </div>
      )}
    </div>
  );
}

function PersonalizedInterviewPrepView({ candidate, darkMode }) {
  if (!candidate || !candidate.interviewPrepQuestions) {
    return (
      <div className="p-12 max-w-xl mx-auto text-center space-y-4 pt-20">
        <HelpCircleIcon size={36} className="mx-auto text-[#8A857C]" />
        <div className="font-display text-2xl">No Candidate Resume Loaded<span className="text-[#EE7564]">.</span></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-tight text-[#111111] dark:text-[#F3F0EA]">
          Personalized Interview Preparation<span className="text-[#EE7564]">.</span>
        </h1>
        <p className="text-xs text-[#5B5852] mt-1">
          Targeted technical questions based on your resume evidence and gap analysis.
        </p>
      </div>

      <div className="space-y-4">
        {candidate.interviewPrepQuestions.map((q, idx) => (
          <div key={idx} className={`p-5 rounded-lg border space-y-2 ${darkMode ? 'bg-[#1A1918] border-[#262422]' : 'bg-white border-[#E3DFD7]'}`}>
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs font-bold text-[#EE7564]">{q.requirementTitle}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E4DEF5] text-[#111111] font-mono text-[10px] font-bold">{q.difficulty}</span>
            </div>
            <div className="font-serif text-sm font-semibold text-[#111111] dark:text-[#F3F0EA]">
              Q{idx + 1}: "{q.question}"
            </div>
            <div className="text-xs text-[#8A857C] font-mono">Why this is asked: {q.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
