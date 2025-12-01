from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

# -------- USERS --------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    token_version = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    pets = relationship("Pet", back_populates="owner")


# -------- PETS --------
class Pet(Base):
    __tablename__ = "pets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    breed = Column(String, nullable=True)
    sex = Column(String, nullable=True)
    dob = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="pets")
