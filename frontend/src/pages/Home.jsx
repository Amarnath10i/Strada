import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import VehicleCard from "../components/VehicleCard";
import "./Home.css";

const CAR_HERO_IMG = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000";
const BIKE_HERO_IMG = "https://images.unsplash.com/photo-1571646750134-a5b0e6d5eb85?w=1000";

export default function Home() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    api.getVehicles({ status: "available", type: "car" }).then(({ vehicles }) => {
      const sorted = [...vehicles].sort((a, b) => a.price_per_day - b.price_per_day);
      setCars(sorted);
    }).catch(() => {});

    api.getVehicles({ status: "available", type: "bike" }).then(({ vehicles }) => {
      const sorted = [...vehicles].sort((a, b) => a.price_per_day - b.price_per_day);
      setBikes(sorted);
    }).catch(() => {});
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    navigate(`/browse?${params.toString()}`);
  }

  // Spread the preview strip across the price range instead of just the
  // cheapest few, so both budget and luxury options show up on the homepage.
  function spread(list, count) {
    if (list.length <= count) return list;
    const out = [];
    for (let i = 0; i < count; i++) {
      out.push(list[Math.round((i * (list.length - 1)) / (count - 1))]);
    }
    return [...new Set(out)];
  }

  const carsMin = cars.length ? cars[0].price_per_day : null;
  const bikesMin = bikes.length ? bikes[0].price_per_day : null;

  return (
    <div>
      <section className="hero">
        <div className="container hero-inner">
          <div className="eyebrow">Est. — three yards, one fleet</div>
          <h1>
            Pick up<br />
            the keys<br />
            <span className="hero-accent">by tonight.</span>
          </h1>
          <p className="hero-sub">
            Cars and bikes across town, from budget runabouts to the good
            stuff — booked by the day. No counters, no queues — reserve
            online and walk up to a full tank and a clean tag.
          </p>

          <form className="counter" onSubmit={handleSearch}>
            <div className="counter-field">
              <label>What are you after</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">Cars &amp; bikes</option>
                <option value="car">Cars only</option>
                <option value="bike">Bikes only</option>
              </select>
            </div>
            <div className="counter-field counter-field-grow">
              <label>Search make, model, or class</label>
              <input
                type="text"
                placeholder="e.g. Tesla, SUV, Cruiser..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary counter-submit">Find a ride</button>
          </form>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <div className="category-split">
            <button className="category-card" onClick={() => navigate("/browse?type=car")}>
              <img src={CAR_HERO_IMG} alt="Cars" />
              <div className="category-card-body">
                <span className="eyebrow">Four wheels</span>
                <h2>Cars</h2>
                <p>Economy hatchbacks up through supercars and a chauffeur-grade Rolls-Royce.</p>
                <span className="category-card-cta">
                  Browse cars{carsMin != null ? ` from ₹${Number(carsMin).toLocaleString("en-IN")}/day` : ""} &rarr;
                </span>
              </div>
            </button>

            <button className="category-card" onClick={() => navigate("/browse?type=bike")}>
              <img src={BIKE_HERO_IMG} alt="Bikes" />
              <div className="category-card-body">
                <span className="eyebrow">Two wheels</span>
                <h2>Bikes</h2>
                <p>Scooters and eBikes up through Ducati superbikes and CVO tourers.</p>
                <span className="category-card-cta">
                  Browse bikes{bikesMin != null ? ` from ₹${Number(bikesMin).toLocaleString("en-IN")}/day` : ""} &rarr;
                </span>
              </div>
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Low-cost to luxury</div>
              <h2>Cars on the lot</h2>
            </div>
            <button className="btn btn-dark" onClick={() => navigate("/browse?type=car")}>View all cars</button>
          </div>

          <div className="ticket-grid">
            {spread(cars, 6).map((v) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Low-cost to luxury</div>
              <h2>Bikes on the lot</h2>
            </div>
            <button className="btn btn-dark" onClick={() => navigate("/browse?type=bike")}>View all bikes</button>
          </div>

          <div className="ticket-grid">
            {spread(bikes, 6).map((v) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        </div>
      </section>

      <section className="section-tight strip">
        <div className="container strip-inner">
          <div className="strip-item">
            <span className="strip-num mono">01</span>
            <h3>Reserve online</h3>
            <p>Pick your dates, lock in a rate, no card holds until pickup.</p>
          </div>
          <div className="strip-item">
            <span className="strip-num mono">02</span>
            <h3>Walk up to the yard</h3>
            <p>Bring your license. We hand over the keys and the claim ticket.</p>
          </div>
          <div className="strip-item">
            <span className="strip-num mono">03</span>
            <h3>Drop it anywhere on the lot</h3>
            <p>Return late in the day or overnight — the gate stays open.</p>
          </div>
        </div>
      </section>
    </div>
  );
}