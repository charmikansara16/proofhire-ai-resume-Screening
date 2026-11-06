import io
import pytest
from app.parser import extract_text_from_pdf, extract_text_from_docx, extract_text_from_txt
from reportlab.pdfgen import canvas
import docx

def test_pdf_extraction():
    # Create valid in-memory PDF
    pdf_buffer = io.BytesIO()
    c = canvas.Canvas(pdf_buffer)
    c.drawString(100, 750, "Jane Doe - Senior Python & Machine Learning Engineer")
    c.drawString(100, 720, "5 years of experience deploying PyTorch models on Kubernetes.")
    c.showPage()
    c.save()
    pdf_bytes = pdf_buffer.getvalue()

    extracted = extract_text_from_pdf(pdf_bytes)
    assert "Jane Doe" in extracted
    assert "Senior Python" in extracted
    assert "PyTorch" in extracted

def test_docx_extraction():
    # Create valid in-memory DOCX
    doc = docx.Document()
    doc.add_paragraph("John Smith - Lead Java Developer")
    doc.add_paragraph("Expertise in Spring Boot, Microservices, and Kafka.")
    table = doc.add_table(rows=1, cols=2)
    table.rows[0].cells[0].text = "Education"
    table.rows[0].cells[1].text = "B.S. Computer Science"
    docx_buffer = io.BytesIO()
    doc.save(docx_buffer)
    docx_bytes = docx_buffer.getvalue()

    extracted = extract_text_from_docx(docx_bytes)
    assert "John Smith" in extracted
    assert "Spring Boot" in extracted
    assert "B.S. Computer Science" in extracted

def test_txt_extraction():
    sample_text = "DevOps Engineer\nProficient in Terraform, Docker, AWS, and CI/CD."
    extracted = extract_text_from_txt(sample_text.encode('utf-8'))
    assert "DevOps Engineer" in extracted
    assert "Terraform" in extracted
