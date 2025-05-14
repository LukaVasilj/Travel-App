import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AppNavbar from '../../../components/Navbar';
import { Container, Card, Button } from 'react-bootstrap';

interface TransportOption {
  id: string;
  name?: string;
  currLocation?: string;
  departure: string;
  destination?: string;
  price: number;
  duration: string;
  company?: string;
}

interface Accommodation {
  id: string;
  name: string;
  type: string;
  price: number;
  image: string;
}

interface Flight {
  id: string;
  airline: string;
  departure: string;
  destination: string;
  price: number;
  departure_time: string;
  arrival_time: string;
}

const TripSummary = () => {
  const router = useRouter();
  const [transportOption, setTransportOption] = useState<TransportOption | null>(null);
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [tripDates, setTripDates] = useState<{ startDate: string; endDate: string } | null>(null);

  // Helper function to format date and time
  const formatDateTime = (date: string, time: string) => {
    console.log('Formatting Date:', date, 'Time:', time); // Debugging
    if (!date || !time) {
      console.error('Invalid date or time:', { date, time });
      return 'Invalid Date';
    }
    const match = time.match(/(\d+):(\d+)\s(AM|PM)/);
    if (!match) {
      console.error('Invalid time format:', time);
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
    const transportData = localStorage.getItem('transportData'); // For bus transport
    const transportFlightData = localStorage.getItem('transportFlightData'); // For air transport
    const accommodationData = localStorage.getItem('accommodationData');
    const flightsData = localStorage.getItem('flightsData');

    console.log('Trip Details:', tripDetails);
    console.log('Selected Accommodation ID:', selectedAccommodationId);
    console.log('Selected Flight ID:', selectedFlightId);

    if (tripDetails) {
      const { startDate, endDate, transportType } = JSON.parse(tripDetails);
      setTripDates({ startDate, endDate });
      console.log('Start Date:', startDate, 'End Date:', endDate); // Debugging

      // Fetch transport option based on transportType
      if (transportType === 'road') {
        const selectedTransportId = localStorage.getItem('transportOption');
        if (selectedTransportId && transportData) {
          const parsedTransportData: TransportOption[] = JSON.parse(transportData);
          const selectedTransport = parsedTransportData.find((option) => option.id === selectedTransportId);
          if (selectedTransport) {
            setTransportOption({
              ...selectedTransport,
              destination: selectedTransport.destination || selectedTransport.departure, // Ensure destination is not empty
            });
          } else {
            setTransportOption(null);
          }
        }
      } else if (transportType === 'air') {
        const selectedTransportId = localStorage.getItem('transportOption');
        if (selectedTransportId && transportFlightData) {
          const parsedTransportFlightData: TransportOption[] = JSON.parse(transportFlightData);
          const selectedTransport = parsedTransportFlightData.find((option) => option.id === selectedTransportId);
          setTransportOption(selectedTransport || null);
        }
      }
    }

    // Fetch accommodation option
    if (selectedAccommodationId && accommodationData) {
      const parsedAccommodationData: Accommodation[] = JSON.parse(accommodationData);
      const selectedAccommodation = parsedAccommodationData.find((a) => a.id === selectedAccommodationId);
      setAccommodation(selectedAccommodation || null);
    }

    // Fetch flight option only if transportType is "air"
    if (tripDetails && JSON.parse(tripDetails).transportType === 'air') {
      if (selectedFlightId && flightsData) {
        const parsedFlightsData: Flight[] = JSON.parse(flightsData);
        const selectedFlight = parsedFlightsData.find((flight) => flight.id === selectedFlightId);
        setFlight(selectedFlight || null);
      }
    } else {
      setFlight(null); // Clear flight data if transportType is "road"
    }
  }, []);

  useEffect(() => {
    // Calculate total cost
    const transportCost = transportOption?.price || 0;
    const accommodationCost = accommodation?.price || 0;
    const flightCost = flight?.price || 0;

    setTotalCost(transportCost + accommodationCost + flightCost);
  }, [transportOption, accommodation, flight]);

  const handleFinalize = () => {
    alert('Trip finalized! Enjoy your journey!');

    // Clear only trip-related data from localStorage
    localStorage.removeItem('transportOption');
    localStorage.removeItem('selectedAccommodation');
    localStorage.removeItem('selectedFlight');
    localStorage.removeItem('tripDetails');

    // Redirect user to the main page
    router.push('/glavnastranica');
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
            <>
              <Card.Text>Name: {transportOption.name || 'N/A'}</Card.Text>
            </>
          ) : (
            <>
              <Card.Text>Company: {transportOption.company || 'N/A'}</Card.Text>
            </>
          )}
        </>
      )}
      {transportOption.name === 'Rent-a-Car' ? (
        <Card.Text>Price: ${transportOption.price} per day</Card.Text>
      ) : (
        <>
          <Card.Text>Price: ${transportOption.price}</Card.Text>
          {tripDates && (
            <>
              <Card.Text>
                Departure Date: {formatDateTime(tripDates.startDate, transportOption.departure_time)}
              </Card.Text>
              <Card.Text>
                Arrival Date: {formatDateTime(tripDates.startDate, transportOption.arrival_time)}
              </Card.Text>
            </>
          )}
          <Card.Text>
            Route: {transportOption.departure} → {transportOption.destination || transportOption.departure}
          </Card.Text>
        </>
      )}
    </Card.Body>
  </Card>
)} 
          {flight && tripDates && (
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
              </Card.Body>
            </Card>
          )} 
          {accommodation && (
  <Card>
    <Card.Body>
      <Card.Title>Accommodation</Card.Title>
      <Card.Text>Name: {accommodation.name}</Card.Text>
      <Card.Text>Type: {accommodation.type}</Card.Text>
      <Card.Text>Price: ${accommodation.price}</Card.Text>
    </Card.Body>
  </Card>
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