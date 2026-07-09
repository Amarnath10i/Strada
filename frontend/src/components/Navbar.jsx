import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="nav">
      <div className="container nav-inner">
        <NavLink to="/" className="nav-brand" aria-label="Strada — home">
          <Logo />
        </NavLink>

        <nav className="nav-links">
          <NavLink to="/browse" className={({ isActive }) => isActive ? "active" : ""}>Fleet</NavLink>
          <NavLink to="/browse?type=car" className={({ isActive }) => isActive ? "active" : ""}>Cars</NavLink>
          <NavLink to="/browse?type=bike" className={({ isActive }) => isActive ? "active" : ""}>Bikes</NavLink>
          {user && (
            <NavLink to="/my-bookings" className={({ isActive }) => isActive ? "active" : ""}>My Bookings</NavLink>
          )}
          {user?.role === "admin" && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? "active" : ""}>Admin</NavLink>
          )}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="nav-user mono">{user.name.split(" ")[0]}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate("/"); }}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/login")}>Sign in</button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate("/register")}>Sign up</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
