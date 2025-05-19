from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, get_db
from models import User, Friend , FriendshipStatus
from pydantic import BaseModel
from routers.auth import get_current_user  # Uvoz funkcije iz auth.py

router = APIRouter()

# Dependency za dobivanje SQLAlchemy sessiona
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class FriendRequestAction(BaseModel):
    request_id: int
    action: str

class AddFriendRequest(BaseModel):
    user_id: int
    friend_id: int

@router.post("/add-friend")
def add_friend(request: AddFriendRequest, db: Session = Depends(get_db)):
    user_id = request.user_id
    friend_id = request.friend_id

    print(f"Received friend request from user ID: {user_id} to friend ID: {friend_id}")

    # Provjerite da li zahtjev već postoji
    existing_request = db.query(Friend).filter(
        Friend.user_id == user_id, Friend.friend_id == friend_id
    ).first()

    if existing_request:
        print(f"Existing request found: {existing_request}")
        if existing_request.status == "rejected":
            # Ako je status "rejected", izbriši stari zapis i kreiraj novi
            db.delete(existing_request)
            db.commit()
            print(f"Deleted rejected request from {user_id} to {friend_id}")
        elif existing_request.status == "pending":
            raise HTTPException(status_code=400, detail="Friend request is already pending")
        elif existing_request.status == "accepted":
            raise HTTPException(status_code=400, detail="You are already friends")
        else:
            raise HTTPException(status_code=400, detail="Friend request already exists")

    # Kreirajte novi zahtjev za prijateljstvo
    friend_request = Friend(user_id=user_id, friend_id=friend_id, status="pending")
    db.add(friend_request)
    db.commit()
    print(f"Created new friend request from {user_id} to {friend_id}")

    return {"message": "Friend request sent successfully"}
    

@router.post("/respond-friend-request")
def respond_friend_request(request: FriendRequestAction, db: Session = Depends(get_db)):
    # Dohvati zahtjev za prijateljstvo
    friend_request = db.query(Friend).filter(Friend.id == request.request_id).first()
    if not friend_request:
        raise HTTPException(status_code=404, detail="Friend request not found")

    # Ažuriraj status zahtjeva
    if request.action == "accept":
        friend_request.status = "accepted"
    elif request.action == "reject":
        friend_request.status = "rejected"
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    db.commit()
    return {"message": f"Friend request {request.action}ed successfully"}

@router.get("/friend-requests/{user_id}")
def get_friend_requests(user_id: int, db: Session = Depends(get_db)):
    requests = (
        db.query(Friend)
        .filter(Friend.friend_id == user_id, Friend.status == FriendshipStatus.pending)
        .all()
    )
    result = []
    for req in requests:
        user = db.query(User).filter(User.id == req.user_id).first()
        result.append({
            "id": req.id,
            "username": user.username,
            "email": user.email,
            "profile_image": user.profile_image  # <-- OVO DODAJ!
        })
    return {"friend_requests": result}

@router.delete("/remove-friend/{friend_id}")
def remove_friend(friend_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    friend = db.query(Friend).filter(
        (Friend.user_id == current_user.id) & (Friend.friend_id == friend_id)
    ).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")

    db.delete(friend)
    db.commit()
    return {"message": "Friend removed successfully"}

@router.get("/{user_id}")
def get_friends(user_id: int, db: Session = Depends(get_db)):
    friends = (
        db.query(Friend)
        .filter(
            ((Friend.user_id == user_id) | (Friend.friend_id == user_id)),
            Friend.status == "accepted"  # ili FriendshipStatus.accepted ako koristiš Enum
        )
        .all()
    )
    result = []
    for f in friends:
        # Pronađi pravog prijatelja (ne trenutnog usera)
        friend_user_id = f.friend_id if f.user_id == user_id else f.user_id
        user = db.query(User).filter(User.id == friend_user_id).first()
        result.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile_image": user.profile_image  # <-- OVO JE KLJUČNO!
        })
    return {"friends": result}

@router.get("/", response_model=list[dict])
def get_my_friends(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Pronađi sve prijatelje gdje je status accepted
    friends = db.query(Friend).filter(
        ((Friend.user_id == current_user.id) | (Friend.friend_id == current_user.id)),
        Friend.status == "accepted"
    ).all()
    # Vrati listu prijatelja (osim samog sebe)
    result = []
    for f in friends:
        if f.user_id == current_user.id:
            friend_id = f.friend_id
        else:
            friend_id = f.user_id
        friend_user = db.query(User).filter(User.id == friend_id).first()
        if friend_user:
            result.append({"id": friend_user.id, "username": friend_user.username})
    return result