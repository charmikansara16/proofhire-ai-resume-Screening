import re
from typing import List, Dict, Any, Tuple
from collections import Counter

# Canonical skill aliases for robust semantic matching
SKILL_ALIASES = {
    "python": ["python", "python3", "py"],
    "machine learning": ["machine learning", "ml", "statistical learning"],
    "deep learning": ["deep learning", "dl", "neural networks"],
    "pytorch": ["pytorch", "torch"],
    "tensorflow": ["tensorflow", "tf", "keras"],
    "scikit-learn": ["scikit-learn", "sklearn"],
    "nlp": ["nlp", "natural language processing", "text mining", "linguistics"],
    "transformers": ["transformers", "huggingface", "bert", "gpt", "llm", "large language models"],
    "sql": ["sql", "rdbms", "relational database", "ansi sql"],
    "postgresql": ["postgresql", "postgres", "psql"],
    "mysql": ["mysql"],
    "mongodb": ["mongodb", "nosql", "documentdb"],
    "docker": ["docker", "containerization", "containers"],
    "kubernetes": ["kubernetes", "k8s"],
    "aws": ["aws", "amazon web services", "ec2", "s3", "lambda"],
    "gcp": ["gcp", "google cloud platform", "google cloud"],
    "azure": ["azure", "microsoft azure"],
    "ci/cd": ["ci/cd", "ci cd", "continuous integration", "github actions", "gitlab ci", "jenkins"],
    "git": ["git", "github", "gitlab", "version control"],
    "linux": ["linux", "ubuntu", "debian", "redhat", "centos", "bash", "shell scripting"],
    "java": ["java", "j2ee", "core java", "java 11", "java 17", "java 21"],
    "spring boot": ["spring boot", "springboot", "spring framework", "spring"],
    "microservices": ["microservices", "microservice architecture", "distributed systems"],
    "rest api": ["rest api", "restful api", "restful", "rest apis", "rest endpoints"],
    "fastapi": ["fastapi", "asgi"],
    "flask": ["flask"],
    "django": ["django", "django rest framework", "drf"],
    "react": ["react", "react.js", "reactjs"],
    "javascript": ["javascript", "js", "es6+"],
    "typescript": ["typescript", "ts"],
    "node.js": ["node.js", "nodejs", "node"],
    "html": ["html", "html5"],
    "css": ["css", "css3", "tailwind", "sass", "scss"],
    "tailwind": ["tailwind", "tailwindcss"],
    "graphql": ["graphql", "apollo"],
    "kafka": ["kafka", "apache kafka", "event streaming"],
    "redis": ["redis", "in-memory cache", "caching"],
    "pandas": ["pandas"],
    "numpy": ["numpy"],
    "tableau": ["tableau", "power bi", "data visualization", "bi tools"],
    "power bi": ["power bi", "powerbi"],
    "spark": ["spark", "pyspark", "apache spark"],
    "hadoop": ["hadoop", "mapreduce"],
    "agile": ["agile", "scrum", "kanban", "sprint planning"],
    "testing": ["qa", "unit testing", "pytest", "jest", "cypress", "selenium", "integration testing"]
}

CATEGORY_KEYWORDS = {
    "Data Science": ["python", "machine learning", "nlp", "deep learning", "pytorch", "tensorflow", "scikit-learn", "data scientist", "pandas", "numpy", "transformers", "sql", "tableau", "statistics", "data analysis"],
    "Java Developer": ["java", "spring boot", "microservices", "hibernate", "rest api", "maven", "junit", "kafka", "postgresql", "docker", "multithreading"],
    "DevOps Engineer": ["devops", "kubernetes", "docker", "terraform", "aws", "ansible", "jenkins", "ci/cd", "linux", "prometheus", "grafana", "helm", "cloud"],
    "Full Stack / Web": ["react", "javascript", "typescript", "node.js", "html", "css", "tailwind", "next.js", "rest api", "frontend", "full stack"],
    "HR & Recruitment": ["human resources", "recruitment", "talent acquisition", "onboarding", "workday", "bamboohr", "employee relations", "payroll", "interviewing", "ats"],
    "Python Developer": ["python", "fastapi", "django", "flask", "sqlalchemy", "celery", "postgresql", "rest api", "asyncio"],
    "Testing & QA": ["testing", "qa", "selenium", "automation testing", "test cases", "cypress", "junit", "bug tracking", "quality assurance"]
}

