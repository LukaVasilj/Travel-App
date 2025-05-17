import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AppNavbar from '../../../components/Navbar';
import { Card, Button, Container, Modal } from 'react-bootstrap';
import transportData from '../../../data/transportData.json';

// Helper za veliko prvo slovo
const capitalize = (str: string) =>
  str && typeof str === 'string'
    ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    : '';

const TransportOptions = () => {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [tripDates, setTripDates] = useState<{ startDate: string; endDate: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalOption, setModalOption] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('transportData', JSON.stringify(transportData));
    const tripDetails = JSON.parse(localStorage.getItem('tripDetails') || '{}');
    const { departure, destination, startDate, endDate } = tripDetails;
    setTripDates({ startDate, endDate });
    const filtered = transportData.filter(
      (option) => option.departure === departure && option.destination === destination
    );
    setFilteredOptions(filtered);
  }, []);

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleNext = () => {
    const selectedObj = filteredOptions.find(opt => opt.id === selectedOption);
    if (selectedObj) {
      localStorage.setItem('transportOption', JSON.stringify(selectedObj));
    }
    router.push('/trips/new/accommodation');
  };

  const handleShowDetails = (option: any) => {
    setModalOption(option);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalOption(null);
  };

  const formatDateTime = (date: string, time: string) => {
    if (!time) return 'Invalid time';
    const match = time.match(/(\d+):(\d+)\s(AM|PM)/);
    if (!match) return 'Invalid time format';
    const [hours, minutes, period] = match.slice(1);
    const dateObj = new Date(date);
    dateObj.setHours(period === 'PM' && parseInt(hours) !== 12 ? parseInt(hours) + 12 : parseInt(hours));
    dateObj.setMinutes(parseInt(minutes));
    return dateObj.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const formatRoute = (departure: string, destination: string) => {
    return `${capitalize(departure)} → ${capitalize(destination)}`;
  };

  return (
    <>
      <AppNavbar />
      <Container style={{ marginTop: '50px' }}>
        <h1>Transport Options</h1>
        {filteredOptions.length > 0 ? (
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {filteredOptions.map((option) => (
              <Card
                key={option.id}
                style={{
                  width: '18rem',
                  border: selectedOption === option.id ? '2px solid blue' : '1px solid #ccc',
                  cursor: 'pointer'
                }}
                onClick={() => handleSelect(option.id)}
              >
                {option.image && (
                  <Card.Img variant="top" src={option.image} alt={option.company} />
                )}
                <Card.Body>
                  <Card.Title>{option.company} ({option.type})</Card.Title>
                  <Card.Text>Price: ${option.price}</Card.Text>
                  {/* Za rent-a-car ne prikazuj vrijeme, rutu i trajanje */}
                  {option.type !== 'rent-a-car' && tripDates && (
                    <>
                      <Card.Text>
                        Duration: {option.duration}
                      </Card.Text>
                      <Card.Text>
                        Departure Date: {formatDateTime(tripDates.startDate, option.departure_time)}
                      </Card.Text>
                      <Card.Text>
                        Arrival Date: {formatDateTime(tripDates.startDate, option.arrival_time)}
                      </Card.Text>
                      <Card.Text>
                        Route: {formatRoute(option.departure, option.destination)}
                      </Card.Text>
                    </>
                  )}
                  <Button
                    variant="secondary"
                    onClick={e => { e.stopPropagation(); handleShowDetails(option); }}
                    style={{ marginTop: '10px' }}
                  >
                    See details
                  </Button>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <p>No transport options available for the selected route.</p>
        )}
        <Button variant="primary" onClick={handleNext} disabled={!selectedOption} style={{ marginTop: '20px' }}>
          Next
        </Button>

        {/* Modal za detalje transporta */}
        <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {modalOption?.company} ({modalOption?.type})
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {modalOption?.image && (
              <img
                src={modalOption.image}
                alt={modalOption.company}
                style={{ width: '100%', maxHeight: 300, objectFit: 'contain', marginBottom: 20 }}
              />
            )}
            <div style={{ marginTop: 15 }}>
              <b>Company:</b> {modalOption?.company}<br />
              <b>Type:</b> {modalOption?.type}<br />
              <b>Price:</b> ${modalOption?.price}<br />
              {/* Za rent-a-car ne prikazuj vrijeme, rutu i trajanje */}
              {modalOption?.type !== 'rent-a-car' && (
                <>
                  <b>Duration:</b> {modalOption?.duration}<br />
                  <b>Departure:</b> {capitalize(modalOption?.departure)} at {modalOption?.departure_time}<br />
                  <b>Arrival:</b> {capitalize(modalOption?.destination)} at {modalOption?.arrival_time}<br />
                  <b>Route:</b> {formatRoute(modalOption?.departure, modalOption?.destination)}<br />
                </>
              )}
            </div>
            {modalOption?.bookingLink && (
              <div style={{ margin: '15px 0' }}>
                <a
                  href={modalOption.bookingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success"
                >
                  Book now
                </a>
              </div>
            )}
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
};

export default TransportOptions;