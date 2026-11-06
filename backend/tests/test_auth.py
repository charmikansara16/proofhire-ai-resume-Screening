import pytest

def test_candidate_registration_and_login(client):
    # 1. Register candidate
    reg_resp = client.post("/api/auth/register-candidate", json={
        "email": "sarah.candidate@example.com",
        "password": "StrongPassword123!",
        "full_name": "Sarah Jenkins"
    })
    assert reg_resp.status_code == 201
    data = reg_resp.json()
    assert "access_token" in data
    assert data["user"]["role"] == "candidate"
    assert data["user"]["email"] == "sarah.candidate@example.com"
    token = data["access_token"]

    # 2. Get profile with token
    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["full_name"] == "Sarah Jenkins"

    # 3. Login
    login_resp = client.post("/api/auth/login", json={
        "email": "sarah.candidate@example.com",
        "password": "StrongPassword123!"
    })
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()

    # 4. Failed login
    bad_login = client.post("/api/auth/login", json={
        "email": "sarah.candidate@example.com",
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401

def test_recruiter_registration_and_org_creation(client):
    reg_resp = client.post("/api/auth/register-recruiter", json={
        "email": "recruiter.alex@acme.com",
        "password": "RecruiterPass456!",
        "full_name": "Alex Vance",
        "organization_name": "Acme Innovations"
    })
    assert reg_resp.status_code == 201
    data = reg_resp.json()
    assert data["user"]["role"] == "recruiter"
    assert data["user"]["organization_name"] == "Acme Innovations"
    assert data["user"]["organization_id"] is not None
