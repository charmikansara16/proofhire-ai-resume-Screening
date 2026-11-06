import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Application, User
from app.auth import require_authenticated_user

router = APIRouter(prefix="/api/resumes", tags=["Private Files"])

@router.get("/{app_id}/download")
def download_resume_file(
    app_id: int,
    current_user: User = Depends(require_authenticated_user),
    db: Session = Depends(get_db)
):
    """
    Secure resume download endpoint.
    Enforces authorization:
    - Candidate can only download their own resume.
    - Recruiter can only download resumes belonging to their organization.
    """
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume record not found")

    # Authorization Check
    if current_user.role == "candidate":
        if app.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: You can only download your own resume")
    elif current_user.role == "recruiter":
        if app.organization_id != current_user.organization_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: Candidate does not belong to your organization")
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")

    if not os.path.exists(app.resume_file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stored resume file was not found on server")

    return FileResponse(
        path=app.resume_file_path,
        filename=app.resume_filename,
        media_type="application/octet-stream"
    )
