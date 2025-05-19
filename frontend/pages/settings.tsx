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
      <Container style={{ marginTop: '50px', maxWidth: '700px' }}>
        <h2 className="mb-4 text-center fw-bold">Settings</h2>
        {message && <Alert variant="info">{message}</Alert>}

        <Card className="mb-4 shadow-sm border-0">
          <Card.Body>
            <Card.Title className="mb-3 text-primary fw-semibold">🔒 Change Password</Card.Title>
            <Form.Group controlId="formNewPassword">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button
              variant="primary"
              className="mt-3"
              onClick={handleChangePassword}
            >
              Change Password
            </Button>
          </Card.Body>
        </Card>

        <Card className="mb-4 shadow-sm border-0">
          <Card.Body>
            <Card.Title className="mb-3 text-primary fw-semibold">🌐 Language</Card.Title>
            <Form.Group controlId="formLanguageSelect">
              <Form.Label>Select Language</Form.Label>
              <Form.Control as="select" value={language} onChange={handleLanguageChange}>
                <option value="en">English</option>
                <option value="hr">Hrvatski</option>
                <option value="de">Deutsch</option>
              </Form.Control>
            </Form.Group>
          </Card.Body>
        </Card>

        <Card className="mb-4 shadow-sm border-0">
          <Card.Body>
            <Card.Title className="mb-3 text-primary fw-semibold">🔔 Notifications</Card.Title>
            <Form.Group controlId="formNotificationsSwitch">
              <Form.Check
                type="switch"
                id="notifications-switch"
                label="Enable notifications"
                checked={notifications}
                onChange={handleNotificationsChange}
              />
            </Form.Group>
          </Card.Body>
        </Card>

        <Card className="mb-5 shadow-sm border-0 bg-light">
          <Card.Body>
            <Card.Title className="mb-3 text-danger fw-semibold">⚠️ Danger Zone</Card.Title>
            <p className="text-muted">
              Deleting your account is irreversible. All your data will be permanently removed.
            </p>
            <Button variant="danger" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default SettingsPage;
