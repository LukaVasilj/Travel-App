import AppNavbar from "../components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import {
  FiMap,
  FiLock,
  FiPhoneCall,
  FiGift,
  FiArrowRight,
  FiTrendingUp,
  FiGlobe,
  FiCalendar,
} from "react-icons/fi";

interface User {
  username: string;
  role: string;
}

const featureList = [
  {
    title: "Easy Planning",
    desc: "Create, organize and track your trips with a modern, intuitive interface.",
    icon: <FiMap size={38} color="var(--primary-color)" />,
  },
  {
    title: "Data Security",
    desc: "Your data is protected with the latest security standards and encryption.",
    icon: <FiLock size={38} color="var(--primary-color)" />,
  },
  {
    title: "24/7 Support",
    desc: "Our support team is available for you at any time, every day.",
    icon: <FiPhoneCall size={38} color="var(--primary-color)" />,
  },
  {
    title: "Personalized Offers",
    desc: "Get exclusive offers and recommendations tailored to your interests.",
    icon: <FiGift size={38} color="var(--primary-color)" />,
  },
];

const latestTrips = [
  {
    name: "Summer Vacation in Dubrovnik",
    date: "07/10/2025 - 07/20/2025",
    image: "/images/dubrovnik.jpg",
  },
  {
    name: "Winter Holiday in the Alps",
    date: "12/01/2024 - 12/15/2024",
    image: "/images/alps.jpg",
  },
  {
    name: "Visit to European Cities",
    date: "04/05/2025 - 04/15/2025",
    image: "/images/paris.jpg",
  },
];

const stats = [
  {
    label: "Number of Trips",
    value: 12,
    icon: <FiCalendar size={32} color="var(--primary-color)" />,
  },
  {
    label: "Distance (km)",
    value: 4820,
    icon: <FiGlobe size={32} color="var(--primary-color)" />,
  },
  {
    label: "Spent (€)",
    value: 3890,
    icon: <FiTrendingUp size={32} color="var(--primary-color)" />,
  },
];

