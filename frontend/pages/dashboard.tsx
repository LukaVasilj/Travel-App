import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Container, Button } from 'react-bootstrap';

interface User {
  username: string;
  role: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No access token found');
        }
        const response = await axios.get('/api/check-auth', {
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
    checkAuth();
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
      <h1>Welcome to the Dashboard, {user.username}</h1>
      <p>Role: {user.role}</p>
      {/* Add your logic and functionalities here */}
      <Button variant="danger" onClick={handleLogout}>Logout</Button>
    </Container>
  );
};

export default Dashboard;