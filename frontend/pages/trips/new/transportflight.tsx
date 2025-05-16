import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AppNavbar from '../../../components/Navbar';
import { Card, Button, Container } from 'react-bootstrap';
import transportFlightData from '../../../data/transportFlightData.json'; // Import the JSON file

interface TransportOption {
  id: string;
  name: string;
  currLocation: string;
  departure: string;
  price: number;
  departure_time: string; // Added field for departure time
  arrival_time: string; // Added field for arrival time
}

const TransportFlight = () => {
  const router = useRouter();
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [tripDates, setTripDates] = useState<{ startDate: string; endDate: string } | null>(null);

  useEffect(() => {
    // Store transport data in localStorage
    localStorage.setItem('transportFlightData', JSON.stringify(transportFlightData));
  }, []);

  useEffect(() => {
    const tripDetails = localStorage.getItem('tripDetails');
    let options = [...transportFlightData];

    // Add the "Already have a ride to airport" option
    const defaultOption: TransportOption = {
      id: 'default',
      name: 'Already have a ride to airport',
      currLocation: '',
      departure: '',
      price: 0,
      departure_time: '',
      arrival_time: '',
    };
    options.unshift(defaultOption); // Add it as the first option

    if (tripDetails) {
      const { departure, currLocation, startDate, endDate } = JSON.parse(tripDetails);
      console.log('Trip Details in TransportFlight:', { departure, currLocation, startDate, endDate }); // Debugging

      // Save trip dates to state
      setTripDates({ startDate, endDate });

      // Filter transport options based on current location and departure
      const filteredOptions = options.filter(
        (option) =>
          option.id === 'default' || // Always include the default option
          (option.currLocation === currLocation && option.departure === departure)
      );
      console.log('Filtered Transport Options:', filteredOptions); // Debugging
      setTransportOptions(filteredOptions);
    } else {
      setTransportOptions(options); // If no trip details, show all options including default
    }
  }, []);

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleNext = () => {
  const selectedObj = transportOptions.find(opt => opt.id === selectedOption);
  if (selectedObj) {
    localStorage.setItem('transportOption', JSON.stringify(selectedObj)); // Spremi cijeli objekt!
  }
  router.push('/trips/new/accommodation');
};

  // Helper function to format date and time
  const formatDateTime = (date: string, time: string) => {
    if (!time) {
      return 'Invalid time'; // Vratite poruku ako je vrijeme neispravno
    }

    const match = time.match(/(\d+):(\d+)\s(AM|PM)/);
    if (!match) {
      return 'Invalid time format'; // Vratite poruku ako format vremena nije ispravan
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
        <h1>Transport to Airport</h1>
        {transportOptions.length > 0 ? (
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {transportOptions.map((option) => (
              <Card
                key={option.id}
                style={{
                  width: '18rem',
                  border: selectedOption === option.id ? '2px solid blue' : '1px solid #ccc',
                }}
                onClick={() => handleSelect(option.id)}
              >
                <Card.Body>
                  <Card.Title>{option.name}</Card.Title>
                  {option.id !== 'default' && (
                    <>
                      {option.name === 'Rent-a-Car' ? (
                        // Display price per day for Rent-a-Car
                        <Card.Text>Price per day: ${option.price}</Card.Text>
                      ) : (
                        <>
                          <Card.Text>Price: ${option.price}</Card.Text>
                          {tripDates && (
                            <>
                              <Card.Text>
                                Departure Date: {formatDateTime(tripDates.startDate, option.departure_time)}
                              </Card.Text>
                              <Card.Text>
                                Arrival Date: {formatDateTime(tripDates.startDate, option.arrival_time)}
                              </Card.Text>
                            </>
                          )}
                          <Card.Text>
                            Route: {option.currLocation} → {option.departure}
                          </Card.Text>
                        </>
                      )}
                    </>
                  )}
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <p>No transport options available for the selected route.</p>
        )}
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!selectedOption}
          style={{ marginTop: '20px' }}
        >
          Next
        </Button>
      </Container>
    </>
  );
};

export default TransportFlight;