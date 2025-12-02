from pydantic import BaseModel, EmailStr
from typing import Optional, List

# -------- USERS --------
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

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
    weight: Optional[float] = None
    image: Optional[str] = None

class PetCreate(PetBase):
    pass

class PetUpdate(BaseModel):
    name: Optional[str] = None
    breed: Optional[str] = None
    sex: Optional[str] = None
    dob: Optional[str] = None
    weight: Optional[float] = None
    image: Optional[str] = None

class PetOut(PetBase):
    id: int
    owner_id: int

    model_config = {
        "from_attributes": True
    }
# User with pets
class UserWithPets(UserOut):
    pets: List[PetOut] = []

    model_config = {
        "from_attributes": True
    }
