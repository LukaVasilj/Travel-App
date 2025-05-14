import AppNavbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Container, Form, Button } from 'react-bootstrap';
import { signIn } from 'next-auth/react';

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
    <>

    <AppNavbar />

    <Container>
      <h1>Login</h1>
      <Form>
        <Form.Group controlId="formUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="formOtpCode">
          <Form.Label>2FA Code</Form.Label>
          <Form.Control type="text" placeholder="Enter 2FA code" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
        </Form.Group>
        <Button variant="primary" onClick={handleLogin}>Login</Button>
      </Form>
      <Button variant="secondary" onClick={() => signIn('google', { callbackUrl: '/' })}>
  Login with Google
</Button>

    </Container>
    </>
  );
};

export default Login;