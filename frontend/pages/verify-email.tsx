import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const VerifyEmail = () => {
  const router = useRouter();
  const { token } = router.query;
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);

  useEffect(() => {
    if (token) {
      console.log(`Token received: ${token}`);
      const verifyEmail = async () => {
  try {
    const response = await fetch(`http://localhost:8000/api/auth/verify-email?token=${token}`);
    
    // Check if the response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Invalid response format");
    }

    const data = await response.json();
    console.log('Response data:', data);

    if (response.ok) {
      setQrCode(data.qr_code);
      setIsEmailVerified(true);
      console.log('QR Code set:', data.qr_code);
    } else {
      setError(data.detail || 'Verification failed');
      console.error('Verification failed:', data.detail);
    }
  } catch (err) {
    console.error('Error verifying email:', err);
    setError('An error occurred while verifying your email');
  }
};
      verifyEmail();
    }
  }, [token]);

  useEffect(() => {
    if (scanned) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 3000); // Preusmjeravanje nakon 3 sekunde

      return () => clearTimeout(timer); // Očisti timer kada se komponenta demontira
    }
  }, [scanned, router]);

  const handleQrCodeClick = () => {
    setScanned(true);
  };

  return (
    <div>
      <h1>Verify Email</h1>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <>
          {isEmailVerified ? (
            <>
              <p>Your email has been verified successfully.</p>
              {qrCode && (
                <div>
                  <img
                    src={`data:image/png;base64,${qrCode}`}
                    alt="QR Code"
                    onClick={handleQrCodeClick} // Simulacija skeniranja QR koda klikom
                    style={{ cursor: 'pointer' }}
                  />
                  {scanned && <p style={{ color: 'green' }}>QR code scanned successfully! Redirecting to login...</p>}
                </div>
              )}
            </>
          ) : (
            <p>Please check your email to verify your account.</p>
          )}
        </>
      )}
    </div>
  );
};

export default VerifyEmail;