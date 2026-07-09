import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";

const BLANK = {
  type: "car", brand: "", model: "", year: new Date().getFullYear(), plate: "",
  category: "", transmission: "automatic", seats: 5, price_per_day: "", location: "",
  image_url: "", description: "", status: "available",
};

export default function AdminVehicles() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch every status separately since the public endpoint excludes retired vehicles by default.
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getVehicles({ status: "available" }),
      api.getVehicles({ status: "maintenance" }),
      api.getVehicles({ status: "retired" }),
    ]).then(([a, m, r]) => {
      setVehicles([...a.vehicles, ...m.vehicles, ...r.vehicles].sort((x, y) => y.id - x.id));
    }).catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(BLANK);
    setFormError("");
    setShowForm(true);
  }

  function openEdit(v) {
    setEditingId(v.id);
    setForm({ ...v });
    setFormError("");
    setShowForm(true);
  }

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    const payload = {
      ...form,
      year: Number(form.year),
      seats: form.seats ? Number(form.seats) : null,
      price_per_day: Number(form.price_per_day),
      transmission: form.type === "bike" ? null : form.transmission,
    };
    try {
      if (editingId) {
        await api.updateVehicle(editingId, payload, token);
      } else {
        await api.createVehicle(payload, token);
      }
      setShowForm(false);
      refreshAll();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function refreshAll() {
    setLoading(true);
    Promise.all([
      api.getVehicles({ status: "available" }),
      api.getVehicles({ status: "maintenance" }),
      api.getVehicles({ status: "retired" }),
    ]).then(([a, m, r]) => {
      setVehicles([...a.vehicles, ...m.vehicles, ...r.vehicles].sort((x, y) => y.id - x.id));
    }).catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleDelete(v) {
    if (!confirm(`Delete ${v.brand} ${v.model} (${v.plate})? This can't be undone.`)) return;
    try {
      await api.deleteVehicle(v.id, token);
      refreshAll();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="admin-section-title">
        <h2 style={{ margin: 0 }}>Fleet ({vehicles.length})</h2>
        <button className="btn btn-primary btn-sm" onClick={showForm && !editingId ? () => setShowForm(false) : openCreate}>
          {showForm && !editingId ? "Close" : "+ Add vehicle"}
        </button>
      </div>

      {showForm && (
        <form className="panel admin-form-panel" onSubmit={handleSubmit}>
          <h3 style={{ marginTop: 0 }}>{editingId ? "Edit vehicle" : "New vehicle"}</h3>
          <div className="admin-form-grid">
            <div className="field">
              <label>Type</label>
              <select value={form.type} onChange={(e) => updateField("type", e.target.value)}>
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </select>
            </div>
            <div className="field">
              <label>Brand</label>
              <input value={form.brand} onChange={(e) => updateField("brand", e.target.value)} required />
            </div>
            <div className="field">
              <label>Model</label>
              <input value={form.model} onChange={(e) => updateField("model", e.target.value)} required />
            </div>
            <div className="field">
              <label>Year</label>
              <input type="number" value={form.year} onChange={(e) => updateField("year", e.target.value)} required />
            </div>
            <div className="field">
              <label>Plate</label>
              <input value={form.plate} onChange={(e) => updateField("plate", e.target.value)} required />
            </div>
            <div className="field">
              <label>Class</label>
              <input value={form.category} onChange={(e) => updateField("category", e.target.value)} placeholder="Sedan, Cruiser..." required />
            </div>
            {form.type === "car" && (
              <div className="field">
                <label>Transmission</label>
                <select value={form.transmission || "automatic"} onChange={(e) => updateField("transmission", e.target.value)}>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            )}
            <div className="field">
              <label>Seats</label>
              <input type="number" value={form.seats || ""} onChange={(e) => updateField("seats", e.target.value)} />
            </div>
            <div className="field">
              <label>Price / day ($)</label>
              <input type="number" step="0.01" value={form.price_per_day} onChange={(e) => updateField("price_per_day", e.target.value)} required />
            </div>
            <div className="field">
              <label>Yard / location</label>
              <input value={form.location} onChange={(e) => updateField("location", e.target.value)} required />
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.status} onChange={(e) => updateField("status", e.target.value)}>
                <option value="available">Available</option>
                <option value="maintenance">In shop</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            <div className="field" style={{ gridColumn: "span 2" }}>
              <label>Image URL</label>
              <input value={form.image_url || ""} onChange={(e) => updateField("image_url", e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="field">
            <label>Description</label>
            <textarea rows={3} value={form.description || ""} onChange={(e) => updateField("description", e.target.value)} />
          </div>

          {formError && <p className="error-text">{formError}</p>}

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save changes" : "Add to fleet"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {loading && <div className="state-msg">Loading fleet...</div>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>Vehicle</th>
              <th>Plate</th>
              <th>Class</th>
              <th>Price/day</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td><img className="thumb" src={v.image_url} alt="" /></td>
                <td>{v.brand} {v.model} <span className="mono" style={{ color: "var(--muted)" }}>'{String(v.year).slice(-2)}</span></td>
                <td className="mono">{v.plate}</td>
                <td>{v.category}</td>
                <td className="mono">${v.price_per_day}</td>
                <td><span className={`stamp stamp-${v.status}`}>{v.status}</span></td>
                <td className="actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(v)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
