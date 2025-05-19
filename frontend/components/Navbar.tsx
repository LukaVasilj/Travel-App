import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Navbar, Nav, NavDropdown, Image } from 'react-bootstrap';

interface User {
  username: string;
  profile_image?: string;
}

const AppNavbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const publicRoutes = ['/', '/login', '/register'];

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);

    if (token) {
      fetch("http://localhost:8000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setUser(data);
        });
    }
  }, []);

  const isPublicRoute = publicRoutes.includes(router.pathname);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowDropdown(!showDropdown);
  };

  const handleDropdownClose = () => setShowDropdown(false);

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="/">TravelApp</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto" style={{ alignItems: "center" }}>
          {isAuthenticated && !isPublicRoute ? (
            <>
              <Nav.Link as={Link} href="/glavnastranica">Home</Nav.Link>
              <Nav.Link as={Link} href="/friends">Friends</Nav.Link>
              <Nav.Link as={Link} href="/mytrips">My Trips</Nav.Link>
              <Nav.Link as={Link} href="/sharedtrips">Shared Trips</Nav.Link>
              <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
                <span
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "1px solid #ccc",
                    background: "#fff"
                  }}
                  onClick={handleProfileClick}
                  tabIndex={0}
                  onBlur={handleDropdownClose}
                >
                  <Image
                    src={user?.profile_image ? `http://localhost:8000${user.profile_image}` : "/default-profile.png"}
                    alt="Profilna slika"
                    width={40}
                    height={40}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      display: "block"
                    }}
                  />
                </span>
                <NavDropdown
                  show={showDropdown}
                  onToggle={setShowDropdown}
                  title={null}
                  id="profile-dropdown"
                  align="end"
                  style={{ marginLeft: 0 }}
                >
                  <NavDropdown.Item as={Link} href="/profile">Profile</NavDropdown.Item>
                  <NavDropdown.Item as={Link} href="/settings">Settings</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              </div>
            </>
          ) : (
            <>
              <Nav.Link as={Link} href="/login">Login</Nav.Link>
              <Nav.Link as={Link} href="/register">Register</Nav.Link>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default AppNavbar;