def split_into_sentences_and_bullets(text: str) -> List[str]:
    """Split resume text into coherent sentences and bullet points."""
    lines = text.split('\n')
    snippets = []
    for line in lines:
        cleaned = line.strip()
        if not cleaned:
            continue
        # Remove leading bullet glyphs
        cleaned = re.sub(r'^[•\-\*–—\d\.\)]+\s*', '', cleaned).strip()
        if len(cleaned) < 10:
            continue
        # Subsplit if very long sentence
        subparts = re.split(r'(?<=[.!?])\s+(?=[A-Z0-9])', cleaned)
        for part in subparts:
            part = part.strip()
            if len(part) >= 15:
                snippets.append(part)
    return snippets

def parse_skills_from_text(text: str) -> List[str]:
    """Extract standard skills mentioned in a job description or free text."""
    lower_text = text.lower()
    found_skills = []

    for canonical, aliases in SKILL_ALIASES.items():
        for alias in aliases:
            pattern = r'\b' + re.escape(alias) + r'\b'
            if re.search(pattern, lower_text):
                found_skills.append(canonical.title() if len(canonical) > 3 else canonical.upper())
                break

    # Also detect custom skill bullet items from JD (e.g., "- 3+ years experience with X, Y, and Z")
    jd_bullets = re.findall(r'(?:[-*•]|\bexperience with\b|\bknowledge of\b|\bproficient in\b)\s*([^.\n;]+)', text, re.IGNORECASE)
    for bullet in jd_bullets:
        sub_items = re.split(r'[,;/]| and ', bullet)
        for item in sub_items:
            clean_item = item.strip()
            if 2 <= len(clean_item) <= 30 and not re.search(r'\b(years?|degree|b\.?s|m\.?s|experience|strong|good)\b', clean_item, re.IGNORECASE):
                # Title case formatted
                formatted = clean_item.strip().title()
                if formatted not in found_skills and len(formatted) > 2:
                    found_skills.append(formatted)

    return list(dict.fromkeys(found_skills))

def extract_years_of_experience(text: str) -> Tuple[float, str]:
    """Extract total years of industry experience from explicit mentions and date spans."""
    # Pattern 1: Direct mentions like "5+ years of experience" or "7 years exp"
    direct_matches = re.findall(r'(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|industry experience|exp|working)?', text, re.IGNORECASE)
    if direct_matches:
        numbers = [float(n) for n in direct_matches if float(n) <= 40]
        if numbers:
            max_years = max(numbers)
            return max_years, f"{max_years:g}+ Years Experience (Directly Stated)"

    # Pattern 2: Year date ranges (e.g., 2018 - 2024, 2020 - Present)
    year_ranges = re.findall(r'(20\d{2}|19\d{2})\s*(?:-|–|—|to)\s*(20\d{2}|present|current)', text, re.IGNORECASE)
    if year_ranges:
        current_year = 2026
        durations = []
        for start_str, end_str in year_ranges:
            try:
                start = int(start_str)
                end = current_year if end_str.lower() in ['present', 'current'] else int(end_str)
                if end >= start and (end - start) <= 35:
                    durations.append(end - start)
            except Exception:
                continue
        if durations:
            total_est = min(sum(durations), 30)
            return float(total_est), f"~{total_est} Years Experience (Calculated from Career Timeline)"

    return 2.0, "Entry to Mid Level (~2 Years Estimated)"

def classify_role_domain(text: str) -> Tuple[str, float]:
    """Classify resume into role domain using weighted keyword frequency."""
    lower_text = text.lower()
    words = re.findall(r'[a-zA-Z0-9+#.]+', lower_text)
    word_counts = Counter(words)

    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = 0.0
        for kw in keywords:
            if " " in kw:
                if kw in lower_text:
                    score += 3.0
            else:
                score += word_counts.get(kw, 0) * 1.5
        scores[category] = score

    sorted_categories = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top_cat, top_score = sorted_categories[0]
    second_score = sorted_categories[1][1] if len(sorted_categories) > 1 else 1.0

    if top_score == 0:
        return "General Technology", 60.0

    confidence = min(round(70.0 + (top_score / (second_score + 1.0)) * 10.0, 1), 98.0)
    return top_cat, confidence

