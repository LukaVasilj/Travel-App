import { useEffect, useState } from "react";
import AppNavbar from "../components/Navbar";
import {
  Container,
  Card,
  Spinner,
  Button,
  Modal,
  Carousel,
  Form,
  Alert,
} from "react-bootstrap";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import "../styles/profile-picture.css";

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

interface SharedBy {
  id: number;
  username: string;
  email: string;
}

interface SharedTripData {
  trip: Trip;
  shared_by: SharedBy;
  shared_trip_id?: number; // Dodaj ako backend šalje id share-a
}

interface Feedback {
  id: number;
  rating: number;
  comment: string;
  user: { id: number; username: string };
}

// Helper za veliko prvo slovo
const capitalize = (str: string) =>
  str && typeof str === "string"
    ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    : "";

const formatDateTime = (date: string, time: string) => {
  if (!date || !time) return "";
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

const SharedTrips = () => {
  const [sharedTrips, setSharedTrips] = useState<SharedTripData[]>([]);
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

  // Feedback state
  const [feedbacks, setFeedbacks] = useState<{ [tripId: number]: Feedback[] }>(
    {}
  );
  const [feedbackLeft, setFeedbackLeft] = useState<{
    [sharedTripId: number]: boolean;
  }>({});
  const [feedbackForm, setFeedbackForm] = useState<{
    [sharedTripId: number]: { rating: number; comment: string };
  }>({});
  const [feedbackError, setFeedbackError] = useState<{
    [sharedTripId: number]: string;
  }>({});
  const [feedbackSuccess, setFeedbackSuccess] = useState<{
    [sharedTripId: number]: string;
  }>({});

  useEffect(() => {
    const fetchSharedTrips = async () => {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:8000/api/trips/shared/", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setSharedTrips(data);

        // Za svaki trip, dohvati feedbackove i provjeri je li korisnik već ostavio feedback
        data.forEach(async (item: any) => {
          const tripId = item.trip.id;
          const sharedTripId = item.shared_trip_id;
          // Dohvati feedbackove za shared trip
          const fbRes = await fetch(
            `http://localhost:8000/api/trips/shared-feedbacks/${sharedTripId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              credentials: "include",
            }
          );
          if (fbRes.ok) {
            const fbData = await fbRes.json();
            setFeedbacks((prev) => ({ ...prev, [sharedTripId]: fbData }));
            // Provjeri je li korisnik već ostavio feedback
            const myId = JSON.parse(atob(token.split(".")[1])).user_id;
            const alreadyLeft = fbData.some(
              (fb: Feedback) => fb.user.id === myId
            );
            setFeedbackLeft((prev) => ({
              ...prev,
              [sharedTripId]: alreadyLeft,
            }));
          }
        });
      }
      setLoading(false);
    };
    fetchSharedTrips();
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

  // Feedback form handlers
  const handleFeedbackChange = (
    sharedTripId: number,
    field: "rating" | "comment",
    value: any
  ) => {
    setFeedbackForm((prev) => ({
      ...prev,
      [sharedTripId]: { ...prev[sharedTripId], [field]: value },
    }));
  };

  const handleFeedbackSubmit = async (sharedTripId: number, tripId: number) => {
    setFeedbackError({});
    setFeedbackSuccess({});
    const token = localStorage.getItem("access_token");
    // Dohvati CSRF token
    const csrfRes = await fetch("http://localhost:8000/api/csrf-token", {
      credentials: "include",
    });
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrf_token;

    const form = feedbackForm[sharedTripId];
    if (!form || !form.rating || !form.comment) {
      setFeedbackError((prev) => ({
        ...prev,
        [sharedTripId]: "Please provide rating and comment.",
      }));
      return;
    }
    const res = await fetch("http://localhost:8000/api/trips/feedback/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify({
        shared_trip_id: sharedTripId,
        rating: form.rating,
        comment: form.comment,
      }),
    });
    if (res.ok) {
      setFeedbackSuccess((prev) => ({
        ...prev,
        [sharedTripId]: "Feedback submitted!",
      }));
      setFeedbackLeft((prev) => ({ ...prev, [sharedTripId]: true }));
      // Refresh feedbacks
      const fbRes = await fetch(
        `http://localhost:8000/api/trips/shared-feedbacks/${sharedTripId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      );
      if (fbRes.ok) {
        const fbData = await fbRes.json();
        setFeedbacks((prev) => ({ ...prev, [sharedTripId]: fbData }));
      }
    } else {
      const data = await res.json();
      // Ako je feedback već ostavljen, sakrij formu
      if (data.detail === "Feedback already left.") {
        setFeedbackLeft((prev) => ({ ...prev, [sharedTripId]: true }));
      }
      setFeedbackError((prev) => ({
        ...prev,
        [sharedTripId]: data.detail || "Error submitting feedback.",
      }));
    }
  };

  return (
    <>
      <AppNavbar />
      <Container style={{ marginTop: "40px" }}>
        <h2>Trips Shared With Me</h2>
        {loading ? (
          <Spinner animation="border" />
        ) : sharedTrips.length === 0 ? (
          <p>No trips shared with you.</p>
        ) : (
          sharedTrips.map(({ trip, shared_by, shared_trip_id }, idx) => {
            if (!trip || !shared_by) return null;
            const stId = shared_trip_id; // fallback ako nema shared_trip_id
            return (
              <Card
                key={trip.id ?? idx}
                style={{ marginBottom: "20px", borderColor: "#007bff" }}
              >
                <Card.Body>
                  <Card.Title>
                    <b>Name:</b> {trip.name}
                    <span
                      style={{ float: "right", fontSize: 14, color: "#007bff" }}
                    >
                      Shared by: <b>{shared_by.username}</b>
                    </span>
                  </Card.Title>
                  <div>
                    <div className="shared-trip-info-row">
                      <b>Dates:</b> {trip.start_date} - {trip.end_date}
                    </div>
                    <div className="shared-trip-info-row">
                      <b>Transport:</b> {trip.transport_type.toUpperCase()}
                    </div>
                    <div className="shared-trip-info-row">
                      <b>Total Cost:</b> ${trip.total_cost}
                    </div>
                    {/* Transport Option */}
                    {trip.transport_option && (
                      <div className="shared-trip-info-row">
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
                        {trip.transport_option && expanded[trip.id] && (
                          <div
                            style={{ marginTop: "10px", marginLeft: "10px" }}
                          >
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
                                  {capitalize(
                                    trip.transport_option.currLocation
                                  )}{" "}
                                  &rarr;{" "}
                                  {capitalize(trip.transport_option.departure)}
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
                      </div>
                    )}
                    {/* Accommodation */}
                    {trip.accommodation && (
                      <div className="shared-trip-info-row">
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
                          <div
                            style={{ marginTop: "10px", marginLeft: "10px" }}
                          >
                            {trip.accommodation.location && (
                              <div className="shared-trip-info-row">
                                <b>Location:</b> {trip.accommodation.location}
                              </div>
                            )}
                            {trip.accommodation.description && (
                              <div>
                                <b>Description:</b>{" "}
                                {trip.accommodation.description}
                              </div>
                            )}
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
                      </div>
                    )}
                    {/* Flight */}
                    {trip.flight && (
                      <div className="shared-trip-info-row">
                        <b>
                          Flight</b>: $
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
                                  {capitalize(trip.flight.departure.departure)}{" "}
                                  →{" "}
                                  {capitalize(
                                    trip.flight.departure.destination
                                  )}
                                </div>
                                <div>
                                  <b>Departure Time:</b>{" "}
                                  {formatDateTime(
                                    trip.start_date,
                                    trip.flight.departure.departure_time
                                  )}
                                </div>
                                <div>
                                  <b>Arrival Time:</b>{" "}
                                  {formatDateTime(
                                    trip.start_date,
                                    trip.flight.departure.arrival_time
                                  )}
                                </div>
                                {trip.flight.departure.bookingLink && (
                                  <div style={{ marginBottom: " 10px" }}>
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
                            <div>
                              <b>Return Flight:</b> {trip.flight.return.airline}{" "}
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
                                  {formatDateTime(
                                    trip.end_date,
                                    trip.flight.return.departure_time
                                  )}
                                </div>
                                <div>
                                  <b>Arrival Time:</b>{" "}
                                  {formatDateTime(
                                    trip.end_date,
                                    trip.flight.return.arrival_time
                                  )}
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
                  </div>
                  {/* FEEDBACK FORM */}
                  <div style={{ marginTop: 20 }}>
                    <h6>Feedback</h6>
                    {feedbacks[stId] && feedbacks[stId].length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        {feedbacks[stId].map((fb) => (
                          <Alert
                            key={fb.id}
                            variant="light"
                            style={{
                              border: "1px solid #ddd",
                              marginBottom: 5,
                            }}
                          >
                            <b>{fb.user.username}:</b> {fb.comment}{" "}
                            <span style={{ color: "#f39c12" }}>
                              ({fb.rating}/5)
                            </span>
                          </Alert>
                        ))}
                      </div>
                    )}
                    {!feedbackLeft[stId] ? (
                      <Form>
                        <Form.Group>
                          <Form.Label>Rating</Form.Label>
                          <Form.Control
                            as="select"
                            value={feedbackForm[stId]?.rating || ""}
                            onChange={(e) =>
                              handleFeedbackChange(
                                stId,
                                "rating",
                                Number(e.target.value)
                              )
                            }
                          >
                            <option value="">Select</option>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </Form.Control>
                        </Form.Group>
                        <Form.Group>
                          <Form.Label>Comment</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={feedbackForm[stId]?.comment || ""}
                            onChange={(e) =>
                              handleFeedbackChange(
                                stId,
                                "comment",
                                e.target.value
                              )
                            }
                          />
                        </Form.Group>
                        {feedbackError[stId] && (
                          <Alert variant="danger">{feedbackError[stId]}</Alert>
                        )}
                        {feedbackSuccess[stId] && (
                          <Alert variant="success">
                            {feedbackSuccess[stId]}
                          </Alert>
                        )}
                        <Button
                          variant="primary"
                          size="sm"
                          style={{ marginTop: 8 }}
                          onClick={() => handleFeedbackSubmit(stId, trip.id)}
                        >
                          Submit Feedback
                        </Button>
                      </Form>
                    ) : (
                      <Alert variant="success" style={{ marginTop: 8 }}>
                        You left feedback for this trip.
                      </Alert>
                    )}
                  </div>
                </Card.Body>
              </Card>
            );
          })
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
    </>
  );
};

export default SharedTrips;
