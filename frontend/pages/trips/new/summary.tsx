import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AppNavbar from '../../../components/Navbar';
import { Container, Card, Button, Modal, Carousel } from 'react-bootstrap';

// Dodaj ovu funkciju na početak!
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return '';
}

// Helper za čišćenje objekata od undefined vrijednosti
function cleanObject(obj: any) {
  if (!obj) return obj;
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [k, typeof v === 'object' && v !== null && !Array.isArray(v) ? cleanObject(v) : v])
  );
}

interface TransportOption {
  id: string;
  name?: string;
  currLocation?: string;
  departure: string;
  destination?: string;
  price?: number;
  duration?: string;
  company?: string;
}

interface Accommodation {
  id: string;
  name: string;
  type: string;
  price: number;
  image: string;
  images?: string[];
  description?: string;
  reviews?: { user: string; comment: string; rating: number }[];
  location: string;
  bookingLink?: string;
}

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

const TripSummary = () => {
  const router = useRouter();
  const [transportOption, setTransportOption] = useState<TransportOption | null>(null);
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [tripDates, setTripDates] = useState<{ startDate: string; endDate: string } | null>(null);
  const [showAccModal, setShowAccModal] = useState(false);
  const [showFlightModal, setShowFlightModal] = useState(false);

  // Helper function to format date and time
  const formatDateTime = (date: string, time: string) => {
    if (!date || !time) {
      return 'Invalid Date';
    }
    const match = time.match(/(\d+):(\d+)\s(AM|PM)/);
    if (!match) {
      return 'Invalid Time Format';
    }
    const [hours, minutes, period] = match.slice(1);
    const dateObj = new Date(date);
    dateObj.setHours(period === 'PM' && parseInt(hours) !== 12 ? parseInt(hours) + 12 : parseInt(hours));
    dateObj.setMinutes(parseInt(minutes));
    return dateObj.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };

  useEffect(() => {
    // Retrieve selected options from localStorage
    const tripDetails = localStorage.getItem('tripDetails');
    const selectedAccommodationId = localStorage.getItem('selectedAccommodation');
    const selectedFlightId = localStorage.getItem('selectedFlight');
    const accommodationData = localStorage.getItem('accommodationData');
    const flightsData = localStorage.getItem('flightsData');

    // NOVO: direktno čitaj transportOption objekt iz localStorage
    const selectedTransportOption = localStorage.getItem('transportOption');
    if (selectedTransportOption) {
      setTransportOption(JSON.parse(selectedTransportOption));
    }

    if (tripDetails) {
      const { startDate, endDate } = JSON.parse(tripDetails);
      setTripDates({ startDate, endDate });
    }

    if (selectedAccommodationId && accommodationData) {
      const parsedAccommodationData: Accommodation[] = JSON.parse(accommodationData);
      const selectedAccommodation = parsedAccommodationData.find((a) => a.id === selectedAccommodationId);
      setAccommodation(selectedAccommodation || null);
    }

    if (tripDetails && JSON.parse(tripDetails).transportType === 'air') {
      if (selectedFlightId && flightsData) {
        const parsedFlightsData: Flight[] = JSON.parse(flightsData);
        const selectedFlight = parsedFlightsData.find((flight) => flight.id === selectedFlightId);
        setFlight(selectedFlight || null);
      }
    } else {
      setFlight(null);
    }
  }, []);

  useEffect(() => {
    const transportCost = transportOption?.price || 0;
    const accommodationCost = accommodation?.price || 0;
    const flightCost = flight?.price || 0;
    setTotalCost(transportCost + accommodationCost + flightCost);
  }, [transportOption, accommodation, flight]);

  const handleFinalize = async () => {
    await fetch('http://localhost:8000/api/csrf-token', { credentials: 'include' }); // osiguraj cookie
    const csrfToken = getCookie('fastapi-csrf-token');
    const tripDetails = JSON.parse(localStorage.getItem('tripDetails') || '{}');
    const payload = {
      name: tripDetails.name || 'My Trip',
      start_date: tripDetails.startDate,
      end_date: tripDetails.endDate,
      transport_type: tripDetails.transportType,
      transport_option: transportOption ? cleanObject(transportOption) : {}, // uvijek šalji dict
      accommodation: accommodation ? cleanObject(accommodation) : null,
      flight: flight ? cleanObject(flight) : null,
      total_cost: Number(totalCost),
    };

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/trips/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken || '',
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (response.ok) {
        alert('Trip finalized and saved! Enjoy your journey!');
        localStorage.removeItem('transportOption');
        localStorage.removeItem('selectedAccommodation');
        localStorage.removeItem('selectedFlight');
        localStorage.removeItem('tripDetails');
        router.push('/glavnastranica');
      } else {
        const error = await response.json();
        alert('Failed to save trip: ' + JSON.stringify(error));
      }
    } catch (err) {
      alert('Error saving trip.');
    }
  };

  return (
    <>
      <AppNavbar />
      <Container style={{ marginTop: '50px' }}>
        <h1>Trip Summary</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          {transportOption && (
            <Card>
              <Card.Body>
                <Card.Title>Transport</Card.Title>
                {tripDates?.startDate && (
                  <>
                    {tripDates.startDate && JSON.parse(localStorage.getItem('tripDetails') || '{}').transportType === 'air' ? (
                      <Card.Text>Name: {transportOption.name || 'N/A'}</Card.Text>
                    ) : (
                      <Card.Text>Company: {transportOption.company || 'N/A'}</Card.Text>
                    )}
                  </>
                )}
                {transportOption.name === 'Rent-a-Car' ? (
                  <Card.Text>Price: ${transportOption.price} per day</Card.Text>
                ) : (
                  <>
                    <Card.Text>Price: ${transportOption.price}</Card.Text>
                    {/* Prikaži datume i rutu samo ako NIJE "Already have a ride to airport" */}
                    {transportOption.id !== 'default' && tripDates && (
                      <>
                        <Card.Text>
                          Departure Date: {formatDateTime(tripDates.startDate, (transportOption as any).departure_time)}
                        </Card.Text>
                        <Card.Text>
                          Arrival Date: {formatDateTime(tripDates.startDate, (transportOption as any).arrival_time)}
                        </Card.Text>
                        <Card.Text>
                          Route: {transportOption.departure} → {transportOption.destination || transportOption.departure}
                        </Card.Text>
                      </>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          )}
          {flight && tripDates && (
            <>
              <Card>
                <Card.Body>
                  <Card.Title>Flight</Card.Title>
                  <Card.Text>Airline: {flight.airline}</Card.Text>
                  <Card.Text>Price: ${flight.price}</Card.Text>
                  <Card.Text>
                    Departure Date: {formatDateTime(tripDates.startDate, flight.departure_time)}
                  </Card.Text>
                  <Card.Text>
                    Arrival Date: {formatDateTime(tripDates.startDate, flight.arrival_time)}
                  </Card.Text>
                  <Card.Text>
                    Route: {flight.departure} → {flight.destination}
                  </Card.Text>
                  <Button
                    variant="secondary"
                    onClick={() => setShowFlightModal(true)}
                    style={{ marginTop: '10px' }}
                  >
                    See details
                  </Button>
                </Card.Body>
              </Card>
              <Modal show={showFlightModal} onHide={() => setShowFlightModal(false)} centered size="lg">
                <Modal.Header closeButton>
                  <Modal.Title>
                    {flight.airline} ({flight.departure} → {flight.destination})
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {flight.images && flight.images.length > 0 && (
                    <Carousel>
                      {flight.images.map((img, idx) => (
                        <Carousel.Item key={idx}>
                          <img
                            className="d-block w-100"
                            src={img}
                            alt={`Slide ${idx + 1}`}
                            style={{ maxHeight: 350, objectFit: 'cover' }}
                          />
                        </Carousel.Item>
                      ))}
                    </Carousel>
                  )}
                  <div style={{ marginTop: 15 }}>
                    <b>Airline:</b> {flight.airline}<br />
                    <b>Price:</b> ${flight.price}<br />
                    <b>Departure:</b> {flight.departure} at {flight.departure_time}<br />
                    <b>Arrival:</b> {flight.destination} at {flight.arrival_time}<br />
                    <b>Route:</b> {flight.departure} → {flight.destination}<br />
                  </div>
                  {flight.bookingLink && (
                    <div style={{ margin: '15px 0' }}>
                      <a
                        href={flight.bookingLink}
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
            </>
          )}
          {accommodation && (
            <>
              <Card>
                <Card.Body>
                  <Card.Title>Accommodation</Card.Title>
                  <Card.Text>Name: {accommodation.name}</Card.Text>
                  <Card.Text>Type: {accommodation.type}</Card.Text>
                  <Card.Text>Price: ${accommodation.price}</Card.Text>
                  <Button
                    variant="secondary"
                    onClick={() => setShowAccModal(true)}
                    style={{ marginTop: '10px' }}
                  >
                    See details
                  </Button>
                </Card.Body>
              </Card>
              <Modal show={showAccModal} onHide={() => setShowAccModal(false)} centered size="lg">
                <Modal.Header closeButton>
                  <Modal.Title>{accommodation.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {accommodation.images && accommodation.images.length > 0 && (
                    <Carousel>
                      {accommodation.images.map((img, idx) => (
                        <Carousel.Item key={idx}>
                          <img
                            className="d-block w-100"
                            src={img}
                            alt={`Slide ${idx + 1}`}
                            style={{ maxHeight: 350, objectFit: 'cover' }}
                          />
                        </Carousel.Item>
                      ))}
                    </Carousel>
                  )}
                  <div style={{ marginTop: 15 }}>
                    <b>Type:</b> {accommodation.type}<br />
                    <b>Price:</b> ${accommodation.price} <br />
                    <b>Location:</b> {accommodation.location}<br />
                    <b>Description:</b> {accommodation.description || 'No description.'}<br />
                    {accommodation.reviews && accommodation.reviews.length > 0 && (
                      <>
                        <b>Reviews:</b>
                        <ul>
                          {accommodation.reviews.map((rev, idx) => (
                            <li key={idx}>
                              <b>{rev.user}</b> ({rev.rating}/5): {rev.comment}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                  {accommodation.bookingLink && (
                    <div style={{ margin: '15px 0' }}>
                      <a
                        href={accommodation.bookingLink}
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
            </>
          )}
        </div>
        <h3 style={{ marginTop: '20px' }}>Total Cost: ${totalCost}</h3>
        <Button variant="success" onClick={handleFinalize} style={{ marginTop: '20px' }}>
          Finalize Trip
        </Button>
      </Container>
    </>
  );
};

export default TripSummary;