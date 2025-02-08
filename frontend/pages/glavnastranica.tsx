import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Container, Button } from 'react-bootstrap';

interface User {
  username: string;
  role: string;
}

const GlavnaStranica = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No access token found');
        }
        const response = await axios.get('http://localhost:8000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        });
        setUser(response.data);
      } catch {
        router.push('/login');
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <h1>Welcome to the Main Page, {user.username}</h1>
      <p>Role: {user.role}</p>
      {/* Add your logic and functionalities here */}
      <Button variant="danger" onClick={handleLogout}>Logout</Button>
    </Container>
  );
};

export default GlavnaStranica;