import logging
from fastapi import APIRouter, HTTPException, Depends, Request, status, Security
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request
from starlette.responses import RedirectResponse, JSONResponse
import pyotp
import qrcode
from io import BytesIO
import base64
from datetime import datetime, timedelta
from database import get_db
from models import User
from database import SessionLocal, engine, Base
from models import User
from utils import send_verification_email, hash_password, generate_otp_secret, generate_qr_code, decode_verification_token
from fastapi.responses import HTMLResponse

# Definirajte logger
logger = logging.getLogger(__name__)

# Kreiraj sve tablice u bazi (ako ne postoje)
Base.metadata.create_all(bind=engine)

# Konfiguracija
SECRET_KEY = "tvoja_tajna_kljuceva"  # U produkciji, spremi ovo u env varijable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 240

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

oauth = OAuth()

oauth.register(
    name='google',
    client_id='GOOGLE_CLIENT_ID',
    client_secret='GOOGLE_CLIENT_SECRET',
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    authorize_params=None,
    access_token_url='https://accounts.google.com/o/oauth2/token',
    access_token_params=None,
    refresh_token_url=None,
    redirect_uri='http://localhost:8000/auth/callback',
    client_kwargs={'scope': 'openid profile email'},
)

# Pydantic sheme
class UserIn(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str = None
    role: str = None

class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str

# Dependency za dobivanje SQLAlchemy sessiona
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Security(oauth2_scheme), db: Session = Depends(get_db)):
    logger.debug(f"Received token: {token}")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        logger.debug(f"Decoded payload: {payload}")
        email: str = payload.get("sub")  # Use email instead of username
        role: str = payload.get("role")
        if email is None or role is None:
            logger.error("Token is missing 'sub' or 'role'")
            raise credentials_exception
        token_data = TokenData(username=email, role=role)
    except JWTError as e:
        logger.error(f"JWT decoding error: {e}")
        raise credentials_exception
    user = db.query(User).filter(User.email == token_data.username).first()  # Query by email
    if user is None:
        logger.error(f"User not found for email: {token_data.username}")
        raise credentials_exception
    logger.debug(f"Authenticated user: {user.email}, role: {user.role}")
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_admin_user(current_user: User = Depends(get_current_active_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user


# Registracijski endpoint
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # Provjerite da li korisnik već postoji
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == request.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    # Kreirajte novog korisnika
    hashed_password = hash_password(request.password)
    new_user = User(email=request.email, username=request.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Pošaljite verifikacijski email
    await send_verification_email(new_user.email)

    return {"message": "User registered successfully. Please check your email to verify your account."}


@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    email = decode_verification_token(token)
    if not email:
        return JSONResponse(
            content={"detail": "Invalid or expired token"},
            status_code=400
        )

    user = db.query(User).filter(User.email == email).first()
    if not user:
        return JSONResponse(
            content={"detail": "User not found"},
            status_code=404
        )

    if user.is_email_verified:
        return JSONResponse(
            content={"detail": "Email is already verified"},
            status_code=200
        )

    user.is_email_verified = True
    db.commit()

    return JSONResponse(
        content={"detail": "Email has been successfully verified"},
        status_code=200
    )

@router.post("/verify-otp")
def verify_otp(otp_code: str, token: str, db: Session = Depends(get_db)):
    email = decode_verification_token(token)
    if email is None:
        raise HTTPException(status_code=400, detail="Invalid token or user not found")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid token or user not found")

    otp = pyotp.TOTP(user.otp_secret)
    if not otp.verify(otp_code):
        raise HTTPException(status_code=400, detail="Invalid OTP code")

    return {"message": "OTP code verified successfully"}

@router.post("/setup-2fa")
def setup_2fa(request: Request, db: Session = Depends(get_db)):
    user = request.user
    if not user.is_email_verified:
        raise HTTPException(status_code=400, detail="Email not verified")

    otp_secret = generate_otp_secret()
    user.otp_secret = otp_secret
    db.commit()

    qr_code = generate_qr_code(user.username, otp_secret)

    return {"qr_code": qr_code}

# Update the login endpoint to use email in the token
@router.post("/login", response_model=Token)
def login(user: UserIn, db: Session = Depends(get_db)):
    logger.debug(f"Login attempt for email: {user.email}")
    
    # Find user by email
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        logger.error(f"User not found with email: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(user.password, db_user.hashed_password):
        logger.error(f"Invalid password for email: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password"
        )

    # Generate JWT token with email as the subject
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email, "role": db_user.role}, expires_delta=access_token_expires
    )
    logger.debug(f"User {user.email} logged in successfully")
    return {"access_token": access_token, "token_type": "bearer"}

# Ruta za dobivanje trenutnog korisnika s više informacija
@router.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    logger.debug(f"Fetching current user info for: {current_user.username}")
    return {
        "user_id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
    }


# Endpoint za pretraživanje korisnika po username
@router.get("/users")
def search_users(search: str, db: Session = Depends(get_db)):
    users = db.query(User).filter(User.username.ilike(f"%{search}%")).all()
    return {"users": [{"id": user.id, "username": user.username, "email": user.email} for user in users]}

# OAuth Google login
@router.get('/login/google')
async def login_google(request: Request):
    redirect_uri = 'http://localhost:8000/auth/callback'
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get('/auth/callback')
async def auth_google_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = await oauth.google.parse_id_token(request, token)
    user = db.query(User).filter(User.username == user_info['email']).first()
    if not user:
        user = User(username=user_info['email'], hashed_password='', role='user', otp_secret='')
        db.add(user)
        db.commit()
        db.refresh(user)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    response = RedirectResponse(url='/')
    response.set_cookie(key="access_token", value=f"Bearer {access_token}", httponly=True)
    return response

