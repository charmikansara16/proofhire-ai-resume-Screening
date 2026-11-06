import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.database import get_db
from app.models import Application, Job, User, Organization
from app.schemas import (
    ApplicationOut,
    RecruiterDecisionUpdate,
    DashboardStats
)
from app.auth import require_recruiter, verify_recruiter_organization
from app.parser import save_and_parse_resume_file
from app.matcher import match_resume_to_job
from app.report import generate_recruiter_summary_pdf

router = APIRouter(prefix="/api/recruiter", tags=["Recruiter Mode"])

@router.get("/dashboard", response_model=DashboardStats)
def get_recruiter_dashboard(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    org_id = current_user.organization_id
    total_candidates = db.query(Application).filter(Application.organization_id == org_id).count()
    avg_score_res = db.query(func.avg(Application.match_score)).filter(Application.organization_id == org_id).scalar() or 0.0
    shortlisted = db.query(Application).filter(Application.organization_id == org_id, Application.recruiter_decision == "shortlisted").count()
    interviews = db.query(Application).filter(Application.organization_id == org_id, Application.recruiter_decision == "interview").count()
    active_jobs = db.query(Job).filter(Job.organization_id == org_id, Job.status == "active").count()

    return DashboardStats(
        total_candidates=total_candidates,
        average_score=round(float(avg_score_res), 1),
        shortlisted_count=shortlisted,
        interview_count=interviews,
        active_jobs=active_jobs
    )

@router.get("/candidates", response_model=List[ApplicationOut])
def list_organization_candidates(
    job_id: Optional[int] = None,
    decision: Optional[str] = None,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    org_id = current_user.organization_id
    query = db.query(Application).filter(Application.organization_id == org_id)

    if job_id:
        query = query.filter(Application.job_id == job_id)
    if decision and decision != "all":
        query = query.filter(Application.recruiter_decision == decision)

    candidates = query.order_by(Application.match_score.desc()).all()
    results = []
    for a in candidates:
        results.append(ApplicationOut(
            id=a.id,
            job_id=a.job_id,
            job_title=a.job.title if a.job else "Direct Application",
            organization_name=current_user.organization.name if current_user.organization else "My Organization",
            candidate_name=a.candidate_name,
            candidate_email=a.candidate_email,
            resume_filename=a.resume_filename,
            match_score=a.match_score,
            skills_score=a.skills_score,
            experience_score=a.experience_score,
            photo_score=a.photo_score,
            predicted_category=a.predicted_category,
            experience_years_detected=a.experience_years_detected,
            matched_skills=a.matched_skills or [],
            missing_skills=a.missing_skills or [],
            evidence_snippets=a.evidence_snippets or [],
            summary=a.summary or "",
            candidate_report=a.candidate_report or {},
            recruiter_report=a.recruiter_report or {},
            recruiter_decision=a.recruiter_decision,
            recruiter_notes=a.recruiter_notes or "",
            decided_at=a.decided_at,
            created_at=a.created_at
        ))
    return results

@router.post("/candidates/upload", response_model=ApplicationOut)
async def recruiter_upload_candidate(
    job_id: int = Form(...),
    candidate_name: str = Form(...),
    candidate_email: Optional[str] = Form(None),
    resume_file: UploadFile = File(...),
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    org_id = current_user.organization_id

    # Verify job belongs to this recruiter's organization
    job = db.query(Job).filter(Job.id == job_id, Job.organization_id == org_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job opening not found in your organization")

    extracted_text, storage_path, orig_filename = await save_and_parse_resume_file(resume_file)

    analysis = match_resume_to_job(
        resume_text=extracted_text,
        job_description=job.description,
        required_skills=job.required_skills,
        preferred_skills=job.preferred_skills,
        min_experience_years=job.min_experience_years
    )

    app_record = Application(
        job_id=job.id,
        user_id=None,
        organization_id=org_id,
        candidate_name=candidate_name.strip(),
        candidate_email=candidate_email.strip() if candidate_email else None,
        resume_filename=orig_filename,
        resume_file_path=storage_path,
        raw_text=extracted_text,
        match_score=analysis["match_score"],
        skills_score=analysis["skills_score"],
        experience_score=analysis["experience_score"],
        photo_score=None,
        predicted_category=analysis["predicted_category"],
        experience_years_detected=analysis["experience_years_detected"],
        matched_skills=analysis["matched_skills"],
        missing_skills=analysis["missing_skills"],
        evidence_snippets=analysis["evidence_snippets"],
        summary=analysis["summary"],
        candidate_report=analysis["candidate_report"],
        recruiter_report=analysis["recruiter_report"],
        recruiter_decision="pending"
    )
    db.add(app_record)
    db.commit()
    db.refresh(app_record)

    return ApplicationOut(
        id=app_record.id,
        job_id=app_record.job_id,
        job_title=job.title,
        organization_name=current_user.organization.name if current_user.organization else "My Organization",
        candidate_name=app_record.candidate_name,
        candidate_email=app_record.candidate_email,
        resume_filename=app_record.resume_filename,
        match_score=app_record.match_score,
        skills_score=app_record.skills_score,
        experience_score=app_record.experience_score,
        photo_score=app_record.photo_score,
        predicted_category=app_record.predicted_category,
        experience_years_detected=app_record.experience_years_detected,
        matched_skills=app_record.matched_skills or [],
        missing_skills=app_record.missing_skills or [],
        evidence_snippets=app_record.evidence_snippets or [],
        summary=app_record.summary or "",
        candidate_report=app_record.candidate_report or {},
        recruiter_report=app_record.recruiter_report or {},
        recruiter_decision=app_record.recruiter_decision,
        recruiter_notes=app_record.recruiter_notes or "",
        decided_at=app_record.decided_at,
        created_at=app_record.created_at
    )

@router.get("/candidates/{app_id}", response_model=ApplicationOut)
def get_candidate_details(
    app_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate record not found")
    verify_recruiter_organization(current_user, app.organization_id)

    return ApplicationOut(
        id=app.id,
        job_id=app.job_id,
        job_title=app.job.title if app.job else "Direct Application",
        organization_name=current_user.organization.name if current_user.organization else "My Organization",
        candidate_name=app.candidate_name,
        candidate_email=app.candidate_email,
        resume_filename=app.resume_filename,
        match_score=app.match_score,
        skills_score=app.skills_score,
        experience_score=app.experience_score,
        photo_score=app.photo_score,
        predicted_category=app.predicted_category,
        experience_years_detected=app.experience_years_detected,
        matched_skills=app.matched_skills or [],
        missing_skills=app.missing_skills or [],
        evidence_snippets=app.evidence_snippets or [],
        summary=app.summary or "",
        candidate_report=app.candidate_report or {},
        recruiter_report=app.recruiter_report or {},
        recruiter_decision=app.recruiter_decision,
        recruiter_notes=app.recruiter_notes or "",
        decided_at=app.decided_at,
        created_at=app.created_at
    )

@router.post("/candidates/{app_id}/decision", response_model=ApplicationOut)
def update_candidate_decision(
    app_id: int,
    payload: RecruiterDecisionUpdate,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate record not found")
    verify_recruiter_organization(current_user, app.organization_id)

    app.recruiter_decision = payload.decision
    if payload.notes:
        app.recruiter_notes = payload.notes
    app.decided_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(app)

    return ApplicationOut(
        id=app.id,
        job_id=app.job_id,
        job_title=app.job.title if app.job else "Direct Application",
        organization_name=current_user.organization.name if current_user.organization else "My Organization",
        candidate_name=app.candidate_name,
        candidate_email=app.candidate_email,
        resume_filename=app.resume_filename,
        match_score=app.match_score,
        skills_score=app.skills_score,
        experience_score=app.experience_score,
        photo_score=app.photo_score,
        predicted_category=app.predicted_category,
        experience_years_detected=app.experience_years_detected,
        matched_skills=app.matched_skills or [],
        missing_skills=app.missing_skills or [],
        evidence_snippets=app.evidence_snippets or [],
        summary=app.summary or "",
        candidate_report=app.candidate_report or {},
        recruiter_report=app.recruiter_report or {},
        recruiter_decision=app.recruiter_decision,
        recruiter_notes=app.recruiter_notes or "",
        decided_at=app.decided_at,
        created_at=app.created_at
    )

@router.get("/jobs/{job_id}/report")
def export_job_recruiter_report(
    job_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id, Job.organization_id == current_user.organization_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job opening not found")

    candidates = db.query(Application).filter(Application.job_id == job.id).order_by(Application.match_score.desc()).all()
    cand_data = []
    for c in candidates:
        cand_data.append({
            "candidate_name": c.candidate_name,
            "match_score": c.match_score,
            "predicted_category": c.predicted_category,
            "recruiter_decision": c.recruiter_decision,
            "matched_skills": c.matched_skills or [],
            "recruiter_report": c.recruiter_report or {}
        })

    pdf_bytes = generate_recruiter_summary_pdf(
        job_title=job.title,
        org_name=current_user.organization.name if current_user.organization else "ProofHire Recruiter",
        candidates=cand_data
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Recruiter_Report_Job_{job.id}.pdf"}
    )