def find_evidence_for_skill(skill: str, snippets: List[str], full_text: str) -> Tuple[bool, str, str, float]:
    """
    Search for proof of a skill in resume snippets.
    Returns: (is_matched, evidence_sentence, context_paragraph, confidence)
    """
    skill_lower = skill.lower()
    aliases = SKILL_ALIASES.get(skill_lower, [skill_lower])

    best_snippet = ""
    best_confidence = 0.0

    for alias in aliases:
        pattern = r'\b' + re.escape(alias) + r'\b'
        for snippet in snippets:
            if re.search(pattern, snippet, re.IGNORECASE):
                # Assess evidence strength: action verbs increase confidence
                has_action_verb = bool(re.search(r'\b(developed|engineered|implemented|architected|built|designed|deployed|led|optimized|analyzed|managed)\b', snippet, re.IGNORECASE))
                confidence = 0.95 if has_action_verb else 0.85

                if confidence > best_confidence:
                    best_snippet = snippet
                    best_confidence = confidence

    if best_snippet:
        return True, best_snippet, best_snippet, best_confidence

    # Substring check across full text if not in snippets
    for alias in aliases:
        pattern = r'\b' + re.escape(alias) + r'\b'
        match = re.search(pattern, full_text, re.IGNORECASE)
        if match:
            start = max(0, match.start() - 60)
            end = min(len(full_text), match.end() + 60)
            extracted = full_text[start:end].replace('\n', ' ').strip()
            return True, f"...{extracted}...", extracted, 0.75

    return False, "", "", 0.0

