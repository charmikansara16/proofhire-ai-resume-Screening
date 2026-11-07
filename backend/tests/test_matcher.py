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

def test_financial_analyst_general_role_profile():
    from app.matcher import generate_general_role_profile
    profile = generate_general_role_profile("Financial Analyst")
    assert profile["role_type"] == "general_role_expectation"
    category_ids = [c["category_id"] for c in profile["categories"]]
    assert "technical_skills" in category_ids
    assert "financial_analysis" in category_ids
    assert "accounting_statements" in category_ids
    assert "analytical_tools" in category_ids
    assert "financial_modelling" in category_ids
    assert "education_experience" in category_ids
    assert "General role expectations, not company-specific requirements." in profile["disclaimer"]

def test_transferable_analytical_skills_rule():
    from app.matcher import match_resume_to_job
    # Candidate with Python and SQL applying for Financial Analyst role
    resume_with_python = """
    Jane Doe
    Financial Analyst Candidate
    Summary: Experienced quantitative specialist with 3 years using Python, SQL, and Excel for data analysis and variance reporting.
    Experience:
    - Analyzed financial transactions using Python and SQL to identify anomalies.
    - Built Excel models for monthly revenue tracking.
    """
    jd = "Financial Analyst role. Core requirements: DCF Valuation, Financial Modeling, Accounting, Python."
    result = match_resume_to_job(
        resume_text=resume_with_python,
        job_description=jd,
        required_skills=["DCF Valuation", "Financial Modeling", "Accounting", "Python"]
    )
    # Python must be labeled transferable, or if matched must NOT be direct financial expertise
    requirements = result["requirements"]
    python_req = next((r for r in requirements if r["name"] == "Python"), None)
    if python_req:
        assert python_req["match_status"] == "transferable_skill" or "transferable" in python_req["match_type_label"].lower() or "transferable" in python_req["explanation"].lower()

def test_analysis_incomplete_on_empty_resume():
    from app.matcher import match_resume_to_job
    result = match_resume_to_job(resume_text="", job_description="Some role")
    assert result["status"] == "Analysis Incomplete"
    assert result["match_score"] is None

def test_section_extraction():
    from app.parser import extract_resume_sections
    resume = """
    Jane Doe
    Professional Summary:
    Energetic Software Engineer with 4 years experience.
    Technical Skills:
    Python, React, Docker, SQL.
    Professional Experience:
    Software Developer at TechCorp.
    Education:
    B.S. in Computer Science.
    Certifications:
    AWS Certified Solutions Architect.
    """
    sections = extract_resume_sections(resume)
    assert "summary" in sections
    assert "skills" in sections
    assert "experience" in sections
    assert "education" in sections
    assert "certifications" in sections
    assert "Python" in sections["skills"]

