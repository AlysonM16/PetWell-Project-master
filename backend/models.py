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
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


# -----------------------------
# USER TABLE
# -----------------------------
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    token_version = Column(Integer, default=0)


# -----------------------------
# 1. UNITS
# -----------------------------
class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True)
    symbol = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=False)

    analytes = relationship("Analyte", back_populates="default_unit")
    reference_ranges = relationship("ReferenceRange", back_populates="unit")
    lab_results = relationship("LabResult", back_populates="unit")


# -----------------------------
# 2. ANALYTES
# -----------------------------
class Analyte(Base):
    __tablename__ = "analytes"

    id = Column(Integer, primary_key=True)
    code = Column(String, nullable=False, unique=True)   # GLU, CREA, BUN/CREA
    name = Column(String, nullable=False)
    default_unit_id = Column(Integer, ForeignKey("units.id"), nullable=True)
    is_ratio = Column(Boolean, default=False)

    default_unit = relationship("Unit", back_populates="analytes")
    reference_ranges = relationship("ReferenceRange", back_populates="analyte")
    lab_results = relationship("LabResult", back_populates="analyte")


# -----------------------------
# 3. REFERENCE RANGES
# -----------------------------
class ReferenceRange(Base):
    __tablename__ = "reference_ranges"

    id = Column(Integer, primary_key=True)
    analyte_id = Column(Integer, ForeignKey("analytes.id"), nullable=False)
    sex = Column(String, nullable=True)  # M, F, U
    species = Column(String, nullable=False)
    age_min_years = Column(Float, nullable=False)
    age_max_years = Column(Float, nullable=False)

    lower_bound = Column(Float, nullable=True)
    upper_bound = Column(Float, nullable=True)

    unit_id = Column(Integer, ForeignKey("units.id"), nullable=True)
    notes = Column(Text, nullable=True)

    analyte = relationship("Analyte", back_populates="reference_ranges")
    unit = relationship("Unit", back_populates="reference_ranges")
    lab_results = relationship("LabResult", back_populates="reference_range")

    # enforce: no overlapping reference ranges per analyte/species/sex
    __table_args__ = (
        UniqueConstraint(
            "analyte_id", "sex", "species", "age_min_years", "age_max_years",
            name="uq_reference_range_no_overlap"
        ),
    )


# -----------------------------
# 4. PATIENTS
# -----------------------------
class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True)
    external_id = Column(String, unique=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    dob = Column(Date, nullable=False)
    sex = Column(String, nullable=True)
    species = Column(String, nullable=False)

    labs = relationship("Lab", back_populates="patient")


# -----------------------------
# 5. LABS
# -----------------------------
class Lab(Base):
    __tablename__ = "labs"

    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    collected_at = Column(DateTime, nullable=False)
    ordering_provider = Column(String, nullable=True)
    source_lab = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    patient = relationship("Patient", back_populates="labs")
    lab_results = relationship("LabResult", back_populates="lab")


# -----------------------------
# 6. LAB RESULTS
# -----------------------------
class LabResult(Base):
    __tablename__ = "lab_results"

    id = Column(Integer, primary_key=True)

    lab_id = Column(Integer, ForeignKey("labs.id"), nullable=False)
    analyte_id = Column(Integer, ForeignKey("analytes.id"), nullable=False)

    value_numeric = Column(Float, nullable=True)
    value_text = Column(String, nullable=True)

    unit_id = Column(Integer, ForeignKey("units.id"), nullable=True)
    reference_range_id = Column(Integer, ForeignKey("reference_ranges.id"), nullable=True)

    abnormal_flag = Column(String, nullable=True)  # H / L / N
    measured_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    lab = relationship("Lab", back_populates="lab_results")
    analyte = relationship("Analyte", back_populates="lab_results")
    unit = relationship("Unit", back_populates="lab_results")
    reference_range = relationship("ReferenceRange", back_populates="lab_results")