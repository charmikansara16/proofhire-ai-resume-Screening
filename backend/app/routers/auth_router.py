from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Organization
from app.schemas import (
    UserRegisterCandidate,
    UserRegisterRecruiter,
    UserLogin,
    UserOut,
    Token
)
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    require_authenticated_user
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def format_user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        organization_id=user.organization_id,
        organization_name=user.organization.name if user.organization else None,
        created_at=user.created_at
    )

@router.post("/register-candidate", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_candidate(payload: UserRegisterCandidate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )

    new_user = User(
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name.strip(),
        role="candidate",
        organization_id=None
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": str(new_user.id), "role": "candidate"})
    return Token(access_token=token, token_type="bearer", user=format_user_out(new_user))

@router.post("/register-recruiter", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_recruiter(payload: UserRegisterRecruiter, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )

    # Find or create Organization
    org_name = payload.organization_name.strip()
    org = db.query(Organization).filter(Organization.name.ilike(org_name)).first()
    if not org:
        org = Organization(name=org_name)
        db.add(org)
        db.commit()
        db.refresh(org)

    new_user = User(
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name.strip(),
        role="recruiter",
        organization_id=org.id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": str(new_user.id), "role": "recruiter", "org_id": org.id})
    return Token(access_token=token, token_type="bearer", user=format_user_out(new_user))

@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={
        "sub": str(user.id),
        "role": user.role,
        "org_id": user.organization_id
    })
    return Token(access_token=token, token_type="bearer", user=format_user_out(user))

@router.get("/me", response_model=UserOut)
def get_me(user: User = Depends(require_authenticated_user)):
    return format_user_out(user)
