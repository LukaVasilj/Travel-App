import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AppNavbar from '../../../components/Navbar';
import { Card, Button, Container, Modal } from 'react-bootstrap';
import transportFlightData from '../../../data/transportFlightData.json';

interface TransportOption {
  id: string;
  name: string;
  currLocation: string;
  departure: string;
  price: number;
  departure_time: string;
  arrival_time: string;
  image?: string;
  bookingLink?: string;
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const TransportFlight = () => {
  const router = useRouter();
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [tripDates, setTripDates] = useState<{ startDate: string; endDate: string } | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalOption, setModalOption] = useState<TransportOption | null>(null);

  useEffect(() => {
    localStorage.setItem('transportFlightData', JSON.stringify(transportFlightData));
  }, []);

  useEffect(() => {
    const tripDetails = localStorage.getItem('tripDetails');
    let options = [...transportFlightData];

    const defaultOption: TransportOption = {
      id: 'default',
      name: 'Already have a ride to airport',
      currLocation: '',
      departure: '',
      price: 0,
      departure_time: '',
      arrival_time: '',
      image: '/images/ride.jpg' // Dodaj sliku za ovu opciju
    };
    options.unshift(defaultOption);

    if (tripDetails) {
      const { departure, currLocation, startDate, endDate } = JSON.parse(tripDetails);
      setTripDates({ startDate, endDate });
      const filteredOptions = options.filter(
        (option) =>
          option.id === 'default' ||
          (option.currLocation === currLocation && option.departure === departure)
      );
      setTransportOptions(filteredOptions);
    } else {
      setTransportOptions(options);
    }
  }, []);

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleNext = () => {
    const selectedObj = transportOptions.find(opt => opt.id === selectedOption);
    if (selectedObj) {
      localStorage.setItem('transportOption', JSON.stringify(selectedObj));
    }
    router.push('/trips/new/accommodation');
  };

  const handleShowDetails = (option: TransportOption) => {
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

  return (
    <>
      <AppNavbar />
      <Container style={{ marginTop: '50px' }}>
        <h1>Transport to Airport</h1>
        {transportOptions.length > 0 ? (
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {transportOptions.map((option) => (
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
                  <Card.Img variant="top" src={option.image} alt={option.name} />
                )}
                <Card.Body>
                  <Card.Title>{option.name}</Card.Title>
                  {option.id !== 'default' && (
                    <>
                      <Card.Text>Price: ${option.price}</Card.Text>
                      {tripDates && (
                        <>
                          <Card.Text>
                            Departure Date: {formatDateTime(tripDates.startDate, option.departure_time)}
                          </Card.Text>
                          <Card.Text>
                            Arrival Date: {formatDateTime(tripDates.startDate, option.arrival_time)}
                          </Card.Text>
                        </>
                      )}
                      <Card.Text>
                        Route: {capitalize(option.currLocation)} → {capitalize(option.departure)}
                      </Card.Text>
                      <Button
                        variant="secondary"
                        onClick={e => { e.stopPropagation(); handleShowDetails(option); }}
                        style={{ marginTop: '10px' }}
                      >
                        See details
                      </Button>
                    </>
                  )}
                  {option.id === 'default' && (
                    <Card.Text style={{ color: 'gray' }}>No transport needed</Card.Text>
                  )}
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <p>No transport options available for the selected route.</p>
        )}
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!selectedOption}
          style={{ marginTop: '20px' }}
        >
          Next
        </Button>

        {/* Modal za detalje transporta */}
        <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {modalOption?.name} ({capitalize(modalOption?.currLocation || '')} → {capitalize(modalOption?.departure || '')})
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {modalOption?.image && (
              <img
                src={modalOption.image}
                alt={modalOption.name}
                style={{ width: '100%', maxHeight: 300, objectFit: 'contain', marginBottom: 20 }}
              />
            )}
            <div style={{ marginTop: 15 }}>
              <b>Name:</b> {modalOption?.name}<br />
              <b>Price:</b> ${modalOption?.price}<br />
              <b>Departure:</b> {capitalize(modalOption?.currLocation || '')} at {modalOption?.departure_time}<br />
              <b>Arrival:</b> {capitalize(modalOption?.departure || '')} at {modalOption?.arrival_time}<br />
              <b>Route:</b> {capitalize(modalOption?.currLocation || '')} → {capitalize(modalOption?.departure || '')}<br />
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

export default TransportFlight;