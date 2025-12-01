from pydantic import BaseModel, EmailStr
from typing import Optional

# -------- USERS --------
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str  # Original setup

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# -------- PETS --------
class PetBase(BaseModel):
    name: str
    breed: Optional[str] = None
    sex: Optional[str] = None
    dob: Optional[str] = None
    owner_id: Optional[int] = None

class PetCreate(PetBase):
    pass

class PetUpdate(BaseModel):
    name: Optional[str] = None
    breed: Optional[str] = None
    sex: Optional[str] = None
    dob: Optional[str] = None

class PetOut(PetBase):
    id: int

    class Config:
        from_attributes = True
