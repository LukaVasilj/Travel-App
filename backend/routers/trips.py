from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models import Trip, User
from database import get_db
from routers.auth import get_current_user
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

class TripCreate(BaseModel):
    name: str
    start_date: str
    end_date: str
    transport_type: str
    transport_option: dict
    accommodation: Optional[dict]
    flight: Optional[dict]
    total_cost: float

    class Config:
        orm_mode = True

class TripOut(BaseModel):
    id: int
    name: str
    start_date: str
    end_date: str
    transport_type: str
    transport_option: dict
    accommodation: Optional[dict]
    flight: Optional[dict]
    total_cost: float

    class Config:
        orm_mode = True

@router.post("/trips/", status_code=201)
def create_trip(
    trip: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    import logging
    logger = logging.getLogger("trips")
    logger.debug(f"Received trip payload: {trip.dict()}")
    try:
        db_trip = Trip(
            name=trip.name,
            start_date=trip.start_date,
            end_date=trip.end_date,
            transport_type=trip.transport_type,
            transport_option=trip.transport_option,
            accommodation=trip.accommodation,
            flight=trip.flight,
            total_cost=trip.total_cost,
            user_id=current_user.id
        )
        db.add(db_trip)
        db.commit()
        db.refresh(db_trip)
        logger.debug(f"Trip created successfully: {db_trip}")
        return db_trip
    except Exception as e:
        logger.error(f"Error creating trip: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trips/", response_model=List[TripOut])
def get_my_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trips = db.query(Trip).filter(Trip.user_id == current_user.id).all()
    return trips