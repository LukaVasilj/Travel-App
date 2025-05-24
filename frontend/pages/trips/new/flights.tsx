import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AppNavbar from '../../../components/Navbar';
import { Card, Button, Container, Modal, Carousel } from 'react-bootstrap';
import flightsData from '../../../data/flightsData.json';

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
    <Container style={{ marginTop: 50, maxWidth: 1200 }}>
      <h1 style={{ marginBottom: 30, fontWeight: '700', fontSize: '2.2rem', textAlign: 'center' }}>
        Available Flights
      </h1>

      {flights.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 24,
          }}
        >
          {flights.map(flight => (
            <Card
              key={flight.id}
              onClick={() => handleSelect(flight.id)}
              style={{
                border: selectedFlight === flight.id ? '2px solid #1E88E5' : '1px solid #ddd',
                boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 20px rgba(30, 136, 229, 0.3)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 3px 8px rgba(0,0,0,0.1)';
              }}
            >
              {flight.image && (
                <Card.Img
                  variant="top"
                  src={flight.image}
                  alt={flight.airline}
                  style={{ height: 160, objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                />
              )}

              <Card.Body style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ flexGrow: 1 }}>
                  <Card.Title style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>
                    {flight.airline}
                  </Card.Title>
                  <Card.Text style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 6 }}>
                    Price: ${flight.price}
                  </Card.Text>

                  {tripDates && (
                    <>
                      <Card.Text style={{ color: '#555', marginBottom: 4 }}>
                        Departure Date: {formatDateTime(tripDates.startDate, flight.departure_time)}
                      </Card.Text>
                      <Card.Text style={{ color: '#555', marginBottom: 6 }}>
                        Arrival Date: {formatDateTime(tripDates.startDate, flight.arrival_time)}
                      </Card.Text>
                    </>
                  )}

                  <Card.Text style={{ color: '#555' }}>
                    Route: {capitalize(flight.departure)} → {capitalize(flight.destination)}
                  </Card.Text>
                </div>

                <div style={{ marginTop: 20 }}>
                  <Button
                    variant="primary"
                    onClick={e => {
                      e.stopPropagation();
                      handleShowDetails(flight);
                    }}
                    style={{
                      alignSelf: 'flex-start',
                      padding: '8px 20px',
                      fontSize: '0.85rem',
                      borderRadius: 6,
                      transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
                      color: 'white',
                      backgroundColor: 'var(--accent-color)',
                      borderColor: 'var(--accent-color)',
                    }}
                    onMouseEnter={e => {
                      const target = e.currentTarget as HTMLElement;
                      target.style.backgroundColor = 'var(--hover-color)';
                      target.style.borderColor = 'var(--hover-color)';
                      target.style.color = 'white';
                    }}
                    onMouseLeave={e => {
                      const target = e.currentTarget as HTMLElement;
                      target.style.backgroundColor = 'var(--accent-color)';
                      target.style.borderColor = 'var(--accent-color)';
                      target.style.color = 'white';
                    }}
                  >
                    See details
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '1.1rem', color: '#555' }}>
          No flights available for the selected route.
        </p>
      )}

      {/* NEXT BUTTON */}
      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!selectedFlight}
          style={{
            padding: '12px 50px',
            fontSize: '1.1rem',
            fontWeight: '600',
            borderRadius: '30px',
            boxShadow: '0 4px 12px rgba(21, 101, 192, 0.6)',
            transition: 'background-color 0.3s ease',
          }}
        >
          Next
        </Button>
      </div>

      {/* MODAL */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg" dialogClassName="rounded-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalFlight?.airline} ({capitalize(modalFlight?.departure || '')} → {capitalize(modalFlight?.destination || '')})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalFlight?.images && modalFlight.images.length > 0 && (
            <Carousel interval={null} style={{ marginBottom: 25, borderRadius: 12, overflow: 'hidden' }}>
              {modalFlight.images.map((img, idx) => (
                <Carousel.Item key={idx}>
                  <img
                    className="d-block w-100"
                    src={img}
                    alt={`Slide ${idx + 1}`}
                    style={{ maxHeight: 360, objectFit: 'cover', borderRadius: 12 }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          )}

          <div
            style={{
              fontSize: '1.1rem',
              fontWeight: '500',
              lineHeight: 1.6,
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              color: '#333',
            }}
          >
            <p><b>Airline:</b> {modalFlight?.airline}</p>
            <p><b>Price:</b> ${modalFlight?.price}</p>
            <p><b>Departure:</b> {capitalize(modalFlight?.departure || '')} at {modalFlight?.departure_time}</p>
            <p><b>Arrival:</b> {capitalize(modalFlight?.destination || '')} at {modalFlight?.arrival_time}</p>
            <p><b>Route:</b> {capitalize(modalFlight?.departure || '')} → {capitalize(modalFlight?.destination || '')}</p>
          </div>

          {modalFlight?.bookingLink && (
            <div style={{ marginTop: 30, textAlign: 'center' }}>
              <Button
                variant="primary"
                href={modalFlight.bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ borderRadius: 30, padding: '12px 48px', fontWeight: '600', fontSize: '1.15rem' }}
              >
                Book now
              </Button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  </>
);
}


export default FlightsPage;
