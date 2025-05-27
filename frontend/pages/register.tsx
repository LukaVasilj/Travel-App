import AppNavbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
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

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!username || !email || !password) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        'http://localhost:8000/api/auth/register',
        { email, username, password },
        {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true,
        }
      );
      alert('Registration successful. Please check your email to verify your account.');
      router.push('/verify-email');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.detail || 'Registration failed');
      } else {
        setError('Registration failed');
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
            background: 'linear-gradient(120deg, rgb(228, 240, 255) 0%, rgb(207, 233, 255) 100%)',
            zIndex: 2,
          }}
        ></div>
        <div className="relative z-10 w-full max-w-xl mx-auto">
          <div className="bg-white/95 dark:bg-[#1a1a1a]/90 rounded-3xl shadow-2xl p-10 transition-all">
            <h1 className="text-4xl font-extrabold text-center text-[var(--primary-color)] mb-2 tracking-tight">
              Create your TravelApp account
            </h1>
            <p className="text-center text-gray-500 mb-8">
              Join us and start planning your next adventure!
            </p>
            {error && (
              <p className="text-red-500 text-center mb-6 font-semibold">{error}</p>
            )}
            <form className="space-y-6" onSubmit={handleRegister} autoComplete="off">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400">
                    <FiUser />
                  </span>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your username"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121212] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)]"
                  />
                </div>
              </div>
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
                  />
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400">
                    <FiLock />
                  </span>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="********"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121212] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)]"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full text-lg mt-2"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
            <div className="mt-8 text-center text-gray-600 dark:text-gray-300">
              Already have an account?{' '}
              <a
                href="/login"
                className="text-[var(--accent-color)] font-semibold hover:underline"
              >
                Log in
              </a>
            </div>
            <div className="mt-6 text-xs text-gray-400 text-center">
              By registering, you agree to our{' '}
              <a href="/terms" className="underline hover:text-[var(--accent-color)]">Terms of Service</a> and{' '}
              <a href="/privacy" className="underline hover:text-[var(--accent-color)]">Privacy Policy</a>.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;