import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="organization", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="organization", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="candidate") # "candidate" | "recruiter"
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="users")
    jobs_created = relationship("Job", back_populates="creator")
    applications = relationship("Application", back_populates="user")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    department = Column(String(100), default="General")
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list) # e.g. ["Python", "FastAPI", "PostgreSQL"]
    preferred_skills = Column(JSON, default=list) # e.g. ["Docker", "Kubernetes"]
    min_experience_years = Column(Integer, default=0)
    target_category = Column(String(100), default="Data Science")
    status = Column(String(50), default="active") # "active" | "closed"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="jobs")
    creator = relationship("User", back_populates="jobs_created")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True)
    candidate_name = Column(String(255), nullable=False)
    candidate_email = Column(String(255), nullable=True)
    resume_filename = Column(String(255), nullable=False)
    resume_file_path = Column(String(512), nullable=False)
    raw_text = Column(Text, nullable=False)
    
    # Matching Scores & Categorization
    match_score = Column(Integer, default=0)
    skills_score = Column(Integer, default=0)
    experience_score = Column(Integer, default=0)
    photo_score = Column(Integer, nullable=True)
    predicted_category = Column(String(100), default="")
    experience_years_detected = Column(Float, default=0.0)

    # Evidence & Reports
    matched_skills = Column(JSON, default=list)      # [{skill, evidence, context, match_type}]
    missing_skills = Column(JSON, default=list)      # [{skill, importance, reason, recommendation}]
    evidence_snippets = Column(JSON, default=list)   # key excerpts demonstrating capabilities
    summary = Column(Text, default="")
    candidate_report = Column(JSON, default=dict)
    recruiter_report = Column(JSON, default=dict)

    # Recruiter Workflow State
    recruiter_decision = Column(String(50), default="pending") # "pending" | "shortlisted" | "interview" | "accepted" | "rejected"
    recruiter_notes = Column(Text, default="")
    decided_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    job = relationship("Job", back_populates="applications")
    user = relationship("User", back_populates="applications")
    organization = relationship("Organization", back_populates="applications")
