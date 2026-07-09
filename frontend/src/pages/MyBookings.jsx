import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "./MyBookings.css";

export default function MyBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  function load() {
    setLoading(true);
    api.myBookings(token)
      .then(({ bookings }) => setBookings(bookings))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [token]);

  async function handleCancel(id) {
    setCancellingId(id);
    try {
      await api.cancelBooking(id, token);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="container section-tight">
      <div className="eyebrow">Your claim tickets</div>
      <h1>My Bookings</h1>

      {loading && <div className="state-msg">Loading your bookings...</div>}
      {error && <p className="error-text">{error}</p>}

      {!loading && bookings.length === 0 && (
        <div className="state-msg">
          <strong>No bookings yet</strong>
          <Link to="/browse" className="btn btn-dark btn-sm" style={{ marginTop: 12 }}>Browse the fleet</Link>
        </div>
      )}

      <div className="booking-list">
        {bookings.map((b) => (
          <div className="booking-row panel" key={b.id}>
            <img src={b.image_url} alt={`${b.brand} ${b.model}`} className="booking-row-img" />
            <div className="booking-row-info">
              <div className="booking-row-top">
                <h3>{b.brand} {b.model}</h3>
                <span className={`stamp stamp-${b.status}`}>{b.status}</span>
              </div>
              <div className="booking-row-meta mono">
                <span>#{b.id}</span>
                <span>{b.plate}</span>
                <span>{b.start_date} &rarr; {b.end_date}</span>
                <span>${b.total_price}</span>
              </div>
            </div>
            {b.status === "confirmed" && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleCancel(b.id)}
                disabled={cancellingId === b.id}
              >
                {cancellingId === b.id ? "Cancelling..." : "Cancel"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
