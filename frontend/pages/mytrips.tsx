import { useEffect, useState } from "react";
import AppNavbar from "../components/Navbar";
import {
  Container,
  Card,
  Spinner,
  Button,
  Modal,
  Carousel,
  Alert,
} from "react-bootstrap";
import "../styles/profile-picture.css";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

interface Trip {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  transport_type: string;
  transport_option: any;
  accommodation?: any;
  flight?: any;
  total_cost: number;
}

interface Feedback {
  id: number;
  rating: number;
  comment: string;
  user: { id: number; username: string; profile_image?: string };
}

// Helper za veliko prvo slovo
const capitalize = (str: string) =>
  str && typeof str === "string"
    ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    : "";

const formatDateTime = (date: string, time: string) => {
  if (!date || !time) return "";
  // Očekuje time u formatu "HH:MM AM/PM"
  const match = time.match(/(\d+):(\d+)\s(AM|PM)/);
  if (!match) return `${date} ${time}`;
  const [hours, minutes, period] = match.slice(1);
  const dateObj = new Date(date);
  dateObj.setHours(
    period === "PM" && parseInt(hours) !== 12
      ? parseInt(hours) + 12
      : parseInt(hours)
  );
  dateObj.setMinutes(parseInt(minutes));
  return dateObj.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const MyTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
  const [flightExpanded, setFlightExpanded] = useState<{
    [key: number]: boolean;
  }>({});
  const [accommodationExpanded, setAccommodationExpanded] = useState<{
    [key: number]: boolean;
  }>({});
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalAccName, setModalAccName] = useState<string>("");

  // --- Share trip modal state ---
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [friends, setFriends] = useState<any[]>([]);

  // --- Delete trip modal state ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<null | number>(null);

  const [sharedWith, setSharedWith] = useState<{ [tripId: number]: any[] }>({});

  // Feedback state
  const [feedbacks, setFeedbacks] = useState<{ [tripId: number]: Feedback[] }>(
    {}
  );

  useEffect(() => {
    const fetchTrips = async () => {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:8000/api/trips/", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setTrips(data);

        // Dohvati sharedWith za svaki trip i feedbackove
        data.forEach(async (trip: Trip) => {
          const sharedRes = await fetch(
            `http://localhost:8000/api/trips/shared-with/${trip.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              credentials: "include",
            }
          );
          if (sharedRes.ok) {
            const sharedData = await sharedRes.json();
            setSharedWith((prev) => ({ ...prev, [trip.id]: sharedData }));
          }
          // Dohvati feedbackove
          const fbRes = await fetch(
            `http://localhost:8000/api/trips/${trip.id}/feedbacks`,
            {
              headers: { Authorization: `Bearer ${token}` },
              credentials: "include",
            }
          );
          if (fbRes.ok) {
            const fbData = await fbRes.json();
            setFeedbacks((prev) => ({ ...prev, [trip.id]: fbData }));
          }
        });
      }
      setLoading(false);
    };
    fetchTrips();
  }, []);

  const toggleExpand = (tripId: number) => {
    setExpanded((prev) => ({ ...prev, [tripId]: !prev[tripId] }));
  };

  const toggleFlightExpand = (tripId: number) => {
    setFlightExpanded((prev) => ({ ...prev, [tripId]: !prev[tripId] }));
  };

  const toggleAccommodationExpand = (tripId: number) => {
    setAccommodationExpanded((prev) => ({ ...prev, [tripId]: !prev[tripId] }));
  };

  const handleShowImages = (images: string[], accName: string) => {
    setModalImages(images);
    setModalAccName(accName);
    setShowImagesModal(true);
  };

  const handleCloseImagesModal = () => {
    setShowImagesModal(false);
    setModalImages([]);
    setModalAccName("");
  };

  // --- Share trip logic ---
  const openShareModal = async (tripId: number) => {
    setSelectedTripId(tripId);
    const token = localStorage.getItem("access_token");
    const res = await fetch("http://localhost:8000/api/friends/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setFriends(await res.json());
    setShowShareModal(true);
  };

  const handleShareTrip = async (friendId: number) => {
    const token = localStorage.getItem("access_token");
    // 1. Dohvati CSRF token
    const csrfRes = await fetch("http://localhost:8000/api/csrf-token", {
      credentials: "include",
    });
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrf_token;

    // 2. Pošalji POST zahtjev s CSRF tokenom u headeru
    await fetch("http://localhost:8000/api/trips/share/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify({ trip_id: selectedTripId, friend_id: friendId }),
    });
    setShowShareModal(false);
  };

  // --- Delete trip logic ---
  const handleDeleteTrip = async () => {
    if (tripToDelete === null) return;
    const token = localStorage.getItem("access_token");
    // Dohvati CSRF token
    const csrfRes = await fetch("http://localhost:8000/api/csrf-token", {
      credentials: "include",
    });
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrf_token;

    const res = await fetch(`http://localhost:8000/api/trips/${tripToDelete}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-CSRF-Token": csrfToken,
      },
      credentials: "include",
    });
    if (res.ok) {
      setTrips((trips) => trips.filter((trip) => trip.id !== tripToDelete));
    }
    setShowDeleteModal(false);
    setTripToDelete(null);
  };

  return (
    <>
      <AppNavbar />
      <Container style={{ marginTop: "40px" }}>
        <h1>My Trips</h1>
        {loading ? (
          <Spinner animation="border" />
        ) : trips.length === 0 ? (
          <p>You have no saved trips.</p>
        ) : (
          trips.map((trip) => (
            <Card key={trip.id} style={{ marginBottom: "20px" }}>
              <Card.Body>
                <Card.Title>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>
                      <b>Name:</b> {trip.name}
                    </span>
                    <span>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        style={{ marginLeft: 5 }}
                        onClick={() => openShareModal(trip.id)}
                      >
                        Share
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        style={{ marginLeft: 8 }}
                        onClick={() => {
                          setTripToDelete(trip.id);
                          setShowDeleteModal(true);
                        }}
                      >
                        Delete
                      </Button>
                    </span>
                  </div>
                </Card.Title>
                <div>
                  <b>Dates:</b> {trip.start_date} - {trip.end_date}
                  <br />
                  <b>Transport:</b> {trip.transport_type.toUpperCase()}
                  <br />
                  <b>Total Cost:</b> ${trip.total_cost}
                  <br />
                  {/* Transport Option */}
                  {trip.transport_option && (
                    <div>
                      <b>Transport Option:</b>
                      {trip.transport_option.id === "default" ? (
                        <> Already have a ride to airport (0$)</>
                      ) : (
                        <>
                          {trip.transport_option.name && (
                            <> {trip.transport_option.name}</>
                          )}
                          {trip.transport_option.company && (
                            <> ({trip.transport_option.company})</>
                          )}
                          {trip.transport_option.price && (
                            <>
                              {"  ($"}
                              {trip.transport_option.price}
                              {")"}
                              <Button
                                variant="link"
                                style={{
                                  padding: 0,
                                  marginLeft: 8,
                                  fontSize: 20,
                                  verticalAlign: "middle",
                                  color: "#007bff",
                                  textDecoration: "none",
                                }}
                                onClick={() => toggleExpand(trip.id)}
                                aria-label={
                                  expanded[trip.id]
                                    ? "Hide details"
                                    : "Show more"
                                }
                              >
                                {expanded[trip.id] ? (
                                  <FiChevronUp />
                                ) : (
                                  <FiChevronDown />
                                )}
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  {trip.transport_option && expanded[trip.id] && (
                    <div style={{ marginTop: "10px", marginLeft: "10px" }}>
                      {trip.transport_option.departure_time && (
                        <div>
                          <b>Departure Time:</b>{" "}
                          {trip.transport_option.departure_time}
                        </div>
                      )}
                      {trip.transport_option.arrival_time && (
                        <div>
                          <b>Arrival Time:</b>{" "}
                          {trip.transport_option.arrival_time}
                        </div>
                      )}
                      {trip.transport_option.currLocation &&
                        trip.transport_option.departure && (
                          <div>
                            <b>Route:</b>{" "}
                            {capitalize(trip.transport_option.currLocation)}{" "}
                            &rarr; {capitalize(trip.transport_option.departure)}
                          </div>
                        )}
                      {trip.transport_option.bookingLink && (
                        <div>
                          <b>Booking Link:</b>{" "}
                          <a
                            href={trip.transport_option.bookingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {trip.transport_option.bookingLink}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Accommodation */}
                  {trip.accommodation && (
                    <div>
                      <b>Accommodation:</b> {trip.accommodation.name} ($
                      {trip.accommodation.price})
                      <Button
                        variant="link"
                        style={{
                          padding: 0,
                          marginLeft: 8,
                          fontSize: 20,
                          verticalAlign: "middle",
                          color: "#007bff",
                          textDecoration: "none",
                        }}
                        onClick={() => toggleAccommodationExpand(trip.id)}
                        aria-label={
                          accommodationExpanded[trip.id]
                            ? "Hide accommodation details"
                            : "Show accommodation details"
                        }
                      >
                        {accommodationExpanded[trip.id] ? (
                          <FiChevronUp />
                        ) : (
                          <FiChevronDown />
                        )}
                      </Button>
                      {accommodationExpanded[trip.id] && (
                        <div style={{ marginTop: "10px", marginLeft: "10px" }}>
                          {trip.accommodation.location && (
                            <div>
                              <b>Location:</b> {trip.accommodation.location}
                            </div>
                          )}
                          {trip.accommodation.description && (
                            <div>
                              <b>Description:</b>{" "}
                              {trip.accommodation.description}
                            </div>
                          )}
                          {/* Prikaz buttona za slike */}
                          {((trip.accommodation.images &&
                            trip.accommodation.images.length > 0) ||
                            trip.accommodation.image) && (
                            <div style={{ margin: "10px 0" }}>
                              <b>Pictures:</b>{" "}
                              <Button
                                className="show-pictures-btn"
                                variant="light"
                                size="sm"
                                onClick={() => {
                                  // Pripremi niz slika: glavna + ostale (bez duplikata)
                                  let imgs: string[] = [];
                                  if (trip.accommodation.image)
                                    imgs.push(trip.accommodation.image);
                                  if (
                                    trip.accommodation.images &&
                                    Array.isArray(trip.accommodation.images)
                                  ) {
                                    trip.accommodation.images.forEach(
                                      (img: string) => {
                                        if (img !== trip.accommodation.image)
                                          imgs.push(img);
                                      }
                                    );
                                  }
                                  handleShowImages(
                                    imgs,
                                    trip.accommodation.name
                                  );
                                }}
                                style={{
                                  marginLeft: 8,
                                  padding: "2px 10px",
                                  fontSize: 13,
                                  borderRadius: 12,
                                  border: "1px solid #007bff",
                                  color: "#007bff",
                                  background: "#f8f9fa",
                                  fontWeight: 500,
                                  boxShadow: "none",
                                  transition: "background 0.2s, color 0.2s",
                                }}
                              >
                                <span style={{ verticalAlign: "middle" }}>
                                  Show pictures
                                </span>
                              </Button>
                            </div>
                          )}
                          {trip.accommodation.bookingLink && (
                            <div>
                              <b>Booking Link:</b>{" "}
                              <a
                                href={trip.accommodation.bookingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {trip.accommodation.bookingLink}
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                      <br />
                    </div>
                  )}
                  {/* Flight */}
                  {trip.flight && (
                    <div>
                      <b>
                        Flight:</b> $
                        {(trip.flight?.departure?.price || 0) +
                          (trip.flight?.return?.price || 0)}
                      <Button
                              variant="link"
                              style={{
                                marginLeft: 8,
                                fontSize: 20,
                                color: "#007bff",
                                verticalAlign: "middle",
                                textDecoration: "none",
                                padding: 0,
                              }}
                              onClick={() => toggleFlightExpand(trip.id)}
                              aria-label={
                                flightExpanded[trip.id]
                                  ? "Hide flight details"
                                  : "Show flight details"
                              }
                            >
                              {flightExpanded[trip.id] ? (
                                <FiChevronUp />
                              ) : (
                                <FiChevronDown />
                              )}
                            </Button>
                      {trip.flight.departure && (
                        <>
                          <div>
                            <b>Departure Flight:</b>{" "}
                            {trip.flight.departure.airline} ($
                            {trip.flight.departure.price})
                            
                          </div>
                          {flightExpanded[trip.id] && (
                            <div style={{ marginLeft: 10, marginTop: 8 }}>
                              <div>
                                <b>Route:</b>{" "}
                                {capitalize(trip.flight.departure.departure)} →{" "}
                                {capitalize(trip.flight.departure.destination)}
                              </div>
                              <div>
                                <b>Departure Time:</b>{" "}
  {formatDateTime(trip.start_date, trip.flight.departure.departure_time)}
                              </div>
                              <div>
                                <b>Arrival Time:</b>{" "}
  {formatDateTime(trip.start_date, trip.flight.departure.arrival_time)}
                              </div>
                              {trip.flight.departure.bookingLink && (
                                <div style={{ marginBottom: "10px" }}>
                                  <b>Booking Link:</b>{" "}
                                  <a
                                    href={trip.flight.departure.bookingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {trip.flight.departure.bookingLink}
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                      {trip.flight.return && (
                        <>
                          <div >
                            <b >Return Flight:</b> {trip.flight.return.airline}{" "}
                            (${trip.flight.return.price})
                          </div>
                          {flightExpanded[trip.id] && (
                            <div style={{ marginLeft: 10, marginTop: 8 }}>
                              <div>
                                <b>Route:</b>{" "}
                                {capitalize(trip.flight.return.departure)} →{" "}
                                {capitalize(trip.flight.return.destination)}
                              </div>
                              <div>
                                <b>Departure Time:</b>{" "}
  {formatDateTime(trip.end_date, trip.flight.return.departure_time)}
                              </div>
                              <div>
                                <b>Arrival Time:</b>{" "}
  {formatDateTime(trip.end_date, trip.flight.return.arrival_time)}
                              </div>
                              {trip.flight.return.bookingLink && (
                                <div>
                                  <b>Booking Link:</b>{" "}
                                  <a
                                    href={trip.flight.return.bookingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {trip.flight.return.bookingLink}
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  {/* FEEDBACKS */}
                  <div style={{ marginTop: 20 }}>
                    <h6>Feedback</h6>
                    {feedbacks[trip.id] && feedbacks[trip.id].length > 0 ? (
                      feedbacks[trip.id].map((fb) => (
                        <Alert
                          key={fb.id}
                          variant="light"
                          style={{
                            border: "1px solid #ddd",
                            marginBottom: 5,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <img
                            src={
                              fb.user.profile_image
                                ? `http://localhost:8000${fb.user.profile_image}`
                                : "/default-profile.png"
                            }
                            alt="Profilna slika"
                            className="profile-image-circle-small"
                            style={{ width: 32, height: 32, marginRight: 10 }}
                          />
                          <b>{fb.user.username}:</b> {fb.comment}{" "}
                          <span style={{ color: "#f39c12" }}>
                            ({fb.rating}/5)
                          </span>
                        </Alert>
                      ))
                    ) : (
                      <span style={{ color: "#888" }}>No feedbacks yet.</span>
                    )}
                  </div>
                </div>
                {sharedWith[trip.id] && sharedWith[trip.id].length > 0 && (
                  <span
                    style={{ fontSize: 14, color: "#007bff", marginLeft: 10 }}
                  >
                    Trip shared with user:{" "}
                    <b>
                      {sharedWith[trip.id].map((user, idx) => (
                        <span key={user.id}>
                          {user.username}
                          {idx < sharedWith[trip.id].length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </b>
                  </span>
                )}
              </Card.Body>
            </Card>
          ))
        )}
      </Container>
      {/* Modal za slike smještaja */}
      <Modal
        show={showImagesModal}
        onHide={handleCloseImagesModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Pictures: {modalAccName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalImages.length > 0 ? (
            <Carousel>
              {modalImages.map((img, idx) => (
                <Carousel.Item key={idx}>
                  <img
                    className="d-block w-100"
                    src={img}
                    alt={`Accommodation ${idx + 1}`}
                    style={{ maxHeight: 400, objectFit: "cover" }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            <p>No pictures available.</p>
          )}
        </Modal.Body>
      </Modal>
      {/* Modal za dijeljenje putovanja */}
      <Modal
        show={showShareModal}
        onHide={() => setShowShareModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Share Trip</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Select a friend to share with:</p>
          {friends.length === 0 ? (
            <p>You have no friends to share with.</p>
          ) : (
            friends.map((friend) => (
              <Button
                key={friend.id}
                onClick={() => handleShareTrip(friend.id)}
                style={{ margin: 4 }}
              >
                {friend.username}
              </Button>
            ))
          )}
        </Modal.Body>
      </Modal>
      {/* Modal za potvrdu brisanja */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Trip</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this trip?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteTrip}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MyTrips;
