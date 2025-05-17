from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Enum , Float
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSON  # <-- Dodaj ovo!
from database import Base
import datetime
import enum

# Enum za status prijateljstva
class FriendshipStatus(enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="user")
    is_active = Column(Boolean, default=True)
    is_email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    otp_secret = Column(String(255), nullable=True)  # Dodano polje za 2FA tajni ključ

    
    # Relationship for friends
    friends = relationship(
        "Friend",
        foreign_keys="[Friend.user_id]",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    trips = relationship(
        "Trip",
        back_populates="user",
        cascade="all, delete-orphan"
    )

class Friend(Base):
    __tablename__ = "friends"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    friend_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(FriendshipStatus), default=FriendshipStatus.pending, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationship back to User
    user = relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="friends",
    )
    
class Trip(Base):
    __tablename__ = "trips"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    start_date = Column(String)
    end_date = Column(String)
    transport_type = Column(String)
    transport_option = Column(JSON)
    accommodation = Column(JSON, nullable=True)
    flight = Column(JSON, nullable=True)
    total_cost = Column(Float, nullable=False)
    user = relationship("User", back_populates="trips")
    
class SharedTrip(Base):
    __tablename__ = "shared_trips"
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"))
    shared_with_id = Column(Integer, ForeignKey("users.id"))
    shared_by_id = Column(Integer, ForeignKey("users.id"))
    shared_at = Column(DateTime, default=datetime.datetime.utcnow)

    trip = relationship("Trip")
    shared_with = relationship("User", foreign_keys=[shared_with_id])
    shared_by = relationship("User", foreign_keys=[shared_by_id])
    feedbacks = relationship("SharedTripFeedback", back_populates="shared_trip", cascade="all, delete-orphan")
    
class SharedTripFeedback(Base):
    __tablename__ = "shared_trip_feedback"
    id = Column(Integer, primary_key=True, index=True)
    shared_trip_id = Column(Integer, ForeignKey("shared_trips.id"))  # <-- ispravljeno!
    rating = Column(Integer)  # npr. 1-5
    comment = Column(String)
    created_by_id = Column(Integer, ForeignKey("users.id"))  # <-- ispravljeno!

    shared_trip = relationship("SharedTrip", back_populates="feedbacks")
    created_by = relationship("User")