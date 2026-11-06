import io
import pytest
from reportlab.pdfgen import canvas
import docx

def test_candidate_analyze_pdf_upload(client):
    # 1. Register candidate
    reg = client.post("/api/auth/register-candidate", json={
        "email": "david.dev@example.com",
        "password": "Password123!",
        "full_name": "David Dev"
    })
    token = reg.json()["access_token"]

    # 2. Build PDF in memory
    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    c.drawString(100, 750, "David Dev - Senior Cloud Architect")
    c.drawString(100, 720, "5 years experience with AWS, Kubernetes, Terraform, Docker, and CI/CD pipelines.")
    c.drawString(100, 690, "Architected high availability cloud infrastructure on AWS EKS with Prometheus monitoring.")
    c.showPage()
    c.save()
    pdf_bytes = buf.getvalue()

    # 3. Analyze against DevOps role
    resp = client.post(
        "/api/candidate/analyze",
        data={
            "target_category": "DevOps Engineer",
            "job_description": "Cloud DevOps Engineer needed. Requirements: AWS, Kubernetes, Docker, Terraform, CI/CD, and Python.",
            "photo_score": 92
        },
        files={
            "resume_file": ("david_resume.pdf", pdf_bytes, "application/pdf")
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["match_score"] >= 70
    assert "application_id" in data
    app_id = data["application_id"]

    # Verify evidence was extracted
    matched_skills = [m["skill"] for m in data["matched_skills"]]
    assert "Aws" in matched_skills or "AWS" in [s.upper() for s in matched_skills]
    assert "Kubernetes" in matched_skills

    # 4. Fetch candidate application history
    hist = client.get("/api/candidate/applications", headers={"Authorization": f"Bearer {token}"})
    assert hist.status_code == 200
    apps = hist.json()
    assert len(apps) >= 1
    assert apps[0]["id"] == app_id

    # 5. Fetch single application
    single = client.get(f"/api/candidate/applications/{app_id}", headers={"Authorization": f"Bearer {token}"})
    assert single.status_code == 200
    assert single.json()["match_score"] == data["match_score"]

    # 6. Download PDF report
    pdf_rep = client.get(f"/api/candidate/applications/{app_id}/pdf")
    assert pdf_rep.status_code == 200
    assert len(pdf_rep.content) > 500

def test_file_validation_empty_and_unsupported(client):
    # Empty file rejection
    empty_resp = client.post(
        "/api/candidate/analyze",
        files={"resume_file": ("empty.pdf", b"", "application/pdf")}
    )
    assert empty_resp.status_code == 400

    # Unsupported format rejection
    bad_ext_resp = client.post(
        "/api/candidate/analyze",
        files={"resume_file": ("virus.exe", b"binarycontent", "application/octet-stream")}
    )
    assert bad_ext_resp.status_code == 400
