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
    "testing": ["qa", "unit testing", "pytest", "jest", "cypress", "selenium", "integration testing"],
    "financial modeling": ["financial modeling", "financial model", "dcf", "discounted cash flow", "3-statement", "three-statement", "lbo", "valuation modeling"],
    "financial analysis": ["financial analysis", "fp&a", "financial planning and analysis", "variance analysis", "ratio analysis", "budgeting", "forecasting"],
    "accounting": ["accounting", "gaap", "ifrs", "general ledger", "balance sheet", "income statement", "cash flow", "audit", "reconciliation"],
    "excel": ["excel", "advanced excel", "vlookup", "pivot tables", "index match", "macros", "vba"]
}

TRANSFERABLE_ANALYTICAL_SKILLS = {"python", "sql", "data analysis", "pandas", "r", "tableau", "power bi", "statistics", "quantitative analysis"}
DIRECT_FINANCIAL_SKILLS = {"financial modeling", "dcf", "financial analysis", "accounting", "gaap", "ifrs", "valuation", "balance sheet", "variance analysis", "budget forecasting", "cash flow"}

def generate_general_role_profile(role_name: str) -> Dict[str, Any]:
    """
    Generate structured general role profile with clear categories.
    Labeled as general role expectations, not company-specific requirements.
    Allows candidate to review and edit before analysis.
    """
    role_lower = role_name.strip().lower()
    if "financial" in role_lower or "finance" in role_lower or "accounting" in role_lower:
        return {
            "role_title": role_name or "Financial Analyst",
            "role_type": "general_role_expectation",
            "disclaimer": "General role expectations, not company-specific requirements.",
            "categories": [
                {
                    "category_id": "technical_skills",
                    "title": "Technical Skills",
                    "description": "Foundational technical capabilities for data handling and reporting.",
                    "skills": ["Advanced Excel (VLOOKUP, Pivot, Index/Match)", "Financial Systems & ERP", "Data Extraction"]
                },
                {
                    "category_id": "financial_analysis",
                    "title": "Financial Analysis Knowledge",
                    "description": "Core financial methodologies, margin evaluation, and valuation principles.",
                    "skills": ["Variance Analysis", "Ratio & Margin Analysis", "Capital Budgeting", "DCF Valuation"]
                },
                {
                    "category_id": "accounting_statements",
                    "title": "Accounting & Financial Statements",
                    "description": "Working knowledge of balance sheets, income statements, and standards.",
                    "skills": ["Balance Sheet Analysis", "Income Statement Modeling", "Cash Flow Statements", "US GAAP / IFRS"]
                },
                {
                    "category_id": "analytical_tools",
                    "title": "Analytical Tools",
                    "description": "BI, database, and market intelligence tooling (transferable analytical tools).",
                    "skills": ["Power BI / Tableau", "Bloomberg Terminal / FactSet", "SQL / Database Queries"]
                },
                {
                    "category_id": "financial_modelling",
                    "title": "Financial Modelling & Forecasting",
                    "description": "Dynamic financial models and projection simulations.",
                    "skills": ["3-Statement Financial Modeling", "Budget Forecasting", "Scenario & Sensitivity Analysis"]
                },
                {
                    "category_id": "education_experience",
                    "title": "Education & Experience",
                    "description": "Academic credentials and practical tenure expectations.",
                    "skills": ["Degree in Finance, Accounting, Economics or related field", "2+ Years Financial Analysis or Corporate Finance"]
                }
            ]
        }
    else:
        return {
            "role_title": role_name or "General Professional",
            "role_type": "general_role_expectation",
            "disclaimer": "General role expectations, not company-specific requirements.",
            "categories": [
                {
                    "category_id": "technical_skills",
                    "title": "Technical Skills",
                    "description": "Core competencies and tools required for the profession.",
                    "skills": [f"Core {role_name} Fundamentals", "Modern Tools & Frameworks", "System Design / Workflow"]
                },
                {
                    "category_id": "domain_knowledge",
                    "title": "Domain Knowledge",
                    "description": "Subject matter expertise and industry-standard workflows.",
                    "skills": ["Industry Best Practices", "Quality Assurance & Standards", "Optimization & Scaling"]
                },
                {
                    "category_id": "analytical_tools",
                    "title": "Analytical Tools",
                    "description": "Tools for measuring, tracking, and diagnosing performance.",
                    "skills": ["Data Analysis & Reporting", "Diagnostic & Monitoring Tools", "Version Control & Automation"]
                },
                {
                    "category_id": "execution_delivery",
                    "title": "Execution & Delivery",
                    "description": "Project execution and collaborative methodologies.",
                    "skills": ["Agile / Sprint Execution", "Cross-Functional Collaboration", "Problem Solving"]
                },
                {
                    "category_id": "education_experience",
                    "title": "Education & Experience",
                    "description": "Academic background and career history expectations.",
                    "skills": ["Relevant Bachelor's Degree or Equivalent Experience", "2+ Years Industry Experience"]
                }
            ]
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
    Enforces strict evidence classification:
    - Direct match with verified quotes
    - Related / Transferable analytical skills (Python/SQL/Data Analysis are NOT direct financial expertise)
    - Not found in resume (Missing evidence does NOT mean lack of skill)
    - If insufficient text or requirements, returns 'Analysis Incomplete'
    """
    from app.parser import extract_resume_sections

    # Check for insufficient data
    if not resume_text or len(resume_text.strip()) < 30:
        return {
            "status": "Analysis Incomplete",
            "match_score": None,
            "overall_fit_label": "Analysis Incomplete",
            "scoring_formula": "N/A - Insufficient Resume Content",
            "scoring_explanation": "Insufficient resume text was extracted to perform a reliable evidence-based evaluation. Please upload a clear text-based PDF or DOCX file.",
            "direct_matches": [],
            "transferable_skills": [],
            "missing_evidence": [],
            "requirements": [],
            "matched_skills": [],
            "missing_skills": [],
            "evidence_snippets": [],
            "summary": "Analysis Incomplete",
            "resume_sections": {},
            "recommendation": "Analysis Incomplete",
            "recommendation_badge": "text-slate-400 bg-slate-800/50 border-slate-700"
        }

    resume_sections = extract_resume_sections(resume_text)
    snippets = split_into_sentences_and_bullets(resume_text)
    exp_years_detected, exp_label = extract_years_of_experience(resume_text)
    domain_category, domain_conf = classify_role_domain(resume_text)

    # Determine required and preferred skill sets
    if not required_skills:
        parsed = parse_skills_from_text(job_description)
        required_skills = parsed[:8] if parsed else ["Communication", "Problem Solving", "Technical Execution"]
    if preferred_skills is None:
        parsed_all = parse_skills_from_text(job_description)
        preferred_skills = parsed_all[8:14] if len(parsed_all) > 8 else []

    all_requirements = []
    direct_matches = []
    transferable_skills = []
    missing_evidence = []
    evidence_snippets = []

    is_finance_role = bool(re.search(r'\b(financial|finance|accounting|fp&a|valuation|banking)\b', job_description, re.IGNORECASE))

    # Helper to evaluate an individual requirement
    def evaluate_requirement(skill_name: str, classification: str):
        skill_lower = skill_name.lower()
        found, evidence, context, conf = find_evidence_for_skill(skill_name, snippets, resume_text)

        # Rule check: Python, SQL, and data analysis must NOT be labelled direct financial expertise
        is_analytical_tool = any(a in skill_lower for a in ["python", "sql", "data analysis", "pandas", "r", "tableau", "power bi"])
        is_direct_fin = any(f in skill_lower for f in DIRECT_FINANCIAL_SKILLS)

        if found:
            # If candidate matched a finance requirement solely via Python/SQL, it's a transferable skill
            if is_finance_role and is_analytical_tool and not is_direct_fin:
                match_type = "transferable_skill"
                match_type_label = "Related / Transferable Skill"
                explanation = f"'{skill_name}' demonstrates transferable analytical capability, but is classified as a transferable analytical skill, not direct financial domain expertise."
                item = {
                    "name": skill_name,
                    "classification": classification,
                    "match_status": match_type,
                    "match_type_label": match_type_label,
                    "evidence": evidence,
                    "explanation": explanation,
                    "score": 60,
                    "confidence": conf
                }
                transferable_skills.append(item)
                all_requirements.append(item)
                if evidence and evidence not in evidence_snippets:
                    evidence_snippets.append(evidence)
            else:
                match_type = "direct_match"
                match_type_label = "Direct Match"
                explanation = f"Direct verifiable supporting evidence identified in resume experience."
                item = {
                    "name": skill_name,
                    "classification": classification,
                    "match_status": match_type,
                    "match_type_label": match_type_label,
                    "evidence": evidence,
                    "explanation": explanation,
                    "score": 100,
                    "confidence": conf
                }
                direct_matches.append(item)
                all_requirements.append(item)
                if evidence and evidence not in evidence_snippets:
                    evidence_snippets.append(evidence)
        else:
            # Check if candidate has general analytical skills that could count as transferable
            has_transferable = False
            transferable_ev = ""
            if is_finance_role and is_direct_fin:
                for t_skill in ["python", "sql", "data analysis", "excel"]:
                    t_found, t_ev, _, _ = find_evidence_for_skill(t_skill, snippets, resume_text)
                    if t_found:
                        has_transferable = True
                        transferable_ev = t_ev
                        break

            if has_transferable:
                match_type = "transferable_skill"
                match_type_label = "Related / Transferable Skill"
                explanation = f"Direct financial evidence for '{skill_name}' was not found. However, candidate possesses transferable quantitative tools ({transferable_ev[:60]}...). Classified as transferable, not direct financial expertise."
                item = {
                    "name": skill_name,
                    "classification": classification,
                    "match_status": match_type,
                    "match_type_label": match_type_label,
                    "evidence": transferable_ev,
                    "explanation": explanation,
                    "score": 50,
                    "confidence": 0.65
                }
                transferable_skills.append(item)
                all_requirements.append(item)
            else:
                match_type = "not_found"
                match_type_label = "Not Found in Resume"
                explanation = f"No supporting evidence found in resume. Note: Missing evidence in the resume does not mean the candidate lacks this skill, but demonstrable proof was not identified in the submitted document."
                item = {
                    "name": skill_name,
                    "classification": classification,
                    "match_status": match_type,
                    "match_type_label": match_type_label,
                    "evidence": "",
                    "explanation": explanation,
                    "score": 0,
                    "confidence": 0.0
                }
                missing_evidence.append(item)
                all_requirements.append(item)

    for req in required_skills:
        evaluate_requirement(req, "Mandatory")

    for pref in preferred_skills:
        evaluate_requirement(pref, "Preferred")

    total_requirements = len(all_requirements)
    if total_requirements == 0:
        return {
            "status": "Analysis Incomplete",
            "match_score": None,
            "overall_fit_label": "Analysis Incomplete",
            "scoring_formula": "N/A - Zero Requirements Evaluated",
            "scoring_explanation": "No valid job requirements were specified to evaluate.",
            "direct_matches": [],
            "transferable_skills": [],
            "missing_evidence": [],
            "requirements": [],
            "matched_skills": [],
            "missing_skills": [],
            "evidence_snippets": [],
            "summary": "Analysis Incomplete",
            "resume_sections": resume_sections,
            "recommendation": "Analysis Incomplete",
            "recommendation_badge": "text-slate-400 bg-slate-800/50 border-slate-700"
        }

    # Verified score calculations
    # Direct match = 100%, Transferable = 60%, Missing = 0%
    req_points = sum(r["score"] for r in all_requirements)
    skills_score = round(req_points / total_requirements)

    if min_experience_years > 0:
        exp_score = min(round((exp_years_detected / min_experience_years) * 100), 100)
    else:
        exp_score = 90

    # Overall Combined Match Score: 70% Skills Match + 30% Experience Match
    match_score = round((skills_score * 0.70) + (exp_score * 0.30))
    match_score = max(min(match_score, 99), 10)

    scoring_formula = "Overall Score = (Sum of Verified Requirement Points / Total Criteria) * 70% + (Experience Fit) * 30%"
    scoring_explanation = (
        f"Evaluated against {total_requirements} verified requirements: "
        f"{len(direct_matches)} direct match(es) (100% weight), "
        f"{len(transferable_skills)} transferable analytical skill(s) (60% weight), and "
        f"{len(missing_evidence)} unverified requirement(s) (0% weight). "
        f"Skills score: {skills_score}%. Experience tenure: {exp_label} ({exp_score}% score)."
    )

    # Recommendation labels
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
    summary = resume_sections.get("summary") or (" ".join(snippets[:3]) if snippets else resume_text[:250] + "...")

    # Backward compatible matched_skills & missing_skills
    matched_skills = [
        {
            "skill": m["name"],
            "importance": "Must-Have" if m["classification"] == "Mandatory" else "Preferred",
            "classification": m["classification"],
            "evidence": m["evidence"],
            "context": m["evidence"],
            "match_type": m["match_status"],
            "confidence": m["confidence"],
            "explanation": m["explanation"]
        }
        for m in (direct_matches + transferable_skills)
    ]
    missing_skills = [
        {
            "skill": m["name"],
            "importance": "Must-Have" if m["classification"] == "Mandatory" else "Preferred",
            "classification": m["classification"],
            "reason": m["explanation"],
            "recommendation": f"Highlight any practical experience or coursework regarding {m['name']}."
        }
        for m in missing_evidence
    ]


    candidate_report = {
        "title": "ProofHire Candidate Readiness & Gap Analysis Report",
        "match_score": match_score,
        "skills_score": skills_score,
        "experience_score": exp_score,
        "scoring_formula": scoring_formula,
        "scoring_explanation": scoring_explanation,
        "recommendation": rec_label,
        "primary_domain": domain_category,
        "experience_level": exp_label,
        "direct_matches_count": len(direct_matches),
        "transferable_skills_count": len(transferable_skills),
        "missing_evidence_count": len(missing_evidence),
        "key_strengths": [m["name"] for m in direct_matches[:5]],
        "transferable_skills": [t["name"] for t in transferable_skills],
        "gap_priorities": [g["name"] for g in missing_evidence if g["classification"] == "Mandatory"],
        "actionable_recommendations": [
            f"Add explicit evidence for '{g['name']}': Missing evidence does not mean you lack the skill, but adding concrete metrics or examples will verify your proficiency."
            for g in missing_evidence[:4]
        ]
    }

    interview_questions = []
    for missing in missing_evidence[:3]:
        interview_questions.append(
            f"Regarding '{missing['name']}': No direct resume evidence was located. Ask candidate to describe practical exposure or related transferability."
        )
    for trans in transferable_skills[:2]:
        interview_questions.append(
            f"Regarding transferable skill '{trans['name']}': Candidate has analytical tools ({trans['evidence'][:60]}...). Ask how they apply this to financial modeling/domain problems."
        )
    for matched in direct_matches[:2]:
        interview_questions.append(
            f"Regarding verified match '{matched['name']}': Candidate cited '{matched['evidence'][:90]}...'. Ask for details on key decisions or business impact."
        )

    recruiter_report = {
        "title": "ProofHire Recruiter Screening Dossier",
        "candidate_summary": summary,
        "overall_fit": rec_label,
        "match_percentage": match_score,
        "scoring_formula": scoring_formula,
        "scoring_explanation": scoring_explanation,
        "direct_matches": len(direct_matches),
        "transferable_skills": len(transferable_skills),
        "missing_evidence": len(missing_evidence),
        "suggested_interview_questions": interview_questions,
        "screening_decision_recommendation": "Advance to Technical Screen" if match_score >= 65 else "Review Alternative Candidates"
    }

    return {
        "status": "Complete",
        "match_score": match_score,
        "skills_score": skills_score,
        "experience_score": exp_score,
        "photo_score": None,
        "scoring_formula": scoring_formula,
        "scoring_explanation": scoring_explanation,
        "predicted_category": domain_category,
        "category_confidence": domain_conf,
        "experience_years_detected": exp_years_detected,
        "experience_label": exp_label,
        "recommendation": rec_label,
        "recommendation_badge": badge,
        "direct_matches": direct_matches,
        "transferable_skills": transferable_skills,
        "missing_evidence": missing_evidence,
        "requirements": all_requirements,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "evidence_snippets": evidence_snippets[:5],
        "summary": summary,
        "resume_sections": resume_sections,
        "candidate_report": candidate_report,
        "recruiter_report": recruiter_report
    }

