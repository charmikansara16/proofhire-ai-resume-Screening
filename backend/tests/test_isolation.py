import pytest

def test_organization_data_isolation(client):
    # 1. Register Recruiter 1 in Organization Alpha
    r1_resp = client.post("/api/auth/register-recruiter", json={
        "email": "alpha.recruiter@alpha.com",
        "password": "Password123!",
        "full_name": "Alpha Recruiter",
        "organization_name": "Organization Alpha"
    })
    token_alpha = r1_resp.json()["access_token"]
    org_alpha_id = r1_resp.json()["user"]["organization_id"]

    # 2. Register Recruiter 2 in Organization Beta
    r2_resp = client.post("/api/auth/register-recruiter", json={
        "email": "beta.recruiter@beta.com",
        "password": "Password123!",
        "full_name": "Beta Recruiter",
        "organization_name": "Organization Beta"
    })
    token_beta = r2_resp.json()["access_token"]
    org_beta_id = r2_resp.json()["user"]["organization_id"]

    assert org_alpha_id != org_beta_id

    # 3. Recruiter 1 creates a job in Org Alpha
    job_resp = client.post("/api/jobs", json={
        "title": "Alpha ML Engineer",
        "department": "AI Labs",
        "description": "Must know Python, PyTorch, and SQL.",
        "required_skills": ["Python", "PyTorch", "SQL"],
        "min_experience_years": 3,
        "target_category": "Data Science"
    }, headers={"Authorization": f"Bearer {token_alpha}"})
    assert job_resp.status_code == 201
    job_alpha_id = job_resp.json()["id"]

    # 4. Upload candidate to Org Alpha job
    upload_resp = client.post(
        "/api/recruiter/candidates/upload",
        data={
            "job_id": job_alpha_id,
            "candidate_name": "Candidate Alpha Applicant",
            "candidate_email": "applicant@test.com"
        },
        files={
            "resume_file": ("resume.txt", b"Machine Learning Engineer with 4 years Python and PyTorch experience.", "text/plain")
        },
        headers={"Authorization": f"Bearer {token_alpha}"}
    )
    assert upload_resp.status_code == 200
    candidate_app_id = upload_resp.json()["id"]

    # 5. TEST ISOLATION: Recruiter Beta attempts to view candidate in Org Alpha -> 403 Forbidden
    beta_view_resp = client.get(
        f"/api/recruiter/candidates/{candidate_app_id}",
        headers={"Authorization": f"Bearer {token_beta}"}
    )
    assert beta_view_resp.status_code == 403

    # 6. TEST ISOLATION: Recruiter Beta attempts to update decision on Org Alpha candidate -> 403 Forbidden
    beta_decide_resp = client.post(
        f"/api/recruiter/candidates/{candidate_app_id}/decision",
        json={"decision": "rejected", "notes": "Hacked"},
        headers={"Authorization": f"Bearer {token_beta}"}
    )
    assert beta_decide_resp.status_code == 403

    # 7. TEST ISOLATION: Recruiter Beta lists candidates -> Should see 0 candidates (Org Alpha candidate is isolated)
    beta_list_resp = client.get(
        "/api/recruiter/candidates",
        headers={"Authorization": f"Bearer {token_beta}"}
    )
    assert beta_list_resp.status_code == 200
    assert len(beta_list_resp.json()) == 0

    # 8. TEST VALID ACCESS: Recruiter Alpha CAN view and update decision
    alpha_decide_resp = client.post(
        f"/api/recruiter/candidates/{candidate_app_id}/decision",
        json={"decision": "shortlisted", "notes": "Strong candidate match"},
        headers={"Authorization": f"Bearer {token_alpha}"}
    )
    assert alpha_decide_resp.status_code == 200
    assert alpha_decide_resp.json()["recruiter_decision"] == "shortlisted"

    # 9. TEST REPORT DOWNLOAD: Recruiter Alpha downloads summary PDF report
    report_resp = client.get(
        f"/api/recruiter/jobs/{job_alpha_id}/report",
        headers={"Authorization": f"Bearer {token_alpha}"}
    )
    assert report_resp.status_code == 200
    assert report_resp.headers["content-type"] == "application/pdf"
    assert len(report_resp.content) > 500

    # 10. TEST CANDIDATE PDF REPORT DOWNLOAD
    cand_pdf_resp = client.get(f"/api/candidate/applications/{candidate_app_id}/pdf")
    assert cand_pdf_resp.status_code == 200
    assert cand_pdf_resp.headers["content-type"] == "application/pdf"
    assert len(cand_pdf_resp.content) > 500
