import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import VehicleCard from "../components/VehicleCard";
import "./Browse.css";

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [meta, setMeta] = useState({ categories: [], locations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mode = searchParams.get("mode") === "buy" ? "buy" : "rent";
  const type = searchParams.get("type") || "";
  const category = searchParams.get("category") || "";
  const location = searchParams.get("location") || "";
  const q = searchParams.get("q") || "";

  useEffect(() => {
    api.getVehicleMeta().then(setMeta).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    api.getVehicles({ type, category, location, q, mode })
      .then(({ vehicles }) => setVehicles(vehicles))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [type, category, location, q, mode]);

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  }

  return (
    <div className="container section-tight">
      <div className="eyebrow">{vehicles.length} {mode === "buy" ? "on sale" : "in the yard"}</div>
      <h1 className="browse-title">{mode === "buy" ? "Buy your ride" : "The Fleet"}</h1>

      <div className="mode-toggle" role="tablist" aria-label="Rent or buy">
        <button
          role="tab"
          aria-selected={mode === "rent"}
          className={`mode-tab ${mode === "rent" ? "is-active" : ""}`}
          onClick={() => updateFilter("mode", "")}
        >Rent</button>
        <button
          role="tab"
          aria-selected={mode === "buy"}
          className={`mode-tab ${mode === "buy" ? "is-active" : ""}`}
          onClick={() => updateFilter("mode", "buy")}
        >Buy</button>
      </div>

      <div className="filters">
        <div className="field">
          <label>Search</label>
          <input
            type="text"
            placeholder="Brand, model, class..."
            value={q}
            onChange={(e) => updateFilter("q", e.target.value)}
          />
        </div>
        <div className="field">
          <label>Type</label>
          <select value={type} onChange={(e) => updateFilter("type", e.target.value)}>
            <option value="">All</option>
            <option value="car">Cars</option>
            <option value="bike">Bikes</option>
          </select>
        </div>
        <div className="field">
          <label>Class</label>
          <select value={category} onChange={(e) => updateFilter("category", e.target.value)}>
            <option value="">All classes</option>
            {meta.categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Yard</label>
          <select value={location} onChange={(e) => updateFilter("location", e.target.value)}>
            <option value="">All yards</option>
            {meta.locations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {loading && <div className="state-msg">Loading the fleet...</div>}
      {error && <div className="state-msg"><strong>Couldn't load the fleet</strong>{error}</div>}
      {!loading && !error && vehicles.length === 0 && (
        <div className="state-msg">
          <strong>Nothing matches</strong>
          Try clearing a filter or searching a different class.
        </div>
      )}

      {!loading && !error && vehicles.length > 0 && (
        <div className="ticket-grid">
          {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} mode={mode} />)}
        </div>
      )}
    </div>
  );
}
