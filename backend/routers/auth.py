from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Pet
from ..schemas import UserCreate, UserOut, TokenPair, UserWithPets, PetOut, BaseModel, UserUpdate
from ..security import hash_password, verify_password, make_token, parse_token, get_current_user
from ..config import settings
from pydantic import BaseModel
import os

router = APIRouter(prefix="/auth", tags=["auth"])

def _issue_tokens(user: User) -> TokenPair:
    access = make_token(
        sub=str(user.id),
        ttl_seconds=settings.ACCESS_TTL_MIN * 60,
        extra={"scope": "access", "ver": user.token_version},
    )
    refresh = make_token(
        sub=str(user.id),
        ttl_seconds=settings.REFRESH_TTL_DAYS * 24 * 3600,
        extra={"scope": "refresh", "ver": user.token_version},
    )
    return TokenPair(access_token=access, refresh_token=refresh)

# Register
@router.post("/register", response_model=UserOut, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    email = payload.email.lower()
    if db.query(User).filter_by(email=email).first():
        raise HTTPException(400, "Email already registered")

    user = User(
        name=payload.name,
        email=email,
        hashed_password=hash_password(payload.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# Login
@router.post("/login", response_model=TokenPair)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    email = form.username.lower()
    user = db.query(User).filter_by(email=email).first()
    if not user or not verify_password(form.password, user.hashed_password) or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return _issue_tokens(user)

# Refresh
class RefreshIn(BaseModel):
    refresh_token: str

@router.post("/refresh", response_model=TokenPair)
def refresh(payload: RefreshIn, db: Session = Depends(get_db)):
    data = parse_token(payload.refresh_token)
    if not data or data.get("scope") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = int(data.get("sub"))
    user = db.query(User).get(user_id)
    if not user or data.get("ver") != user.token_version:
        raise HTTPException(status_code=401, detail="Token no longer valid")

    return _issue_tokens(user)

# Logout
@router.post("/logout")
def logout(payload: RefreshIn, db: Session = Depends(get_db)):
    data = parse_token(payload.refresh_token)
    if data:
        user = db.get(User, int(data["sub"]))
        if user:
            user.token_version += 1
            db.commit()
    return {"ok": True}

@router.get("/me", response_model=UserWithPets)
def read_current_user(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pets_list = [PetOut.from_orm(p) for p in current_user.pets]
    return UserWithPets(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        phone=current_user.phone,
        pets=pets_list
    )
@router.put("/me", response_model=UserOut)
def update_current_user(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated = False

    if payload.name:
        current_user.name = payload.name
        updated = True

    if payload.email and payload.email != current_user.email:
        email_lower = payload.email.lower()
        if db.query(User).filter(User.email == email_lower, User.id != current_user.id).first():
            raise HTTPException(400, "Email already in use")
        current_user.email = email_lower
        current_user.token_version += 1
        updated = True

    if payload.password:
        current_user.hashed_password = hash_password(payload.password)
        current_user.token_version += 1
        updated = True

    if payload.phone is not None: 
        current_user.phone = payload.phone
        updated = True

    if updated:
        db.commit()
        db.refresh(current_user)

    return current_user

@router.get("/files/user")
def get_user_files(current_user: User = Depends(get_current_user)):
    """
    Returns all JSON files for all pets associated with the current user.
    Each file includes petId, title, and size in MB.
    """
    # Get all pet IDs for the user
    pet_ids = [pet.id for pet in current_user.pets]
    if not pet_ids:
        return []

    # Set base directory for uploaded JSONs
    # Adjust path relative to project root
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    base_dir = os.path.join(project_root, "Files", "Converted_JSONs")

    print("Base dir exists:", os.path.exists(base_dir), " -> ", base_dir)


    all_files = []

    for pet_id in pet_ids:
        pet_folder = os.path.join(base_dir, str(pet_id))
        if not os.path.exists(pet_folder):
            continue

        for filename in os.listdir(pet_folder):
            if filename.lower().endswith(".json"):
                filepath = os.path.join(pet_folder, filename)
                stat = os.stat(filepath)
                all_files.append({
                    "petId": pet_id,
                    "title": filename,
                    "path": filepath,
                    "date": stat.st_mtime,          
                    "size": f"{stat.st_size / (1024*1024):.2f}Mb"
                })

    return all_files
