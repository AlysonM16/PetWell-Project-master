from pydantic import BaseModel, EmailStr
from typing import Optional, List
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None  
class UserCreate(UserBase):
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True
class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    password: str | None = None
class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
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
class UserWithPets(UserOut):
    pets: List[PetOut] = []
    phone: Optional[str] = None 
    model_config = {
        "from_attributes": True
    }
