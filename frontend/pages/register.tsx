import AppNavbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
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

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

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
  };

  return (
    <>
      <AppNavbar />
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)] px-4">
        <div className="w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl p-10 transition-all">
          <h1 className="text-4xl font-extrabold text-center text-[var(--primary-color)] mb-8 tracking-tight">Create an Account</h1>
          {error && <p className="text-red-500 text-center mb-6 font-semibold">{error}</p>}
          <form className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121212] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)]"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121212] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)]"
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
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121212] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)]"
              />
            </div>
            <button
              type="button"
              onClick={handleRegister}
              className="btn btn-primary w-full text-lg"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
