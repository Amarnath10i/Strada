import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";

export default function AdminBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  function load() {
    setLoading(true);
    api.allBookings(token, status)
      .then(({ bookings }) => setBookings(bookings))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [token, status]);

  async function handleCancel(id) {
    setCancellingId(id);
    try {
      await api.cancelBooking(id, token);
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div>
      <div className="admin-section-title">
        <h2 style={{ margin: 0 }}>Bookings ({bookings.length})</h2>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 200, padding: "8px 10px", border: "1.5px solid var(--line)", borderRadius: "var(--radius)" }}>
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading && <div className="state-msg">Loading bookings...</div>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && bookings.length === 0 && (
        <div className="state-msg"><strong>No bookings</strong>Nothing to show for this filter.</div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Pickup</th>
              <th>Return</th>
              <th>Total</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td className="mono">{b.id}</td>
                <td>{b.customer_name}<br /><span className="mono" style={{ color: "var(--muted)", fontSize: "0.75rem" }}>{b.customer_email}</span></td>
                <td>{b.brand} {b.model} <span className="mono" style={{ color: "var(--muted)" }}>({b.plate})</span></td>
                <td className="mono">{b.start_date}</td>
                <td className="mono">{b.end_date}</td>
                <td className="mono">${b.total_price}</td>
                <td><span className={`stamp stamp-${b.status}`}>{b.status}</span></td>
                <td>
                  {b.status === "confirmed" && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)} disabled={cancellingId === b.id}>
                      {cancellingId === b.id ? "..." : "Cancel"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
