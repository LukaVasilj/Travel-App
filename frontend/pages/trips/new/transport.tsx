import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AppNavbar from '../../../components/Navbar';
import { Card, Button, Container, Modal } from 'react-bootstrap';
import transportData from '../../../data/transportData.json';

// Helper za veliko prvo slovo
const capitalize = (str: string) =>
  str && typeof str === 'string'
    ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    : '';

const TransportOptions = () => {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [tripDates, setTripDates] = useState<{ startDate: string; endDate: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalOption, setModalOption] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('transportData', JSON.stringify(transportData));
    const tripDetails = JSON.parse(localStorage.getItem('tripDetails') || '{}');
    const { departure, destination, startDate, endDate } = tripDetails;
    setTripDates({ startDate, endDate });
    const filtered = transportData.filter(
      (option) => option.departure === departure && option.destination === destination
    );
    setFilteredOptions(filtered);
  }, []);

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleNext = () => {
    const selectedObj = filteredOptions.find(opt => opt.id === selectedOption);
    if (selectedObj) {
      localStorage.setItem('transportOption', JSON.stringify(selectedObj));
    }
    router.push('/trips/new/accommodation');
  };

  const handleShowDetails = (option: any) => {
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

  const formatRoute = (departure: string, destination: string) => {
    return `${capitalize(departure)} → ${capitalize(destination)}`;
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
          Transport Options
        </h1>
        {filteredOptions.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 24,
            }}
          >
            {filteredOptions.map((option) => (
              <Card
                key={option.id}
                style={{
                  border: selectedOption === option.id ? '2px solid #1E88E5' : '1px solid #ddd',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                  borderRadius: 12,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
                onClick={() => handleSelect(option.id)}
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
                    alt={option.company}
                    style={{ height: 160, objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                  />
                )}
                <Card.Body style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{ flexGrow: 1 }}>
                    <Card.Title style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>
                      {option.company} ({option.type})
                    </Card.Title>
                    <Card.Text style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 6 }}>
                      <b>Price:</b> <span style={{ fontWeight: 400 }}>${option.price}</span>
                    </Card.Text>
                    {/* Za rent-a-car ne prikazuj vrijeme, rutu i trajanje */}
                    {option.type !== 'rent-a-car' && tripDates && (
                      <>
                        <Card.Text>
                          <b>Duration:</b> <span style={{ fontWeight: 400 }}>{option.duration}</span>
                        </Card.Text>
                        <Card.Text>
                          <b>Departure Date:</b> <span style={{ fontWeight: 400 }}>{formatDateTime(tripDates.startDate, option.departure_time)}</span>
                        </Card.Text>
                        <Card.Text>
                          <b>Arrival Date:</b> <span style={{ fontWeight: 400 }}>{formatDateTime(tripDates.startDate, option.arrival_time)}</span>
                        </Card.Text>
                        <Card.Text>
                          <b>Route:</b> <span style={{ fontWeight: 400 }}>{formatRoute(option.departure, option.destination)}</span>
                        </Card.Text>
                      </>
                    )}
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <Button
                      variant="primary"
                      onClick={e => { e.stopPropagation(); handleShowDetails(option); }}
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

        {/* Modal za detalje transporta */}
        <Modal show={showModal} onHide={handleCloseModal} centered size="lg" dialogClassName="rounded-modal">
          <Modal.Header closeButton>
            <Modal.Title>
              {modalOption?.company} ({modalOption?.type})
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
              <p><b>Company:</b> <span style={{ fontWeight: 400 }}>{modalOption?.company}</span></p>
              <p><b>Type:</b> <span style={{ fontWeight: 400 }}>{modalOption?.type}</span></p>
              <p><b>Price:</b> <span style={{ fontWeight: 400 }}>${modalOption?.price}</span></p>
              {/* Za rent-a-car ne prikazuj vrijeme, rutu i trajanje */}
              {modalOption?.type !== 'rent-a-car' && (
                <>
                  <p><b>Duration:</b> <span style={{ fontWeight: 400 }}>{modalOption?.duration}</span></p>
                  <p><b>Departure:</b> <span style={{ fontWeight: 400 }}>{capitalize(modalOption?.departure)} at {modalOption?.departure_time}</span></p>
                  <p><b>Arrival:</b> <span style={{ fontWeight: 400 }}>{capitalize(modalOption?.destination)} at {modalOption?.arrival_time}</span></p>
                  <p><b>Route:</b> <span style={{ fontWeight: 400 }}>{formatRoute(modalOption?.departure, modalOption?.destination)}</span></p>
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
};

export default TransportOptions;