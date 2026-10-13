# Strada

A full-stack car and bike marketplace for Indian cities: **rent** a vehicle by the hour, day or kilometre, or **buy** one with ex-showroom and on-road prices and the nearest brand showroom. Admins manage the fleet and every reservation.

## Stack

- **Backend:** Node.js, Express, SQLite (`better-sqlite3`), JWT auth, bcrypt
- **Frontend:** React (Vite), React Router, plain CSS with a small custom design system

## Features

**Customers**
- Browse 186 seeded cars and bikes across 17 cities in *Rent* or *Buy* mode, with filters for type, class, city and free-text search
- Rent: per-hour, per-day and per-km INR pricing; booking a date range is rejected server-side if it overlaps an existing booking
- Buy: ex-showroom and on-road prices, fuel type, colours, features, an image gallery, and brand showrooms in the chosen city
- View and cancel their own bookings

**Admins**
- Dashboard with fleet, booking, customer and revenue stats
- Add, edit and retire vehicles (available / in shop / retired)
- View and cancel any booking

## API

| Method | Route | Access |
|---|---|---|
| `POST` | `/api/auth/register`, `/api/auth/login` | public |
| `GET` | `/api/auth/me` | signed in |
| `GET` | `/api/vehicles`, `/api/vehicles/meta`, `/api/vehicles/:id` | public |
| `POST` `PUT` `DELETE` | `/api/vehicles[/:id]` | admin |
| `POST` | `/api/bookings` | signed in |
| `GET` | `/api/bookings/mine`; `PATCH /api/bookings/:id/cancel` | signed in |
| `GET` | `/api/bookings` | admin |
| `GET` | `/api/showrooms`, `/api/showrooms/cities` | public |
| `GET` | `/api/admin/stats` | admin |

## Data model

SQLite tables `users`, `vehicles` (rent and buy fields, `listing_mode` = rent / buy / both), `showrooms` and `bookings`, created in [`backend/db/index.js`](backend/db/index.js) with lightweight migrations for columns added later. Queries use `better-sqlite3`'s synchronous API, so moving to Postgres mainly means swapping the driver.

## Project structure

```
backend/
  server.js         Express app
  db/               schema, migrations, seed data, media builders
  routes/           auth, vehicles, bookings, showrooms, admin
  middleware/       JWT guard and admin check
frontend/src/
  pages/            Home, Browse, VehicleDetail, Login, Register, MyBookings, admin/*
  components/       Navbar, Footer, VehicleCard, route guards
  context/          AuthContext (JWT session)
  api.js            fetch wrapper for the backend
```

## Run locally

Node.js 18+.

```bash
# API on http://localhost:4000
cd backend
npm install
cp .env.example .env      # set JWT_SECRET
npm run seed              # creates rental.db with vehicles, showrooms and demo users (safe to re-run)
npm start

# Web app on http://localhost:5173 (second terminal)
cd frontend
npm install
npm run dev
```

The frontend reads the API URL from `VITE_API_URL` (default `http://localhost:4000/api`).

Demo accounts created by the seed script:

| Role | Email | Password |
|---|---|---|
| Admin | admin@strada.com | admin123 |
| Customer | jamie@example.com | customer123 |

## Before deploying for real

This is a demo-grade build: set a strong `JWT_SECRET`, serve over HTTPS, add rate limiting and stricter input validation, and move vehicle images off hot-linked URLs to your own storage.
