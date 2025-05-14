import AppNavbar from '../components/Navbar';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const response = await axios.get('http://localhost:8000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            withCredentials: true
          });
          const userRole = response.data.role;
          if (userRole === 'admin') {
            router.push('/dashboard');
          } else {
            router.push('/glavnastranica');
          }
        }
      } catch {
        // User is not authenticated, stay on the home page
      }
    };
    checkAuth();
  }, [router]);

  return (
    <>
      <AppNavbar />
    <div>
      <h1>Welcome to the Home Page</h1>
      <p>Please log in to access the main page.</p>
    </div>
    </>
  );
};

export default Home;