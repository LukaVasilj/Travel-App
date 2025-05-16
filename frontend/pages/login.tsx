import AppNavbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { signIn } from 'next-auth/react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(''); // Dodano stanje za greške
  const router = useRouter();

  const fetchCsrfToken = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/csrf-token', { credentials: 'include' });
      const data = await response.json();
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

  useEffect(() => {
    if (router.query.message) {
      setMessage(router.query.message as string);
    }
  }, [router.query]);

  const handleLogin = async () => {
    setError(''); // Resetovanje greške

    // Validacija unosa
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      console.log("Logging in user with CSRF token:", csrfToken);
      const response = await axios.post(
        'http://localhost:8000/api/auth/login',
        { email, password },
        {
          headers: { 
            'X-CSRF-Token': csrfToken, 
            'Content-Type': 'application/json' 
          },
          withCredentials: true,
        }
      );
      console.log("Login successful:", response.data);

      localStorage.setItem('access_token', response.data.access_token);

      const userResponse = await axios.get('http://localhost:8000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${response.data.access_token}`
        },
        withCredentials: true
      });
      const userRole = userResponse.data.role;

      if (userRole === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/glavnastranica');
      }
    } catch (error) {
      console.error("Error during login:", error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.detail || 'Invalid email or password.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <>
      <AppNavbar />
      <Container>
        <h1>Login</h1>
        {message && (
          <Alert variant="success">
            {message === 'verified' && 'Your email has been successfully verified. You can now log in.'}
            {message === 'already_verified' && 'Your email is already verified. Please log in.'}
          </Alert>
        )}
        {error && <Alert variant="danger">{error}</Alert>} {/* Prikaz greške */}
        <Form>
          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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