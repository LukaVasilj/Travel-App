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

      {/* Hero Section */}
      <section className="relative w-full mb-20" style={{ minHeight: '600px' }}>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90"
          style={{ backgroundImage: 'url(/images/travel1.jpg)' }}
        ></div>

        <div className="absolute inset-0 bg-black opacity-40"></div>

        <div className="relative z-10 text-white py-28 px-6 max-w-3xl mx-auto text-center rounded-lg">
          <h1 className="text-5xl font-bold mb-16 text-white">Welcome to Your Travel App</h1>
          <p className="text-lg mb-16">
            Plan your trips, explore new destinations, and manage your travel plans all in one place.
          </p>
          <button
            onClick={() => router.push('/register')}
            className="btn btn-primary text-xl px-8 py-3"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Main content container */}
      <main className="container text-center py-16">

        {/* Features Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-semibold mb-6 text-primary-color">Features</h2>
          <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
            <div data-aos="fade-up" className="feature-card p-6 bg-white rounded-lg shadow-md w-64">
              <h3 className="text-xl font-bold mb-2">Create Trips</h3>
              <p>Easily add new trips with dates, locations, and notes.</p>
            </div>
            <div data-aos="fade-up" data-aos-delay="100" className="feature-card p-6 bg-white rounded-lg shadow-md w-64">
              <h3 className="text-xl font-bold mb-2">User Profiles</h3>
              <p>Manage your profile and personalize your travel experience.</p>
            </div>
            <div data-aos="fade-up" data-aos-delay="200" className="feature-card p-6 bg-white rounded-lg shadow-md w-64">
              <h3 className="text-xl font-bold mb-2">Real-time Updates</h3>
              <p>Stay updated with live trip info and notifications.</p>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="mb-20 bg-primary-color text-white py-12 rounded-lg max-w-4xl mx-auto" data-aos="fade-in">
          <h2 className="text-3xl font-semibold mb-4">Why Choose Us?</h2>
          <p className="text-lg max-w-3xl mx-auto text-black">
            Our app is designed to make your travel planning seamless and enjoyable. With a clean interface and powerful features, you are always in control.
          </p>
        </section>

        {/* Testimonials Section */}
        <section className="my-20 max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-12 text-primary-color text-center" data-aos="fade-up">
            What Our Users Say
          </h2>
          <div className="flex flex-wrap gap-8 justify-center">
            <div data-aos="fade-up" className="p-6 shadow-lg rounded-lg w-72 bg-white">
              <p className="mb-4 italic">"This app transformed my travel planning – so easy and fun to use!"</p>
              <h4 className="font-bold">Ana K.</h4>
              <span className="text-sm text-gray-500">Frequent Traveler</span>
            </div>
            <div data-aos="fade-up" data-aos-delay="100" className="p-6 shadow-lg rounded-lg w-72 bg-white">
              <p className="mb-4 italic">"Real-time updates kept me informed throughout my trip."</p>
              <h4 className="font-bold">Marko S.</h4>
              <span className="text-sm text-gray-500">Adventure Seeker</span>
            </div>
            <div data-aos="fade-up" data-aos-delay="200" className="p-6 shadow-lg rounded-lg w-72 bg-white">
              <p className="mb-4 italic">"User profiles make it easy to organize my trips."</p>
              <h4 className="font-bold">Ivana T.</h4>
              <span className="text-sm text-gray-500">Digital Nomad</span>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-gray-100 py-12 px-6 rounded-lg max-w-4xl mx-auto text-center" data-aos="fade-up">
          <h3 className="text-2xl font-semibold mb-4">Stay Updated!</h3>
          <p className="mb-6 max-w-md mx-auto">Subscribe to our newsletter for the latest travel tips and offers.</p>
          <form className="flex justify-center gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="p-3 rounded-l-lg border border-gray-300 focus:outline-none"
            />
            <button type="submit" className="btn btn-primary px-6 rounded-r-lg">
              Subscribe
            </button>
            
          </form>
        </section>
        
      </main>
      
    </>
  );
};

export default Home;
