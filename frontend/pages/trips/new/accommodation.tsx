import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AppNavbar from '../../../components/Navbar';
import { Card, Button, Container, Form, Modal, Carousel } from 'react-bootstrap';
import accommodationData from '../../../data/accommodationData.json';

interface Accommodation {
  id: string;
  name: string;
  type: string;
  price: number;
  image: string;
  images?: string[];
  destination: string;
  description?: string;
  reviews?: { user: string; comment: string; rating: number }[];
  location: string;
  bookingLink?: string;
}

const AccommodationPage = () => {
  const router = useRouter();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [selectedAccommodation, setSelectedAccommodation] = useState<string>('');
  const [filter, setFilter] = useState({ type: '', maxPrice: 0 });
  const [showModal, setShowModal] = useState(false);
  const [modalAcc, setModalAcc] = useState<Accommodation | null>(null);

  useEffect(() => {
    localStorage.setItem('accommodationData', JSON.stringify(accommodationData));
    const tripDetails = localStorage.getItem('tripDetails');
    if (tripDetails) {
      const { destination } = JSON.parse(tripDetails);
      const filteredAccommodations = accommodationData.filter(
        (acc) => acc.destination === destination
      );
      setAccommodations(filteredAccommodations);
    }
  }, []);

  const handleSelect = (accommodationId: string) => {
    setSelectedAccommodation(accommodationId);
  };

  const handleNext = () => {
    localStorage.setItem('selectedAccommodation', selectedAccommodation);
    router.push('/trips/new/summary');
  };

  const handleShowDetails = (acc: Accommodation) => {
    setModalAcc(acc);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalAcc(null);
  };

  const filteredAccommodations = accommodations.filter((acc) => {
    const matchesType = filter.type ? acc.type === filter.type : true;
    const matchesPrice = filter.maxPrice ? acc.price <= filter.maxPrice : true;
    return matchesType && matchesPrice;
  });

  return (
    <>
      <AppNavbar />
      <Container style={{ marginTop: '50px' }}>
        <h1>Accommodation Options</h1>
        <Form style={{ marginBottom: '20px' }}>
          <Form.Group controlId="typeSelect" style={{ width: 200, display: 'inline-block', marginRight: 20 }}>
            <Form.Label>Type</Form.Label>
            <Form.Control
              as="select"
              value={filter.type}
              onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
            >
              <option value="">All</option>
              <option value="hotel">Hotel</option>
              <option value="apartment">Apartment</option>
              <option value="hostel">Hostel</option>
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="maxPrice" style={{ width: 200, display: 'inline-block' }}>
            <Form.Label>Max price</Form.Label>
            <Form.Control
              type="number"
              placeholder="No limit"
              value={filter.maxPrice || ''}
              onChange={e => setFilter(f => ({ ...f, maxPrice: Number(e.target.value) }))}
              min={0}
            />
          </Form.Group>
        </Form>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {filteredAccommodations.map((acc) => (
            <Card
              key={acc.id}
              style={{
                width: '18rem',
                border: selectedAccommodation === acc.id ? '2px solid blue' : '1px solid #ccc',
              }}
              onClick={() => handleSelect(acc.id)}
            >
              <Card.Img variant="top" src={acc.image} alt={acc.name} />
              <Card.Body>
                <Card.Title>{acc.name}</Card.Title>
                <Card.Text>Type: {acc.type}</Card.Text>
                <Card.Text>Price: ${acc.price} </Card.Text>
                <Button
                  variant="secondary"
                  onClick={e => { e.stopPropagation(); handleShowDetails(acc); }}
                  style={{ marginTop: '10px' }}
                >
                  See details
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>
        <Button variant="primary" onClick={handleNext} disabled={!selectedAccommodation} style={{ marginTop: '20px' }}>
          Next
        </Button>

        {/* Modal za detalje */}
        <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{modalAcc?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {modalAcc?.images && modalAcc.images.length > 0 && (
              <Carousel>
                {modalAcc.images.map((img, idx) => (
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
              <b>Type:</b> {modalAcc?.type}<br />
              <b>Price:</b> ${modalAcc?.price} <br />
              <b>Location:</b> {modalAcc?.location}<br />
              <b>Description:</b> {modalAcc?.description || 'No description.'}<br />
              {modalAcc?.reviews && modalAcc.reviews.length > 0 && (
                <>
                  <b>Reviews:</b>
                  <ul>
                    {modalAcc.reviews.map((rev, idx) => (
                      <li key={idx}>
                        <b>{rev.user}</b> ({rev.rating}/5): {rev.comment}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            {modalAcc?.bookingLink && (
              <div style={{ margin: '15px 0' }}>
                <a
                  href={modalAcc.bookingLink}
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

export default AccommodationPage;