# ProofHire — AI Resume Intelligence & Evidence-Based Candidate Screening

> **AI-powered resume intelligence and evidence-based candidate screening platform for candidates and recruiters.**

ProofHire bridges the trust gap in automated recruitment. Instead of treating candidate resumes as opaque keyword black-boxes, ProofHire uses deterministic NLP evidence extraction, semantic alias matching, and career timeline calculation to **extract verbatim sentences from the resume as auditable proof for every claimed skill**, while diagnosing missing criteria and recommending actionable career plans.

---

## 🌟 Key Features

### 👤 Candidate Mode
- **Multi-Format Document Parsing:** Native parsing of multi-page `.pdf` (using `pypdf`), Word `.docx` (including tables and styled paragraphs), and plain `.txt` with automated encoding recovery.
- **Evidence-Based Skill Verification:** Locates specific sentences and bullet points in the resume that prove practical execution (e.g. action verbs like *engineered*, *deployed*, *architected*).
- **Missing Requirement & Gap Diagnostics:** Distinguishes between critical Must-Have criteria and Preferred bonus criteria, providing concrete action steps to bridge qualification gaps.
- **Career Timeline Analytics:** Algorithmic calculation of actual industry experience from explicit mentions and temporal spans (e.g., `2020 - Present`).
- **Official Candidate PDF Report:** Instant download of a signed, professional evaluation report generated dynamically using ReportLab.
- **Historical Analysis Log:** Preserves past evaluated resumes and readiness dossiers for authenticated candidates.

### 🏢 Recruiter & Enterprise Mode
- **Multi-Tenant Organization Data Isolation:** Hardened data isolation ensuring recruiters strictly access job openings, candidate resumes, and hiring decisions belonging to their organization.
- **Job Openings & Benchmarks Manager:** Full CRUD interface to define roles, departments, core competencies, preferred bonuses, and experience thresholds.
- **Ranked Candidate Leaderboard:** Comparative ranking of applicants based on verified evidence coverage, experience duration, and role domain fit.
- **AI-Tailored Interview Inquiries:** Automatically formulates targeted technical interview questions auditing detected skill gaps and probing verified claims.
- **Audited Hiring Decisions:** Recruiter workflow supporting `Shortlisted`, `Interview Scheduled`, `Accepted / Offer`, and `Rejected` statuses with persistent recruiter screening notes.
- **Comparative Recruiter PDF Dossier:** One-click generation of multi-candidate leaderboard reports for hiring manager review.
- **Secure Private Resume Storage:** Resumes are persisted with unique UUID paths in non-public storage; downloads require authenticated ownership verification.

---

## 🏗️ Architecture & Technology Stack

```mermaid
flowchart TD
    subgraph Client["Frontend Layer (React 18 + Vite + Tailwind CSS)"]
        UI["Modern Glassmorphic Dark UI (#080c14)"]
        CM["Candidate Workspace (Upload, Evidence, PDF)"]
        RM["Recruiter Workspace (Leaderboard, Jobs, Audits)"]
    end

    subgraph API["Backend Layer (FastAPI REST Service)"]
        Auth["JWT Auth & Org Multi-Tenancy"]
        Parser["Document Parser (pypdf, python-docx)"]
        Matcher["Evidence Extraction & NLP Match Engine"]
        Reports["ReportLab Dynamic PDF Engine"]
        Storage["Private Storage Controller"]
    end

    subgraph Data["Database & Storage"]
        DB[("PostgreSQL / SQLite")]
        Disk[("Private Encrypted File System")]
    end

    Client -->|HTTPS / REST API| API
    API -->|SQLAlchemy ORM + Alembic| DB
    API -->|Protected Path / Stream| Disk
```

### Technology Stack
- **Frontend:** React 18, Vite 5, Tailwind CSS 3, Lucide Icons
- **Backend Framework:** FastAPI (Python 3.11+ / 3.14)
- **Database ORM:** SQLAlchemy 2.0 with Alembic database migrations
- **Supported Databases:** Managed PostgreSQL (Production), SQLite (Development & Testing)
- **Security & Auth:** JWT tokens (`pyjwt`), salted password hashing (`bcrypt`)
- **Document Processing:** `pypdf 7.0+`, `python-docx 1.2+`
- **PDF Generation:** `reportlab 5.1+`
- **Testing:** `pytest`, `pytest-asyncio`, `httpx` (100% test pass rate)

---

## 📁 Repository Structure

