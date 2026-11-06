import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_candidate_pdf_report(app_data: dict) -> bytes:
    """Generate professional PDF report for a candidate analysis."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=colors.HexColor('#4f46e5'),
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#64748b'),
        spaceAfter=14
    )
    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=13,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontSize=9.5,
        textColor=colors.HexColor('#334155'),
        leading=14
    )
    quote_style = ParagraphStyle(
        'DocQuote',
        parent=styles['Normal'],
        fontSize=8.5,
        textColor=colors.HexColor('#1e293b'),
        fontName='Helvetica-Oblique',
        leftIndent=10,
        leading=12
    )

    story = []

    # Header
    story.append(Paragraph("PROOFHIRE — RESUME INTELLIGENCE REPORT", title_style))
    story.append(Paragraph(f"Candidate: <b>{app_data.get('candidate_name', 'Candidate')}</b> | Evaluated for: <b>{app_data.get('job_title', 'Target Role')}</b>", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceAfter=14))

    # Metrics Summary Table
    match_score = app_data.get('match_score', 0)
    skills_score = app_data.get('skills_score', 0)
    exp_score = app_data.get('experience_score', 0)
    rec = app_data.get('recommendation', 'Screening in progress')

    score_data = [
        ["Overall Match Score", "Skills Alignment", "Experience Match", "Screening Recommendation"],
        [f"{match_score}%", f"{skills_score}%", f"{exp_score}%", rec]
    ]
    score_table = Table(score_data, colWidths=[130, 130, 130, 150])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 1), (0, 1), colors.HexColor('#4f46e5')),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 14))

    # Evidence-Based Skill Verification
    story.append(Paragraph("1. Evidence-Based Skill Verification", section_style))
    story.append(Paragraph("The following skills were explicitly verified with textual evidence from your resume:", body_style))
    story.append(Spacer(1, 6))

    matched = app_data.get('matched_skills', [])
    if matched:
        for m in matched[:8]:
            skill_name = m.get('skill', '')
            evidence = m.get('evidence', '')
            story.append(Paragraph(f"• <b>{skill_name}</b> ({m.get('match_type', 'verified').title()} Match)", body_style))
            if evidence:
                story.append(Paragraph(f'"{evidence}"', quote_style))
            story.append(Spacer(1, 4))
    else:
        story.append(Paragraph("No direct skill matches identified against specified criteria.", body_style))

    story.append(Spacer(1, 10))

    # Missing Requirements & Actionable Recommendations
    story.append(Paragraph("2. Missing Requirements & Gap Action Plan", section_style))
    missing = app_data.get('missing_skills', [])
    if missing:
        for item in missing[:6]:
            skill_name = item.get('skill', '')
            imp = item.get('importance', 'Required')
            rec_text = item.get('recommendation', '')
            story.append(Paragraph(f"• <b>{skill_name}</b> [{imp}]: {item.get('reason', '')}", body_style))
            if rec_text:
                story.append(Paragraph(f"<b>Recommended Action:</b> {rec_text}", quote_style))
            story.append(Spacer(1, 4))
    else:
        story.append(Paragraph("Outstanding! All required skills were verified in your profile.", body_style))

    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#e2e8f0'), spaceAfter=8))
    story.append(Paragraph("Generated securely by ProofHire AI Resume Intelligence Platform", subtitle_style))

    doc.build(story)
    return buffer.getvalue()

def generate_recruiter_summary_pdf(job_title: str, org_name: str, candidates: list) -> bytes:
    """Generate comparative summary report for recruiters."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#4f46e5'),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#64748b'),
        spaceAfter=14
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#334155'),
        leading=13
    )

    story = []
    story.append(Paragraph("PROOFHIRE — RECRUITER CANDIDATE DOSSIER", title_style))
    story.append(Paragraph(f"Organization: <b>{org_name}</b> | Job Opening: <b>{job_title}</b>", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceAfter=14))

    # Leaderboard Table
    table_data = [["Rank", "Candidate Name", "Match Score", "Category", "Decision", "Verified Skills"]]
    for idx, c in enumerate(candidates):
        matched_str = ", ".join([m.get('skill', '') for m in c.get('matched_skills', [])[:3]])
        table_data.append([
            f"#{idx+1}",
            c.get('candidate_name', 'Unknown'),
            f"{c.get('match_score', 0)}%",
            c.get('predicted_category', 'N/A'),
            c.get('recruiter_decision', 'pending').upper(),
            matched_str or "None"
        ])

    cand_table = Table(table_data, colWidths=[40, 130, 70, 100, 80, 120])
    cand_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('ALIGN', (2, 0), (2, -1), 'CENTER'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
    ]))
    story.append(cand_table)
    story.append(Spacer(1, 20))

    story.append(Paragraph("<b>Audited Interview Inquiries:</b>", body_style))
    for c in candidates[:3]:
        r_rep = c.get('recruiter_report', {})
        questions = r_rep.get('suggested_interview_questions', [])
        if questions:
            story.append(Paragraph(f"<b>For {c.get('candidate_name')}:</b>", body_style))
            for q in questions[:2]:
                story.append(Paragraph(f"• {q}", body_style))
            story.append(Spacer(1, 6))

    doc.build(story)
    return buffer.getvalue()
