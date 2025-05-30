import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AppNavbar from "../../../components/Navbar";
import { Container, Card, Button, Modal, Carousel } from "react-bootstrap";
import flightsData from "../../../data/flightsData.json";

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return "";
}

function cleanObject(obj: any) {
  if (!obj) return obj;
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [
        k,
        typeof v === "object" && v !== null && !Array.isArray(v)
          ? cleanObject(v)
          : v,
      ])
  );
}

const capitalize = (str: string) =>
  str && typeof str === "string"
    ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    : "";

interface TransportOption {
  id: string;
  name?: string;
  currLocation?: string;
  departure: string;
  destination?: string;
  price?: number;
  duration?: string;
  company?: string;
  image?: string;
  bookingLink?: string;
}

interface Accommodation {
  id: string;
  name: string;
  type: string;
  price: number;
  image: string;
  images?: string[];
  description?: string;
  reviews?: { user: string; comment: string; rating: number }[];
  location: string;
  bookingLink?: string;
}

interface Flight {
  id: string;
  airline: string;
  departure: string;
  destination: string;
  price: number;
  departure_time: string;
  arrival_time: string;
  image?: string;
  images?: string[];
  bookingLink?: string;
}

const TripSummary = () => {
  const router = useRouter();
  const [transportOption, setTransportOption] =
    useState<TransportOption | null>(null);
  const [accommodation, setAccommodation] = useState<Accommodation | null>(
    null
  );
  const [flight, setFlight] = useState<Flight | null>(null);
  const [returnFlight, setReturnFlight] = useState<Flight | null>(null);

  const [totalCost, setTotalCost] = useState<number>(0);
  const [tripDates, setTripDates] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);
  const [showAccModal, setShowAccModal] = useState(false);
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState(false);

  const formatDateTime = (date: string, time: string) => {
    if (!date || !time) {
      return "Invalid Date";
    }
    const match = time.match(/(\d+):(\d+)\s(AM|PM)/);
    if (!match) {
      return "Invalid Time Format";
    }
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

  const formatRoute = (departure: string, destination?: string) => {
    if (!departure) return "";
    if (!destination) return capitalize(departure);
    return `${capitalize(departure)} → ${capitalize(destination)}`;
  };

  useEffect(() => {
    const tripDetails = localStorage.getItem("tripDetails");
    const selectedAccommodationId = localStorage.getItem(
      "selectedAccommodation"
    );
    const selectedFlightId = localStorage.getItem("selectedFlight");
    const accommodationData = localStorage.getItem("accommodationData");
    const flightsDataLS = localStorage.getItem("flightsData");

    const selectedTransportOption = localStorage.getItem("transportOption");
    if (selectedTransportOption) {
      setTransportOption(JSON.parse(selectedTransportOption));
    }

    if (tripDetails) {
      const { startDate, endDate } = JSON.parse(tripDetails);
      setTripDates({ startDate, endDate });
    }

    if (selectedAccommodationId && accommodationData) {
      const parsedAccommodationData: Accommodation[] =
        JSON.parse(accommodationData);
      const selectedAccommodation = parsedAccommodationData.find(
        (a) => a.id === selectedAccommodationId
      );

      // Ako nije pronađen (npr. default), ručno ga kreiraj
      if (selectedAccommodation) {
        setAccommodation(selectedAccommodation);
      } else if (selectedAccommodationId === "default") {
        setAccommodation({
          id: "default",
          name: "Already have accommodation",
          type: "other",
          price: 0,
          image: "/images/cozy_hotel.jpg", // ili tvoja slika
          location: "",
          description: "You already have your own accommodation for this trip.",
        });
      } else {
        setAccommodation(null);
      }
    }

    if (tripDetails && JSON.parse(tripDetails).transportType === "air") {
      if (selectedFlightId && flightsDataLS) {
        const parsedFlightsData: Flight[] = JSON.parse(flightsDataLS);
        const selectedFlight = parsedFlightsData.find(
          (flight) => flight.id === selectedFlightId
        );
        setFlight(selectedFlight || null);

        // Pronađi povratni let
        if (selectedFlight) {
          const ret = parsedFlightsData.find(
            (f) =>
              f.departure === selectedFlight.destination &&
              f.destination === selectedFlight.departure
          );
          setReturnFlight(ret || null);
        } else {
          setReturnFlight(null);
        }
      }
    } else {
      setFlight(null);
      setReturnFlight(null);
    }
  }, []);

  useEffect(() => {
    const transportCost = transportOption?.price || 0;
    const accommodationCost = accommodation?.price || 0;
    const flightCost = (flight?.price || 0) + (returnFlight?.price || 0);
    setTotalCost(transportCost + accommodationCost + flightCost);
  }, [transportOption, accommodation, flight, returnFlight]);

  const handleFinalize = async () => {
    await fetch("http://localhost:8000/api/csrf-token", {
      credentials: "include",
    });
    const csrfToken = getCookie("fastapi-csrf-token");
    const tripDetails = JSON.parse(localStorage.getItem("tripDetails") || "{}");
    const payload = {
      name: tripDetails.name || "My Trip",
      start_date: tripDetails.startDate,
      end_date: tripDetails.endDate,
      transport_type: tripDetails.transportType,
      transport_option: transportOption ? cleanObject(transportOption) : {},
      accommodation: accommodation ? cleanObject(accommodation) : null,
      flight: flight
    ? {
        departure: cleanObject(flight),
        return: returnFlight ? cleanObject(returnFlight) : null,
      }
    : null,
      total_cost: Number(totalCost),
    };

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/trips/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken || "",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (response.ok) {
        alert("Trip finalized and saved! Enjoy your journey!");
        localStorage.removeItem("transportOption");
        localStorage.removeItem("selectedAccommodation");
        localStorage.removeItem("selectedFlight");
        localStorage.removeItem("tripDetails");
        router.push("/mytrips");
      } else {
        const error = await response.json();
        alert("Failed to save trip: " + JSON.stringify(error));
      }
    } catch (err) {
      alert("Error saving trip.");
    }
  };

  return (
    <>
      <AppNavbar />
      <Container style={{ marginTop: "50px" }}>
        <h1>Trip Summary</h1>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {transportOption && (
            <>
              <Card>
                <Card.Body>
                  <Card.Title>Transport</Card.Title>
                  {transportOption.id === "default" ? (
                    <>
                      <Card.Text>
                        <b>Name:</b>{" "}
                        <span style={{ fontWeight: 400 }}>
                          {transportOption.name ||
                            "Already have a ride to airport"}
                        </span>
                      </Card.Text>
                      <Card.Text>
                        <b>Price:</b>{" "}
                        <span style={{ fontWeight: 400 }}>
                          0$ (Own transport)
                        </span>
                      </Card.Text>
                    </>
                  ) : (
                    <>
                      {"name" in transportOption ? (
                        <>
                          <Card.Text>
                            <b>Name:</b>{" "}
                            <span style={{ fontWeight: 400 }}>
                              {transportOption.name}
                            </span>
                          </Card.Text>
                          <Card.Text>
                            <b>Price:</b>{" "}
                            <span style={{ fontWeight: 400 }}>
                              ${transportOption.price}
                            </span>
                          </Card.Text>
                          <Card.Text>
                            <b>Departure:</b>{" "}
                            <span style={{ fontWeight: 400 }}>
                              {capitalize(transportOption.currLocation || "")}{" "}
                              at {transportOption.departure_time}
                            </span>
                          </Card.Text>
                          <Card.Text>
                            <b>Arrival:</b>{" "}
                            <span style={{ fontWeight: 400 }}>
                              {capitalize(transportOption.departure || "")} at{" "}
                              {transportOption.arrival_time}
                            </span>
                          </Card.Text>
                          <Card.Text>
                            <b>Route:</b>{" "}
                            <span style={{ fontWeight: 400 }}>
                              {capitalize(transportOption.currLocation || "")} →{" "}
                              {capitalize(transportOption.departure || "")}
                            </span>
                          </Card.Text>
                        </>
                      ) : (
                        <>
                          <Card.Text>
                            <b>Company:</b>{" "}
                            <span style={{ fontWeight: 400 }}>
                              {transportOption.company}
                            </span>
                          </Card.Text>
                          <Card.Text>
                            <b>Type:</b>{" "}
                            <span style={{ fontWeight: 400 }}>
                              {transportOption.type}
                            </span>
                          </Card.Text>
                          <Card.Text>
                            <b>Price:</b>{" "}
                            <span style={{ fontWeight: 400 }}>
                              ${transportOption.price}
                            </span>
                          </Card.Text>
                          <Card.Text>
                            <b>Duration:</b>{" "}
                            <span style={{ fontWeight: 400 }}>
                              {transportOption.duration}
                            </span>
                          </Card.Text>
                          <Card.Text>
                            <b>Departure:</b>{" "}
                            <span style={{ fontWeight: 400 }}>
                              {capitalize(transportOption.departure)} at{" "}
                              {transportOption.departure_time}
                            </span>
                          </Card.Text>
                          <Card.Text>
                            <b>Arrival:</b>{" "}
                            <span style={{ fontWeight: 400 }}>
                              {capitalize(transportOption.destination)} at{" "}
                              {transportOption.arrival_time}
                            </span>
                          </Card.Text>
                          <Card.Text>
                            <b>Route:</b>{" "}
                            <span style={{ fontWeight: 400 }}>
                              {formatRoute(
                                transportOption.departure,
                                transportOption.destination
                              )}
                            </span>
                          </Card.Text>
                        </>
                      )}
                      <Button
                        variant="primary"
                        onClick={() => setShowTransportModal(true)}
                        style={{
                          alignSelf: "flex-start",
                          padding: "8px 20px",
                          fontSize: "0.85rem",
                          borderRadius: "6px",
                          transition:
                            "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
                          color: "white",
                          backgroundColor: "var(--accent-color)",
                          borderColor: "var(--accent-color)",
                          marginTop: "10px",
                        }}
                        onMouseEnter={(e) => {
                          const target = e.currentTarget as HTMLElement;
                          target.style.backgroundColor = "var(--hover-color)";
                          target.style.borderColor = "var(--hover-color)";
                          target.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          const target = e.currentTarget as HTMLElement;
                          target.style.backgroundColor = "var(--accent-color)";
                          target.style.borderColor = "var(--accent-color)";
                          target.style.color = "white";
                        }}
                      >
                        See details
                      </Button>
                    </>
                  )}
                </Card.Body>
              </Card>
              {transportOption.id !== "default" && (
                <Modal
                  show={showTransportModal}
                  onHide={() => setShowTransportModal(false)}
                  centered
                  size="lg"
                >
                  <Modal.Header closeButton>
                    <Modal.Title>
                      {"name" in transportOption
                        ? transportOption.name
                        : transportOption.company}
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div style={{ marginTop: 15 }}>
                      {"name" in transportOption ? (
                        <>
                          <b>Name:</b>{" "}
                          <span style={{ fontWeight: 400 }}>
                            {transportOption.name}
                          </span>
                          <br />
                          <b>Price:</b>{" "}
                          <span style={{ fontWeight: 400 }}>
                            ${transportOption.price}
                          </span>
                          <br />
                          <b>Departure:</b>{" "}
                          <span style={{ fontWeight: 400 }}>
                            {capitalize(transportOption.currLocation || "")} at{" "}
                            {transportOption.departure_time}
                          </span>
                          <br />
                          <b>Arrival:</b>{" "}
                          <span style={{ fontWeight: 400 }}>
                            {capitalize(transportOption.departure || "")} at{" "}
                            {transportOption.arrival_time}
                          </span>
                          <br />
                          <b>Route:</b>{" "}
                          <span style={{ fontWeight: 400 }}>
                            {capitalize(transportOption.currLocation || "")} →{" "}
                            {capitalize(transportOption.departure || "")}
                          </span>
                          <br />
                        </>
                      ) : (
                        <>
                          <b>Company:</b>{" "}
                          <span style={{ fontWeight: 400 }}>
                            {transportOption.company}
                          </span>
                          <br />
                          <b>Type:</b>{" "}
                          <span style={{ fontWeight: 400 }}>
                            {transportOption.type}
                          </span>
                          <br />
                          <b>Price:</b>{" "}
                          <span style={{ fontWeight: 400 }}>
                            ${transportOption.price}
                          </span>
                          <br />
                          <b>Duration:</b>{" "}
                          <span style={{ fontWeight: 400 }}>
                            {transportOption.duration}
                          </span>
                          <br />
                          <b>Departure:</b>{" "}
                          <span style={{ fontWeight: 400 }}>
                            {capitalize(transportOption.departure)} at{" "}
                            {transportOption.departure_time}
                          </span>
                          <br />
                          <b>Arrival:</b>{" "}
                          <span style={{ fontWeight: 400 }}>
                            {capitalize(transportOption.destination)} at{" "}
                            {transportOption.arrival_time}
                          </span>
                          <br />
                          <b>Route:</b>{" "}
                          <span style={{ fontWeight: 400 }}>
                            {formatRoute(
                              transportOption.departure,
                              transportOption.destination
                            )}
                          </span>
                          <br />
                        </>
                      )}
                    </div>
                    {transportOption.bookingLink && (
                      <div style={{ margin: "15px 0", textAlign: "center" }}>
                        <Button
                          variant="primary"
                          onClick={() =>
                            window.open(transportOption.bookingLink, "_blank")
                          }
                          style={{
                            borderRadius: 30,
                            padding: "12px 48px",
                            fontWeight: "600",
                            fontSize: "1.15rem",
                            color: "white",
                            backgroundColor: "var(--accent-color)",
                            borderColor: "var(--accent-color)",
                          }}
                          onMouseEnter={(e) => {
                            const target = e.currentTarget as HTMLElement;
                            target.style.backgroundColor = "var(--hover-color)";
                            target.style.borderColor = "var(--hover-color)";
                            target.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            const target = e.currentTarget as HTMLElement;
                            target.style.backgroundColor =
                              "var(--accent-color)";
                            target.style.borderColor = "var(--accent-color)";
                            target.style.color = "white";
                          }}
                        >
                          Book now
                        </Button>
                      </div>
                    )}
                  </Modal.Body>
                </Modal>
              )}
            </>
          )}
          {flight && tripDates && (
            <>
              <Card>
                <Card.Body>
                  <Card.Title>Flight</Card.Title>
                  <Card.Text>
                    <b>Airline:</b>{" "}
                    <span style={{ fontWeight: 400 }}>{flight.airline}</span>
                  </Card.Text>
                  <Card.Text>
                    <b>Price:</b>{" "}
                    <span style={{ fontWeight: 400 }}>
                      ${(flight.price || 0) + (returnFlight?.price || 0)}
                    </span>
                  </Card.Text>
                  <Card.Text>
                    <b>Departure Date:</b>{" "}
                    <span style={{ fontWeight: 400 }}>
                      {formatDateTime(
                        tripDates.startDate,
                        flight.departure_time
                      )}
                    </span>
                  </Card.Text>
                  <Card.Text>
                    <b>Arrival Date:</b>{" "}
                    <span style={{ fontWeight: 400 }}>
                      {formatDateTime(tripDates.startDate, flight.arrival_time)}
                    </span>
                  </Card.Text>
                  <Card.Text>
                    <b>Route:</b>{" "}
                    <span style={{ fontWeight: 400 }}>
                      {formatRoute(flight.departure, flight.destination)}
                    </span>
                  </Card.Text>

                  <Button
                    variant="primary"
                    onClick={() => setShowFlightModal(true)}
                    style={{
                      alignSelf: "flex-start",
                      padding: "8px 20px",
                      fontSize: "0.85rem",
                      borderRadius: "6px",
                      transition:
                        "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
                      color: "white",
                      backgroundColor: "var(--accent-color)",
                      borderColor: "var(--accent-color)",
                      marginTop: "10px",
                    }}
                    onMouseEnter={(e) => {
                      const target = e.currentTarget as HTMLElement;
                      target.style.backgroundColor = "var(--hover-color)";
                      target.style.borderColor = "var(--hover-color)";
                      target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      const target = e.currentTarget as HTMLElement;
                      target.style.backgroundColor = "var(--accent-color)";
                      target.style.borderColor = "var(--accent-color)";
                      target.style.color = "white";
                    }}
                  >
                    See details
                  </Button>
                </Card.Body>
              </Card>
              <Modal
                show={showFlightModal}
                onHide={() => setShowFlightModal(false)}
                centered
                size="lg"
              >
                <Modal.Header closeButton>
                  <Modal.Title>
                    {flight.airline} (
                    {formatRoute(flight.departure, flight.destination)})
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {/* Odlazni let */}
                  <div
                    style={{
                      marginTop: 8,
                      padding: 18,
                      border: "1px solid #e0e0e0",
                      borderRadius: 12,
                      background: "#f7fafc",
                      marginBottom: 24,
                    }}
                  >
                    <h5 style={{ fontWeight: 700, marginBottom: 10 }}>
                      Departure Flight
                    </h5>
                    <div
                      style={{
                        fontSize: "1.05rem",
                        fontWeight: 500,
                        color: "#444",
                      }}
                    >
                      <p>
                        <b>Airline:</b> {flight.airline}
                      </p>
                      <p>
                        <b>Price:</b> ${flight.price}
                      </p>
                      <p>
                        <b>Departure:</b> {capitalize(flight.departure)} at{" "}
                        {flight.departure_time} (
                        {formatDateTime(
                          tripDates.startDate,
                          flight.departure_time
                        )}
                        )
                      </p>
                      <p>
                        <b>Arrival:</b> {capitalize(flight.destination)} at{" "}
                        {flight.arrival_time} (
                        {formatDateTime(
                          tripDates.startDate,
                          flight.arrival_time
                        )}
                        )
                      </p>
                      <p>
                        <b>Route:</b> {capitalize(flight.departure)} →{" "}
                        {capitalize(flight.destination)}
                      </p>
                    </div>
                    {flight.bookingLink && (
                      <div style={{ marginTop: 18 }}>
                        <Button
                          variant="primary"
                          onClick={() =>
                            window.open(flight.bookingLink, "_blank")
                          }
                          style={{
                            borderRadius: 30,
                            padding: "10px 36px",
                            fontWeight: "600",
                            fontSize: "1rem",
                          }}
                        >
                          Book now
                        </Button>
                      </div>
                    )}
                  </div>
                  {/* Povratni let */}
                  {returnFlight && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: 18,
                        border: "1px solid #e0e0e0",
                        borderRadius: 12,
                        background: "#fafbfc",
                      }}
                    >
                      <h5 style={{ fontWeight: 700, marginBottom: 10 }}>
                        Return Flight
                      </h5>
                      <div
                        style={{
                          fontSize: "1.05rem",
                          fontWeight: 500,
                          color: "#444",
                        }}
                      >
                        <p>
                          <b>Airline:</b> {returnFlight.airline}
                        </p>
                        <p>
                          <b>Price:</b> ${returnFlight.price}
                        </p>
                        <p>
                          <b>Departure:</b> {capitalize(returnFlight.departure)}{" "}
                          at {returnFlight.departure_time} (
                          {formatDateTime(
                            tripDates.endDate,
                            returnFlight.departure_time
                          )}
                          )
                        </p>
                        <p>
                          <b>Arrival:</b> {capitalize(returnFlight.destination)}{" "}
                          at {returnFlight.arrival_time} (
                          {formatDateTime(
                            tripDates.endDate,
                            returnFlight.arrival_time
                          )}
                          )
                        </p>
                        <p>
                          <b>Route:</b> {capitalize(returnFlight.departure)} →{" "}
                          {capitalize(returnFlight.destination)}
                        </p>
                      </div>
                      {returnFlight.bookingLink && (
                        <div style={{ marginTop: 18 }}>
                          <Button
                            variant="primary"
                            onClick={() =>
                              window.open(returnFlight.bookingLink, "_blank")
                            }
                            style={{
                              borderRadius: 30,
                              padding: "10px 36px",
                              fontWeight: "600",
                              fontSize: "1rem",
                            }}
                          >
                            Book now
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </Modal.Body>
              </Modal>
            </>
          )}

          {accommodation && (
            <>
              <Card>
                <Card.Body>
                  <Card.Title>Accommodation</Card.Title>
                  <Card.Text>
                    <b>Name:</b>{" "}
                    <span style={{ fontWeight: 400 }}>
                      {accommodation.name}
                    </span>
                  </Card.Text>
                  <Card.Text>
                    <b>Type:</b>{" "}
                    <span style={{ fontWeight: 400 }}>
                      {capitalize(accommodation.type)}
                    </span>
                  </Card.Text>
                  <Card.Text>
                    <b>Price:</b>{" "}
                    <span style={{ fontWeight: 400 }}>
                      {accommodation.id === "default"
                        ? "0$ (Own accommodation)"
                        : `$${accommodation.price}`}
                    </span>
                  </Card.Text>
                  {accommodation.id !== "default" && (
                    <Button
                      variant="primary"
                      onClick={() => setShowAccModal(true)}
                      style={{
                        alignSelf: "flex-start",
                        padding: "8px 20px",
                        fontSize: "0.85rem",
                        borderRadius: "6px",
                        transition:
                          "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
                        color: "white",
                        backgroundColor: "var(--accent-color)",
                        borderColor: "var(--accent-color)",
                        marginTop: "10px",
                      }}
                      onMouseEnter={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.backgroundColor = "var(--hover-color)";
                        target.style.borderColor = "var(--hover-color)";
                        target.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.backgroundColor = "var(--accent-color)";
                        target.style.borderColor = "var(--accent-color)";
                        target.style.color = "white";
                      }}
                    >
                      See details
                    </Button>
                  )}
                </Card.Body>
              </Card>
              {/* Modal samo ako nije default */}
              {accommodation.id !== "default" && (
                <Modal
                  show={showAccModal}
                  onHide={() => setShowAccModal(false)}
                  centered
                  size="lg"
                >
                  <Modal.Header closeButton>
                    <Modal.Title>{accommodation.name}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    {accommodation.images &&
                      accommodation.images.length > 0 && (
                        <Carousel>
                          {accommodation.images.map((img, idx) => (
                            <Carousel.Item key={idx}>
                              <img
                                className="d-block w-100"
                                src={img}
                                alt={`Slide ${idx + 1}`}
                                style={{ maxHeight: 350, objectFit: "cover" }}
                              />
                            </Carousel.Item>
                          ))}
                        </Carousel>
                      )}
                    <div style={{ marginTop: 15 }}>
                      <b>Type:</b>{" "}
                      <span style={{ fontWeight: 400 }}>
                        {capitalize(accommodation.type)}
                      </span>
                      <br />
                      <b>Price:</b>{" "}
                      <span style={{ fontWeight: 400 }}>
                        ${accommodation.price}
                      </span>{" "}
                      <br />
                      <b>Location:</b>{" "}
                      <span style={{ fontWeight: 400 }}>
                        {accommodation.location}
                      </span>
                      <br />
                      <b>Description:</b>{" "}
                      <span style={{ fontWeight: 400 }}>
                        {accommodation.description || "No description."}
                      </span>
                      <br />
                      {accommodation.reviews &&
                        accommodation.reviews.length > 0 && (
                          <>
                            <b>Reviews:</b>
                            <ul>
                              {accommodation.reviews.map((rev, idx) => (
                                <li key={idx}>
                                  <b>{rev.user}</b> ({rev.rating}/5):{" "}
                                  <span style={{ fontWeight: 400 }}>
                                    {rev.comment}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                    </div>
                    {accommodation.bookingLink && (
                      <div style={{ margin: "15px 0", textAlign: "center" }}>
                        <Button
                          variant="primary"
                          onClick={() =>
                            window.open(accommodation.bookingLink, "_blank")
                          }
                          style={{
                            borderRadius: 30,
                            padding: "12px 48px",
                            fontWeight: "600",
                            fontSize: "1.15rem",
                            color: "white",
                            backgroundColor: "var(--accent-color)",
                            borderColor: "var(--accent-color)",
                          }}
                          onMouseEnter={(e) => {
                            const target = e.currentTarget as HTMLElement;
                            target.style.backgroundColor = "var(--hover-color)";
                            target.style.borderColor = "var(--hover-color)";
                            target.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            const target = e.currentTarget as HTMLElement;
                            target.style.backgroundColor =
                              "var(--accent-color)";
                            target.style.borderColor = "var(--accent-color)";
                            target.style.color = "white";
                          }}
                        >
                          Book now
                        </Button>
                      </div>
                    )}
                  </Modal.Body>
                </Modal>
              )}
            </>
          )}
        </div>
        <h3
          style={{
            marginTop: "32px",
            fontSize: "2rem",
            fontWeight: 700,
            color: "#4169e1",
            letterSpacing: "-0.5px",
            textAlign: "left",
            background: "#f4f8ff",
            borderRadius: 16,
            padding: "18px 0",
            boxShadow: "0 2px 12px rgba(65,105,225,0.08)",
            marginBottom: "0.5rem",
          }}
        >
          Total Cost:{" "}
          <span style={{ color: "#222", fontWeight: 800 }}>${totalCost}</span>
        </h3>
        <Button
          variant="primary"
          onClick={handleFinalize}
          style={{
            marginTop: "30px",
            borderRadius: 30,
            fontWeight: 600,
            fontSize: "1.15rem",
            padding: "14px 54px",
            boxShadow: "0 4px 16px rgba(65,105,225,0.18)",
            transition: "background-color 0.3s, box-shadow 0.3s, color 0.3s",
            color: "white",
            backgroundColor: "#4169e1",
            borderColor: "#4169e1",
            letterSpacing: 0.5,
          }}
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.backgroundColor = "#274bb3";
            target.style.borderColor = "#274bb3";
            target.style.color = "white";
            target.style.boxShadow = "0 8px 24px rgba(39,75,179,0.22)";
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.backgroundColor = "#4169e1";
            target.style.borderColor = "#4169e1";
            target.style.color = "white";
            target.style.boxShadow = "0 4px 16px rgba(65,105,225,0.18)";
          }}
        >
          Finalize Trip
        </Button>
      </Container>
    </>
  );
};

export default TripSummary;