def match_resume_to_job(
    resume_text: str,
    job_description: str,
    required_skills: List[str] = None,
    preferred_skills: List[str] = None,
    min_experience_years: int = 0
) -> Dict[str, Any]:
    """
    Performs comprehensive evidence-based matching between resume and job description.
    Extracts explicit quotes as evidence, detects missing skills with recommendations,
    and computes weighted readiness scores.
    """
    snippets = split_into_sentences_and_bullets(resume_text)
    exp_years_detected, exp_label = extract_years_of_experience(resume_text)
    domain_category, domain_conf = classify_role_domain(resume_text)

    # Determine required and preferred skill sets
    if not required_skills:
        parsed = parse_skills_from_text(job_description)
        required_skills = parsed[:8] if parsed else ["Communication", "Problem Solving", "Technical Leadership"]
    if preferred_skills is None:
        parsed_all = parse_skills_from_text(job_description)
        preferred_skills = parsed_all[8:14] if len(parsed_all) > 8 else []

    matched_skills = []
    missing_skills = []
    evidence_snippets = []

    # Check Required (Must-Have) Skills
    matched_req_count = 0
    for skill in required_skills:
        found, evidence, context, conf = find_evidence_for_skill(skill, snippets, resume_text)
        if found:
            matched_req_count += 1
            matched_skills.append({
                "skill": skill,
                "importance": "Must-Have",
                "evidence": evidence,
                "context": context,
                "match_type": "exact" if conf >= 0.85 else "semantic",
                "confidence": conf
            })
            if evidence and evidence not in evidence_snippets:
                evidence_snippets.append(evidence)
        else:
            missing_skills.append({
                "skill": skill,
                "importance": "Must-Have",
                "reason": f"No demonstrable evidence or mention of '{skill}' located in resume experience.",
                "recommendation": f"Add project achievements or responsibilities explicitly highlighting hands-on work with {skill}."
            })

    # Check Preferred (Nice-to-Have) Skills
    matched_pref_count = 0
    for skill in preferred_skills:
        found, evidence, context, conf = find_evidence_for_skill(skill, snippets, resume_text)
        if found:
            matched_pref_count += 1
            matched_skills.append({
                "skill": skill,
                "importance": "Preferred",
                "evidence": evidence,
                "context": context,
                "match_type": "exact" if conf >= 0.85 else "semantic",
                "confidence": conf
            })
            if evidence and evidence not in evidence_snippets:
                evidence_snippets.append(evidence)
        else:
            missing_skills.append({
                "skill": skill,
                "importance": "Preferred",
                "reason": f"Preferred bonus skill '{skill}' was not referenced.",
                "recommendation": f"Mention any foundational familiarity, courses, or side projects utilizing {skill}."
            })

    # Score Calculations
    total_req = max(len(required_skills), 1)
    req_ratio = matched_req_count / total_req
    
    pref_ratio = 1.0
    if preferred_skills:
        pref_ratio = matched_pref_count / len(preferred_skills)

    # Skills Score (75% must-have + 25% preferred)
    if preferred_skills:
        skills_score = round((req_ratio * 75.0) + (pref_ratio * 25.0))
    else:
        skills_score = round(req_ratio * 100.0)

    # Experience Score
    if min_experience_years > 0:
        exp_score = min(round((exp_years_detected / min_experience_years) * 100), 100)
    else:
        exp_score = 90

    # Overall Combined Match Score: 70% Skills Match + 30% Experience Match
    match_score = round((skills_score * 0.70) + (exp_score * 0.30))
    match_score = max(min(match_score, 99), 15)

    # Recommendation and Badges
    if match_score >= 80:
        rec_label = "Strong Match (Highly Recommended)"
        badge = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    elif match_score >= 65:
        rec_label = "Good Match (Recommended for Review)"
        badge = "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
    elif match_score >= 50:
        rec_label = "Partial Match (Needs Additional Verification)"
        badge = "text-amber-400 bg-amber-500/10 border-amber-500/20"
    else:
        rec_label = "Low Match (Not Recommended)"
        badge = "text-rose-400 bg-rose-500/10 border-rose-500/20"

    # Extract Candidate Profile Summary (first coherent sentences)
    summary = " ".join(snippets[:3]) if snippets else resume_text[:250] + "..."

    # Generate Candidate Report
    candidate_report = {
        "title": "ProofHire Candidate Readiness & Gap Analysis Report",
        "match_score": match_score,
        "skills_score": skills_score,
        "experience_score": exp_score,
        "recommendation": rec_label,
        "primary_domain": domain_category,
        "experience_level": exp_label,
        "verified_evidence_count": len(matched_skills),
        "unmet_requirements_count": len(missing_skills),
        "key_strengths": [m["skill"] for m in matched_skills[:5]],
        "gap_priorities": [g["skill"] for g in missing_skills if g["importance"] == "Must-Have"],
        "actionable_recommendations": [g["recommendation"] for g in missing_skills[:4]]
    }

    # Generate Recruiter Dossier Report with tailored interview questions
    interview_questions = []
    for missing in missing_skills[:3]:
        interview_questions.append(
            f"Candidate resume does not specify '{missing['skill']}': Ask candidate about their depth of practical exposure or ability to rapidly onboard into {missing['skill']}."
        )
    for matched in matched_skills[:2]:
        interview_questions.append(
            f"Verify evidence for '{matched['skill']}': Candidate stated '{matched['evidence'][:90]}...'. Ask for specific architectural trade-offs made."
        )

    recruiter_report = {
        "title": "ProofHire Recruiter Screening Dossier",
        "candidate_summary": summary,
        "overall_fit": rec_label,
        "match_percentage": match_score,
        "skills_coverage": f"{matched_req_count}/{total_req} Core Requirements Met",
        "experience_evaluation": f"{exp_years_detected} years detected vs {min_experience_years} years requested",
        "suggested_interview_questions": interview_questions,
        "screening_decision_recommendation": "Advance to Technical Screen" if match_score >= 65 else "Review Alternative Candidates"
    }

    return {
        "match_score": match_score,
        "skills_score": skills_score,
        "experience_score": exp_score,
        "photo_score": None,
        "predicted_category": domain_category,
        "category_confidence": domain_conf,
        "experience_years_detected": exp_years_detected,
        "experience_label": exp_label,
        "recommendation": rec_label,
        "recommendation_badge": badge,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "evidence_snippets": evidence_snippets[:5],
        "summary": summary,
        "candidate_report": candidate_report,
        "recruiter_report": recruiter_report
    }
