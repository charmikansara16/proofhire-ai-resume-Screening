from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.config import settings
from app.database import engine, Base
from app.routers import (
    auth_router,
    jobs_router,
    candidate_router,
    recruiter_router,
    files_router
)

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("proofhire")

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ProofHire AI Resume Intelligence API",
    description="Production backend for AI-powered resume intelligence, evidence-based skill verification, and multi-tenant recruiter screening.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Parse CORS origins
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Error Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."}
    )

# Include Routers
app.include_router(auth_router.router)
app.include_router(jobs_router.router)
app.include_router(candidate_router.router)
app.include_router(recruiter_router.router)
app.include_router(files_router.router)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "ProofHire AI Resume Intelligence API",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
