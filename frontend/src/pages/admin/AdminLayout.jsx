import { NavLink, Outlet } from "react-router-dom";
import "./Admin.css";

export default function AdminLayout() {
  return (
    <div className="container section-tight">
      <div className="eyebrow">Back office</div>
      <h1>Admin</h1>

      <div className="admin-tabs">
        <NavLink to="/admin" end className={({ isActive }) => isActive ? "active" : ""}>Dashboard</NavLink>
        <NavLink to="/admin/vehicles" className={({ isActive }) => isActive ? "active" : ""}>Fleet</NavLink>
        <NavLink to="/admin/bookings" className={({ isActive }) => isActive ? "active" : ""}>Bookings</NavLink>
      </div>

      <Outlet />
    </div>
  );
}
