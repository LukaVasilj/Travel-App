import AppNavbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import { Container, Form, Button, ListGroup, Alert } from 'react-bootstrap';
import axios from 'axios';
import '../styles/profile-picture.css'; // za .profile-image-circle


const FriendsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [error, setError] = useState('');

  // Fetch CSRF token
  const getCsrfToken = async () => {
    try {
      console.log('Fetching CSRF token...');
      const response = await axios.get('http://localhost:8000/api/csrf-token', { withCredentials: true });
      console.log('CSRF token fetched:', response.data.csrf_token);
      return response.data.csrf_token;
    } catch (err) {
      console.error('Error fetching CSRF token:', err);
      return null;
    }
  };

  // Fetch current user ID
  const getCurrentUserId = async () => {
    try {
      const token = localStorage.getItem('access_token'); // Pretpostavljam da token čuvate u localStorage
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await axios.get('http://localhost:8000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response.data.user_id; // Pretpostavljam da backend vraća user_id
    } catch (err) {
      console.error('Error fetching current user ID:', err);
      return null;
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = await getCurrentUserId();
      if (!userId) {
        setError('Failed to fetch user ID.');
        return;
      }

      // Fetch the current user's friends
      const fetchFriends = async () => {
        try {
          console.log(`Fetching friends for user ID: ${userId}`);
          const response = await axios.get(`http://localhost:8000/api/friends/${userId}`);
          console.log('Friends fetched:', response.data.friends);
          setFriends(response.data.friends);
        } catch (err) {
          console.error('Error fetching friends:', err);
        }
      };

      // Fetch friend requests
      const fetchFriendRequests = async () => {
        try {
          console.log(`Fetching friend requests for user ID: ${userId}`);
          const response = await axios.get(`http://localhost:8000/api/friends/friend-requests/${userId}`);
          console.log('Friend requests fetched:', response.data.friend_requests);
          setFriendRequests(response.data.friend_requests);
        } catch (err) {
          console.error('Error fetching friend requests:', err);
        }
      };

      fetchFriends();
      fetchFriendRequests();
    };

    fetchUserData();
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query) {
      console.log('Search query is empty, clearing results.');
      setSearchResults([]);
      return;
    }

    try {
      console.log(`Searching for users with query: ${query}`);
      const token = localStorage.getItem('access_token'); // Dohvatite token
      if (!token) {
        throw new Error('No access token found');
      }

      const currentUserId = await getCurrentUserId(); // Dohvatite trenutnog korisnika
      const response = await axios.get(`http://localhost:8000/api/auth/users?search=${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      // Filtrirajte rezultate da izbacite trenutnog korisnika
      const filteredResults = response.data.users.filter((user) => user.id !== currentUserId);
      console.log('Filtered search results:', filteredResults);
      setSearchResults(filteredResults);
    } catch (err) {
      console.error('Error searching users:', err);
    }
  };

  const handleAddFriend = async (friendId) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        setError('Failed to fetch user ID.');
        return;
      }

      console.log(`Sending friend request from user ID: ${userId} to friend ID: ${friendId}`);
      const csrfToken = await getCsrfToken();
      if (!csrfToken) {
        console.error('Failed to fetch CSRF token.');
        setError('Failed to fetch CSRF token.');
        return;
      }

      const response = await axios.post(
        'http://localhost:8000/api/friends/add-friend',
        {
          user_id: userId,
          friend_id: friendId,
        },
        {
          headers: {
            'X-CSRF-Token': csrfToken,
          },
          withCredentials: true,
        }
      );

      console.log('Friend request sent successfully:', response.data);
      setSearchResults((prev) => prev.filter((user) => user.id !== friendId));
    } catch (err) {
      if (err.response) {
        console.error('Backend error:', err.response.data);
      } else {
        console.error('Error adding friend:', err);
      }
      setError('Failed to send friend request. Please try again.');
    }
  };

  const handleRespondToRequest = async (requestId, action) => {
    try {
      const csrfToken = await getCsrfToken();
      if (!csrfToken) {
        console.error('Failed to fetch CSRF token.');
        setError('Failed to fetch CSRF token.');
        return;
      }

      await axios.post(
        'http://localhost:8000/api/friends/respond-friend-request',
        {
          request_id: requestId,
          action: action,
        },
        {
          headers: {
            'X-CSRF-Token': csrfToken,
          },
          withCredentials: true,
        }
      );

      console.log(`Friend request ${action}ed successfully.`);
      setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
      if (action === 'accept') {
        setFriends((prev) => [...prev, requestId]);
      }
    } catch (err) {
      console.error('Error responding to friend request:', err);
      setError('Failed to respond to friend request. Please try again.');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      const csrfToken = await getCsrfToken();
      const token = localStorage.getItem('access_token'); // Dohvatite token iz localStorage
      console.log(`Token: ${token}`);

      if (!csrfToken || !token) {
        console.error('Failed to fetch CSRF token or access token.');
        setError('Failed to fetch CSRF token or access token.');
        return;
      }

      console.log(`Removing friend with ID: ${friendId}`);
      await axios.delete(`http://localhost:8000/api/friends/remove-friend/${friendId}`, {
        headers: {
          'X-CSRF-Token': csrfToken,
          Authorization: `Bearer ${token}`, // Dodajte token u zaglavlje
        },
        withCredentials: true,
      });

      console.log('Friend removed successfully.');
      setFriends((prev) => prev.filter((friend) => friend.id !== friendId));
    } catch (err) {
      console.error('Error removing friend:', err);
      setError('Failed to remove friend. Please try again.');
    }
  };

  return (
    <>
      <AppNavbar />
      <Container style={{ marginTop: '50px', maxWidth: '600px' }}>
        <h1>Friends</h1>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group>
            <Form.Label>Search for Friends</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </Form.Group>
        </Form>
        <h3 style={{ marginTop: '30px' }}>Search Results</h3>
        <ListGroup>
          {searchResults.map((user) => (
            <ListGroup.Item key={user.id} style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={user.profile_image ? `http://localhost:8000${user.profile_image}` : "/default-profile.png"}
                alt="Profilna slika"
                className="profile-image-circle"
                style={{ marginRight: 12, width: 40, height: 40 }}
              />
              <span style={{ flex: 1 }}>
                {user.username} ({user.email})
              </span>
              <Button
                variant="success"
                style={{ float: 'right' }}
                onClick={() => handleAddFriend(user.id)}
              >
                Add Friend
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
        <h3 style={{ marginTop: '30px' }}>Friend Requests</h3>
        <ListGroup>
          {friendRequests.map((req) => (
            <ListGroup.Item key={req.id} style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={req.profile_image ? `http://localhost:8000${req.profile_image}` : "/default-profile.png"}
                alt="Profilna slika"
                className="profile-image-circle"
                style={{ marginRight: 12, width: 40, height: 40 }}
              />
              <span style={{ flex: 1 }}>
                Friend request from user: {req.username}
              </span>
              <Button variant="success" onClick={() => handleRespondToRequest(req.id, 'accept')}>
                Accept
              </Button>
              <Button variant="danger" onClick={() => handleRespondToRequest(req.id, 'reject')}>
                Reject
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
        <h3 style={{ marginTop: '30px' }}>Your Friends</h3>
        <ListGroup>
          {friends.map((friend) => (
            <ListGroup.Item key={friend.id} style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={friend.profile_image ? `http://localhost:8000${friend.profile_image}` : "/default-profile.png"}
                alt="Profilna slika"
                className="profile-image-circle"
                style={{ marginRight: 12, width: 40, height: 40 }}
              />
              <span style={{ flex: 1 }}>
                {friend.username} ({friend.email})
              </span>
              <Button
                variant="danger"
                style={{ float: 'right' }}
                onClick={() => handleRemoveFriend(friend.id)}
              >
                Remove
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Container>
    </>
  );
};

export default FriendsPage;