from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models import Trip, User , Friend, SharedTrip , SharedTripFeedback
from database import get_db
from routers.auth import get_current_user
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

class FeedbackRequest(BaseModel):
    shared_trip_id: int
    rating: int
    comment: str

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
        raise HTTPException(status_code=404, detail="Trip not found or not yours.")

    # Prvo obriši sve feedbackove povezane sa shared tripovima
    shared_trips = db.query(SharedTrip).filter(SharedTrip.trip_id == trip_id).all()
    for shared in shared_trips:
        db.query(SharedTripFeedback).filter(SharedTripFeedback.shared_trip_id == shared.id).delete()
    db.query(SharedTrip).filter(SharedTrip.trip_id == trip_id).delete()
    db.delete(trip)
    db.commit()
    return {"detail": "Trip deleted"}

@router.get("/trips/shared/", response_model=list[dict])
def get_shared_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shared = db.query(SharedTrip).filter(SharedTrip.shared_with_id == current_user.id).all()
    result = []
    for s in shared:
        if s.trip and s.shared_by:
            result.append({
                "trip": {
                    "id": s.trip.id,
                    "name": s.trip.name,
                    "start_date": s.trip.start_date,
                    "end_date": s.trip.end_date,
                    "transport_type": s.trip.transport_type,
                    "transport_option": s.trip.transport_option,
                    "accommodation": s.trip.accommodation,
                    "flight": s.trip.flight,
                    "total_cost": s.trip.total_cost,
                },
                "shared_by": {
                    "id": s.shared_by.id,
                    "username": s.shared_by.username,
                    "email": s.shared_by.email
                },
                "shared_trip_id": s.id  # <-- OVO DODAJ!
            })
    return result

@router.get("/trips/shared-with/{trip_id}", response_model=List[dict])
def get_shared_with_for_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Provjeri da je trip od trenutnog korisnika
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found or not yours.")
    shared = db.query(SharedTrip).filter(SharedTrip.trip_id == trip_id).all()
    return [
        {
            "id": s.shared_with.id,
            "username": s.shared_with.username,
            "email": s.shared_with.email
        }
        for s in shared if s.shared_with
    ]
    
@router.post("/trips/feedback/")
def leave_feedback(
    feedback: FeedbackRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shared_trip = db.query(SharedTrip).filter(
        SharedTrip.id == feedback.shared_trip_id,
        SharedTrip.shared_with_id == current_user.id
    ).first()
    if not shared_trip:
        raise HTTPException(status_code=404, detail="Shared trip not found or not yours.")

    # Provjeri je li već ostavljen feedback
    existing = db.query(SharedTripFeedback).filter(
        SharedTripFeedback.shared_trip_id == feedback.shared_trip_id,
        SharedTripFeedback.created_by_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Feedback already left.")

    fb = SharedTripFeedback(
        shared_trip_id=feedback.shared_trip_id,
        rating=feedback.rating,
        comment=feedback.comment,
        created_by_id=current_user.id
    )
    db.add(fb)
    db.commit()
    return {"message": "Feedback submitted"}

@router.get("/trips/{trip_id}/feedbacks", response_model=List[dict])
def get_feedbacks_for_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Samo vlasnik tripa može vidjeti feedbackove
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found or not yours.")

    shared_trips = db.query(SharedTrip).filter(SharedTrip.trip_id == trip_id).all()
    feedbacks = []
    for s in shared_trips:
        for fb in s.feedbacks:
            feedbacks.append({
                "id": fb.id,
                "rating": fb.rating,
                "comment": fb.comment,
                "user": {"id": fb.created_by.id, "username": fb.created_by.username}
            })
    return feedbacks

@router.get("/trips/shared-feedbacks/{shared_trip_id}", response_model=List[dict])
def get_feedbacks_for_shared_trip(
    shared_trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shared_trip = db.query(SharedTrip).filter(
        SharedTrip.id == shared_trip_id,
        SharedTrip.shared_with_id == current_user.id
    ).first()
    if not shared_trip:
        raise HTTPException(status_code=404, detail="Shared trip not found or not yours.")

    feedbacks = []
    for fb in shared_trip.feedbacks:
        feedbacks.append({
            "id": fb.id,
            "rating": fb.rating,
            "comment": fb.comment,
            "user": {"id": fb.created_by.id, "username": fb.created_by.username}
        })
    return feedbacks