from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Pet
from ..schemas import PetCreate, PetUpdate, PetOut
from .auth import get_current_user
from ..models import User

router = APIRouter(prefix="/pets", tags=["pets"])

# Create pet
@router.post("/", response_model=PetOut)
def create_pet(payload: PetCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pet = Pet(**payload.dict(), owner_id=current_user.id)
    db.add(pet)
    db.commit()
    db.refresh(pet)
    return pet

# List pets
@router.get("/", response_model=List[PetOut])
def list_pets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pets = db.query(Pet).filter(Pet.owner_id == current_user.id).all()
    return pets

# Get single pet
@router.get("/{pet_id}", response_model=PetOut)
def get_pet(pet_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.owner_id == current_user.id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet

# Update pet
@router.put("/{pet_id}", response_model=PetOut)
def update_pet(pet_id: int, payload: PetUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.owner_id == current_user.id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    for key, value in payload.dict(exclude_unset=True).items():
        setattr(pet, key, value)
    db.commit()
    db.refresh(pet)
    return pet

# Delete pet
@router.delete("/{pet_id}")
def delete_pet(pet_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.owner_id == current_user.id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    db.delete(pet)
    db.commit()
    return {"ok": True}
