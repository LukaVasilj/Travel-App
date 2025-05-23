import AppNavbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
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

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
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
  };

  return (
    <>
      <AppNavbar />
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)] px-4">
        <div className="w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl p-10 transition-all">
          <h1 className="text-4xl font-extrabold text-center text-[var(--primary-color)] mb-8 tracking-tight">Login</h1>

          {message && (
            <p className="text-green-600 text-center mb-6 font-semibold">
              {message === 'verified' && 'Your email has been successfully verified. You can now log in.'}
              {message === 'already_verified' && 'Your email is already verified. Please log in.'}
            </p>
          )}

          {error && <p className="text-red-500 text-center mb-6 font-semibold">{error}</p>}

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121212] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)]"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121212] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)]"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full text-lg"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
