import AppNavbar from '../components/Navbar';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Container } from 'react-bootstrap';

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
        if (!token) throw new Error('No access token found');

        const response = await axios.get('http://localhost:8000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setUser(response.data);
      } catch {
        router.push('/login');
      }
    };
    fetchUser();
  }, [router]);

  const handleCreateTrip = () => router.push('/trips/new');
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <>
      <AppNavbar />

      {/* Hero Section with Background */}
      <section className="relative w-full mb-20" style={{ minHeight: '600px' }}>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90"
          style={{ backgroundImage: 'url(/images/travel.jpg)' }}
        ></div>

        <div className="absolute inset-0 bg-black opacity-40"></div>

        <div className="relative z-10 text-white py-32 px-6 max-w-4xl mx-auto text-center rounded-lg">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-8 text-white">
            Welcome, <span className="text-primary-color">{user.username}</span>!
          </h1>
          <p className="text-2xl md:text-3xl mb-10 font-medium">
            Plan your trip quickly and easily with TravelApp.
          </p>
          <button
            onClick={handleCreateTrip}
            className="btn btn-primary text-lg px-6 py-3"
          >
            Create New Trip
          </button>
        </div>
      </section>

      <Container className="container">

        {/* Feature Highlights */}
        <section className="mb-20 d-flex justify-content-between flex-wrap gap-4">
          {[
            {
              title: 'Easy Planning',
              desc: 'Easily create and track your trips with our intuitive interface.',
              icon: '🗺️',
            },
            {
              title: 'Data Security',
              desc: 'Your data is safe and protected with modern technologies.',
              icon: '🔒',
            },
            {
              title: '24/7 Support',
              desc: 'Our team is available to help you anytime.',
              icon: '📞',
            },
            {
              title: 'Personalized Offers',
              desc: 'Receive exclusive offers tailored to your interests.',
              icon: '🎁',
            },
          ].map(({ title, desc, icon }, idx) => (
            <div
              key={idx}
              className="bg-white rounded shadow-sm p-4 text-center flex-grow"
              style={{ minWidth: '250px', flexBasis: '23%' }}
            >
              <div className="display-4 mb-3">{icon}</div>
              <h3 className="mb-2 text-primary-color">{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </section>

        {/* Latest Trips */}
        <section className="mb-20">
          <h2 className="text-center text-primary-color mb-5">Your Latest Trips</h2>
          <div className="d-flex flex-wrap justify-content-center gap-4">
            {[
              { name: 'Summer Vacation in Dubrovnik', date: '07/10/2025 - 07/20/2025' },
              { name: 'Winter Holiday in the Alps', date: '12/01/2024 - 12/15/2024' },
              { name: 'Visit to European Cities', date: '04/05/2025 - 04/15/2025' },
            ].map(({ name, date }, idx) => (
              <div
                key={idx}
                className="bg-white rounded shadow p-4"
                style={{ minWidth: '280px', maxWidth: '320px' }}
              >
                <h4 className="text-primary-color mb-2">{name}</h4>
                <p className="text-muted mb-3">Date: {date}</p>
                <button className="btn btn-primary w-100">Details</button>
              </div>
            ))}
          </div>
        </section>

        {/* Statistics Section */}
        <section className="text-center mb-20">
          <h2 className="text-primary-color mb-5">Your Statistics</h2>
          <div className="d-flex justify-content-center gap-5 flex-wrap">
            {[
              { label: 'Number of Trips', value: 12 },
              { label: 'Distance (km)', value: 4820 },
              { label: 'Spent (€)', value: 3890 }
            ].map(({ label, value }, idx) => (
              <div key={idx} className="bg-white shadow rounded p-4" style={{ minWidth: '180px' }}>
                <h3 className="text-primary-color mb-2">{value}</h3>
                <p>{label}</p>
              </div>
            ))}
          </div>
        </section>
      </Container>

      {/* Newsletter Section */}
      <section
        className="py-12 px-4 text-white rounded"
        style={{ backgroundColor: 'var(--primary-color)' }}
      >
        <h2 className="text-center mb-4">Subscribe to our Newsletter</h2>
        <p className="text-center mb-5 max-w-600 mx-auto">
          Be the first to learn about new offers and exclusive deals.
        </p>
        <form
          className="d-flex flex-column flex-sm-row justify-content-center gap-3 max-w-600 mx-auto"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="Your email address"
            required
            className="form-control"
            style={{ maxWidth: '400px' }}
          />
          <button type="submit" className="btn btn-secondary px-4">
            Subscribe
          </button>
        </form>

        {/* Footer full width */}
        <footer
          className="text-center py-6 mt-12"
          style={{
            borderTop: '1px solid var(--primary-color)',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            width: '100%',
            position: 'relative',
            left: 0,
            bottom: 0,
          }}
        >
          <p>&copy; {new Date().getFullYear()} TravelApp. All rights reserved.</p>
        </footer>
      </section>
    </>
  );
};

export default GlavnaStranica;
