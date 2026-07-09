import { Router } from "express";
import db from "../db/index.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/stats", (req, res) => {
  const totalVehicles = db.prepare("SELECT COUNT(*) AS c FROM vehicles").get().c;
  const availableVehicles = db.prepare("SELECT COUNT(*) AS c FROM vehicles WHERE status = 'available'").get().c;
  const totalBookings = db.prepare("SELECT COUNT(*) AS c FROM bookings WHERE status = 'confirmed'").get().c;
  const totalCustomers = db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'customer'").get().c;
  const revenue = db.prepare("SELECT COALESCE(SUM(total_price), 0) AS s FROM bookings WHERE status != 'cancelled'").get().s;

  const byType = db.prepare(`
    SELECT type, COUNT(*) AS count FROM vehicles GROUP BY type
  `).all();

  const upcoming = db.prepare(`
    SELECT b.*, u.name AS customer_name, v.brand, v.model, v.plate
    FROM bookings b
    JOIN users u ON u.id = b.user_id
    JOIN vehicles v ON v.id = b.vehicle_id
    WHERE b.status = 'confirmed' AND date(b.start_date) >= date('now')
    ORDER BY b.start_date ASC
    LIMIT 5
  `).all();

  res.json({
    totalVehicles, availableVehicles, totalBookings, totalCustomers, revenue, byType, upcoming
  });
});

export default router;
