import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "./VehicleDetail.css";

const STATUS_LABEL = { available: "Available", maintenance: "In Shop", retired: "Retired" };

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.getVehicle(id)
      .then(({ vehicle, bookedRanges }) => {
        setVehicle(vehicle);
        setBookedRanges(bookedRanges);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const nights = startDate && endDate
    ? Math.max(0, Math.round((new Date(endDate) - new Date(startDate)) / 86400000))
    : 0;
  const total = vehicle ? Math.round(nights * vehicle.price_per_day * 100) / 100 : 0;

  function overlaps(start, end) {
    return bookedRanges.some(r => new Date(start) < new Date(r.end_date) && new Date(end) > new Date(r.start_date));
  }

  async function handleBook(e) {
    e.preventDefault();
    setFormError("");
    setSuccess(null);

    if (!user) {
      navigate("/login", { state: { from: { pathname: `/vehicles/${id}` } } });
      return;
    }
    if (!startDate || !endDate) {
      setFormError("Choose a pickup and return date.");
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setFormError("Return date must be after pickup date.");
      return;
    }
    if (overlaps(startDate, endDate)) {
      setFormError("This vehicle is already booked over part of that range.");
      return;
    }

    setSubmitting(true);
    try {
      const { booking } = await api.createBooking(
        { vehicle_id: vehicle.id, start_date: startDate, end_date: endDate },
        token
      );
      setSuccess(booking);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="state-msg">Pulling up the file...</div>;
  if (error) return <div className="state-msg"><strong>Not found</strong>{error}</div>;
  if (!vehicle) return null;

  return (
    <div className="container section-tight detail-grid">
      <div className="detail-media">
        <img src={vehicle.image_url} alt={`${vehicle.brand} ${vehicle.model}`} />
        <span className={`stamp stamp-${vehicle.status} detail-stamp`}>{STATUS_LABEL[vehicle.status]}</span>
      </div>

      <div className="detail-info">
        <div className="eyebrow">{vehicle.type === "car" ? "Car" : "Bike"} &middot; {vehicle.category}</div>
        <h1 className="detail-title">{vehicle.brand} {vehicle.model}</h1>
        <div className="detail-meta mono">
          <span>{vehicle.year}</span>
          <span>{vehicle.plate}</span>
          {vehicle.transmission && <span>{vehicle.transmission}</span>}
          {vehicle.seats && <span>{vehicle.seats} seats</span>}
          <span>{vehicle.location}</span>
        </div>
        <p className="detail-desc">{vehicle.description}</p>

        <div className="panel booking-panel">
          <div className="booking-price">
            <span className="mono">${vehicle.price_per_day}</span>
            <span className="booking-price-unit">/ day</span>
          </div>

          {vehicle.status !== "available" ? (
            <p className="help-text">This vehicle isn't bookable right now &mdash; it's marked {STATUS_LABEL[vehicle.status].toLowerCase()}.</p>
          ) : success ? (
            <div className="booking-success">
              <strong>Booked. Claim ticket #{success.id}.</strong>
              <p>Pickup {success.start_date} &middot; Return {success.end_date} &middot; ${success.total_price} total.</p>
              <Link to="/my-bookings" className="btn btn-dark btn-sm">View my bookings</Link>
            </div>
          ) : (
            <form onSubmit={handleBook}>
              <div className="field-row">
                <div className="field">
                  <label>Pickup</label>
                  <input type="date" min={todayStr()} value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="field">
                  <label>Return</label>
                  <input type="date" min={startDate || todayStr()} value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>

              {nights > 0 && (
                <p className="help-text booking-calc">
                  {nights} day{nights === 1 ? "" : "s"} &times; ${vehicle.price_per_day} = <strong className="mono">${total}</strong>
                </p>
              )}

              {formError && <p className="error-text">{formError}</p>}

              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? "Reserving..." : user ? "Reserve this vehicle" : "Sign in to reserve"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
