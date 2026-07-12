const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: (token) => request("/auth/me", { token }),

  getVehicles: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== "" && v != null)
    ).toString();
    return request(`/vehicles${qs ? `?${qs}` : ""}`);
  },
  getVehicleMeta: () => request("/vehicles/meta"),
  getVehicle: (id) => request(`/vehicles/${id}`),
  createVehicle: (payload, token) => request("/vehicles", { method: "POST", body: payload, token }),
  updateVehicle: (id, payload, token) => request(`/vehicles/${id}`, { method: "PUT", body: payload, token }),
  deleteVehicle: (id, token) => request(`/vehicles/${id}`, { method: "DELETE", token }),

  createBooking: (payload, token) => request("/bookings", { method: "POST", body: payload, token }),
  myBookings: (token) => request("/bookings/mine", { token }),
  cancelBooking: (id, token) => request(`/bookings/${id}/cancel`, { method: "PATCH", token }),
  allBookings: (token, status) => request(`/bookings${status ? `?status=${status}` : ""}`, { token }),

  adminStats: (token) => request("/admin/stats", { token }),

  getShowrooms: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== "" && v != null)
    ).toString();
    return request(`/showrooms${qs ? `?${qs}` : ""}`);
  },
  getShowroomCities: () => request("/showrooms/cities"),
};
