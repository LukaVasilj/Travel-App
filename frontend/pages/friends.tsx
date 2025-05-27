import AppNavbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import { Container, Form, Button, ListGroup, Alert, Row, Col, Card, Tab, Nav } from 'react-bootstrap';
import axios from 'axios';
import '../styles/profile-picture.css';

// Komponenta za prikaz rezultata pretrage
const SearchResultList = ({ results, onAddFriend }) => (
  <ListGroup variant="flush">
    {results.map(user => (
      <ListGroup.Item key={user.id} className="d-flex align-items-center">
        <img
          src={user.profile_image ? `http://localhost:8000${user.profile_image}` : "/default-profile.png"}
          alt="Profile"
          className="profile-image-circle"
          style={{ marginRight: 12, width: 40, height: 40 }}
        />
        <div className="flex-grow-1">
          <span className="fw-bold">{user.username}</span>
          <span className="text-muted ms-2" style={{ fontSize: 13 }}>{user.email}</span>
        </div>
        <Button variant="success" size="sm" onClick={() => onAddFriend(user.id)}>
          Add Friend
        </Button>
      </ListGroup.Item>
    ))}
  </ListGroup>
);

// Komponenta za prikaz zahtjeva za prijateljstvo
const FriendRequestList = ({ requests, onRespond }) => (
  <ListGroup variant="flush">
    {requests.map(req => (
      <ListGroup.Item key={req.id} className="d-flex align-items-center">
        <img
          src={req.profile_image ? `http://localhost:8000${req.profile_image}` : "/default-profile.png"}
          alt="Profile"
          className="profile-image-circle"
          style={{ marginRight: 12, width: 40, height: 40 }}
        />
        <div className="flex-grow-1">
          <span className="fw-bold">{req.username}</span>
          <span className="text-muted ms-2" style={{ fontSize: 13 }}>sent you a friend request</span>
        </div>
        <Button variant="success" size="sm" className="me-2" onClick={() => onRespond(req.id, 'accept')}>
          Accept
        </Button>
        <Button variant="outline-danger" size="sm" onClick={() => onRespond(req.id, 'reject')}>
          Reject
        </Button>
      </ListGroup.Item>
    ))}
  </ListGroup>
);

// Komponenta za prikaz liste prijatelja
const FriendList = ({ friends, onRemoveFriend }) => (
  <ListGroup variant="flush">
    {friends.map(friend => (
      <ListGroup.Item key={friend.id} className="d-flex align-items-center">
        <img
          src={friend.profile_image ? `http://localhost:8000${friend.profile_image}` : "/default-profile.png"}
          alt="Profile"
          className="profile-image-circle"
          style={{ marginRight: 12, width: 40, height: 40 }}
        />
        <div className="flex-grow-1">
          <span className="fw-bold">{friend.username}</span>
          <span className="text-muted ms-2" style={{ fontSize: 13 }}>{friend.email}</span>
        </div>
        <Button variant="outline-danger" size="sm" onClick={() => onRemoveFriend(friend.id)}>
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
  const [activeTab, setActiveTab] = useState('friends');

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
      <Container style={{ marginTop: 50, maxWidth: '900px' }}>
        <h1 className="mb-4 text-center fw-bold" style={{ letterSpacing: '-1px' }}>Friends</h1>
        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            {error}
          </Alert>
        )}

        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Form>
              <Form.Group className="mb-0">
                <Form.Label><strong>Search for Friends</strong></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username or email"
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  autoFocus
                />
              </Form.Group>
            </Form>
            {searchQuery && (
              <div className="mt-3">
                <h6 className="mb-2 text-muted">Search Results</h6>
                {searchResults.length > 0 ? (
                  <SearchResultList results={searchResults} onAddFriend={handleAddFriend} />
                ) : (
                  <p className="text-muted">No results found.</p>
                )}
              </div>
            )}
          </Card.Body>
        </Card>

        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Nav variant="tabs" className="mb-4 justify-content-center">
            <Nav.Item>
              <Nav.Link eventKey="friends" className="fw-semibold">Your Friends</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="requests" className="fw-semibold">Friend Requests</Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="friends">
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-white fw-bold">👥 Friends List</Card.Header>
                <Card.Body>
                  {friends.length > 0 ? (
                    <FriendList friends={friends} onRemoveFriend={handleRemoveFriend} />
                  ) : (
                    <p className="text-muted">You have no friends yet.</p>
                  )}
                </Card.Body>
              </Card>
            </Tab.Pane>
            <Tab.Pane eventKey="requests">
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-white fw-bold">📨 Friend Requests</Card.Header>
                <Card.Body>
                  {friendRequests.length > 0 ? (
                    <FriendRequestList requests={friendRequests} onRespond={handleRespondToRequest} />
                  ) : (
                    <p className="text-muted">No pending friend requests.</p>
                  )}
                </Card.Body>
              </Card>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Container>
    </>
  );
};

export default FriendsPage;