```
proofhire-ai-resume-intelligence/
├── backend/
│   ├── alembic/              # Database migration scripts
│   ├── app/
│   │   ├── config.py         # App settings & environment loader
│   │   ├── database.py       # SQLAlchemy engine & session factory
│   │   ├── models.py         # Organizations, Users, Jobs, Applications
│   │   ├── schemas.py        # Pydantic v2 validation models
│   │   ├── auth.py           # Bcrypt & JWT role-based access control
│   │   ├── parser.py         # Multi-format PDF/DOCX/TXT text extractor
│   │   ├── matcher.py        # Evidence verification & gap engine
│   │   ├── report.py         # PDF report generator (ReportLab)
│   │   ├── main.py           # FastAPI entrypoint with CORS & routes
│   │   └── routers/
│   │       ├── auth_router.py
│   │       ├── jobs_router.py
│   │       ├── candidate_router.py
│   │       ├── recruiter_router.py
│   │       └── files_router.py
│   ├── tests/                # Automated pytest test suite
│   ├── Dockerfile            # Container deployment specification
│   ├── requirements.txt      # Production Python dependencies
│   └── .env.example          # Backend environment template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── AuthModal.jsx
│   │   │   ├── CandidateMode/
│   │   │   │   ├── ResumeUploader.jsx
│   │   │   │   ├── EvidenceViewer.jsx
│   │   │   │   └── CandidateHistory.jsx
│   │   │   └── RecruiterMode/
│   │   │       ├── RecruiterDashboard.jsx
│   │   │       ├── JobManager.jsx
│   │   │       ├── CandidateComparison.jsx
│   │   │       └── ResumeBatchUploader.jsx
│   │   ├── services/
│   │   │   └── api.js        # Centralized HTTP & Auth client
│   │   ├── App.jsx           # Main workspace coordinator
│   │   ├── main.jsx
│   │   └── index.css         # Glassmorphism styling & animations
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json           # Vercel deployment configuration
│   └── .env.example
├── .gitignore
├── README.md
└── start.sh                  # One-click startup script
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Git

### 1. Clone & Setup
```bash
git clone git@github.com:charmikansara16/proofhire-ai-resume-intelligence.git
cd proofhire-ai-resume-intelligence
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
The backend API and interactive documentation will be accessible at:
- **API URL:** `http://localhost:8000`
- **Swagger Docs:** `http://localhost:8000/api/docs`
- **ReDoc:** `http://localhost:8000/api/redoc`

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The frontend interface will open at `http://localhost:5173`.

### 4. Running the Test Suite
```bash
cd backend
PYTHONPATH=. venv/bin/pytest -v tests
```

---

## 🌐 Production Deployment

### Frontend Deployment (Vercel)
1. Push this repository to GitHub.
2. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import the repository and set the **Root Directory** to `frontend`.
4. Configure Environment Variable:
   - `VITE_API_URL`: Your deployed FastAPI backend URL (e.g. `https://api.proofhire.example.com`).
5. Deploy. The `vercel.json` file automatically handles single-page app routing.

### Backend Deployment (Render / Railway / Fly.io / AWS)
1. Deploy as a Docker service using the included `backend/Dockerfile` or native Python runtime.
2. Set the build directory / root directory to `backend`.
3. Start command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
4. Set Production Environment Variables:
   - `DATABASE_URL`: Managed PostgreSQL connection string (`postgresql://user:pass@host:5432/dbname`)
   - `JWT_SECRET`: A strong 32+ character random secret string
   - `CORS_ORIGINS`: Your Vercel frontend domain (e.g. `https://proofhire.vercel.app`)
   - `STORAGE_DIR`: Persistent mount path for private resume storage
   - `MAX_UPLOAD_SIZE_MB`: `10`

---

## 🔒 Security & Privacy Practices
- **No Public Resume Exposure:** Uploaded candidate CVs are stored with non-deterministic UUID filenames in an unexposed directory and can only be downloaded via authenticated, role-verified endpoints.
- **Tenancy Boundary:** Database queries for jobs, applicants, decisions, and analytics enforce `organization_id` filtering.
- **Credential Protection:** Zero credentials or sample secrets are tracked in version control. All configuration flows through environment variables.
- **Upload Hardening:** Enforced 10MB file caps, mime-type verification, and sanitized text extraction.

---

## 🔮 Limitations & Future Improvements
- **Scanned Image Resumes:** Currently requires text-based PDFs or DOCX files; future iterations will incorporate Tesseract OCR for scanned photographic documents.
- **Multi-Language Support:** NLP keyword lemmas are optimized for English; expansion to multilingual tokenizers is planned.
- **ATS Webhooks:** Future support for direct synchronization with Greenhouse, Ashby, and Lever.

---

## 📄 License
MIT License. Built by Charmi Kansara.
