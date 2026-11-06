from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

# --- Auth Schemas ---
class UserRegisterCandidate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)

class UserRegisterRecruiter(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    organization_name: str = Field(..., min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    organization_id: Optional[int] = None
    organization_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# --- Job Schemas ---
class JobCreate(BaseModel):
    title: str = Field(..., min_length=2)
    department: str = Field(default="Engineering")
    description: str = Field(..., min_length=10)
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    min_experience_years: int = Field(default=0, ge=0)
    target_category: str = Field(default="Data Science")

class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    min_experience_years: Optional[int] = None
    target_category: Optional[str] = None
    status: Optional[str] = None

class JobOut(BaseModel):
    id: int
    organization_id: int
    title: str
    department: str
    description: str
    required_skills: List[str]
    preferred_skills: List[str]
    min_experience_years: int
    target_category: str
    status: str
    created_at: datetime
    applicant_count: Optional[int] = 0

    class Config:
        from_attributes = True

# --- Analysis & Evidence Schemas ---
class SkillMatchEvidence(BaseModel):
    skill: str
    evidence: str
    context: str
    match_type: str # "exact" | "synonym" | "semantic"
    confidence: float # 0.0 - 1.0

class MissingRequirement(BaseModel):
    skill: str
    importance: str # "Must-Have" | "Preferred"
    reason: str
    recommendation: str

class AnalysisResult(BaseModel):
    match_score: int
    skills_score: int
    experience_score: int
    photo_score: Optional[int] = None
    predicted_category: str
    category_confidence: float
    experience_years_detected: float
    experience_label: str
    recommendation: str
    recommendation_badge: str
    matched_skills: List[SkillMatchEvidence]
    missing_skills: List[MissingRequirement]
    evidence_snippets: List[str]
    summary: str
    candidate_report: Dict[str, Any]
    recruiter_report: Dict[str, Any]

# --- Application Schemas ---
class ApplicationOut(BaseModel):
    id: int
    job_id: Optional[int]
    job_title: Optional[str] = None
    organization_name: Optional[str] = None
    candidate_name: str
    candidate_email: Optional[str]
    resume_filename: str
    match_score: int
    skills_score: int
    experience_score: int
    photo_score: Optional[int]
    predicted_category: str
    experience_years_detected: float
    matched_skills: List[Any]
    missing_skills: List[Any]
    evidence_snippets: List[str]
    summary: str
    candidate_report: Dict[str, Any]
    recruiter_report: Dict[str, Any]
    recruiter_decision: str
    recruiter_notes: str
    decided_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

class RecruiterDecisionUpdate(BaseModel):
    decision: str = Field(..., pattern="^(pending|shortlisted|interview|accepted|rejected)$")
    notes: Optional[str] = ""

class DashboardStats(BaseModel):
    total_candidates: int
    average_score: float
    shortlisted_count: int
    interview_count: int
    active_jobs: int
