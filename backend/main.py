from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, APIRouter, Form, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os, tempfile, json
from dotenv import load_dotenv
from typing import List

from .routers import pets

from .llm_parser import extract_data_from_pdf, insert_extracted_labs_to_db
from .database import Base, engine, get_db
from . import models, schemas
from .routers.auth import router as auth_router
from .routers.pets import router as pets_router
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

# Include auth router (login/register/etc)
app.include_router(auth_router)
app.include_router(pets_router)
# Root
@app.get("/")
async def read_root():
    return {"message": "Hello from FastAPI"}

# PDF processing
@app.post("/process-pdf")
async def process_pdf(file: UploadFile = File(...), petId : int = Form(...), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    original_filename = file.filename
    original_filename = os.path.splitext(original_filename)[0]

    contents = await file.read()
    max_size = 10 * 1024 * 1024
    if len(contents) > max_size:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        temp_file.write(contents)
        temp_file_path = temp_file.name

    try:
        extracted_data = extract_data_from_pdf(temp_file_path, petId, original_filename)

        if isinstance(extracted_data, str):
            try:
                json_data = json.loads(extracted_data)
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=500,
                    detail="extract_data_from_pdf returned non-JSON string",
                )
        else:
            json_data = extracted_data

        # Write JSON data
        try:
            with open(temp_file_path, "w") as f:
                json.dump(json_data, f, indent=4)
        except Exception as e:
            print("Error writing lab_data.txt:", e)
            raise HTTPException(
                status_code=500, detail="Failed to write lab_data.txt on server"
            )

        # Read back data
        try:
            with open(temp_file_path, "r") as f:
                file_data = json.load(f)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500,
                detail="Invalid JSON in new file after writing",
            )
        except FileNotFoundError:
            raise HTTPException(
                status_code=500,
                detail="New file not found after writing",
            )

        # Return the JSON
        return JSONResponse(status_code=200, content=file_data)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to decode JSON from LLM response.")
    except Exception as e:
        print(f"Error processing PDF: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        )
    finally:
        # Always clean up temp file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            
# ------------------ Pets Router ------------------
pets_router = APIRouter(prefix="/pets", tags=["pets"])

@pets_router.post("/", response_model=schemas.PetOut)
def add_pet(
    pet: schemas.PetCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return pets.create_pet(db, owner_id=current_user.id, pet=pet)

@pets_router.get("/", response_model=List[schemas.PetOut])
def list_pets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return pets.get_pets(db, owner_id=current_user.id)

@pets_router.get("/{pet_id}", response_model=schemas.PetOut)
def get_pet(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    pet = pets.get_pet(db, pet_id)
    if not pet or pet.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet

@pets_router.put("/{pet_id}", response_model=schemas.PetOut)
def update_pet(
    pet_id: int,
    pet_data: schemas.PetUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    pet = pets.update_pet(db, pet_id, pet_data)
    if not pet or pet.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Pet not found or not authorized")
    return pet

@app.get("/api/labs")
def get_labs(petId: int = Query(...), db: Session = Depends(get_db)):
    # Fetch labs for this pet
    labs = db.query(models.Lab).filter(models.Lab.pet_id == petId).all()
    if not labs:
        raise HTTPException(status_code=404, detail="No labs found for this pet")

    result = {"petId": petId, "visits": []}

    for lab in labs:
        visit = {
            "visit_date": lab.visit_date.isoformat() if lab.visit_date else "unknown",
            "records": [],
            "notes": getattr(lab, "notes", "")
        }
        for test in lab.tests:
            visit["records"].append({
                "test_name": test.test_name,
                "value": test.value,
                "unit": test.unit,
                "reference_range": test.reference_range
            })
        result["visits"].append(visit)

    result["visits"].sort(key=lambda x: x["visit_date"] or "")
    return result

