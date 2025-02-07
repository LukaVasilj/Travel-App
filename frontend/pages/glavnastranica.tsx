import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

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
    <div>
      <h1>Welcome to the Main Page, {user.username}</h1>
      <p>Role: {user.role}</p>
      {/* Add your logic and functionalities here */}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default GlavnaStranica;