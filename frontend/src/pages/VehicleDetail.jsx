import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "./VehicleDetail.css";

const STATUS_LABEL = { available: "Available", maintenance: "In Shop", retired: "Retired" };
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const todayStr = () => new Date().toISOString().slice(0, 10);
const parse = (s, fallback) => { try { return JSON.parse(s); } catch { return fallback; } };

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "buy" ? "buy" : "rent";

  const [vehicle, setVehicle] = useState(null);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);

  // rent state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  // buy state
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState("");
  const [showroom, setShowroom] = useState(null);
  const [enquired, setEnquired] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getVehicle(id)
      .then(({ vehicle, bookedRanges }) => {
        setVehicle(vehicle);
        setBookedRanges(bookedRanges);
        setActiveImg(0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    api.getShowroomCities().then(({ cities }) => {
      setCities(cities);
      setCity((c) => c || cities[0] || "");
    }).catch(() => {});
  }, []);

  // fetch the nearest showroom for this brand + city
  useEffect(() => {
    if (mode !== "buy" || !vehicle || !city) return;
    setShowroom(null);
    api.getShowrooms({ brand: vehicle.brand, type: vehicle.type, city })
      .then(({ showrooms }) => setShowroom(showrooms[0] || null))
      .catch(() => {});
  }, [mode, vehicle, city]);

  const gallery = useMemo(() => {
    if (!vehicle) return [];
    const g = parse(vehicle.gallery, null);
    const list = Array.isArray(g) && g.length ? g : [vehicle.image_url].filter(Boolean);
    return [...new Set(list)];
  }, [vehicle]);
  const colors = useMemo(() => (vehicle ? parse(vehicle.colors, []) : []), [vehicle]);
  const features = useMemo(() => (vehicle ? parse(vehicle.features, []) : []), [vehicle]);

  const nights = startDate && endDate
    ? Math.max(0, Math.round((new Date(endDate) - new Date(startDate)) / 86400000)) : 0;
  const total = vehicle ? Math.round(nights * vehicle.price_per_day) : 0;

  function overlaps(start, end) {
    return bookedRanges.some(r => new Date(start) < new Date(r.end_date) && new Date(end) > new Date(r.start_date));
  }

  async function handleBook(e) {
    e.preventDefault();
    setFormError(""); setSuccess(null);
    if (!user) { navigate("/login", { state: { from: { pathname: `/vehicles/${id}` } } }); return; }
    if (!startDate || !endDate) { setFormError("Choose a pickup and return date."); return; }
    if (new Date(startDate) >= new Date(endDate)) { setFormError("Return date must be after pickup date."); return; }
    if (overlaps(startDate, endDate)) { setFormError("This vehicle is already booked over part of that range."); return; }
    setSubmitting(true);
    try {
      const { booking } = await api.createBooking(
        { vehicle_id: vehicle.id, start_date: startDate, end_date: endDate }, token);
      setSuccess(booking);
    } catch (err) { setFormError(err.message); }
    finally { setSubmitting(false); }
  }

  function setMode(next) {
    const p = new URLSearchParams(searchParams);
    if (next === "buy") p.set("mode", "buy"); else p.delete("mode");
    setSearchParams(p);
  }

  if (loading) return <div className="state-msg">Pulling up the file...</div>;
  if (error) return <div className="state-msg"><strong>Not found</strong>{error}</div>;
  if (!vehicle) return null;

  const buying = mode === "buy";

  return (
    <div className="container section-tight detail-grid">
      <div className="detail-media">
        <img src={gallery[activeImg] || vehicle.image_url} alt={`${vehicle.brand} ${vehicle.model}`} />
        <span className={`stamp stamp-${vehicle.status} detail-stamp`}>{STATUS_LABEL[vehicle.status]}</span>
        {gallery.length > 1 && (
          <div className="detail-thumbs">
            {gallery.map((src, i) => (
              <button key={src} className={`detail-thumb ${i === activeImg ? "is-active" : ""}`}
                onClick={() => setActiveImg(i)} aria-label={`Photo ${i + 1}`}>
                <img src={src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="detail-info">
        <div className="eyebrow">{vehicle.type === "car" ? "Car" : "Bike"} &middot; {vehicle.category}</div>
        <h1 className="detail-title">{vehicle.brand} {vehicle.model}</h1>
        <div className="detail-meta mono">
          <span>{vehicle.year}</span>
          {vehicle.fuel && <span>{vehicle.fuel}</span>}
          {vehicle.transmission && <span>{vehicle.transmission}</span>}
          {vehicle.seats && <span>{vehicle.seats} seats</span>}
          <span>{vehicle.location}</span>
        </div>
        <p className="detail-desc">{vehicle.description}</p>

        <div className="mode-toggle" role="tablist" aria-label="Rent or buy">
          <button role="tab" aria-selected={!buying} className={`mode-tab ${!buying ? "is-active" : ""}`} onClick={() => setMode("rent")}>Rent</button>
          <button role="tab" aria-selected={buying} className={`mode-tab ${buying ? "is-active" : ""}`} onClick={() => setMode("buy")}>Buy</button>
        </div>

        {colors.length > 0 && (
          <div className="detail-block">
            <h3 className="detail-block-title">Colours</h3>
            <div className="swatches">
              {colors.map((c) => (
                <span key={c.name} className="swatch" title={c.name}>
                  <span className="swatch-dot" style={{ background: c.hex }} />
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {features.length > 0 && (
          <div className="detail-block">
            <h3 className="detail-block-title">Key features</h3>
            <ul className="feature-list">
              {features.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </div>
        )}

        {buying ? (
          <div className="panel booking-panel">
            <div className="buy-price">
              <div>
                <div className="buy-price-label">Ex-showroom</div>
                <div className="mono buy-price-val">{inr(vehicle.ex_showroom_price)}</div>
              </div>
              <div>
                <div className="buy-price-label">On-road ({city || "city"})*</div>
                <div className="mono buy-price-val">{inr(vehicle.on_road_price)}</div>
              </div>
            </div>

            <div className="field">
              <label>Your city — find the nearest showroom</label>
              <select value={city} onChange={(e) => { setCity(e.target.value); setEnquired(false); }}>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {showroom ? (
              <div className="showroom-card">
                <strong>{showroom.name}</strong>
                <span>{showroom.address}</span>
                <span className="mono">{showroom.phone}</span>
              </div>
            ) : (
              <p className="help-text">No {vehicle.brand} showroom in {city} — try another city.</p>
            )}

            {enquired ? (
              <div className="booking-success">
                <strong>Test drive requested.</strong>
                <p>{showroom ? `${showroom.name} will call you to schedule your ${vehicle.brand} ${vehicle.model} test drive.` : "We'll reach out shortly."}</p>
              </div>
            ) : (
              <button className="btn btn-primary btn-block" disabled={!showroom}
                onClick={() => setEnquired(true)}>
                Book a test drive
              </button>
            )}
            <p className="help-text">*On-road price is indicative; includes RTO &amp; insurance estimate.</p>
          </div>
        ) : (
          <div className="panel booking-panel">
            <div className="booking-price">
              <span className="mono">{inr(vehicle.price_per_day)}</span>
              <span className="booking-price-unit">/ day</span>
              <span className="booking-rate-extra mono">{inr(vehicle.price_per_hour)}/hr &middot; {inr(vehicle.price_per_km)}/km</span>
            </div>

            {vehicle.status !== "available" ? (
              <p className="help-text">This vehicle isn't bookable right now &mdash; it's marked {STATUS_LABEL[vehicle.status].toLowerCase()}.</p>
            ) : success ? (
              <div className="booking-success">
                <strong>Booked. Claim ticket #{success.id}.</strong>
                <p>Pickup {success.start_date} &middot; Return {success.end_date} &middot; {inr(success.total_price)} total.</p>
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
                    {nights} day{nights === 1 ? "" : "s"} &times; {inr(vehicle.price_per_day)} = <strong className="mono">{inr(total)}</strong>
                  </p>
                )}
                {formError && <p className="error-text">{formError}</p>}
                <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                  {submitting ? "Reserving..." : user ? "Reserve this vehicle" : "Sign in to reserve"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
