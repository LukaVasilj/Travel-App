import logging
from fastapi import FastAPI, Request, Depends, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi_csrf_protect import CsrfProtect
from pydantic import BaseModel
from starlette.responses import JSONResponse

from routers import auth  # Ensure your auth router is imported correctly

# Define CSRF configuration
class CsrfSettings(BaseModel):
    secret_key: str = "your_secret_key"

# Initialize FastAPI app
app = FastAPI()

# Configure logging at DEBUG level
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Add CORS middleware – allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"  # Frontend domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load CSRF settings using fastapi-csrf-protect
@CsrfProtect.load_config
def get_csrf_config():
    return CsrfSettings()

# Include the auth router
app.include_router(auth.router, prefix="/api/auth")

# CSRF token endpoint: generate token and set it in a cookie manually
@app.get("/api/csrf-token")
def get_csrf_token(response: Response, csrf_protect: CsrfProtect = Depends()):
    logger.info("CSRF token endpoint accessed")
    
    # Generate tokens (this returns a tuple)
    tokens = csrf_protect.generate_csrf_tokens()
    csrf_token = tokens[0]  # Extract the first token from the tuple
    logger.debug(f"Generated CSRF tokens: {tokens}")
    
    # Create a JSONResponse and manually set the cookie.
    json_response = JSONResponse(content={"csrf_token": csrf_token})
    json_response.set_cookie(
        key="fastapi-csrf-token",
        value=csrf_token,
        httponly=True,
        samesite="lax",
        domain="localhost"  # Explicitly set the domain if needed
    )
    
    return json_response

# CSRF protection middleware
@app.middleware("http")
async def csrf_protect_middleware(request: Request, call_next):
    logger.info(f"Request method: {request.method}, URL: {request.url}")
    
    # For state-changing methods, check the CSRF token.
    if request.method in ["POST", "PUT", "DELETE"]:
        csrf_protect = CsrfProtect()  # Initialize CSRF protection
        csrf_header = request.headers.get("X-CSRF-Token")
        csrf_cookie = request.cookies.get("fastapi-csrf-token")
        
        # Log tokens for debugging.
        logger.debug(f"CSRF token from header: {csrf_header}")
        logger.debug(f"CSRF token from cookie: {csrf_cookie}")
        
        if not csrf_header:
            logger.error("CSRF token is missing in header")
            return JSONResponse(status_code=403, content={"detail": "CSRF token is missing in header"})
        
        # If tokens are in a comma-separated (tuple-like) string, extract the first element.
        if csrf_header and ',' in csrf_header:
            csrf_header = csrf_header.split(',')[0]
            logger.debug(f"Extracted header token: {csrf_header}")
        if csrf_cookie and ',' in csrf_cookie:
            csrf_cookie = csrf_cookie.split(',')[0]
            logger.debug(f"Extracted cookie token: {csrf_cookie}")
        
        if csrf_header != csrf_cookie:
            logger.error("CSRF token validation failed. Header token does not match cookie token.")
            return JSONResponse(status_code=403, content={"detail": "CSRF token validation failed"})
        
        logger.info("CSRF token validated successfully")
    
    response = await call_next(request)
    return response