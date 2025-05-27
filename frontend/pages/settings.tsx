import { useState } from 'react';
import AppNavbar from '../components/Navbar';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';

const SettingsPage = () => {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState(true);

  const handleChangePassword = async () => {
    setMessage('Password changed (dummy message)');
  };

  const handleDeleteAccount = async () => {
    setMessage('Account deleted (dummy message)');
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    setMessage('Language changed (dummy message)');
  };

  const handleNotificationsChange = () => {
    setNotifications(!notifications);
    setMessage('Notification settings updated (dummy message)');
  };

  return (
    <>
      <AppNavbar />
      <Container style={{ marginTop: '60px', maxWidth: '600px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
        <h2 className="mb-4 text-center" style={{ color: '#1565C0', fontWeight: '600' }}>Settings</h2>

        {message && <Alert variant="info" style={{ fontSize: '0.9rem' }}>{message}</Alert>}

        <Card className="mb-4" style={{ borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', border: 'none' }}>
          <Card.Body>
            <Card.Title className="mb-3" style={{ color: '#1565C0', fontWeight: '600' }}>🔒 Change Password</Card.Title>
            <Form.Group controlId="formNewPassword">
              <Form.Label style={{ fontWeight: '500' }}>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ borderRadius: '6px', borderColor: '#ccc' }}
              />
            </Form.Group>
            <Button
              
              className="mt-3"
              onClick={handleChangePassword}
              style={{ borderRadius: '6px', fontWeight: '600', padding: '8px 20px', backgroundColor: '#1565C0', color: '#fff' }}
            >
              Change Password
            </Button>
          </Card.Body>
        </Card>

        <Card className="mb-4" style={{ borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', border: 'none' }}>
          <Card.Body>
            <Card.Title className="mb-3" style={{ color: '#1565C0', fontWeight: '600' }}>🌐 Language</Card.Title>
            <Form.Group controlId="formLanguageSelect">
              <Form.Label style={{ fontWeight: '500' }}>Select Language</Form.Label>
              <Form.Control
                as="select"
                value={language}
                onChange={handleLanguageChange}
                style={{ borderRadius: '6px', borderColor: '#ccc' }}
              >
                <option value="en">English</option>
                <option value="hr">Hrvatski</option>
                <option value="de">Deutsch</option>
              </Form.Control>
            </Form.Group>
          </Card.Body>
        </Card>

        <Card className="mb-4" style={{ borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', border: 'none' }}>
          <Card.Body>
            <Card.Title className="mb-3" style={{ color: '#1565C0', fontWeight: '600' }}>🔔 Notifications</Card.Title>
            <Form.Group controlId="formNotificationsSwitch">
              <Form.Check
                type="switch"
                id="notifications-switch"
                label="Enable notifications"
                checked={notifications}
                onChange={handleNotificationsChange}
                style={{ userSelect: 'none' }}
              />
            </Form.Group>
          </Card.Body>
        </Card>

        <Card className="mb-5" style={{ borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', border: 'none', backgroundColor: '#fff5f5' }}>
          <Card.Body>
            <Card.Title className="mb-3" style={{ color: '#d32f2f', fontWeight: '600' }}>⚠️ Danger Zone</Card.Title>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              Deleting your account is irreversible. All your data will be permanently removed.
            </p>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              style={{ borderRadius: '6px', fontWeight: '600', padding: '8px 20px' }}
            >
              Delete Account
            </Button>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default SettingsPage;
