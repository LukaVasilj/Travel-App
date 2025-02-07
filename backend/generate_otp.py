import pyotp
otp_secret = "HS6VACQH35HCFIV6RHNSW4UZ77SQDFRZ"  # Zamijenite s vašim otp_secret
otp = pyotp.TOTP(otp_secret)
print("Current OTP:", otp.now())