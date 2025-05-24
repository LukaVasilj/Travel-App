import React, { useEffect, useState } from "react";
import AppNavbar from '../components/Navbar';
import '../styles/profile-picture.css';

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
  const [selectedFileName, setSelectedFileName] = useState<string>("");

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);  // postavi ime datoteke za prikaz
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
      setUser(prev => prev ? { ...prev, profile_image: data.profile_image } : prev);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Niste prijavljeni.</div>;

  return (
    <>
      <AppNavbar />
      <div className="profile-container">
        <h1 className="profile-title">Profil</h1>
        <img
          src={user.profile_image ? `http://localhost:8000${user.profile_image}` : "/default-profile.png"}
          alt="Profilna slika"
          className="profile-image-circle"
        />
        <div className="file-input-wrapper">
          <label htmlFor="file-upload" className="file-input-label">
            Odaberi novu profilnu sliku
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="file-input"
          />
          <div className="file-name">
            {selectedFileName || "Nije odabrana nijedna datoteka"}
          </div>
        </div>
        <div className="profile-info">
          <p><strong>Korisničko ime:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Uloga:</strong> {user.role}</p>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
