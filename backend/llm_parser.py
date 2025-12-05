import os
import time
import io
import json
import pytesseract
import json_repair
import google.generativeai as genai
from datetime import datetime, timezone
from dotenv import load_dotenv
from PIL import Image
import fitz  # PyMuPDF
import pymupdf4llm
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models import Lab, LabTest
import hashlib

# --- Ensure pytesseract points to Tesseract executable ---
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Load environment variables
load_dotenv(dotenv_path="backend/.env")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or "dummy_key_for_local_testing"
genai.configure(api_key=GOOGLE_API_KEY)


def extract_data_from_pdf(file_path: str, petId: int, original_filename: str) -> dict:
    """
    Extract lab data from PDF, save JSON in permanent folder, and insert labs into DB.
    Returns parsed JSON.
    """
    # Convert PDF to markdown text
    md_text = pymupdf4llm.to_markdown(file_path)

    if any(not c.isspace() for c in md_text):
        markdown_text = md_text
    else:
        # OCR fallback
        pages_text = []
        with fitz.open(file_path) as doc:
            for i, page in enumerate(doc):
                pix = page.get_pixmap(dpi=300)
                img_bytes = pix.tobytes("png")
                with Image.open(io.BytesIO(img_bytes)).convert("L") as img:
                    text = pytesseract.image_to_string(img, config="--psm 3")
                    pages_text.append(f"# Page {i+1}\n\n{text.strip()}\n\n---\n\n")
        markdown_text = "".join(pages_text)

    # Save markdown temporarily
    tmp_path = "markdown.md"
    with open(tmp_path, "w", encoding="utf-8") as f:
        f.write(markdown_text)
        f.flush()
        os.fsync(f.fileno())

    # --- Prompt Gemini ---
    prompt = f"""
You are an expert medical data extraction assistant. 
Analyze the attached PDF lab report accurately.

Extract all medical tests, values, units, and reference ranges.
Group them by visit date.

Also include a 'notes' field with important warnings (max 150 chars).

Output must be ONLY a single valid JSON object.

Schema:
{{
  "petId": {petId},
  "visits": [
    {{
      "visit_date": "YYYY-MM-DD",
      "records": [
        {{
          "test_name": "string",
          "value": "float or string",
          "unit": "string",
          "reference_range": "string"
        }}
      ],
      "notes": "Note 1, Note 2, ..."
    }}
  ]
}}

If the visit date is not found, use "unknown".
"""

    start_time = time.time()
    try:
        # Upload markdown file to Gemini
        uploaded_file = genai.upload_file(tmp_path, mime_type="text/markdown")
        model = genai.GenerativeModel("models/gemini-2.5-flash-lite")
        response = model.generate_content([prompt, uploaded_file])

        # Cleanup Gemini uploaded file
        file_id = getattr(uploaded_file, "name", None) or getattr(uploaded_file, "uri", None)
        if file_id:
            try:
                genai.delete_file(file_id)
            except:
                pass

        text = response.text.strip()
        if text.startswith("```"):
            text = text.strip("`").replace("json", "", 1).strip()

        try:
            extracted_json = json.loads(text)
        except json.JSONDecodeError:
            repaired = json_repair.repair_json(text)
            extracted_json = json.loads(repaired)

    finally:
        elapsed = time.time() - start_time
        print(f"PDF extraction for {file_path} took {elapsed:.2f}s")

        # Save JSON to permanent folder
        base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Files", "Converted_JSONs")
        pet_folder = os.path.join(base_dir, str(petId))
        os.makedirs(pet_folder, exist_ok=True)

        json_filename = original_filename + ".json"
        json_path = os.path.join(pet_folder, json_filename)
        with open(json_path, "w", encoding="utf-8") as jf:
            json.dump(extracted_json, jf, indent=2)

        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception as e:
                print(f"Failed to delete temp markdown: {e}")

        db = SessionLocal()
        insert_extracted_labs_to_db(db, json_path, petId)

    return extracted_json


def insert_extracted_labs_to_db(db: Session, json_path: str, petId: int):
    with open(json_path, "r", encoding="utf-8") as f:
        extracted_json = json.load(f)

    visits = extracted_json.get("visits", [])
    for visit in visits:
        if not visit:
            continue
        visit_date_str = visit.get("visit_date")
        visit_date = None if visit_date_str in ("unknown", None) else datetime.strptime(visit_date_str, "%Y-%m-%d").date()

        lab_json_str = str(sorted(visit.get("records", []), key=lambda x: x.get("test_name")))
        lab_hash = hashlib.md5(lab_json_str.encode()).hexdigest()

        existing_lab = db.query(Lab).filter(
            Lab.pet_id == petId,
            Lab.visit_date == visit_date,
            Lab.pdf_path == json_path
        ).first()
        if existing_lab:
            print(f"Duplicate lab for pet {petId} on {visit_date}, skipping")
            continue

        lab = Lab(
            pet_id=petId,
            visit_date=visit_date,
            created_at=datetime.now(timezone.utc),
            lab_hash=lab_hash,
            pdf_path=json_path
        )
        db.add(lab)
        db.flush()

        for record in visit.get("records", []):
            if not record:
                continue
            test = LabTest(
                lab_id=lab.id,
                test_name=record.get("test_name"),
                value=record.get("value"),
                unit=record.get("unit"),
                reference_range=record.get("reference_range")
            )
            db.add(test)

    db.commit()
    return extracted_json
