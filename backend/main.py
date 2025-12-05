from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Form, Query, APIRouter
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os, tempfile, json
from dotenv import load_dotenv
from typing import List

from .routers import pets
from .llm_parser import extract_data_from_pdf
from .database import Base, engine, get_db
from . import models, schemas
from .routers.auth import router as auth_router
from .security import get_current_user

load_dotenv()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pet Management API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(pets.router)

# Root
@app.get("/")
async def read_root():
    return {"message": "Hello from FastAPI"}

# PDF processing
@app.post("/process-pdf")
async def process_pdf(file: UploadFile = File(...), petId: int = Form(...), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    original_filename = os.path.splitext(file.filename)[0]
    contents = await file.read()
    max_size = 10 * 1024 * 1024
    if len(contents) > max_size:
        raise HTTPException(status_code=400, detail="File too large (>10MB)")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(contents)
        temp_pdf_path = tmp.name

    try:
        extracted_data = extract_data_from_pdf(temp_pdf_path, petId, original_filename)
        return JSONResponse(status_code=200, content=extracted_data)
    except Exception as e:
        print(f"Error processing PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)

# Get labs for a pet
@app.get("/api/labs")
def get_labs(petId: int = Query(...), db: Session = Depends(get_db)):
    labs = db.query(models.Lab).filter(models.Lab.pet_id == petId).all()
    if not labs:
        raise HTTPException(status_code=404, detail="No labs found")

    result = {"petId": petId, "visits": []}
    for lab in labs:
        visit = {
            "visit_date": lab.visit_date.isoformat() if lab.visit_date else "unknown",
            "records": [{"test_name": t.test_name, "value": t.value, "unit": t.unit, "reference_range": t.reference_range} for t in lab.tests],
            "notes": getattr(lab, "notes", "")
        }
        result["visits"].append(visit)
    result["visits"].sort(key=lambda x: x["visit_date"] or "")
    return result
