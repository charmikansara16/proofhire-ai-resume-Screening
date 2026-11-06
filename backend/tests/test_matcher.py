import pytest
from app.matcher import match_resume_to_job, extract_years_of_experience, classify_role_domain

SAMPLE_RESUME = """
Dr. Maria Chen
Senior Machine Learning Scientist
Summary:
Innovative Data Scientist with 6 years of industry experience leveraging Python, NLP, PyTorch, and Scikit-Learn to build scalable machine learning architectures. Expert in Natural Language Processing, TF-IDF vectorization, and text classification.

Experience:
Senior Machine Learning Scientist | Apex Technologies (2020 - Present)
- Engineered automated document classification system classifying 50,000+ candidate CVs with 94.2% accuracy using Python, PyTorch, and FastAPI.
- Built NLP transformer pipelines using HuggingFace BERT and Scikit-Learn for semantic search.
- Deployed REST APIs on Docker and AWS with CI/CD automation.

Education:
Ph.D. in Computer Science | Stanford University (2016 - 2020)
"""

def test_evidence_based_skill_matching():
    jd = "Seeking a Senior Machine Learning Engineer with Python, PyTorch, FastAPI, and Kubernetes."
    required_skills = ["Python", "PyTorch", "FastAPI", "Kubernetes"]
    preferred_skills = ["Docker", "AWS"]

    result = match_resume_to_job(
        resume_text=SAMPLE_RESUME,
        job_description=jd,
        required_skills=required_skills,
        preferred_skills=preferred_skills,
        min_experience_years=4
    )

    # 1. Match score calculation
    assert result["match_score"] >= 70
    assert result["skills_score"] > 60

    # 2. Evidence mapping: Check matched skills have exact quote excerpts
    matched_names = [m["skill"] for m in result["matched_skills"]]
    assert "Python" in matched_names
    assert "PyTorch" in matched_names
    assert "FastAPI" in matched_names

    python_match = next(m for m in result["matched_skills"] if m["skill"] == "Python")
    assert "Python" in python_match["evidence"]
    assert len(python_match["evidence"]) > 10

    # 3. Missing requirement detection
    missing_names = [m["skill"] for m in result["missing_skills"]]
    assert "Kubernetes" in missing_names
    k8s_gap = next(m for m in result["missing_skills"] if m["skill"] == "Kubernetes")
    assert k8s_gap["importance"] == "Must-Have"
    assert "recommendation" in k8s_gap

    # 4. Experience detection
    assert result["experience_years_detected"] >= 4.0

    # 5. Reports generated
    assert "title" in result["candidate_report"]
    assert "suggested_interview_questions" in result["recruiter_report"]

def test_experience_extraction_regex():
    text1 = "Over 7+ years of experience developing enterprise distributed systems."
    years, label = extract_years_of_experience(text1)
    assert years == 7.0

    text2 = "Software Engineer (2019 - 2024)"
    years2, label2 = extract_years_of_experience(text2)
    assert years2 == 5.0
