from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Pet
from ..schemas import UserCreate, UserOut, TokenPair, PetOut
from ..security import hash_password, verify_password, make_token, parse_token, get_current_user
from ..config import settings
from pydantic import BaseModel

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

# -------------------------------
# Register a new user
# -------------------------------
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

# -------------------------------
# Login
# -------------------------------
@router.post("/login", response_model=TokenPair)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    email = form.username.lower()
    user = db.query(User).filter_by(email=email).first()
    if not user or not verify_password(form.password, user.hashed_password) or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return _issue_tokens(user)

# -------------------------------
# Refresh token
# -------------------------------
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

# -------------------------------
# Logout
# -------------------------------
@router.post("/logout")
def logout(payload: RefreshIn, db: Session = Depends(get_db)):
    data = parse_token(payload.refresh_token)
    if data:
        user = db.get(User, int(data["sub"]))
        if user:
            user.token_version += 1
            db.commit()
    return {"ok": True}

# -------------------------------
# Current user info (with pets)
# -------------------------------
class UserWithPets(UserOut):
    pets: list[PetOut] = []

@router.get("/me", response_model=UserWithPets)
def read_current_user(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pets = db.query(Pet).filter_by(owner_id=current_user.id).all()
    return UserWithPets(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        pets=pets
    )
