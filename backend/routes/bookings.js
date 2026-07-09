import { Router } from "express";
import db from "../db/index.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

function daysBetween(start, end) {
  const ms = new Date(end) - new Date(start);
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function hasOverlap(vehicleId, start, end, excludeBookingId = null) {
  let sql = `
    SELECT COUNT(*) AS c FROM bookings
    WHERE vehicle_id = ? AND status = 'confirmed'
      AND date(?) < date(end_date) AND date(?) > date(start_date)
  `;
  const params = [vehicleId, end, start];
  if (excludeBookingId) {
    sql += " AND id != ?";
    params.push(excludeBookingId);
  }
  return db.prepare(sql).get(...params).c > 0;
}

// POST /api/bookings - create a booking (customer)
router.post("/", requireAuth, (req, res) => {
  const { vehicle_id, start_date, end_date, pickup_location } = req.body;

  if (!vehicle_id || !start_date || !end_date) {
    return res.status(400).json({ error: "vehicle_id, start_date, and end_date are required" });
  }
  if (new Date(start_date) >= new Date(end_date)) {
    return res.status(400).json({ error: "End date must be after start date" });
  }
  if (new Date(start_date) < new Date(new Date().toDateString())) {
    return res.status(400).json({ error: "Start date cannot be in the past" });
  }

  const vehicle = db.prepare("SELECT * FROM vehicles WHERE id = ?").get(vehicle_id);
  if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
  if (vehicle.status !== "available") {
    return res.status(409).json({ error: "This vehicle is not currently available" });
  }
  if (hasOverlap(vehicle_id, start_date, end_date)) {
    return res.status(409).json({ error: "This vehicle is already booked for part of that date range" });
  }

  const nights = daysBetween(start_date, end_date);
  const total_price = Math.round(nights * vehicle.price_per_day * 100) / 100;

  const info = db.prepare(`
    INSERT INTO bookings (user_id, vehicle_id, start_date, end_date, total_price, pickup_location, status)
    VALUES (?, ?, ?, ?, ?, ?, 'confirmed')
  `).run(req.user.id, vehicle_id, start_date, end_date, total_price, pickup_location || vehicle.location);

  const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json({ booking });
});

// GET /api/bookings/mine - customer's own bookings, joined with vehicle info
router.get("/mine", requireAuth, (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, v.brand, v.model, v.type, v.image_url, v.plate, v.category
    FROM bookings b JOIN vehicles v ON v.id = b.vehicle_id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `).all(req.user.id);
  res.json({ bookings });
});

// PATCH /api/bookings/:id/cancel - customer cancels own booking, admin can cancel any
router.patch("/:id/cancel", requireAuth, (req, res) => {
  const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id);
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  if (booking.user_id !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "You can only cancel your own bookings" });
  }
  if (booking.status !== "confirmed") {
    return res.status(400).json({ error: "Only confirmed bookings can be cancelled" });
  }

  db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(req.params.id);
  const updated = db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id);
  res.json({ booking: updated });
});

// GET /api/bookings - admin: list all bookings, joined with user + vehicle
router.get("/", requireAuth, requireAdmin, (req, res) => {
  const { status } = req.query;
  let sql = `
    SELECT b.*, u.name AS customer_name, u.email AS customer_email,
           v.brand, v.model, v.type, v.plate
    FROM bookings b
    JOIN users u ON u.id = b.user_id
    JOIN vehicles v ON v.id = b.vehicle_id
  `;
  const params = [];
  if (status) { sql += " WHERE b.status = ?"; params.push(status); }
  sql += " ORDER BY b.created_at DESC";

  const bookings = db.prepare(sql).all(...params);
  res.json({ bookings });
});

export default router;
