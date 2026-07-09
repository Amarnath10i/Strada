# Strada

A full-stack car & bike rental platform: browse a fleet, book by the day, manage your
bookings, and (as an admin) manage the fleet and every reservation.

## Stack

- **Backend:** Node.js, Express, SQLite (via `better-sqlite3`), JWT auth, bcrypt
- **Frontend:** React (Vite), React Router — plain CSS with a custom design system (no UI framework)

## Project structure

```
rental-app/
  backend/          Express API + SQLite database
    db/             schema + seed script
    routes/         auth, vehicles, bookings, admin
    middleware/      JWT auth guard
  frontend/         React app (Vite)
    src/
      pages/         Home, Browse, VehicleDetail, Login, Register, MyBookings, admin/*
      components/    Navbar, Footer, VehicleCard, route guards
      context/       AuthContext (JWT session)
      api.js         fetch wrapper for the backend
```

## Running it locally

You'll need Node.js 18+.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # already done for you; edit JWT_SECRET for real use
npm run seed               # creates rental.db with sample vehicles + users (safe to re-run)
npm start                  # http://localhost:4000
```

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

The frontend reads the API URL from `frontend/.env` (`VITE_API_URL`, defaults to
`http://localhost:4000/api`).

## Demo accounts

Seeded by `npm run seed`:

| Role     | Email               | Password    |
|----------|---------------------|-------------|
| Admin    | admin@strada.com     | admin123    |
| Customer | jamie@example.com   | customer123 |

You can also register a new customer account from the app.

## What's included

**Customers can:**
- Browse the fleet with filters (type, class, yard/location, search)
- View a vehicle's detail page, pricing, and specs
- Book a vehicle for a date range (server checks for overlapping bookings)
- View and cancel their own bookings

**Admins can:**
- See a dashboard with fleet, booking, customer, and revenue stats
- Add, edit, and delete vehicles (mark them available / in shop / retired)
- View and cancel any booking

## Notes on the data layer

SQLite is used for simplicity — the whole database is a single file
(`backend/rental.db`) with no external service to set up. The schema (`backend/db/index.js`)
is plain SQL and easy to port to Postgres/MySQL later if you outgrow SQLite; the queries
use `better-sqlite3`'s synchronous API, so swapping the driver is the main change needed.

## Security notes for production use

This is a learning/demo-grade build. Before deploying for real:
- Set a strong, secret `JWT_SECRET` in `backend/.env`
- Serve over HTTPS and set secure cookie/storage practices for the auth token
- Add rate limiting and input validation hardening on the API
- Move image uploads off hot-linked Unsplash URLs to real storage
