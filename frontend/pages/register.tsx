import AppNavbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button } from 'react-bootstrap';
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
        const response = await axios.get('http://localhost:8000/api/csrf-token', { withCredentials: true });
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
      await axios.post('http://localhost:8000/api/auth/register', {
        email,
        username,
        password,
      }, {
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        withCredentials: true,
      });

      // Redirect to email verification page or show success message
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
    <Container>
      <h1>Register</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Form>
        <Form.Group controlId="formEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
        <Form.Group controlId="formConfirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" onClick={handleRegister}>Register</Button>
      </Form>
    </Container>
    </>
  );
};

export default Register;