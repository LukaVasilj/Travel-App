from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models import Trip, User , Friend, SharedTrip
from database import get_db
from routers.auth import get_current_user
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

class ShareTripRequest(BaseModel):
    trip_id: int
    friend_id: int

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

@router.post("/trips/share/")
def share_trip(request: ShareTripRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Provjeri postoji li prijateljstvo
    friendship = db.query(Friend).filter(
        ((Friend.user_id == current_user.id) & (Friend.friend_id == request.friend_id) & (Friend.status == "accepted")) |
        ((Friend.user_id == request.friend_id) & (Friend.friend_id == current_user.id) & (Friend.status == "accepted"))
    ).first()
    if not friendship:
        raise HTTPException(status_code=403, detail="You are not friends with this user.")

    # Provjeri postoji li trip i da li pripada korisniku
    trip = db.query(Trip).filter(Trip.id == request.trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found or not yours.")

    # Provjeri je li već podijeljen
    already_shared = db.query(SharedTrip).filter(
        SharedTrip.trip_id == request.trip_id,
        SharedTrip.shared_with_id == request.friend_id
    ).first()
    if already_shared:
        raise HTTPException(status_code=400, detail="Trip already shared with this friend.")

    shared_trip = SharedTrip(
        trip_id=request.trip_id,
        shared_with_id=request.friend_id,
        shared_by_id=current_user.id
    )
    db.add(shared_trip)
    db.commit()
    return {"message": "Trip shared successfully"}

@router.delete("/trips/{trip_id}")
def delete_trip(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    # Prvo obriši sve share-ove za taj trip
    db.query(SharedTrip).filter(SharedTrip.trip_id == trip_id).delete()
    db.delete(trip)
    db.commit()
    return {"message": "Trip deleted"}

@router.get("/trips/shared/", response_model=List[TripOut])
def get_shared_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shared = db.query(SharedTrip).filter(SharedTrip.shared_with_id == current_user.id).all()
    trips = [s.trip for s in shared if s.trip is not None]
    return trips