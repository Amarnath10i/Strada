import { Router } from "express";
import db from "../db/index.js";

const router = Router();

// GET /api/showrooms?brand=&type=&city=  — find showrooms (for "nearest showroom")
router.get("/", (req, res) => {
  const { brand, type, city } = req.query;
  let sql = "SELECT * FROM showrooms WHERE 1=1";
  const params = [];
  if (brand) { sql += " AND brand = ?"; params.push(brand); }
  if (type) { sql += " AND type = ?"; params.push(type); }
  if (city) { sql += " AND city = ?"; params.push(city); }
  sql += " ORDER BY city";
  res.json({ showrooms: db.prepare(sql).all(...params) });
});

// GET /api/showrooms/cities — distinct cities for the city picker
router.get("/cities", (req, res) => {
  const cities = db.prepare("SELECT DISTINCT city FROM showrooms ORDER BY city").all().map((r) => r.city);
  res.json({ cities });
});

export default router;
