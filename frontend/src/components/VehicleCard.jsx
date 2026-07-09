import { Link } from "react-router-dom";
import "./VehicleCard.css";

const STATUS_LABEL = {
  available: "Available",
  maintenance: "In Shop",
  retired: "Retired",
};

export default function VehicleCard({ vehicle }) {
  return (
    <Link to={`/vehicles/${vehicle.id}`} className="ticket">
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
          <span className="ticket-location">{vehicle.location}</span>
          <span className="ticket-price mono">
            ${vehicle.price_per_day}<span className="ticket-price-unit">/day</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
