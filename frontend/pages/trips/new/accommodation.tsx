import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AppNavbar from '../../../components/Navbar';
import { Card, Button, Container, Form } from 'react-bootstrap';
import accommodationData from '../../../data/accommodationData.json'; // Import the JSON file

interface Accommodation {
  id: string;
  name: string;
  type: string;
  price: number;
  image: string;
  destination: string;
}

const AccommodationPage = () => {
  const router = useRouter();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [selectedAccommodation, setSelectedAccommodation] = useState<string>('');
  const [filter, setFilter] = useState({ type: '', maxPrice: 0 });

  useEffect(() => {
  // Store accommodationData in localStorage
  console.log('Accommodation Data:', accommodationData);
  localStorage.setItem('accommodationData', JSON.stringify(accommodationData));

  // Retrieve the selected destination from localStorage
  const tripDetails = localStorage.getItem('tripDetails');
  if (tripDetails) {
    const { destination } = JSON.parse(tripDetails);

    // Filter accommodations based on the selected destination
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
  console.log('Selected Accommodation:', selectedAccommodation); // Debugging
  localStorage.setItem('selectedAccommodation', selectedAccommodation);
  router.push('/trips/new/summary');
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
          <Form.Group>
            <Form.Label>Type</Form.Label>
            <Form.Control
              as="select"
              value={filter.type}
              onChange={(e) => setFilter((prev) => ({ ...prev, type: e.target.value }))}
            >
              <option value="">All</option>
              <option value="hotel">Hotel</option>
              <option value="apartment">Apartment</option>
              <option value="hostel">Hostel</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Max Price</Form.Label>
            <Form.Control
              type="number"
              value={filter.maxPrice === 0 ? '' : filter.maxPrice} // Show an empty string if the value is 0
              onChange={(e) => {
                const value = e.target.value;
                setFilter((prev) => ({
                  ...prev,
                  maxPrice: value === '' ? 0 : Number(value), // Set to 0 if the input is cleared
                }));
              }}
              placeholder="Enter max price"
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
                <Card.Text>Price: ${acc.price}</Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
        <Button variant="primary" onClick={handleNext} disabled={!selectedAccommodation} style={{ marginTop: '20px' }}>
          Next
        </Button>
      </Container>
    </>
  );
};

export default AccommodationPage;