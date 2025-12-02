from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

# Create engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# -----------------------------------------
# SAFE TABLE INSPECTION (won't crash)
# -----------------------------------------
inspector = inspect(engine)

try:
    existing_tables = inspector.get_table_names()
    if "pets" in existing_tables:
        columns = [col["name"] for col in inspector.get_columns("pets")]
        print("Existing columns:", columns)

        # Add `img` column if missing
        if "img" not in columns:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE pets ADD COLUMN img TEXT"))
                conn.commit()
                print("Added 'img' column successfully!")

    else:
        print("Table 'pets' does not exist yet — will be created on startup.")

except Exception as e:
    print("Could not inspect tables:", e)

# Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
