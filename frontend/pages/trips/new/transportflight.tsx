import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AppNavbar from '../../../components/Navbar';
import { Card, Button, Container, Modal } from 'react-bootstrap';
import transportFlightData from '../../../data/transportFlightData.json';

interface TransportOption {
  id: string;
  name: string;
  currLocation: string;
  departure: string;
  price: number;
  departure_time: string;
  arrival_time: string;
  image?: string;
  bookingLink?: string;
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const TransportFlight = () => {
  const router = useRouter();
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [tripDates, setTripDates] = useState<{ startDate: string; endDate: string } | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalOption, setModalOption] = useState<TransportOption | null>(null);

  useEffect(() => {
    localStorage.setItem('transportFlightData', JSON.stringify(transportFlightData));
  }, []);

  useEffect(() => {
    const tripDetails = localStorage.getItem('tripDetails');
    let options = [...transportFlightData];

    const defaultOption: TransportOption = {
      id: 'default',
      name: 'Already have a ride to airport',
      currLocation: '',
      departure: '',
      price: 0,
      departure_time: '',
      arrival_time: '',
      image: '/images/ride.jpg'
    };
    options.unshift(defaultOption);

    if (tripDetails) {
      const { departure, currLocation, startDate, endDate } = JSON.parse(tripDetails);
      setTripDates({ startDate, endDate });
      const filteredOptions = options.filter(
        (option) =>
          option.id === 'default' ||
          (option.currLocation === currLocation && option.departure === departure)
      );
      setTransportOptions(filteredOptions);
    } else {
      setTransportOptions(options);
    }
  }, []);

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleNext = () => {
    const selectedObj = transportOptions.find(opt => opt.id === selectedOption);
    if (selectedObj) {
      localStorage.setItem('transportOption', JSON.stringify(selectedObj));
    }
    router.push('/trips/new/accommodation');
  };

  const handleShowDetails = (option: TransportOption) => {
    setModalOption(option);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalOption(null);
  };

  const formatDateTime = (date: string, time: string) => {
    if (!time) return 'Invalid time';
    const match = time.match(/(\d+):(\d+)\s(AM|PM)/);
    if (!match) return 'Invalid time format';
    const [hours, minutes, period] = match.slice(1);
    const dateObj = new Date(date);
    dateObj.setHours(period === 'PM' && parseInt(hours) !== 12 ? parseInt(hours) + 12 : parseInt(hours));
    dateObj.setMinutes(parseInt(minutes));
    return dateObj.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
  <>
    <AppNavbar />
    <Container style={{ marginTop: 50, maxWidth: 1200 }}>
      <h1
        style={{
          marginBottom: 30,
          fontWeight: '700',
          fontSize: '2.2rem',
          textAlign: 'center',
        }}
      >
        Transport to Airport
      </h1>

      {transportOptions.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 24,
          }}
        >
          {transportOptions.map(option => (
            <Card
              key={option.id}
              onClick={() => handleSelect(option.id)}
              style={{
                border:
                  selectedOption === option.id ? '2px solid #1E88E5' : '1px solid #ddd',
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
                (e.currentTarget as HTMLElement).style.boxShadow =
                  '0 10px 20px rgba(30, 136, 229, 0.3)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow =
                  '0 3px 8px rgba(0,0,0,0.1)';
              }}
            >
              {option.image && (
                <Card.Img
                  variant="top"
                  src={option.image}
                  alt={option.name}
                  style={{ height: 160, objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                />
              )}

              <Card.Body
                style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
              >
                <div style={{ flexGrow: 1 }}>
                  <Card.Title
                    style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}
                  >
                    {option.name}
                  </Card.Title>

                  {option.id !== 'default' ? (
                    <>
                      <Card.Text style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 6 }}>
                        Price: ${option.price}
                      </Card.Text>

                      {tripDates && !option.name.toLowerCase().includes('rent-a-car') && (
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
                        Route: {capitalize(option.currLocation)} → {capitalize(option.departure)}
                      </Card.Text>
                    </>
                  ) : (
                    <Card.Text style={{ color: 'gray' }}>No transport needed</Card.Text>
                  )}
                </div>

                {option.id !== 'default' && (
                  <div style={{ marginTop: 20 }}>
                    <Button
                      variant="primary"
                      onClick={e => {
                        e.stopPropagation();
                        handleShowDetails(option);
                      }}
                      style={{
                        alignSelf: 'flex-start',
                        padding: '8px 20px',
                        fontSize: '0.85rem',
                        borderRadius: 6,
                        transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
                        color: 'white',
                        backgroundColor: 'var(--accent-color)',
                        borderColor: 'var(--accent-color)',
                      }}
                      onMouseEnter={e => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.backgroundColor = 'var(--hover-color)';
                        target.style.borderColor = 'var(--hover-color)';
                        target.style.color = 'white';
                      }}
                      onMouseLeave={e => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.backgroundColor = 'var(--accent-color)';
                        target.style.borderColor = 'var(--accent-color)';
                        target.style.color = 'white';
                      }}
                    >
                      See details
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: 'center', marginTop: 40 }}>
          No transport options available for the selected route.
        </p>
      )}

      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!selectedOption}
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
          <Modal.Title>
            {modalOption?.name} ({capitalize(modalOption?.currLocation || '')} → {capitalize(modalOption?.departure || '')})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            style={{
              fontSize: '1.1rem',
              fontWeight: 500,
              lineHeight: 1.6,
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              color: '#333',
            }}
          >
            <p><b>Name:</b> {modalOption?.name}</p>
            <p><b>Price:</b> ${modalOption?.price}</p>
            {!modalOption?.name?.toLowerCase().includes('rent-a-car') && (
              <>
                <p><b>Departure:</b> {capitalize(modalOption?.currLocation || '')} at {modalOption?.departure_time}</p>
                <p><b>Arrival:</b> {capitalize(modalOption?.departure || '')} at {modalOption?.arrival_time}</p>
                
              </>
            )}
            
          </div>

          {modalOption?.bookingLink && (
            <div style={{ marginTop: 30, textAlign: 'center' }}>
              <Button
                variant="primary"
                href={modalOption.bookingLink}
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
}

export default TransportFlight;
