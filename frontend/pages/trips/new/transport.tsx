import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AppNavbar from '../../../components/Navbar';
import { Card, Button, Container } from 'react-bootstrap';
import transportData from '../../../data/transportData.json'; // Import the JSON file

const TransportOptions = () => {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [tripDates, setTripDates] = useState<{ startDate: string; endDate: string } | null>(null);

  useEffect(() => {
    // Store transportData in localStorage
    console.log('Transport Data:', transportData);
    localStorage.setItem('transportData', JSON.stringify(transportData));

    // Retrieve trip details from localStorage
    const tripDetails = JSON.parse(localStorage.getItem('tripDetails') || '{}');
    const { departure, destination, startDate, endDate } = tripDetails;

    // Save trip dates to state
    setTripDates({ startDate, endDate });

    // Filter transport options based on departure and destination
    const filtered = transportData.filter(
      (option) => option.departure === departure && option.destination === destination
    );
    setFilteredOptions(filtered);
  }, []);

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleNext = () => {
    console.log('Selected Transport Option:', selectedOption); // Debugging
    localStorage.setItem('transportOption', selectedOption);
    router.push('/trips/new/accommodation');
  };

  // Helper function to format date and time
  const formatDateTime = (date: string, time: string) => {
    if (!time) {
      return 'Invalid time'; // Return message if time is invalid
    }

    const match = time.match(/(\d+):(\d+)\s(AM|PM)/);
    if (!match) {
      return 'Invalid time format'; // Return message if time format is invalid
    }

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
        <h1>Transport Options</h1>
        {filteredOptions.length > 0 ? (
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {filteredOptions.map((option) => (
  <Card
    key={option.id}
    style={{
      width: '18rem',
      border: selectedOption === option.id ? '2px solid blue' : '1px solid #ccc',
    }}
    onClick={() => handleSelect(option.id)}
  >
    <Card.Body>
      <Card.Title>{option.company} ({option.type})</Card.Title>
      <Card.Text>Price: ${option.price}</Card.Text>
      <Card.Text>Duration: {option.duration}</Card.Text>
      {tripDates && (
        <>
          <Card.Text>
            Departure Date: {formatDateTime(tripDates.startDate, option.departure_time)}
          </Card.Text>
          <Card.Text>
            Arrival Date: {formatDateTime(tripDates.startDate, option.arrival_time)}
          </Card.Text>
          <Card.Text>
            Route: {option.departure} → {option.destination}
          </Card.Text>
        </>
      )}
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
      </Container>
    </>
  );
};

export default TransportOptions;