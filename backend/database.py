# database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Podesi konekcijski string za PostgreSQL
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:1234@localhost:5432/Travel"

# Kreiraj engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Konfiguriraj session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Deklarativna baza (svi modeli će biti definirani preko nje)
Base = declarative_base()
