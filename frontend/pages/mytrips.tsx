import { useEffect, useState } from 'react';
import AppNavbar from '../components/Navbar';
import { Container, Card, Spinner, Button } from 'react-bootstrap';

interface Trip {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  transport_type: string;
  transport_option: any;
  accommodation?: any;
  flight?: any;
  total_cost: number;
}

const MyTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
  const [flightExpanded, setFlightExpanded] = useState<{ [key: number]: boolean }>({});
  const [accommodationExpanded, setAccommodationExpanded] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const fetchTrips = async () => {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:8000/api/trips/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
      }
      setLoading(false);
    };
    fetchTrips();
  }, []);

  const toggleExpand = (tripId: number) => {
    setExpanded(prev => ({ ...prev, [tripId]: !prev[tripId] }));
  };

  const toggleFlightExpand = (tripId: number) => {
    setFlightExpanded(prev => ({ ...prev, [tripId]: !prev[tripId] }));
  };

  const toggleAccommodationExpand = (tripId: number) => {
    setAccommodationExpanded(prev => ({ ...prev, [tripId]: !prev[tripId] }));
  };

  return (
    <>
      <AppNavbar />
      <Container style={{ marginTop: '40px' }}>
        <h1>My Trips</h1>
        {loading ? (
          <Spinner animation="border" />
        ) : trips.length === 0 ? (
          <p>You have no saved trips.</p>
        ) : (
          trips.map(trip => (
            <Card key={trip.id} style={{ marginBottom: '20px' }}>
              <Card.Body>
                <Card.Title>
                  <b>Name:</b> {trip.name} 
                </Card.Title>
                <div>
                  <b>Dates:</b> {trip.start_date} - {trip.end_date}<br />
                  <b>Transport:</b> {trip.transport_type.toUpperCase()}<br />
                  <b>Total Cost:</b> ${trip.total_cost}<br />
                  {/* Transport Option */}
                  {trip.transport_option && (
                  <div>
                    <b>Transport Option:</b>
                    {trip.transport_option.id === 'default' ? (
                      <> Already have a ride to airport (0$)</>
                    ) : (
                      <>
                        {trip.transport_option.name && <> {trip.transport_option.name}</>}
                        {trip.transport_option.company && <> ({trip.transport_option.company})</>}
                        {trip.transport_option.price && (
                          <>
                            {'  ($'}{trip.transport_option.price}{')'}
                            <Button
                              variant="link"
                              style={{ padding: 0, marginLeft: 8, fontSize: 18, verticalAlign: 'middle' }}
                              onClick={() => toggleExpand(trip.id)}
                              aria-label={expanded[trip.id] ? 'Hide details' : 'Show more'}
                            >
                              {expanded[trip.id] ? '▲' : '▼'}
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
                  {trip.transport_option && expanded[trip.id] && (
                    <div style={{ marginTop: '10px', marginLeft: '10px' }}>
                      
                      {trip.transport_option.departure_time && (
                        <div>
                          <b>Departure Time:</b> {trip.transport_option.departure_time}
                        </div>
                      )}
                      {trip.transport_option.arrival_time && (
                        <div>
                          <b>Arrival Time:</b> {trip.transport_option.arrival_time}
                        </div>
                      )}{trip.transport_option.currLocation && trip.transport_option.departure && (
                        <div>
                          <b>Route:</b> {trip.transport_option.currLocation} &rarr; {trip.transport_option.departure}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Accommodation */}
                  {trip.accommodation && (
                    <div>
                      <b>Accommodation:</b> {trip.accommodation.name} (${trip.accommodation.price})
                      <Button
                        variant="link"
                        style={{ padding: 0, marginLeft: 8, fontSize: 18, verticalAlign: 'middle' }}
                        onClick={() => toggleAccommodationExpand(trip.id)}
                        aria-label={accommodationExpanded[trip.id] ? 'Hide accommodation details' : 'Show accommodation details'}
                      >
                        {accommodationExpanded[trip.id] ? '▲' : '▼'}
                      </Button>
                      {accommodationExpanded[trip.id] && (
                        <div style={{ marginTop: '10px', marginLeft: '10px' }}>
                          {trip.accommodation.location && (
                            <div>
                              <b>Location:</b> {trip.accommodation.location}
                            </div>
                          )}
                          {trip.accommodation.description && (
                            <div>
                              <b>Description:</b> {trip.accommodation.description}
                            </div>
                          )}
                          {trip.accommodation.bookingLink && (
                            <div>
                              <b>Booking Link:</b> <a href={trip.accommodation.bookingLink} target="_blank" rel="noopener noreferrer">{trip.accommodation.bookingLink}</a>
                            </div>
                          )}
                        </div>
                      )}
                      <br />
                    </div>
                  )}
                  {/* Flight */}
                  {trip.flight && (
                    <div>
                      <b>Flight:</b> {trip.flight.airline} (${trip.flight.price})
                      <Button
                        variant="link"
                        style={{ padding: 0, marginLeft: 8, fontSize: 18, verticalAlign: 'middle' }}
                        onClick={() => toggleFlightExpand(trip.id)}
                        aria-label={flightExpanded[trip.id] ? 'Hide flight details' : 'Show flight details'}
                      >
                        {flightExpanded[trip.id] ? '▲' : '▼'}
                      </Button>
                      {flightExpanded[trip.id] && (
                        <div style={{ marginTop: '10px', marginLeft: '10px' }}>
                          {trip.flight.departure && trip.flight.destination && (
                            <div>
                              <b>Route:</b> {trip.flight.departure} &rarr; {trip.flight.destination}
                            </div>
                          )}
                          {trip.flight.departure_time && (
                            <div>
                              <b>Departure Time:</b> {trip.flight.departure_time}
                            </div>
                          )}
                          {trip.flight.arrival_time && (
                            <div>
                              <b>Arrival Time:</b> {trip.flight.arrival_time}
                            </div>
                          )}
                          {trip.flight.bookingLink && (
                            <div>
                              <b>Booking Link:</b>{' '}
                              <a href={trip.flight.bookingLink} target="_blank" rel="noopener noreferrer">
                                {trip.flight.bookingLink}
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))
        )}
      </Container>
    </>
  );
};

export default MyTrips;