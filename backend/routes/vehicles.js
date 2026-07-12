import { Router } from "express";
import db from "../db/index.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/vehicles - public list with filters
router.get("/", (req, res) => {
  const { type, category, location, q, maxPrice, status, mode } = req.query;

  let sql = "SELECT * FROM vehicles WHERE 1=1";
  const params = [];

  if (type) { sql += " AND type = ?"; params.push(type); }
  if (category) { sql += " AND category = ?"; params.push(category); }
  if (location) { sql += " AND location = ?"; params.push(location); }
  // mode = 'rent' | 'buy' — a vehicle is offered for it if listing_mode is that or 'both'
  if (mode === "rent" || mode === "buy") { sql += " AND listing_mode IN (?, 'both')"; params.push(mode); }
  if (status) { sql += " AND status = ?"; params.push(status); }
  else { sql += " AND status != 'retired'"; }
  if (maxPrice) { sql += " AND price_per_day <= ?"; params.push(Number(maxPrice)); }
  if (q) {
    sql += " AND (brand LIKE ? OR model LIKE ? OR category LIKE ?)";
    const like = `%${q}%`;
    params.push(like, like, like);
  }

  sql += " ORDER BY price_per_day ASC, created_at DESC";
  const vehicles = db.prepare(sql).all(...params);
  res.json({ vehicles });
});

// GET /api/vehicles/meta - distinct categories/locations for filter UI
router.get("/meta", (req, res) => {
  const categories = db.prepare("SELECT DISTINCT category FROM vehicles ORDER BY category").all().map(r => r.category);
  const locations = db.prepare("SELECT DISTINCT location FROM vehicles ORDER BY location").all().map(r => r.location);
  res.json({ categories, locations });
});

// GET /api/vehicles/:id - public detail + booked date ranges
router.get("/:id", (req, res) => {
  const vehicle = db.prepare("SELECT * FROM vehicles WHERE id = ?").get(req.params.id);
  if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

  const bookedRanges = db
    .prepare(
      "SELECT start_date, end_date FROM bookings WHERE vehicle_id = ? AND status = 'confirmed'"
    )
    .all(req.params.id);

  res.json({ vehicle, bookedRanges });
});

// POST /api/vehicles - admin create
router.post("/", requireAuth, requireAdmin, (req, res) => {
  const {
    type, brand, model, year, plate, category,
    transmission, seats,
    price_per_hour, price_per_day, price_per_km,
    location, image_url, description, status
  } = req.body;

  if (!type || !brand || !model || !year || !plate || !category || !price_per_day || !location) {
    return res.status(400).json({ error: "Missing required vehicle fields" });
  }

  try {
    const info = db.prepare(`
      INSERT INTO vehicles
        (type, brand, model, year, plate, category, transmission, seats,
         price_per_hour, price_per_day, price_per_km,
         location, image_url, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      type, brand, model, year, plate, category,
      transmission || null, seats || null,
      Number(price_per_hour) || 0, Number(price_per_day), Number(price_per_km) || 0,
      location, image_url || null, description || null, status || "available"
    );
    const vehicle = db.prepare("SELECT * FROM vehicles WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json({ vehicle });
  } catch (err) {
    if (String(err).includes("UNIQUE")) {
      return res.status(409).json({ error: "A vehicle with this plate already exists" });
    }
    res.status(500).json({ error: "Could not create vehicle" });
  }
});

// PUT /api/vehicles/:id - admin update
router.put("/:id", requireAuth, requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM vehicles WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Vehicle not found" });

  const merged = { ...existing, ...req.body };
  db.prepare(`
    UPDATE vehicles SET
      type = ?, brand = ?, model = ?, year = ?, plate = ?, category = ?,
      transmission = ?, seats = ?,
      price_per_hour = ?, price_per_day = ?, price_per_km = ?,
      location = ?, image_url = ?, description = ?, status = ?
    WHERE id = ?
  `).run(
    merged.type, merged.brand, merged.model, merged.year, merged.plate, merged.category,
    merged.transmission, merged.seats,
    Number(merged.price_per_hour) || 0, Number(merged.price_per_day), Number(merged.price_per_km) || 0,
    merged.location, merged.image_url, merged.description, merged.status,
    req.params.id
  );

  const vehicle = db.prepare("SELECT * FROM vehicles WHERE id = ?").get(req.params.id);
  res.json({ vehicle });
});

// DELETE /api/vehicles/:id - admin delete
router.delete("/:id", requireAuth, requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM vehicles WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Vehicle not found" });

  const activeBookings = db
    .prepare("SELECT COUNT(*) AS c FROM bookings WHERE vehicle_id = ? AND status = 'confirmed'")
    .get(req.params.id).c;

  if (activeBookings > 0) {
    return res.status(409).json({ error: "Cannot delete a vehicle with active bookings. Retire it instead." });
  }

  db.prepare("DELETE FROM vehicles WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

export default router;