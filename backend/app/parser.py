import os
import uuid
import re
import io
from fastapi import UploadFile, HTTPException, status
from pypdf import PdfReader
import docx

from app.config import settings

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}

def clean_extracted_text(text: str) -> str:
    """Normalize extracted text whitespace and line breaks."""
    if not text:
        return ""
    # Normalize unicode spaces & carriage returns
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    # Collapse 3+ newlines to 2
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Collapse multiple spaces to single space
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract clean text across all pages from PDF bytes."""
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        extracted_pages = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                extracted_pages.append(page_text)
        
        full_text = "\n\n".join(extracted_pages)
        return clean_extracted_text(full_text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to parse PDF document: {str(e)}"
        )

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from Word DOCX including paragraphs and tables."""
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        paragraphs = []

        # Read normal paragraphs
        for p in doc.paragraphs:
            if p.text.strip():
                paragraphs.append(p.text.strip())

        # Read tables (resumes often put skills and education in tables)
        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                if row_text:
                    paragraphs.append(row_text)

        full_text = "\n".join(paragraphs)
        return clean_extracted_text(full_text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to parse DOCX document: {str(e)}"
        )

def extract_text_from_txt(file_bytes: bytes) -> str:
    """Extract text from plain text file with encoding fallbacks."""
    for encoding in ['utf-8', 'latin-1', 'cp1252']:
        try:
            return clean_extracted_text(file_bytes.decode(encoding))
        except UnicodeDecodeError:
            continue
    return clean_extracted_text(file_bytes.decode('utf-8', errors='replace'))

async def save_and_parse_resume_file(upload_file: UploadFile) -> tuple[str, str, str]:
    """
    Validate, securely persist, and extract text from an uploaded resume file.
    Returns: (extracted_text, secure_storage_path, original_filename)
    """
    orig_filename = upload_file.filename or "resume.pdf"
    _, ext = os.path.splitext(orig_filename)
    ext = ext.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read bytes and validate size
    content = await upload_file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB"
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty"
        )

    # Secure storage with unique UUID filename to avoid path traversal & collisions
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    storage_path = os.path.join(settings.STORAGE_DIR, unique_filename)

    with open(storage_path, "wb") as f:
        f.write(content)

    # Extract text based on file format
    if ext == ".pdf":
        extracted_text = extract_text_from_pdf(content)
    elif ext == ".docx":
        extracted_text = extract_text_from_docx(content)
    else:
        extracted_text = extract_text_from_txt(content)

    if len(extracted_text.strip()) < 30:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not extract meaningful readable text from this file. If it is a scanned image, please provide a text-based PDF or DOCX."
        )

    return extracted_text, storage_path, orig_filename
