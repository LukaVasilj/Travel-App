import AppNavbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { FiMail, FiLock } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/csrf-token', {
          withCredentials: true,
        });
        setCsrfToken(response.data.csrf_token);
      } catch (err) {
        console.error('Error fetching CSRF token:', err);
      }
    };
    fetchCsrfToken();
  }, []);

  useEffect(() => {
    if (router.query.message) {
      setMessage(router.query.message as string);
    }
  }, [router.query]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8000/api/auth/login',
        { email, password },
        {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true,
        }
      );

      localStorage.setItem('access_token', response.data.access_token);

      const userResponse = await axios.get('http://localhost:8000/api/auth/me', {
        headers: { Authorization: `Bearer ${response.data.access_token}` },
        withCredentials: true,
      });

      if (userResponse.data.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/glavnastranica');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.detail || 'Invalid email or password.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
    setLoading(false);
  };

  return (
    <>
      <AppNavbar />
      {/* Background with gradient and image overlay */}
      <div
        className="min-h-screen flex items-center justify-center px-4 py-12"
        style={{
          background: 'linear-gradient(120deg, #1565C0 0%, #1E88E5 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <img
          src="/images/register-bg.jpg"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.22,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(120deg, rgba(233, 243, 255, 0.93) 0%, rgba(239, 247, 255, 0.92) 100%)',
            zIndex: 2,
          }}
        ></div>
        <div className="relative z-10 w-full max-w-xl mx-auto">
          <div className="bg-white/95 dark:bg-[#1a1a1a]/90 rounded-3xl shadow-2xl p-10 transition-all">
            <h1 className="text-4xl font-extrabold text-center text-[var(--primary-color)] mb-2 tracking-tight">
              Login to TravelApp
            </h1>
            <p className="text-center text-gray-500 mb-8">
              Welcome back! Please sign in to your account.
            </p>
            {message && (
              <p className="text-green-600 text-center mb-6 font-semibold">
                {message === 'verified' && 'Your email has been successfully verified. You can now log in.'}
                {message === 'already_verified' && 'Your email is already verified. Please log in.'}
                {message !== 'verified' && message !== 'already_verified' && message}
              </p>
            )}
            {error && <p className="text-red-500 text-center mb-6 font-semibold">{error}</p>}
            <form className="space-y-6" onSubmit={handleLogin} autoComplete="off">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400">
                    <FiMail />
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121212] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)]"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400">
                    <FiLock />
                  </span>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121212] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)]"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full text-lg mt-2"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <div className="mt-8 text-center text-gray-600 dark:text-gray-300">
              Don't have an account?{' '}
              <a
                href="/register"
                className="text-[var(--accent-color)] font-semibold hover:underline"
              >
                Register
              </a>
            </div>
            <div className="mt-6 text-xs text-gray-400 text-center">
              By logging in, you agree to our{' '}
              <a href="/terms" className="underline hover:text-[var(--accent-color)]">Terms of Service</a> and{' '}
              <a href="/privacy" className="underline hover:text-[var(--accent-color)]">Privacy Policy</a>.
            </div>
            <div className="mt-6 text-center">
              <a
                href="/forgot-password"
                className="text-sm text-[var(--primary-color)] hover:underline font-semibold"
              >
                Forgot your password?
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;