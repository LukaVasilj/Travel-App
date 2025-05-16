import { useState } from 'react';
import { useRouter } from 'next/router';
import AppNavbar from '../../components/Navbar';
import { Form, Button, Container } from 'react-bootstrap';
import dynamic from 'next/dynamic';

// Dynamically import react-select without SSR
const Select = dynamic(() => import('react-select'), { ssr: false });

const CreateTrip = () => {
  const router = useRouter();
  const [tripDetails, setTripDetails] = useState({
    name: '',
    startDate: '',
    endDate: '',
    currLocation: '', // Current location (disabled by default)
    departure: '',
    destination: '',
    transportType: '', // "road" or "air"
  });

  // List of cities
  const cityOptions = [
    { value: 'split', label: 'Split, Croatia' },
    { value: 'zagreb', label: 'Zagreb, Croatia' },
    { value: 'dubrovnik', label: 'Dubrovnik, Croatia' },
    { value: 'berlin', label: 'Berlin, Germany' },
    { value: 'paris', label: 'Paris, France' },
    { value: 'london', label: 'London, United Kingdom' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTripDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleCityChange = (selectedOption: any, actionMeta: { name: string }) => {
    const { name } = actionMeta;
    setTripDetails((prev) => ({ ...prev, [name]: selectedOption?.value || '' }));
  };

  const handleNext = () => {
    localStorage.setItem('tripDetails', JSON.stringify(tripDetails));

    if (tripDetails.transportType === 'road') {
      router.push('/trips/new/transport');
    } else if (tripDetails.transportType === 'air') {
      router.push('/trips/new/flights');
    }
  };

  // Validacija forme
  const isFormValid = () => {
    const { name, startDate, endDate, departure, destination, transportType, currLocation } = tripDetails;
    if (!name || !startDate || !endDate || !departure || !destination || !transportType) {
      return false;
    }
    if (transportType === "air" && !currLocation) {
      return false;
    }
    return true;
  };

  return (
    <>
      <AppNavbar />
      <Container style={{ maxWidth: '600px', marginTop: '50px' }}>
        <h1>Create New Trip</h1>
        <Form>
          <Form.Group>
            <Form.Label>Trip Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={tripDetails.name}
              onChange={handleChange}
              placeholder="Enter trip name"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              name="startDate"
              value={tripDetails.startDate}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              name="endDate"
              value={tripDetails.endDate}
              onChange={handleChange}
              min={tripDetails.startDate}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Departure Location</Form.Label>
            <Select
              name="departure"
              options={cityOptions}
              onChange={handleCityChange}
              placeholder="Select departure location"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Destination</Form.Label>
            <Select
              name="destination"
              options={cityOptions}
              onChange={handleCityChange}
              placeholder="Select destination"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Transport Type</Form.Label>
            <Form.Control
              as="select"
              name="transportType"
              value={tripDetails.transportType}
              onChange={handleChange}
            >
              <option value="">Select transport type</option>
              <option value="road">Road (Bus, Train, Rent-a-Car)</option>
              <option value="air">Air (Flight)</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Current Location</Form.Label>
            <Select
              name="currLocation"
              options={cityOptions}
              onChange={handleCityChange}
              placeholder="Select your current location"
              isDisabled={tripDetails.transportType !== 'air'} // Disable unless "air" is selected
            />
          </Form.Group>
          <Button
            variant="primary"
            onClick={handleNext}
            style={{ marginTop: '20px' }}
            disabled={!isFormValid()}
          >
            Next
          </Button>
        </Form>
      </Container>
    </>
  );
};

export default CreateTrip;