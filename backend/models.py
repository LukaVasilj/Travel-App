from sqlalchemy import Column, Integer, String, DateTime, Boolean
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)  # Dodano polje za email
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="user")
    is_active = Column(Boolean, default=True)
    is_email_verified = Column(Boolean, default=False)  # Dodano polje za verifikaciju emaila
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    otp_secret = Column(String(32))  # Dodano polje za 2FA tajni ključ