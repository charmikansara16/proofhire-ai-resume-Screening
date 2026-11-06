import os
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Response
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Application, Job, User
from app.schemas import ApplicationOut, AnalysisResult
from app.auth import get_current_user, require_candidate
from app.parser import save_and_parse_resume_file
from app.matcher import match_resume_to_job
from app.report import generate_candidate_pdf_report

router = APIRouter(prefix="/api/candidate", tags=["Candidate Mode"])

@router.post("/analyze")
async def analyze_candidate_resume(
    resume_file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
    candidate_name: Optional[str] = Form(None),
    candidate_email: Optional[str] = Form(None),
    job_id: Optional[int] = Form(None),
    job_description: Optional[str] = Form(None),
    target_category: Optional[str] = Form(None),
    photo_score: Optional[int] = Form(None),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Step 1: Text extraction & secure storage
    storage_path = ""
    orig_filename = "direct_paste.txt"

    if resume_file and resume_file.filename:
        extracted_text, storage_path, orig_filename = await save_and_parse_resume_file(resume_file)
    elif raw_text and raw_text.strip():
        extracted_text = raw_text.strip()
        # Save raw text to storage as well
        import uuid
        from app.config import settings
        fname = f"{uuid.uuid4().hex}.txt"
        storage_path = os.path.join(settings.STORAGE_DIR, fname)
        with open(storage_path, "w", encoding="utf-8") as f:
            f.write(extracted_text)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a resume file (.pdf, .docx, .txt) or raw resume text must be provided."
        )

    # Step 2: Determine Job Criteria
    req_skills = None
    pref_skills = None
    min_exp = 0
    jd_text = job_description or ""
    org_id = None
    job_title = "Custom Job Evaluation"

    if job_id:
        target_job = db.query(Job).filter(Job.id == job_id).first()
        if target_job:
            req_skills = target_job.required_skills
            pref_skills = target_job.preferred_skills
            min_exp = target_job.min_experience_years
            jd_text = target_job.description
            org_id = target_job.organization_id
            job_title = target_job.title

    if not jd_text.strip():
        # Default baseline criteria if none provided
        jd_text = f"Professional role in {target_category or 'Technology'}. Requires strong relevant experience, core technical competencies, and teamwork."

    # Step 3: Run Evidence-Based Match Engine
    analysis = match_resume_to_job(
        resume_text=extracted_text,
        job_description=jd_text,
        required_skills=req_skills,
        preferred_skills=pref_skills,
        min_experience_years=min_exp
    )

    if photo_score is not None:
        analysis["photo_score"] = photo_score
        # Adjust overall score slightly if photo score provided (80% nlp + 20% photo)
        adjusted = round((analysis["match_score"] * 0.80) + (photo_score * 0.20))
        analysis["match_score"] = adjusted

    # Step 4: Persist application record in database
    c_name = candidate_name or (current_user.full_name if current_user else "Applicant")
    c_email = candidate_email or (current_user.email if current_user else None)

    app_record = Application(
        job_id=job_id,
        user_id=current_user.id if current_user else None,
        organization_id=org_id,
        candidate_name=c_name,
        candidate_email=c_email,
        resume_filename=orig_filename,
        resume_file_path=storage_path,
        raw_text=extracted_text,
        match_score=analysis["match_score"],
        skills_score=analysis["skills_score"],
        experience_score=analysis["experience_score"],
        photo_score=analysis.get("photo_score"),
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

    analysis["application_id"] = app_record.id
    analysis["job_title"] = job_title
    analysis["candidate_name"] = c_name
    return analysis

@router.get("/applications", response_model=List[ApplicationOut])
def list_my_applications(
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    apps = db.query(Application).filter(Application.user_id == current_user.id).order_by(Application.created_at.desc()).all()
    out = []
    for a in apps:
        out.append(ApplicationOut(
            id=a.id,
            job_id=a.job_id,
            job_title=a.job.title if a.job else "Direct Resume Analysis",
            organization_name=a.organization.name if a.organization else "Independent",
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
    return out

@router.get("/applications/{app_id}", response_model=ApplicationOut)
def get_candidate_application(
    app_id: int,
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == app_id, Application.user_id == current_user.id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application record not found")
    return ApplicationOut(
        id=app.id,
        job_id=app.job_id,
        job_title=app.job.title if app.job else "Direct Resume Analysis",
        organization_name=app.organization.name if app.organization else "Independent",
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

@router.get("/applications/{app_id}/pdf")
def download_candidate_pdf(
    app_id: int,
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application record not found")

    data = {
        "candidate_name": app.candidate_name,
        "job_title": app.job.title if app.job else "Target Role",
        "match_score": app.match_score,
        "skills_score": app.skills_score,
        "experience_score": app.experience_score,
        "recommendation": app.candidate_report.get("recommendation", "Screening Complete"),
        "matched_skills": app.matched_skills or [],
        "missing_skills": app.missing_skills or []
    }

    pdf_bytes = generate_candidate_pdf_report(data)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=ProofHire_Report_{app.id}.pdf"}
    )
