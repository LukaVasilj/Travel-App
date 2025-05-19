import React, { useEffect, useState } from "react";
import AppNavbar from '../components/Navbar';
import '../styles/profile-picture.css'; // Dodaj ovo ako već nije importano globalno

interface User {
  user_id: number;
  username: string;
  email: string;
  role: string;
  profile_image?: string;
}

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Dohvati CSRF token na mount
  useEffect(() => {
    fetch("http://localhost:8000/api/csrf-token", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        setCsrfToken(data.csrf_token);
        localStorage.setItem("csrf_token", data.csrf_token);
      });
  }, []);

  // Dohvati podatke o korisniku
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("http://localhost:8000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        // handle error
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  // Upload slike s CSRF tokenom
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("access_token");
    const csrf = csrfToken || localStorage.getItem("csrf_token") || "";

    const res = await fetch("http://localhost:8000/api/auth/upload-profile-image", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-CSRF-Token": csrf,
      },
      body: formData,
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      setUser((prev) => prev ? { ...prev, profile_image: data.profile_image } : prev);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Niste prijavljeni.</div>;

  return (
    <>
      <AppNavbar />
      <div style={{ maxWidth: 500, margin: "2rem auto", padding: 24, border: "1px solid #eee", borderRadius: 8 }}>
        <h1>Profil</h1>
        <img
          src={user.profile_image ? `http://localhost:8000${user.profile_image}` : "/default-profile.png"}
          alt="Profilna slika"
          className="profile-image-circle"
        />
        <div style={{ marginBottom: 16 }}>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>
        <p><strong>Korisničko ime:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Uloga:</strong> {user.role}</p>
      </div>
    </>
  );
};

export default ProfilePage;