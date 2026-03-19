// ═══════════════════════════════════════════════════════════════════════════
//  NAIL PRO — SERVICIO DE API v4 (Multi-servicio + PWA)
// ═══════════════════════════════════════════════════════════════════════════
const BASE = process.env.NODE_ENV === "production"
  ? process.env.REACT_APP_BACKEND_URL || "https://tu-backend.onrender.com/api"
  : "/api";

function obtenerToken() {
  return localStorage.getItem("nail_pro_token");
}

function construirHeaders(esFormData = false) {
  const headers = {};
  const token = obtenerToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!esFormData) headers["Content-Type"] = "application/json";
  return headers;
}

async function peticion(metodo, ruta, cuerpo = null, esFormData = false) {
  const opciones = { method: metodo, headers: construirHeaders(esFormData), credentials: 'include' };
  if (cuerpo) opciones.body = esFormData ? cuerpo : JSON.stringify(cuerpo);
  
  try {
    const respuesta = await fetch(`${BASE}${ruta}`, opciones);
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.error || "Error en el servidor");
    return datos;
  } catch (error) {
    console.error(`❌ Error en ${metodo} ${ruta}:`, error.message);
    throw error;
  }
}

export const authAPI = {
  login: (username, password) => peticion("POST", "/auth/login", { username, password }),
  verify: () => peticion("GET", "/auth/verify"),
};

export const servicesAPI = {
  getAll: () => peticion("GET", "/services"),
  create: (data) => peticion("POST", "/services", data),
  update: (id, data) => peticion("PUT", `/services/${id}`, data),
  delete: (id) => peticion("DELETE", `/services/${id}`),
};

export const appointmentsAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return peticion("GET", `/appointments${qs ? "?" + qs : ""}`);
  },
  getBooked: (fecha) =>
    fetch(`${BASE}/appointments/booked/${fecha}`, { credentials: 'include' }).then(r => r.json()),
  uploadInspiration: (file) => {
    const fd = new FormData();
    fd.append("inspiration", file);
    return fetch(`${BASE}/appointments/upload-inspiration`, {
      method: "POST",
      body: fd,
    }).then(async r => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Error subiendo imagen");
      return data;
    });
  },
  create: (data) => peticion("POST", "/appointments", data),
  updateStatus: (id, status) => peticion("PATCH", `/appointments/${id}/status`, { status }),
  delete: (id) => peticion("DELETE", `/appointments/${id}`),
};

export const clientNotesAPI = {
  getByPhone: (phone) => peticion("GET", `/client-notes/${encodeURIComponent(phone)}`),
  getAll: () => peticion("GET", "/client-notes"),
  create: (data) => peticion("POST", "/client-notes", data),
  update: (id, note) => peticion("PUT", `/client-notes/${id}`, { note }),
  delete: (id) => peticion("DELETE", `/client-notes/${id}`),
};

export const galleryAPI = {
  getAll: () => peticion("GET", "/gallery"),
  uploadFile: (formData) => peticion("POST", "/gallery/upload", formData, true),
  addUrl: (url, caption) => peticion("POST", "/gallery/url", { url, caption }),
  delete: (id) => peticion("DELETE", `/gallery/${id}`),
};

export const salonAPI = {
  get: () => fetch(`${BASE}/salon`, { credentials: 'include' }).then(r => r.json()),
  update: (data) => peticion("PUT", "/salon", data),
};

export const statsAPI = {
  get: () => peticion("GET", "/stats"),
};