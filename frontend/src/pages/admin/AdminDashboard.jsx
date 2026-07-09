import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.adminStats(token).then(setStats).catch((err) => setError(err.message));
  }, [token]);

  if (error) return <p className="error-text">{error}</p>;
  if (!stats) return <div className="state-msg">Loading dashboard...</div>;

  return (
    <div>
      <div className="stat-grid">
        <div className="panel stat-card">
          <div className="eyebrow">Fleet size</div>
          <div className="stat-value">{stats.totalVehicles}</div>
        </div>
        <div className="panel stat-card">
          <div className="eyebrow">Available now</div>
          <div className="stat-value">{stats.availableVehicles}</div>
        </div>
        <div className="panel stat-card">
          <div className="eyebrow">Active bookings</div>
          <div className="stat-value">{stats.totalBookings}</div>
        </div>
        <div className="panel stat-card">
          <div className="eyebrow">Customers</div>
          <div className="stat-value">{stats.totalCustomers}</div>
        </div>
        <div className="panel stat-card">
          <div className="eyebrow">Total revenue</div>
          <div className="stat-value">${stats.revenue}</div>
        </div>
      </div>

      <div className="admin-section-title">
        <h2 style={{ margin: 0 }}>Upcoming pickups</h2>
        <Link to="/admin/bookings" className="btn btn-ghost btn-sm">View all bookings</Link>
      </div>

      {stats.upcoming.length === 0 ? (
        <div className="state-msg"><strong>Nothing on the books</strong>No upcoming pickups scheduled.</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Booking</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Pickup</th>
              <th>Return</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {stats.upcoming.map((b) => (
              <tr key={b.id}>
                <td className="mono">#{b.id}</td>
                <td>{b.customer_name}</td>
                <td>{b.brand} {b.model} <span className="mono" style={{ color: "var(--muted)" }}>({b.plate})</span></td>
                <td className="mono">{b.start_date}</td>
                <td className="mono">{b.end_date}</td>
                <td className="mono">${b.total_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
