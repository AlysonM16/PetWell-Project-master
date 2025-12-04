import os
import time
import json
import io
import pytesseract
import json_repair
import google.generativeai as genai
from dotenv import load_dotenv
from PIL import Image
import fitz  # PyMuPDF
import pymupdf4llm

# --- Ensure pytesseract points to Tesseract executable ---
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Load environment variables
load_dotenv(dotenv_path="backend/.env")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or "dummy_key_for_local_testing"
genai.configure(api_key=GOOGLE_API_KEY)


def extract_data_from_pdf(file_path: str,  petId: int, original_filename: str) -> dict:
    """
    Extract lab data from PDF and submit to Gemini API.
    Returns a parsed JSON dict.
    """

    # --- Convert PDF to markdown text ---
    md_text = pymupdf4llm.to_markdown(file_path)
    petId = petId

    if md_text.strip():
        markdown_text = md_text
    else:
        # Fallback: OCR all pages
        print("No text detected, running OCR")
        pages_text = []

        with fitz.open(file_path) as doc:
            for i, page in enumerate(doc):
                pix = page.get_pixmap(dpi=300)
                img_bytes = pix.tobytes("png")

                with Image.open(io.BytesIO(img_bytes)).convert("L") as img:
                    text = pytesseract.image_to_string(img, config="--psm 3")
                    pages_text.append(f"# Page {i + 1}\n\n{text.strip()}\n\n---\n\n")

        markdown_text = "".join(pages_text)

    # --- Save markdown to temporary file ---
    tmp_path = "markdown.md"
    with open(tmp_path, "w", encoding="utf-8") as f:
        f.write(markdown_text)
        f.flush()
        os.fsync(f.fileno())

    # --- Prompt for Gemini ---
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
    uploaded_file = None

    try:
        # Upload markdown file to Gemini with MIME type
        uploaded_file = genai.upload_file(tmp_path, mime_type="text/markdown")

        # Use Gemini model
        model = genai.GenerativeModel("models/gemini-2.5-flash-lite")
        response = model.generate_content([prompt, uploaded_file])

        # Safely delete uploaded file on Gemini
        file_id = getattr(uploaded_file, "name", None) or getattr(uploaded_file, "uri", None)
        if file_id:
            try:
                genai.delete_file(file_id)
            except:
                pass

        # Extract text
        text = response.text.strip()

        # Remove code fences safely
        if text.startswith("```"):
            text = text.strip("`").strip()
            text = text.replace("json", "", 1).strip()

        # Attempt JSON parse
        try:
            extracted_json = json.loads(text)
        except json.JSONDecodeError:
            repaired = json_repair.repair_json(text)
            extracted_json = json.loads(repaired)
        
        
        

    except Exception as e:
        raise Exception(f"PDF processing failed: {str(e)}")

    finally:#Put in here, refresh
        elapsed = time.time() - start_time
        print(f"PDF extraction for {file_path} took {elapsed:.2f} seconds")
        base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Files", "Converted_JSONs")
        pet_folder = os.path.join(base_dir, str(petId))
        os.makedirs(pet_folder, exist_ok=True)

        # --- Save JSON to file ---
        json_filename = original_filename + ".json"
        json_path = os.path.join(pet_folder, json_filename)
        with open(json_path, "w", encoding="utf-8") as jf:
            json.dump(extracted_json, jf, indent=2)


        # --- Safely delete temp markdown file ---
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception as e:
                print(f"Could not delete temp file {tmp_path}: {e}")
