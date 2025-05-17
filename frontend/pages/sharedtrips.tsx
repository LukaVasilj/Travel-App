import { useEffect, useState } from 'react';
import AppNavbar from '../components/Navbar';
import { Container, Card, Spinner, Button, Modal, Carousel } from 'react-bootstrap';

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

// Helper za veliko prvo slovo
const capitalize = (str: string) =>
  str && typeof str === 'string'
    ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    : '';

const SharedTrips = () => {
  const [sharedTrips, setSharedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
  const [flightExpanded, setFlightExpanded] = useState<{ [key: number]: boolean }>({});
  const [accommodationExpanded, setAccommodationExpanded] = useState<{ [key: number]: boolean }>({});
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalAccName, setModalAccName] = useState<string>('');

  useEffect(() => {
    const fetchSharedTrips = async () => {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:8000/api/trips/shared/', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setSharedTrips(data);
      }
      setLoading(false);
    };
    fetchSharedTrips();
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

  const handleShowImages = (images: string[], accName: string) => {
    setModalImages(images);
    setModalAccName(accName);
    setShowImagesModal(true);
  };

  const handleCloseImagesModal = () => {
    setShowImagesModal(false);
    setModalImages([]);
    setModalAccName('');
  };

  return (
    <>
      <AppNavbar />
      <Container style={{ marginTop: '40px' }}>
        <h2>Trips Shared With Me</h2>
        {loading ? (
          <Spinner animation="border" />
        ) : sharedTrips.length === 0 ? (
          <p>No trips shared with you.</p>
        ) : (
          sharedTrips.map(trip => (
            <Card key={trip.id} style={{ marginBottom: '20px', borderColor: '#007bff' }}>
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
                      )}
                      {trip.transport_option.currLocation && trip.transport_option.departure && (
                        <div>
                          <b>Route:</b> {capitalize(trip.transport_option.currLocation)} &rarr; {capitalize(trip.transport_option.departure)}
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
                          {/* Prikaz buttona za slike */}
                          {(
                            (trip.accommodation.images && trip.accommodation.images.length > 0) ||
                            trip.accommodation.image
                          ) && (
                            <div style={{ margin: '10px 0' }}>
                              <b>Pictures:</b>{' '}
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => {
                                  let imgs: string[] = [];
                                  if (trip.accommodation.image) imgs.push(trip.accommodation.image);
                                  if (trip.accommodation.images && Array.isArray(trip.accommodation.images)) {
                                    trip.accommodation.images.forEach((img: string) => {
                                      if (img !== trip.accommodation.image) imgs.push(img);
                                    });
                                  }
                                  handleShowImages(imgs, trip.accommodation.name);
                                }}
                                style={{ marginLeft: 8 }}
                              >
                                Show pictures
                              </Button>
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
                              <b>Route:</b> {capitalize(trip.flight.departure)} &rarr; {capitalize(trip.flight.destination)}
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
      {/* Modal za slike smještaja */}
      <Modal show={showImagesModal} onHide={handleCloseImagesModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Pictures: {modalAccName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalImages.length > 0 ? (
            <Carousel>
              {modalImages.map((img, idx) => (
                <Carousel.Item key={idx}>
                  <img
                    className="d-block w-100"
                    src={img}
                    alt={`Accommodation ${idx + 1}`}
                    style={{ maxHeight: 400, objectFit: 'cover' }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            <p>No pictures available.</p>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SharedTrips;