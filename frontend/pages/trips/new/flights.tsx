import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AppNavbar from '../../../components/Navbar';
import { Card, Button, Container, Modal, Carousel } from 'react-bootstrap';
import flightsData from '../../../data/flightsData.json'; // Import the JSON file

interface Flight {
  id: string;
  airline: string;
  departure: string;
  destination: string;
  price: number;
  departure_time: string;
  arrival_time: string;
  image?: string;
  images?: string[];
  bookingLink?: string;
}

// Helper function to capitalize first letter
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const FlightsPage = () => {
  const router = useRouter();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<string>('');
  const [tripDates, setTripDates] = useState<{ startDate: string; endDate: string } | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalFlight, setModalFlight] = useState<Flight | null>(null);

  useEffect(() => {
    // Store flights data in localStorage
    localStorage.setItem('flightsData', JSON.stringify(flightsData));
  }, []);

  useEffect(() => {
    const tripDetails = localStorage.getItem('tripDetails');
    if (tripDetails) {
      const { departure, destination, startDate, endDate } = JSON.parse(tripDetails);
      setTripDates({ startDate, endDate });
      const filteredFlights = flightsData.filter(
        (flight) => flight.departure === departure && flight.destination === destination
      );
      setFlights(filteredFlights);
    }
  }, []);

  const handleSelect = (flightId: string) => {
    setSelectedFlight(flightId);
  };

  const handleNext = () => {
    localStorage.setItem('selectedFlight', selectedFlight);
    router.push('/trips/new/transportflight');
  };

  const handleShowDetails = (flight: Flight) => {
    setModalFlight(flight);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalFlight(null);
  };

  // Helper function to format date and time
  const formatDateTime = (date: string, time: string) => {
    const [hours, minutes, period] = time.match(/(\d+):(\d+)\s(AM|PM)/)!.slice(1);
    const dateObj = new Date(date);
    dateObj.setHours(period === 'PM' && parseInt(hours) !== 12 ? parseInt(hours) + 12 : parseInt(hours));
    dateObj.setMinutes(parseInt(minutes));
    return dateObj.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <>
      <AppNavbar />
      <Container style={{ marginTop: '50px' }}>
        <h1>Available Flights</h1>
        {flights.length > 0 ? (
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {flights.map((flight) => (
              <Card
                key={flight.id}
                style={{
                  width: '18rem',
                  border: selectedFlight === flight.id ? '2px solid blue' : '1px solid #ccc',
                }}
                onClick={() => handleSelect(flight.id)}
              >
                {flight.image && (
                  <Card.Img variant="top" src={flight.image} alt={flight.airline} />
                )}
                <Card.Body style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Card.Title>{flight.airline}</Card.Title>
                  <Card.Text>Price: ${flight.price}</Card.Text>
                  {tripDates && (
                    <>
                      <Card.Text>
                        Departure Date: {formatDateTime(tripDates.startDate, flight.departure_time)}
                      </Card.Text>
                      <Card.Text>
                        Arrival Date: {formatDateTime(tripDates.startDate, flight.arrival_time)}
                      </Card.Text>
                    </>
                  )}
                  <Card.Text>
                    Route: {capitalize(flight.departure)} → {capitalize(flight.destination)}
                  </Card.Text>
                  <Button
                    variant="secondary"
                    onClick={e => { e.stopPropagation(); handleShowDetails(flight); }}
                    style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
                  >
                    See details
                  </Button>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <p>No flights available for the selected route.</p>
        )}
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!selectedFlight}
          style={{ marginTop: '20px' }}
        >
          Next
        </Button>

        {/* Modal za detalje leta */}
        <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {modalFlight?.airline} ({capitalize(modalFlight?.departure || '')} → {capitalize(modalFlight?.destination || '')})
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div style={{ marginTop: 15 }}>
              <b>Airline:</b> {modalFlight?.airline}<br />
              <b>Price:</b> ${modalFlight?.price}<br />
              <b>Departure:</b> {capitalize(modalFlight?.departure || '')} at {modalFlight?.departure_time}<br />
              <b>Arrival:</b> {capitalize(modalFlight?.destination || '')} at {modalFlight?.arrival_time}<br />
              <b>Route:</b> {capitalize(modalFlight?.departure || '')} → {capitalize(modalFlight?.destination || '')}<br />
            </div>
            {modalFlight?.bookingLink && (
              <div style={{ margin: '15px 0' }}>
                <a
                  href={modalFlight.bookingLink}
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

export default FlightsPage;