const GlavnaStranica = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("No access token found");

        const response = await axios.get("http://localhost:8000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setUser(response.data);
      } catch {
        router.push("/login");
      }
    };
    fetchUser();
  }, [router]);

  const handleCreateTrip = () => router.push("/trips/new");
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  if (!user) return <div>Loading...</div>;

  return (
    <>
      <AppNavbar />

      {/* Hero Section */}
      <section
        className="relative w-full flex items-center justify-center"
        style={{
          minHeight: "600px",
          background: "linear-gradient(120deg, #1565C0 0%, #1E88E5 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <img
          src="/images/travel.jpg"
          alt="Travel background"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.99,
            zIndex: 1,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(120deg, rgba(108, 123, 141, 0.29) 0%, rgba(11, 90, 159, 0.41) 100%)",
            zIndex: 2,
          }}
        ></div>
        <div
          className="relative z-10 flex flex-col items-center justify-center text-center"
          style={{
            padding: "80px 24px",
            maxWidth: 700,
            borderRadius: 24,
            boxShadow: "0 8px 32px rgba(21,101,192,0.15)",
            background: "rgba(9, 44, 82, 0.55)",
            margin: "60px 0",
          }}
        >
          <h1
            className="font-extrabold mb-6"
            style={{
              fontSize: "3.2rem",
              color: "white",
              letterSpacing: "-1px",
            }}
          >
            Welcome,{" "}
            <span style={{ color: "var(--accent-color)" }}>
              {user.username}
            </span>
            !
          </h1>
          <p
            className="mb-8"
            style={{ fontSize: "1.6rem", color: "white", fontWeight: 500 }}
          >
            Plan, organize and enjoy your journeys with{" "}
            <span style={{ color: "var(--accent-color)" }}>TravelApp</span>.
          </p>
          <button
            onClick={handleCreateTrip}
            className="btn btn-primary text-lg px-6 py-3"
            style={{ fontSize: "1.2rem", minWidth: 200 }}
          >
            Create New Trip
          </button>
        </div>
      </section>

      {/* Features */}
      <Container className="container">
        <section className="mb-20">
          <div className="row g-4 justify-content-center">
            {featureList.map(({ title, desc, icon }, idx) => (
              <div
                key={idx}
                className="col-12 col-sm-6 col-lg-3 d-flex"
                style={{ minWidth: 260, marginBottom: 24 }}
              >
                <div className="feature-card bg-white rounded shadow-sm p-4 w-100 text-center d-flex flex-column align-items-center h-100">
                  <div className="mb-3">{icon}</div>
                  <h3
                    className="mb-2 text-primary-color"
                    style={{ fontWeight: 700 }}
                  >
                    {title}
                  </h3>
                  <p style={{ color: "#444", fontSize: "1.05rem" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Latest Trips */}
        <section className="mb-20">
          <h2
            className="text-center text-primary-color mb-5"
            style={{ fontWeight: 800 }}
          >
            Your Latest Trips
          </h2>
          <div className="row g-4 justify-content-center">
            {latestTrips.map(({ name, date, image }, idx) => (
              <div
                key={idx}
                className="col-12 col-md-6 col-lg-4 d-flex"
                style={{ minWidth: 280, maxWidth: 350, marginBottom: 24 }}
              >
                <div
                  className="bg-white rounded shadow p-0 w-100 d-flex flex-column h-100"
                  style={{ overflow: "hidden" }}
                >
                  <div
                    style={{ height: 170, width: "100%", overflow: "hidden" }}
                  >
                    <img
                      src={image}
                      alt={name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                      }}
                    />
                  </div>
                  <div className="p-4 flex-grow-1 d-flex flex-column justify-content-between">
                    <div>
                      <h4
                        className="text-primary-color mb-2"
                        style={{ fontWeight: 700 }}
                      >
                        {name}
                      </h4>
                      <p
                        className="text-muted mb-3"
                        style={{ fontSize: "1.05rem" }}
                      >
                        Date: {date}
                      </p>
                    </div>
                    <button
                      className="btn btn-primary w-100 mt-auto"
                      style={{ fontWeight: 600 }}
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Statistics */}
        <section className="text-center mb-20">
          <h2 className="text-primary-color mb-5" style={{ fontWeight: 800 }}>
            Your Statistics
          </h2>
          <div className="row g-4 justify-content-center">
            {stats.map(({ label, value, icon }, idx) => (
              <div
                key={idx}
                className="col-12 col-md-4 d-flex"
                style={{ minWidth: 180, marginBottom: 24 }}
              >
                <div className="bg-white shadow rounded p-4 w-100 d-flex flex-column align-items-center">
                  <div className="mb-2">{icon}</div>
                  <h3
                    className="text-primary-color mb-2"
                    style={{ fontWeight: 700, fontSize: "2.2rem" }}
                  >
                    {value}
                  </h3>
                  <p style={{ color: "#444", fontSize: "1.08rem" }}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Container>

      {/* Newsletter & Footer Section - all in one */}
      <section
        className="py-12 px-4 text-white"
        style={{
          background:
            "linear-gradient(120deg, var(--primary-color) 0%, var(--secondary-color) 100%)",
          marginBottom: 0,
          paddingBottom: 0,
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="mb-4"
            style={{ color: "white", fontWeight: 800, fontSize: "2.2rem" }}
          >
            Subscribe to our Newsletter
          </h2>
          <p className="mb-5" style={{ fontSize: "1.15rem", color: "#f3f3f3" }}>
            Be the first to learn about new offers and exclusive deals.
          </p>
          <form
            className="d-flex flex-column flex-sm-row justify-content-center gap-3 max-w-600 mx-auto"
            onSubmit={(e) => e.preventDefault()}
            style={{ maxWidth: 600, margin: "0 auto" }}
          >
            <input
              type="email"
              placeholder="Your email address"
              required
              className="form-control"
              style={{ maxWidth: "400px", borderRadius: 8, fontSize: "1.1rem" }}
            />
            <button
              type="submit"
              className="btn btn-secondary px-4"
              style={{ fontWeight: 600 }}
            >
              Subscribe
            </button>
          </form>
        </div>
        <footer
          className="text-center py-6 mt-8"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.18)",
            color: "white",
            width: "100%",
            marginTop: 48,
            background: "transparent",
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

export default GlavnaStranica;
