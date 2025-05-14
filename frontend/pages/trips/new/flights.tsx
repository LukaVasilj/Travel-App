import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AppNavbar from '../../../components/Navbar';
import { Card, Button, Container } from 'react-bootstrap';
import flightsData from '../../../data/flightsData.json'; // Import the JSON file

interface Flight {
  id: string;
  airline: string;
  departure: string;
  destination: string;
  price: number;
  departure_time: string;
  arrival_time: string;
}

const FlightsPage = () => {
  const router = useRouter();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<string>('');
  const [tripDates, setTripDates] = useState<{ startDate: string; endDate: string } | null>(null);

  useEffect(() => {
    // Store flights data in localStorage
    localStorage.setItem('flightsData', JSON.stringify(flightsData));
  }, []);

  useEffect(() => {
    const tripDetails = localStorage.getItem('tripDetails');
    if (tripDetails) {
      const { departure, destination, startDate, endDate } = JSON.parse(tripDetails);
      console.log('Trip Details in Flights:', { departure, destination, startDate, endDate }); // Debugging

      // Save trip dates to state
      setTripDates({ startDate, endDate });

      // Filter flights based on departure and destination
      const filteredFlights = flightsData.filter(
        (flight) => flight.departure === departure && flight.destination === destination
      );
      console.log('Filtered Flights:', filteredFlights); // Debugging
      setFlights(filteredFlights);
    }
  }, []);

  const handleSelect = (flightId: string) => {
    setSelectedFlight(flightId);
  };

  const handleNext = () => {
    console.log('Selected Flight:', selectedFlight); // Debugging
    localStorage.setItem('selectedFlight', selectedFlight); // Save selected flight
    router.push('/trips/new/transportflight'); // Redirect to TransportFlight page
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
                <Card.Body>
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
                    Route: {flight.departure} → {flight.destination}
                  </Card.Text>
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
      </Container>
    </>
  );
};

export default FlightsPage;