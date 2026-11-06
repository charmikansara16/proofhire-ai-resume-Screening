from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Job, User, Application
from app.schemas import JobCreate, JobUpdate, JobOut
from app.auth import get_current_user, require_recruiter, verify_recruiter_organization

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

@router.get("", response_model=List[JobOut])
def list_jobs(
    organization_id: Optional[int] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Job).filter(Job.status == "active")
    if organization_id:
        query = query.filter(Job.organization_id == organization_id)
    if category and category != "All":
        query = query.filter(Job.target_category == category)
    
    jobs = query.order_by(Job.created_at.desc()).all()
    results = []
    for j in jobs:
        count = db.query(Application).filter(Application.job_id == j.id).count()
        job_dict = {
            "id": j.id,
            "organization_id": j.organization_id,
            "title": j.title,
            "department": j.department,
            "description": j.description,
            "required_skills": j.required_skills or [],
            "preferred_skills": j.preferred_skills or [],
            "min_experience_years": j.min_experience_years,
            "target_category": j.target_category,
            "status": j.status,
            "created_at": j.created_at,
            "applicant_count": count
        }
        results.append(JobOut(**job_dict))
    return results

@router.post("", response_model=JobOut, status_code=status.HTTP_201_CREATED)
def create_job(
    payload: JobCreate,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    new_job = Job(
        organization_id=current_user.organization_id,
        created_by_user_id=current_user.id,
        title=payload.title.strip(),
        department=payload.department.strip(),
        description=payload.description.strip(),
        required_skills=payload.required_skills,
        preferred_skills=payload.preferred_skills,
        min_experience_years=payload.min_experience_years,
        target_category=payload.target_category,
        status="active"
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return JobOut(
        id=new_job.id,
        organization_id=new_job.organization_id,
        title=new_job.title,
        department=new_job.department,
        description=new_job.description,
        required_skills=new_job.required_skills,
        preferred_skills=new_job.preferred_skills,
        min_experience_years=new_job.min_experience_years,
        target_category=new_job.target_category,
        status=new_job.status,
        created_at=new_job.created_at,
        applicant_count=0
    )

@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job opening not found")
    count = db.query(Application).filter(Application.job_id == job.id).count()
    return JobOut(
        id=job.id,
        organization_id=job.organization_id,
        title=job.title,
        department=job.department,
        description=job.description,
        required_skills=job.required_skills or [],
        preferred_skills=job.preferred_skills or [],
        min_experience_years=job.min_experience_years,
        target_category=job.target_category,
        status=job.status,
        created_at=job.created_at,
        applicant_count=count
    )

@router.put("/{job_id}", response_model=JobOut)
def update_job(
    job_id: int,
    payload: JobUpdate,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job opening not found")
    verify_recruiter_organization(current_user, job.organization_id)

    if payload.title is not None:
        job.title = payload.title.strip()
    if payload.department is not None:
        job.department = payload.department.strip()
    if payload.description is not None:
        job.description = payload.description.strip()
    if payload.required_skills is not None:
        job.required_skills = payload.required_skills
    if payload.preferred_skills is not None:
        job.preferred_skills = payload.preferred_skills
    if payload.min_experience_years is not None:
        job.min_experience_years = payload.min_experience_years
    if payload.target_category is not None:
        job.target_category = payload.target_category
    if payload.status is not None:
        job.status = payload.status

    db.commit()
    db.refresh(job)
    count = db.query(Application).filter(Application.job_id == job.id).count()
    return JobOut(
        id=job.id,
        organization_id=job.organization_id,
        title=job.title,
        department=job.department,
        description=job.description,
        required_skills=job.required_skills or [],
        preferred_skills=job.preferred_skills or [],
        min_experience_years=job.min_experience_years,
        target_category=job.target_category,
        status=job.status,
        created_at=job.created_at,
        applicant_count=count
    )

@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job opening not found")
    verify_recruiter_organization(current_user, job.organization_id)
    db.delete(job)
    db.commit()
    return None
