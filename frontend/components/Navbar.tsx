import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Navbar, Nav, Button, NavDropdown } from 'react-bootstrap';

const AppNavbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Provjera postoji li JWT token u localStorage
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    // Ukloni token iz localStorage i preusmjeri na login
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="/">TravelApp</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          {isAuthenticated ? (
            <>
              <Nav.Link as={Link} href="/glavnastranica">Home</Nav.Link>
              <Nav.Link as={Link} href="/friends">Friends</Nav.Link>
              <Nav.Link as={Link} href="/mytrips">My Trips</Nav.Link>
              <Nav.Link as={Link} href="/sharedtrips">Shared Trips</Nav.Link>
              <NavDropdown title="Account" id="basic-nav-dropdown">
                <NavDropdown.Item as={Link} href="/profile">Profile</NavDropdown.Item>
                <NavDropdown.Item as={Link} href="/settings">Settings</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
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