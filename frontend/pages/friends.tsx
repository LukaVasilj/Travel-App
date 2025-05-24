import AppNavbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import { Container, Form, Button, ListGroup, Alert, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import '../styles/profile-picture.css'; // za .profile-image-circle

// Komponenta za prikaz rezultata pretrage
const SearchResultList = ({ results, onAddFriend }) => (
  <ListGroup>
    {results.map(user => (
      <ListGroup.Item key={user.id} className="d-flex align-items-center">
        <img
          src={user.profile_image ? `http://localhost:8000${user.profile_image}` : "/default-profile.png"}
          alt="Profilna slika"
          className="profile-image-circle"
          style={{ marginRight: 12, width: 40, height: 40 }}
        />
        <span className="flex-grow-1">
          {user.username} ({user.email})
        </span>
        <Button variant="success" onClick={() => onAddFriend(user.id)}>
          Add Friend
        </Button>
      </ListGroup.Item>
    ))}
  </ListGroup>
);

// Komponenta za prikaz zahtjeva za prijateljstvo
const FriendRequestList = ({ requests, onRespond }) => (
  <ListGroup>
    {requests.map(req => (
      <ListGroup.Item key={req.id} className="d-flex align-items-center">
        <img
          src={req.profile_image ? `http://localhost:8000${req.profile_image}` : "/default-profile.png"}
          alt="Profilna slika"
          className="profile-image-circle"
          style={{ marginRight: 12, width: 40, height: 40 }}
        />
        <span className="flex-grow-1">
          Friend request from {req.username}
        </span>
        <Button variant="success" className="me-2" onClick={() => onRespond(req.id, 'accept')}>
          Accept
        </Button>
        <Button variant="danger" onClick={() => onRespond(req.id, 'reject')}>
          Reject
        </Button>
      </ListGroup.Item>
    ))}
  </ListGroup>
);

// Komponenta za prikaz liste prijatelja
const FriendList = ({ friends, onRemoveFriend }) => (
  <ListGroup>
    {friends.map(friend => (
      <ListGroup.Item key={friend.id} className="d-flex align-items-center">
        <img
          src={friend.profile_image ? `http://localhost:8000${friend.profile_image}` : "/default-profile.png"}
          alt="Profilna slika"
          className="profile-image-circle"
          style={{ marginRight: 12, width: 40, height: 40 }}
        />
        <span className="flex-grow-1">
          {friend.username} ({friend.email})
        </span>
        <Button variant="danger" onClick={() => onRemoveFriend(friend.id)}>
          Remove
        </Button>
      </ListGroup.Item>
    ))}
  </ListGroup>
);

const FriendsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [error, setError] = useState('');

  // Funkcija za dohvat CSRF tokena
  const fetchCsrfToken = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/csrf-token', { withCredentials: true });
      return res.data.csrf_token;
    } catch {
      setError('Failed to fetch CSRF token.');
      return null;
    }
  };

  // Dohvat trenutnog korisnika
  const fetchCurrentUserId = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const res = await axios.get('http://localhost:8000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      return res.data.user_id;
    } catch {
      setError('Failed to fetch user data.');
      return null;
    }
  };

  // Učitavanje prijatelja i zahtjeva za prijateljstvo
  useEffect(() => {
    const loadUserData = async () => {
      const userId = await fetchCurrentUserId();
      if (!userId) return;

      try {
        const [friendsRes, requestsRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/friends/${userId}`),
          axios.get(`http://localhost:8000/api/friends/friend-requests/${userId}`),
        ]);

        setFriends(friendsRes.data.friends || []);
        setFriendRequests(requestsRes.data.friend_requests || []);
      } catch {
        setError('Failed to load friends data.');
      }
    };

    loadUserData();
  }, []);

  // Pretraga korisnika
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const currentUserId = await fetchCurrentUserId();
      if (!currentUserId) return;

      const res = await axios.get(`http://localhost:8000/api/auth/users?search=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const filteredUsers = res.data.users.filter(user => user.id !== currentUserId);
      setSearchResults(filteredUsers);
    } catch {
      setError('Search failed.');
    }
  };

  // Slanje zahtjeva za prijateljstvo
  const handleAddFriend = async (friendId) => {
    const userId = await fetchCurrentUserId();
    if (!userId) return;

    const csrfToken = await fetchCsrfToken();
    if (!csrfToken) return;

    try {
      await axios.post(
        'http://localhost:8000/api/friends/add-friend',
        { user_id: userId, friend_id: friendId },
        { headers: { 'X-CSRF-Token': csrfToken }, withCredentials: true }
      );
      setSearchResults(prev => prev.filter(user => user.id !== friendId));
    } catch {
      setError('Failed to send friend request.');
    }
  };

  // Odgovor na zahtjev za prijateljstvo (prihvati/odbaci)
  const handleRespondToRequest = async (requestId, action) => {
    const csrfToken = await fetchCsrfToken();
    if (!csrfToken) return;

    try {
      await axios.post(
        'http://localhost:8000/api/friends/respond-friend-request',
        { request_id: requestId, action },
        { headers: { 'X-CSRF-Token': csrfToken }, withCredentials: true }
      );
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      if (action === 'accept') {
        // Opcionalno možeš ponovno fetchati prijatelje ili ih dodati ručno ovdje
        // setFriends(prev => [...prev, newFriendObject]);
      }
    } catch {
      setError('Failed to respond to friend request.');
    }
  };

  // Uklanjanje prijatelja
  const handleRemoveFriend = async (friendId) => {
    const csrfToken = await fetchCsrfToken();
    const token = localStorage.getItem('access_token');
    if (!csrfToken || !token) {
      setError('Failed to authenticate request.');
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/friends/remove-friend/${friendId}`, {
        headers: {
          'X-CSRF-Token': csrfToken,
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setFriends(prev => prev.filter(friend => friend.id !== friendId));
    } catch {
      setError('Failed to remove friend.');
    }
  };

  return (
    <>
      <AppNavbar />
      <Container style={{ marginTop: 50, maxWidth: 600 }}>
        <h1 className="mb-4">Friends</h1>
        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Search for Friends</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
            />
          </Form.Group>
        </Form>

        <h3>Search Results</h3>
        <SearchResultList results={searchResults} onAddFriend={handleAddFriend} />

        <h3 className="mt-4">Friend Requests</h3>
        <FriendRequestList requests={friendRequests} onRespond={handleRespondToRequest} />

        <h3 className="mt-4">Your Friends</h3>
        <FriendList friends={friends} onRemoveFriend={handleRemoveFriend} />
      </Container>
    </>
  );
};

export default FriendsPage;
