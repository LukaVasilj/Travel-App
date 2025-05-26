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

// Helper za veliko prvo slovo
const capitalize = (str: string) =>
  str && typeof str === 'string'
    ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    : '';

const AccommodationPage = () => {
  const router = useRouter();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [selectedAccommodation, setSelectedAccommodation] = useState<string>('');
  const [filter, setFilter] = useState({ type: '', maxPrice: 0 });
  const [showModal, setShowModal] = useState(false);
  const [modalAcc, setModalAcc] = useState<Accommodation | null>(null);

  useEffect(() => {
    localStorage.setItem('accommodationData', JSON.stringify(accommodationData));
    let accs = [...accommodationData];

    // Dodaj default opciju na početak
    const defaultAcc: Accommodation = {
      id: 'default',
      name: 'Already have accommodation',
      type: 'other',
      price: 0,
      image: '/images/dada.jpg', // koristi neku neutralnu sliku
      destination: '',
      location: '',
      description: 'You already have your own accommodation for this trip.',
    };
    accs.unshift(defaultAcc);

    const tripDetails = localStorage.getItem('tripDetails');
    if (tripDetails) {
      const { destination } = JSON.parse(tripDetails);
      const filteredAccommodations = accs.filter(
        (acc) => acc.id === 'default' || acc.destination === destination
      );
      setAccommodations(filteredAccommodations);
    } else {
      setAccommodations(accs);
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
      <Container style={{ marginTop: 50, maxWidth: 1200 }}>
  <h1 style={{ marginBottom: 30, fontWeight: '700', fontSize: '2.2rem', textAlign: 'center' }}>
    Accommodation Options
  </h1>

  {/* FILTERS */}
  <Form
    style={{
      display: 'flex',
      gap: 20,
      justifyContent: 'center',
      marginBottom: 30,
      flexWrap: 'wrap',
    }}
  >
    <Form.Group controlId="typeSelect" style={{ minWidth: 180 }}>
      <Form.Label style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: 6 }}>
        Type
      </Form.Label>
      <Form.Control
        as="select"
        value={filter.type}
        onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
        style={{ padding: '8px 12px', fontSize: '1rem', borderRadius: 6 }}
      >
        <option value="">All</option>
        <option value="hotel">Hotel</option>
        <option value="apartment">Apartment</option>
        <option value="hostel">Hostel</option>
      </Form.Control>
    </Form.Group>

    <Form.Group controlId="maxPrice" style={{ minWidth: 180 }}>
      <Form.Label style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: 6 }}>
        Max Price
      </Form.Label>
      <Form.Control
        type="number"
        placeholder="No limit"
        value={filter.maxPrice || ''}
        onChange={e => setFilter(f => ({ ...f, maxPrice: Number(e.target.value) }))}
        min={0}
        style={{ padding: '8px 12px', fontSize: '1rem', borderRadius: 6 }}
      />
    </Form.Group>
  </Form>

  {/* ACCOMMODATION CARDS GRID */}
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
      gap: 24,
    }}
  >
    {filteredAccommodations.map(acc => (
      <Card
        key={acc.id}
        onClick={() => handleSelect(acc.id)}
        style={{
          border: selectedAccommodation === acc.id ? '2px solid #1E88E5' : '1px solid #ddd',
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
        <Card.Img
          variant="top"
          src={acc.image}
          alt={acc.name}
          style={{ height: 160, objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
        />
        <Card.Body style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <div style={{ flexGrow: 1 }}>
            <Card.Title style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>
              {acc.name}
            </Card.Title>
            <Card.Text style={{ color: '#555', marginBottom: 6 }}>
              Type: {capitalize(acc.type)}
            </Card.Text>
            <Card.Text style={{ fontWeight: 600, fontSize: '1rem' }}>
              Price: ${acc.price}
            </Card.Text>
          </div>

          <div style={{ marginTop: 20 }}>
           <Button
  variant="primary" // možeš ostaviti i outline ako želiš, ali radi ispunjene boje bolje primarno
  onClick={e => {
    e.stopPropagation();
    handleShowDetails(acc);
  }}
  style={{
    alignSelf: 'flex-start',
    padding: '8px 20px',
    fontSize: '0.85rem',
    borderRadius: '6px',
    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
    color: 'white',                   // tekst je bijeli jer je gumb žut
    backgroundColor: 'var(--accent-color)', // početna žuta boja
    borderColor: 'var(--accent-color)',
  }}
  onMouseEnter={e => {
    const target = e.currentTarget as HTMLElement;
    target.style.backgroundColor = 'var(--hover-color)'; // tamnija žuta na hover
    target.style.borderColor = 'var(--hover-color)';
    target.style.color = 'white'; // tekst ostaje bijel
  }}
  onMouseLeave={e => {
    const target = e.currentTarget as HTMLElement;
    target.style.backgroundColor = 'var(--accent-color)'; // vraća se na početnu žutu
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

  {/* NEXT BUTTON */}
  <div style={{ textAlign: 'center', marginTop: 40 }}>
    <Button
      variant="primary"
      onClick={handleNext}
      disabled={!selectedAccommodation}
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
      <Modal.Title>{modalAcc?.name}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {modalAcc?.images && modalAcc.images.length > 0 && (
        <Carousel interval={null} style={{ marginBottom: 25, borderRadius: 12, overflow: 'hidden' }}>
          {modalAcc.images.map((img, idx) => (
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
        <p><b>Type:</b> {modalAcc?.type ? capitalize(modalAcc.type) : ''}</p>
        <p><b>Price:</b> ${modalAcc?.price}</p>
        <p><b>Location:</b> {modalAcc?.location}</p>
        <p><b>Description:</b> {modalAcc?.description || 'No description.'}</p>
        {modalAcc?.reviews && modalAcc.reviews.length > 0 && (
          <>
            <b>Reviews:</b>
            <ul style={{ paddingLeft: 20 }}>
              {modalAcc.reviews.map((rev, idx) => (
                <li key={idx} style={{ marginBottom: 8 }}>
                  <b>{rev.user}</b> ({rev.rating}/5): {rev.comment}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {modalAcc?.bookingLink && (
        <div style={{ marginTop: 30, textAlign: 'center' }}>
          <Button
            variant="primary"
            href={modalAcc.bookingLink}
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
};

export default AccommodationPage;
