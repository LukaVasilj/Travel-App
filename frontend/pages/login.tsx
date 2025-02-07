import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const router = useRouter();

  // Function to fetch CSRF token from the backend
  const fetchCsrfToken = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/csrf-token', { credentials: 'include' });
      const data = await response.json();
      // If the token is returned as an array, extract the first element; otherwise, use it directly.
      const token = Array.isArray(data.csrf_token) ? data.csrf_token[0] : data.csrf_token;
      return token;
    } catch (error) {
      console.error("Error fetching CSRF token:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadCsrfToken = async () => {
      const token = await fetchCsrfToken();
      if (token) {
        setCsrfToken(token);
        console.log("CSRF token fetched:", token);
      } else {
        console.error("CSRF token fetch failed");
      }
    };
    loadCsrfToken();
  }, []);

  const handleLogin = async () => {
    if (!csrfToken) {
      console.error("CSRF token is missing, cannot proceed with login");
      return;
    }

    try {
      console.log("Logging in user with CSRF token:", csrfToken);
      const response = await axios.post(
        'http://localhost:8000/api/auth/login',
        { username, password, otp_code: otpCode },
        {
          headers: { 
            'X-CSRF-Token': csrfToken, 
            'Content-Type': 'application/json' 
          },
          withCredentials: true,
        }
      );
      console.log("Login successful:", response.data);
      // Store the JWT token in localStorage
      localStorage.setItem('access_token', response.data.access_token);
      // Fetch user role
      const userResponse = await axios.get('http://localhost:8000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${response.data.access_token}`
        },
        withCredentials: true
      });
      const userRole = userResponse.data.role;
      // Redirect based on user role
      if (userRole === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/glavnastranica');
      }
    } catch (error) {
      console.error("Error during login:", error);
      if (axios.isAxiosError(error) && error.response) {
        alert(error.response.data.detail || 'Login failed');
      } else {
        alert('Login failed');
      }
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input 
        type="text" 
        placeholder="Username" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <input 
        type="text" 
        placeholder="2FA Code" 
        value={otpCode} 
        onChange={(e) => setOtpCode(e.target.value)} 
      />
      <button onClick={handleLogin}>Login</button>
      <a href="http://localhost:8000/auth/login/google">Login with Google</a>
    </div>
  );
};

export default Login;