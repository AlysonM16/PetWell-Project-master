from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Float,
    Date,
    DateTime,
    ForeignKey,
    Boolean,
    Text,
    UniqueConstraint
)
from datetime import datetime
from sqlalchemy.orm import relationship
from .database import Base
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True) 
    hashed_password = Column(String, nullable=False)
    token_version = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    pets = relationship("Pet", back_populates="owner") 
class Pet(Base):
    __tablename__ = "pets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    dob = Column(String, nullable=True) 
    breed = Column(String, nullable=True)
    sex = Column(String, nullable=True)
    weight = Column(Float, nullable=True)
    img = Column(String, nullable=True) 
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="pets")


    # New relationship for labs
    labs = relationship("Lab", back_populates="pet", cascade="all, delete-orphan")




class Lab(Base):
    __tablename__ = "labs"
    id = Column(Integer, primary_key=True, index=True)
    visit_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    lab_hash = Column(String, nullable=True, index=True)
    pdf_path = Column(String, nullable=True, index=True)

    pet = relationship("Pet", back_populates="labs")

    __table_args__ = (
        UniqueConstraint('pet_id', 'visit_date', name='uix_pet_visit'),
    )

    tests = relationship("LabTest", back_populates="lab", cascade="all, delete-orphan")


class LabTest(Base):
    __tablename__ = "lab_tests"
    id = Column(Integer, primary_key=True, index=True)


    lab_id = Column(Integer, ForeignKey("labs.id"), nullable=False)
    lab = relationship("Lab", back_populates="tests")


    # Each test entry
    test_name = Column(String, nullable=False)
    value = Column(String, nullable=False)
    unit = Column(String, nullable=True)
    reference_range = Column(String, nullable=True)
