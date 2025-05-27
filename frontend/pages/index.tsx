import AppNavbar from '../components/Navbar';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  FiMap,
  FiUser,
  FiRefreshCw,
  FiArrowRight,
  FiSmile,
  FiStar,
  FiGlobe,
} from 'react-icons/fi';

const featureList = [
  {
    title: 'Create Trips',
    desc: 'Easily add new trips with dates, locations, and notes.',
    icon: <FiMap size={38} color="var(--primary-color)" />,
  },
  {
    title: 'User Profiles',
    desc: 'Manage your profile and personalize your travel experience.',
    icon: <FiUser size={38} color="var(--primary-color)" />,
  },
  {
    title: 'Real-time Updates',
    desc: 'Stay updated with live trip info and notifications.',
    icon: <FiRefreshCw size={38} color="var(--primary-color)" />,
  },
];

const testimonials = [
  {
    text: '"This app transformed my travel planning – so easy and fun to use!"',
    name: 'Ana K.',
    role: 'Frequent Traveler',
    icon: <FiSmile size={28} color="var(--accent-color)" />,
  },
  {
    text: '"Real-time updates kept me informed throughout my trip."',
    name: 'Marko S.',
    role: 'Adventure Seeker',
    icon: <FiStar size={28} color="var(--accent-color)" />,
  },
  {
    text: '"User profiles make it easy to organize my trips."',
    name: 'Ivana T.',
    role: 'Digital Nomad',
    icon: <FiGlobe size={28} color="var(--accent-color)" />,
  },
];

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

      {/* Hero Section */}
      <section
        className="relative w-full flex items-center justify-center"
        style={{
          minHeight: '700px',
          background: 'linear-gradient(120deg,rgb(36, 69, 112) 0%,rgb(35, 70, 102) 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <img
          src="/images/travel1.jpg"
          alt="Travel background"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.35,
            zIndex: 1,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            zIndex: 2,
          }}
        ></div>
        <div
          className="relative z-10 flex flex-col items-center justify-center text-center"
          style={{
            padding: '80px 24px',
            maxWidth: 700,
            borderRadius: 24,
            boxShadow: '0 8px 32px rgba(21,101,192,0.15)',
            background: 'rgba(38, 66, 99, 0.47)',
            margin: '60px 0',
          }}
        >
          <h1 className="font-extrabold mb-6" style={{ fontSize: '3.2rem', color: 'white', letterSpacing: '-1px' }}>
            Welcome to <span style={{ color: 'var(--accent-color)' }}>TravelApp</span>
          </h1>
          <p className="mb-8" style={{ fontSize: '1.6rem', color: 'white', fontWeight: 500 }}>
            Plan your trips, explore new destinations, and manage your travel plans all in one place.
          </p>
          <button
            onClick={() => router.push('/register')}
            className="btn btn-primary text-xl px-8 py-3"
            style={{ fontSize: '1.2rem', minWidth: 200 }}
          >
            Get Started 
          </button>
        </div>
      </section>

      {/* Main content container */}
      <main className="container text-center py-16">

        {/* Features Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-semibold mb-8 text-primary-color" style={{ fontWeight: 800 }}>
            Features
          </h2>
          <div className="row g-4 justify-content-center">
            {featureList.map(({ title, desc, icon }, idx) => (
              <div
                key={idx}
                className="col-12 col-sm-6 col-lg-4 d-flex"
                style={{ minWidth: 260, marginBottom: 24 }}
              >
                <div className="feature-card bg-white rounded shadow-sm p-4 w-100 text-center d-flex flex-column align-items-center h-100">
                  <div className="mb-3">{icon}</div>
                  <h3 className="mb-2 text-primary-color" style={{ fontWeight: 700 }}>{title}</h3>
                  <p style={{ color: '#444', fontSize: '1.05rem' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section
          className="mb-20"
          style={{
            color: 'black',
            borderRadius: 24,
            padding: '56px 24px',
            maxWidth: 900,
            margin: '0 auto',
          }}
        >
          <h2 className="text-3xl font-semibold mb-4" style={{ fontWeight: 800 }}>
            Why Choose Us?
          </h2>
          <p className="text-lg max-w-3xl mx-auto" style={{ color: '#000', fontSize: '1.18rem' }}>
            Our app is designed to make your travel planning seamless and enjoyable. With a clean interface and powerful features, you are always in control.
          </p>
        </section>

        {/* Testimonials Section */}
        <section className="my-20 max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-12 text-primary-color text-center" style={{ fontWeight: 800 }}>
            What Our Users Say
          </h2>
          <div className="row g-4 justify-content-center">
            {testimonials.map(({ text, name, role, icon }, idx) => (
              <div
                key={idx}
                className="col-12 col-md-4 d-flex"
                style={{ minWidth: 260, marginBottom: 24 }}
              >
                <div className="bg-white shadow-lg rounded-lg w-100 p-5 d-flex flex-column align-items-center h-100">
                  <div className="mb-3">{icon}</div>
                  <p className="mb-4 italic" style={{ color: '#222', fontSize: '1.08rem' }}>{text}</p>
                  <h4 className="font-bold mb-1" style={{ color: 'var(--primary-color)' }}>{name}</h4>
                  <span className="text-sm text-gray-500">{role}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Newsletter & Footer Section - full width */}
      <section
        style={{
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          background: 'linear-gradient(120deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
          borderRadius: '0 0 32px 32px',
          marginBottom: 0,
          paddingBottom: 0,
          paddingTop: 64,
          zIndex: 10,
        }}
        className="text-white"
      >
        <div className="max-w-2xl mx-auto text-center" style={{ padding: '0 1rem' }}>
          <h2 className="mb-4" style={{ color: "white", fontWeight: 800, fontSize: '2.2rem' }}>
            Stay Updated!
          </h2>
          <p className="mb-5" style={{ fontSize: '1.15rem', color: '#f3f3f3' }}>
            Subscribe to our newsletter for the latest travel tips and offers.
          </p>
          <form
            className="d-flex flex-column flex-sm-row justify-content-center gap-3 max-w-600 mx-auto"
            onSubmit={(e) => e.preventDefault()}
            style={{ maxWidth: 600, margin: '0 auto' }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="form-control"
              style={{ maxWidth: '400px', borderRadius: 8, fontSize: '1.1rem' }}
            />
            <button type="submit" className="btn btn-secondary px-4" style={{ fontWeight: 600 }}>
              Subscribe
            </button>
          </form>
        </div>
        <footer
          className="text-center py-6 mt-8"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.18)',
            color: 'white',
            width: '100%',
            marginTop: 48,
            background: 'transparent',
            borderRadius: 0,
          }}
        >
          <p style={{ margin: 0, fontWeight: 500 }}>
            &copy; {new Date().getFullYear()} TravelApp. All rights reserved.
          </p>
        </footer>
      </section>
    </>
  );
};

export default Home;