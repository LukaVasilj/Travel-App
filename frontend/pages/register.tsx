import { useState, useEffect } from 'react';
import axios from 'axios';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        console.log("Fetching CSRF token...");
        const response = await axios.get('http://localhost:8000/api/csrf-token', { withCredentials: true });
        console.log("CSRF token fetched:", response.data.csrf_token);
        setCsrfToken(response.data.csrf_token);
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    };
    fetchCsrfToken();
  }, []);

  const handleRegister = async () => {
    try {
      console.log("Registering user with CSRF token:", csrfToken);
      const response = await axios.post('http://localhost:8000/api/auth/register', { username, password }, {
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        withCredentials: true,
      });
      console.log("Registration successful:", response.data);
      alert('Registration successful');
      setQrCode(response.data.qr_code);
    } catch (error) {
      console.error("Error during registration:", error);
      if (axios.isAxiosError(error) && error.response) {
        alert(error.response.data.detail || 'Registration failed');
      } else {
        alert('Registration failed');
      }
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Register</button>
      {qrCode && (
        <div>
          <h2>Scan this QR code with your authenticator app</h2>
          <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" />
        </div>
      )}
    </div>
  );
};

export default Register;