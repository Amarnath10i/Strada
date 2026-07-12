import { Link } from "react-router-dom";
import "./VehicleCard.css";

const STATUS_LABEL = {
  available: "Available",
  maintenance: "In Shop",
  retired: "Retired",
};

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function VehicleCard({ vehicle, mode = "rent" }) {
  const buying = mode === "buy";
  const to = `/vehicles/${vehicle.id}${buying ? "?mode=buy" : ""}`;
  return (
    <Link to={to} className="ticket">
      <div className="ticket-image">
        <img src={vehicle.image_url} alt={`${vehicle.brand} ${vehicle.model}`} loading="lazy" />
        <span className={`stamp stamp-${vehicle.status} ticket-stamp`}>{STATUS_LABEL[vehicle.status]}</span>
      </div>

      <div className="ticket-perf" aria-hidden="true">
        {Array.from({ length: 28 }).map((_, i) => <span key={i} />)}
      </div>

      <div className="ticket-stub">
        <div className="ticket-stub-top">
          <div>
            <span className="ticket-category">{vehicle.type === "car" ? "Car" : "Bike"} &middot; {vehicle.category}</span>
            <h3 className="ticket-title">{vehicle.brand} {vehicle.model}</h3>
          </div>
          <span className="ticket-plate mono">{vehicle.plate}</span>
        </div>

        <div className="ticket-stub-bottom">
          <span className="ticket-location">{buying ? vehicle.fuel : vehicle.location}</span>
          {buying ? (
            <span className="ticket-price mono">
              {inr(vehicle.ex_showroom_price)}<span className="ticket-price-unit">&nbsp;onwards</span>
            </span>
          ) : (
            <span className="ticket-price mono">
              {inr(vehicle.price_per_day)}<span className="ticket-price-unit">/day</span>
            </span>
          )}
        </div>

        {buying ? (
          <div className="ticket-rates mono" aria-label="on-road price">
            <span className="ticket-onroad">On-road {inr(vehicle.on_road_price)}*</span>
          </div>
        ) : (
          <div className="ticket-rates mono" aria-label="rate card">
            <span>{inr(vehicle.price_per_hour)}<small>/hr</small></span>
            <span>{inr(vehicle.price_per_day)}<small>/day</small></span>
            <span>{inr(vehicle.price_per_km)}<small>/km</small></span>
          </div>
        )}
      </div>
    </Link>
  );
}