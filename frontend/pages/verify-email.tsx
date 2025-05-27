import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const VerifyEmail = () => {
  const router = useRouter();
  const { token } = router.query;
  const [error, setError] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);

  useEffect(() => {
    if (token) {
      const verifyEmail = async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/auth/verify-email?token=${token}`);
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Invalid response format");
          }
          const data = await response.json();
          if (response.ok) {
            setIsEmailVerified(true);
          } else {
            setError(data.detail || 'Verification failed');
          }
        } catch (err) {
          setError('An error occurred while verifying your email');
        }
      };
      verifyEmail();
    }
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-100 to-blue-600">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <h1 className="text-3xl font-extrabold text-[var(--primary-color)] mb-4">Verify Email</h1>
        {error ? (
          <p className="text-red-500 mb-6">{error}</p>
        ) : (
          <>
            {isEmailVerified ? (
              <>
                <p className="mb-6 text-green-700 font-semibold">Your email has been verified successfully.</p>
                <button
                  className="btn btn-primary w-full text-lg"
                  onClick={() => router.push('/login')}
                >
                  Go to Login
                </button>
              </>
            ) : (
              <p>Please check your email to verify your account.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;