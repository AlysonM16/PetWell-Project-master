from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Pet, User
from ..schemas import PetOut
from .auth import get_current_user
import os
import uuid

router = APIRouter(prefix="/pets", tags=["pets"])

UPLOAD_DIR = "uploads/pets"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# CREATE PET
@router.post("", response_model=PetOut)
async def create_pet(
    name: str = Form(...),
    dob: Optional[str] = Form(None),
    breed: Optional[str] = Form(None),
    sex: Optional[str] = Form(None),
    weight: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = Pet(
        name=name,
        dob=dob,
        breed=breed,
        sex=sex,
        weight=weight,
        owner_id=current_user.id,
    )

    if image:
        ext = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        with open(file_path, "wb+") as f:
            f.write(await image.read())
        pet.img = file_path

    db.add(pet)
    db.commit()
    db.refresh(pet)
    return PetOut.from_orm(pet)

# LIST PETS
@router.get("", response_model=List[PetOut])
def list_pets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pets = db.query(Pet).filter(Pet.owner_id == current_user.id).all()
    return [PetOut.from_orm(p) for p in pets]

# GET PET
@router.get("/{pet_id}", response_model=PetOut)
def get_pet(pet_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.owner_id == current_user.id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return PetOut.from_orm(pet)

# UPDATE PET
@router.put("/{pet_id}", response_model=PetOut)
async def update_pet(
    pet_id: int,
    name: Optional[str] = Form(None),
    dob: Optional[str] = Form(None),
    breed: Optional[str] = Form(None),
    sex: Optional[str] = Form(None),
    weight: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.owner_id == current_user.id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    # Update fields if provided
    for field, value in {
        "name": name,
        "dob": dob,
        "breed": breed,
        "sex": sex,
        "weight": weight,
    }.items():
        if value is not None:
            setattr(pet, field, value)

    if image:
        ext = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        with open(file_path, "wb+") as f:
            f.write(await image.read())
        pet.img = file_path

    db.commit()
    db.refresh(pet)
    return PetOut.from_orm(pet)

# DELETE PET
@router.delete("/{pet_id}")
def delete_pet(pet_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.owner_id == current_user.id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    db.delete(pet)
    db.commit()
    return {"ok": True}
