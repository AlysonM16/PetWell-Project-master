from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os, tempfile, json
from dotenv import load_dotenv

from .llm_parser import extract_data_from_pdf
from .database import Base, engine
from . import models
from .routers.auth import router as auth_router
from .security import get_current_user
from .schemas import UserOut
from .models import User

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

@app.get("/")
async def read_root():
    return {"message": "Hello from FastAPI"}

#@app.get("/me")
#def me(user: User = Depends(get_current_user)):
 #   return {"id": user.id, "email": user.email}

@app.post("/process-pdf")
async def process_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    contents = await file.read()
    max_size = 10 * 1024 * 1024
    if len(contents) > max_size:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        temp_file.write(contents)
        temp_file_path = temp_file.name

    try:
        extracted_data = extract_data_from_pdf(temp_file_path)
        return JSONResponse(status_code=200, content=extracted_data)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to decode JSON from the LLM response.")
    except Exception as e:
        print(f"Error processing PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
