# backend/init_db.py
from backend.database import Base, engine
from backend import models  # Make sure this imports your User and Pet models

# This will create all tables that don't exist yet
Base.metadata.create_all(bind=engine)

print("Database tables created!")
