import pyotp
import qrcode
import base64
from io import BytesIO
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from itsdangerous import URLSafeTimedSerializer

# Konfiguracija za FastMail
conf = ConnectionConfig(
    MAIL_USERNAME="lukavasilj51@gmail.com",
    MAIL_PASSWORD="hfsi zzov wwvy alou",
    MAIL_FROM="lukavasilj51@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# Tajni ključ za generiranje tokena
SECRET_KEY = "your-secret-key"
SECURITY_PASSWORD_SALT = "your-security-password-salt"

# Funkcija za generiranje verifikacijskog tokena
def generate_verification_token(email: str) -> str:
    serializer = URLSafeTimedSerializer(SECRET_KEY)
    return serializer.dumps(email, salt=SECURITY_PASSWORD_SALT)

# Funkcija za dekodiranje verifikacijskog tokena
def decode_verification_token(token: str, expiration=3600) -> str:
    serializer = URLSafeTimedSerializer(SECRET_KEY)
    try:
        email = serializer.loads(
            token,
            salt=SECURITY_PASSWORD_SALT,
            max_age=expiration
        )
    except Exception as e:
        return None
    return email

# Funkcija za slanje verifikacijskog emaila
async def send_verification_email(email: str):
    token = generate_verification_token(email)
    verification_url = f"http://localhost:3000/verify-email?token={token}"
    html = f"""
    <html>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f9f9f9; padding: 40px; text-align: center;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
            <div style="background: #007BFF; padding: 20px; border-radius: 10px 10px 0 0; color: white;">
                <h1 style="margin: 0; font-size: 28px;">TravelApp</h1>
            </div>
            <h2 style="color: #333333; margin-top: 20px;">Confirm Your Email Address</h2>
            <p style="color: #555555; font-size: 16px; line-height: 1.6;">Thank you for registering with TravelApp! Please confirm your email address to activate your account.</p>
            <a href="{verification_url}" style="display: inline-block; padding: 15px 30px; font-size: 18px; color: white; background-color: #28a745; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold;">Verify Email</a>
            <p style="color: #888888; font-size: 14px; line-height: 1.5;">If you didn't request this email, you can safely ignore it.</p>
            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
            <p style="color: #aaaaaa; font-size: 12px;">TravelApp Team | Your Gateway to Adventures 🌍</p>
        </div>
    </body>
    </html>
    """

    message = MessageSchema(
        subject="Verify Your Email - TravelApp",
        recipients=[email],
        body=html,
        subtype="html"
    )
    fm = FastMail(conf)
    await fm.send_message(message)


def hash_password(password: str) -> str:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_context.hash(password)

def generate_otp_secret() -> str:
    return pyotp.random_base32()

def generate_qr_code(username: str, otp_secret: str) -> str:
    otp_uri = pyotp.totp.TOTP(otp_secret).provisioning_uri(name=username, issuer_name="YourAppName")
    qr = qrcode.make(otp_uri)
    buffer = BytesIO()
    qr.save(buffer, format="PNG")
    qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()
    return qr_code_base64