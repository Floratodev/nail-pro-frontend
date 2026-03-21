// ═══════════════════════════════════════════════════════════════════════════
//  NAIL PRO — COMPONENTE PRINCIPAL DE REACT (Versión PWA + Multi-servicio)
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { authAPI, servicesAPI, appointmentsAPI, galleryAPI, salonAPI, statsAPI, clientNotesAPI } from "./api";

// ─── Carga de fuentes de Google ───────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&family=Passions+Conflict&display=swap";
document.head.appendChild(fontLink);

// ─── Registro de PWA (Service Worker) ─────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log('✅ PWA Service Worker registrado'))
    .catch(err => console.error('❌ Error registrando PWA:', err));
}

// ─── Estilos CSS globales ─────────────────────────────────────────────────────
const css = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --noir: #fff0f5;
  --noir2: #ffe4ef;
  --noir3: #ffd6e7;
  --gold: #c2567a;
  --gold2: #a03060;
  --gold3: #7a1040;
  --rose: #e8729a;
  --rose2: #f0a0b4;
  --cream: #3a1028;
  --muted: #9a6070;
  --border: rgba(194,86,122,0.2);
  --border2: rgba(194,86,122,0.4);
  --glass: rgba(255,255,255,0.5);
  --glass2: rgba(255,255,255,0.7);
  --shadow-gold: 0 4px 24px rgba(201,149,108,0.2);
  --ff-display: 'Cormorant Garamond', Georgia, serif;
  --ff-body: 'Jost', sans-serif;
  --ff-script: 'Jost', sans-serif;
}
body { background: var(--noir); color: var(--cream); font-family: var(--ff-body); }
input, textarea, button, select { font-family: var(--ff-body); }
::selection { background: var(--gold); color: var(--noir); }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--noir2); }
::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 2px; }

@keyframes fadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn  { from{opacity:0} to{opacity:1} }
@keyframes scaleIn { from{opacity:0;transform:scale(.93)} to{opacity:1;transform:scale(1)} }
@keyframes slideUp { from{opacity:0;transform:translateY(36px)} to{opacity:1;transform:translateY(0)} }
@keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes goldGlow{ 0%,100%{text-shadow:none} 50%{text-shadow:0 0 40px rgba(201,149,108,.5)} }
@keyframes spin    { to{transform:rotate(360deg)} }

.anim-fade-up  { animation: fadeUp  .6s cubic-bezier(.16,1,.3,1) both; }
.anim-fade-in  { animation: fadeIn  .5s ease both; }
.anim-scale-in { animation: scaleIn .5s cubic-bezier(.16,1,.3,1) both; }
.anim-slide-up { animation: slideUp .4s cubic-bezier(.16,1,.3,1) both; }
.float         { animation: float 4s ease-in-out infinite; }
.gold-glow     { animation: goldGlow 3.5s ease-in-out infinite; }
.spinning      { animation: spin .8s linear infinite; display:inline-block; }

.d1{animation-delay:.08s} .d2{animation-delay:.16s} .d3{animation-delay:.24s}
.d4{animation-delay:.32s} .d5{animation-delay:.4s}  .d6{animation-delay:.48s}

.card {
  background: rgba(255,255,255,0.9);
  border: 1px solid var(--border2);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  box-shadow: 0 2px 16px rgba(194,86,122,0.08);
  transition: border-color .3s, transform .3s, box-shadow .3s;
}
.card-hover:hover { border-color: var(--border2); box-shadow: var(--shadow-gold); }
.card-lift:hover  { transform: translateY(-3px); border-color: var(--border2); box-shadow: var(--shadow-gold); cursor:pointer; }

.svc-card {
  background: rgba(255,255,255,0.9); border: 1px solid var(--border2);
  border-radius: 18px; padding: 22px; cursor: pointer;
  transition: all .3s cubic-bezier(.16,1,.3,1);
  position: relative; overflow: hidden;
}
.svc-card::before {
  content:''; position:absolute; inset:0;
  background: linear-gradient(135deg, rgba(201,149,108,.07), transparent 60%);
  opacity:0; transition:opacity .3s;
}
.svc-card:hover, .svc-card.selected {
  border-color: var(--border2); transform:translateY(-3px); box-shadow:var(--shadow-gold);
}
.svc-card:hover::before, .svc-card.selected::before { opacity:1; }
.svc-card.selected { border-color: var(--gold) !important; background: rgba(201,149,108,.1); }

.btn-primary {
  background: linear-gradient(135deg, var(--gold), var(--rose));
  color: var(--noir); border: none; border-radius: 50px;
  padding: 14px 36px; font-family: var(--ff-body); font-weight: 600;
  font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase;
  cursor: pointer; transition: opacity .25s, transform .2s, box-shadow .25s;
  box-shadow: 0 4px 20px rgba(201,149,108,.3);
}
.btn-primary:hover:not(:disabled) { opacity:.88; transform:translateY(-2px); box-shadow:0 8px 28px rgba(201,149,108,.4); }
.btn-primary:disabled { opacity:.35; cursor:default; }

.btn-outline {
  background: transparent; color: var(--gold); border: 1px solid var(--border2);
  border-radius: 50px; padding: 12px 28px; font-family: var(--ff-body);
  font-size: 12px; letter-spacing: 1px; text-transform: uppercase;
  cursor: pointer; transition: background .25s, border-color .25s;
}
.btn-outline:hover { background: var(--glass2); border-color: var(--gold); }

.btn-ghost {
  background: rgba(255,255,255,0.9); color: var(--gold2); border: 1px solid var(--border2);
  border-radius: 12px; padding: 9px 16px; font-family: var(--ff-body);
  font-size: 13px; cursor: pointer; transition: background .2s, border-color .2s;
}
.btn-ghost:hover { background: rgba(255,255,255,1); border-color: var(--gold); }

.btn-green {
  background: linear-gradient(135deg, #25D366, #128C7E); color: #fff;
  border: none; border-radius: 10px; padding: 8px 13px;
  font-family: var(--ff-body); font-size: 12px; font-weight: 600;
  cursor: pointer; transition: opacity .2s;
}
.btn-green:hover { opacity:.85; }

.btn-danger {
  background: rgba(239,68,68,.15); color: #ef4444;
  border: 1px solid rgba(239,68,68,.3); border-radius: 10px;
  padding: 8px 13px; font-family: var(--ff-body); font-size: 12px;
  cursor: pointer; transition: background .2s;
}
.btn-danger:hover { background: rgba(239,68,68,.25); }

.btn-full { width: 100%; }

.input {
  width: 100%; padding: 13px 17px;
  background: rgba(255,255,255,0.9);
  border: 1px solid var(--border2); border-radius: 12px;
  color: var(--cream); font-family: var(--ff-body); font-size: 14px;
  outline: none; transition: border-color .25s, background .25s;
}
.input:focus { border-color: var(--gold); background: rgba(255,255,255,1); box-shadow: 0 0 0 3px rgba(194,86,122,0.1); }
.input::placeholder { color: var(--muted); }
textarea.input { resize: vertical; min-height: 80px; }

.nav {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  padding: 0 24px; display: flex; align-items: center;
  justify-content: space-between; height: 68px;
  position: sticky; top: 0; z-index: 100;
}

.hero-bg {
  background:
    radial-gradient(ellipse at 20% 50%, rgba(232,114,154,.12), transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(194,86,122,.08), transparent 50%),
    var(--noir);
}

.day-cell {
  text-align: center; padding: 10px 4px; border-radius: 12px;
  cursor: pointer; border: 1px solid var(--border2);
  background: rgba(255,255,255,0.9); transition: all .2s;
}
.day-cell:hover:not(.disabled):not(.selected) { border-color: var(--border2); }
.day-cell.selected { background: linear-gradient(135deg, var(--gold), var(--rose)); border-color: transparent; }
.day-cell.disabled { opacity: .3; cursor: default; }

.time-slot {
  text-align: center; padding: 11px 4px; border-radius: 10px;
  cursor: pointer; border: 1px solid var(--border2); background: rgba(255,255,255,0.9);
  font-size: 13px; font-weight: 500; color: var(--cream); transition: all .2s;
}
.time-slot:hover:not(.busy):not(.selected) { border-color: var(--border2); }
.time-slot.selected { background: linear-gradient(135deg, var(--gold), var(--rose)); border-color: transparent; color: var(--noir); font-weight: 700; }
.time-slot.busy { opacity: .25; cursor: default; }

.badge { border-radius: 20px; padding: 3px 12px; font-size: 10px; font-weight: 600; letter-spacing: .5px; text-transform: uppercase; display: inline-block; }
.badge-pendiente  { background: rgba(245,158,11,.15); color: #f59e0b; border: 1px solid rgba(245,158,11,.3); }
.badge-confirmada { background: rgba(16,185,129,.15);  color: #10b981; border: 1px solid rgba(16,185,129,.3); }
.badge-completada { background: rgba(201,149,108,.15); color: var(--gold); border: 1px solid rgba(201,149,108,.3); }
.badge-cancelada  { background: rgba(239,68,68,.15);   color: #ef4444; border: 1px solid rgba(239,68,68,.3); }

.gal-item { border-radius: 14px; overflow: hidden; cursor: pointer; aspect-ratio: 1; position: relative; border: 1px solid var(--border); }
.gal-item img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s; }
.gal-item:hover img { transform: scale(1.07); }
.gal-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.6), transparent 50%); opacity: 0; transition: opacity .3s; }
.gal-item:hover .gal-overlay { opacity: 1; }

.gold-line { height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); margin: 20px 0; }
.section-label { font-size: 14px; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; font-family: var(--ff-script); }
.display-title { font-family: 'Jost', sans-serif; font-weight: 300; line-height: 1.15; letter-spacing: 0.5px; }

.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.75);
  backdrop-filter: blur(8px);
  z-index: 200;
  display: flex; align-items: flex-end; justify-content: center;
  animation: fadeIn .2s ease;
}
.modal-panel {
  background: rgba(255,255,255,0.98); border: 1px solid var(--border2); box-shadow: 0 -4px 40px rgba(194,86,122,0.15);
  border-radius: 24px 24px 0 0;
  width: 100%; max-width: 520px; padding: 32px;
  max-height: 90vh; overflow-y: auto;
  animation: slideUp .35s cubic-bezier(.16,1,.3,1);
}

.lightbox {
  position: fixed; inset: 0; background: rgba(0,0,0,.92);
  z-index: 999; display: flex; align-items: center; justify-content: center;
  padding: 20px; animation: fadeIn .2s ease; cursor: pointer;
}

.toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
  z-index: 1000; padding: 13px 28px; border-radius: 50px;
  font-size: 13px; font-weight: 600; letter-spacing: .5px;
  white-space: nowrap; animation: fadeUp .3s ease;
  box-shadow: 0 8px 32px rgba(0,0,0,.4);
}
.toast-success { background: linear-gradient(135deg, var(--gold), var(--rose)); color: var(--noir); }
.toast-error   { background: #ef4444; color: #fff; }

.step-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; transition: all .3s; }
.step-done    { background: linear-gradient(135deg, var(--gold), var(--rose)); color: var(--noir); }
.step-active  { background: linear-gradient(135deg, var(--gold), var(--rose)); color: var(--noir); box-shadow: 0 0 0 4px rgba(201,149,108,.25); }
.step-pending { background: rgba(255,255,255,0.8); border: 1px solid var(--border2); color: var(--muted); }

.admin-tab {
  padding: 14px 18px; background: none; border: none;
  border-bottom: 2px solid transparent; color: var(--muted);
  font-family: var(--ff-body); font-size: 11px; letter-spacing: 1.2px;
  text-transform: uppercase; cursor: pointer; white-space: nowrap;
  transition: color .25s, border-color .25s;
  background: rgba(255,255,255,0.8);
}
.admin-tab.active { border-bottom-color: var(--gold); color: var(--gold2); background: rgba(255,255,255,1); }
.admin-tab:hover  { color: var(--gold2); background: rgba(255,255,255,1); }

.kpi {
  background: rgba(255,255,255,0.9); border: 1px solid var(--border2);
  border-radius: 18px; padding: 20px; transition: border-color .3s, box-shadow .3s;
  position: relative; overflow: hidden;
}
.kpi::after {
  content: ''; position: absolute; top: 0; right: 0;
  width: 80px; height: 80px;
  background: radial-gradient(circle at top right, rgba(201,149,108,.12), transparent 70%);
}
.kpi:hover { border-color: var(--border2); box-shadow: var(--shadow-gold); }

.progress-bar  { height: 6px; border-radius: 3px; background: rgba(194,86,122,0.1); overflow: hidden; }
.progress-fill { height: 100%; border-radius: 3px; transition: width .6s; }

.row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
.field label { font-size: 10px; color: var(--gold); letter-spacing: 1.5px; text-transform: uppercase; display: block; margin-bottom: 7px; }

/* Enlace de dirección destacado */
.address-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255,255,255,0.8);
  border: 1px solid var(--border2);
  border-radius: 50px;
  color: var(--gold2);
  font-size: 13px;
  letter-spacing: 1px;
  text-decoration: none;
  transition: all .3s;
  margin: 16px 0;
}
.address-link:hover {
  background: var(--gold);
  color: var(--noir);
  border-color: var(--gold);
  transform: translateY(-2px);
  box-shadow: var(--shadow-gold);
}

/* Calendario mensual */
.month-calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  background: rgba(255,255,255,0.9);
  border-radius: 12px;
  padding: 6px;
  border: 1px solid var(--border2);
}
.month-calendar-header {
  font-size: 9px;
  text-align: center;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0;
  padding: 4px 0;
}
.month-calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  transition: all .2s;
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.5);
  min-width: 0;
  overflow: hidden;
}
.month-calendar-day:hover:not(.disabled) {
  border-color: var(--border2);
  background: rgba(255,255,255,1);
}
.month-calendar-day.selected {
  background: linear-gradient(135deg, var(--gold), var(--rose));
  border-color: transparent;
  color: var(--noir);
}
.month-calendar-day.disabled {
  opacity: 0.3;
  cursor: default;
}
.month-calendar-day.has-appointments {
  border-color: var(--gold);
}
.month-calendar-day .day-number {
  font-weight: 600;
  font-size: 11px;
}
.month-calendar-day .appointment-count {
  font-size: 7px;
  color: var(--gold);
  margin-top: 1px;
}

/* Multi-servicio selection */
.service-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--border2);
  border-radius: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all .3s;
  background: rgba(255,255,255,0.9);
}
.service-checkbox:hover {
  border-color: var(--border2);
  transform: translateY(-2px);
}
.service-checkbox.selected {
  border-color: var(--gold);
  background: rgba(201,149,108,.1);
}
.service-checkbox input {
  width: 20px;
  height: 20px;
  accent-color: var(--gold);
}

/* Notas de clientas */
.client-notes-panel {
  background: rgba(255,255,255,0.9);
  border: 1px solid var(--border2);
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
}
.client-note-item {
  padding: 10px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
}
.client-note-item:last-child {
  border-bottom: none;
}
.client-note-date {
  font-size: 10px;
  color: var(--muted);
  margin-bottom: 4px;
}
`;

const styleEl = document.createElement("style");
styleEl.textContent = css;
document.head.appendChild(styleEl);

// ─── Constantes ───────────────────────────────────────────────────────────────
const HOURS = [
  "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "15:30", "16:00", "16:30", "17:00", "17:30", "18:00",
];
const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const PIE_COLORS = ["#c9956c", "#d4607a", "#9b7dd4", "#6db89a", "#6a9fd4", "#d4b86a", "#ef4444"];

// ─── Funciones auxiliares ─────────────────────────────────────────────────────
const todayStr = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;
};

// Devuelve true si el día NO se puede reservar (pasado, domingo, o sábado tarde)
const diaNoDisponible = (dateStr) => {
  if (dateStr < todayStr()) return true;
  const [y, m, d] = dateStr.split("-").map(Number);
  const diaSemana = new Date(y, m - 1, d).getDay(); // 0=Dom, 6=Sáb
  if (diaSemana === 0) return true; // Domingo: cerrado
  return false;
};

// Slots de hora según el día y hora actual (no muestra horas pasadas para hoy)
const getHorasDisponibles = (dateStr) => {
  if (!dateStr) return HOURS;
  const [y, m, d] = dateStr.split("-").map(Number);
  const diaSemana = new Date(y, m - 1, d).getDay();
  let horas = diaSemana === 6 ? HOURS.filter(h => h <= "12:30") : HOURS;

  // Si es hoy, filtrar las horas que ya han pasado (con 30min de margen)
  if (dateStr === todayStr()) {
    const ahora = new Date();
    const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes() + 30;
    horas = horas.filter(h => {
      const [hh, mm] = h.split(":").map(Number);
      return hh * 60 + mm > minutosAhora;
    });
  }
  return horas;
};
const addDays = (dateStr, n) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
};
const formatDate = dateStr => {
  if (!dateStr) return "";
  // Parsear manualmente para evitar el bug de zona horaria (UTC vs local)
  const [year, month, day] = dateStr.split("-").map(Number);
  const DAYS_FULL = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const d = new Date(year, month - 1, day);
  return `${DAYS_FULL[d.getDay()]} ${day} ${MONTHS[month - 1]} ${year}`;
};
const getWeekDays = base => {
  const [y, m, day] = base.split("-").map(Number);
  const d = new Date(y, m - 1, day);
  const dayOfWeek = d.getDay();
  const mon = new Date(y, m - 1, day - ((dayOfWeek + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const nd = new Date(mon);
    nd.setDate(mon.getDate() + i);
    return `${nd.getFullYear()}-${String(nd.getMonth()+1).padStart(2,"0")}-${String(nd.getDate()).padStart(2,"0")}`;
  });
};
const getMonthDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  const startOffset = (firstDay.getDay() + 6) % 7;
  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`);
  }
  return days;
};
const openWA = (phone, msg) => {
  if (!phone) return;
  window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
};
const formatDuration = minutes => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
};

// ═══════════════════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function NailProApp() {
  // ─── Estado del componente ─────────────────────────────────────────────────
  const [view, setView] = useState("home");
  const [services, setServices] = useState([]);
  const [salon, setSalon] = useState({ name: "Nail Studio", tagline: "...", whatsapp: "", instagram: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  // ── Estado del proceso de reserva ──
  const [booking, setBooking] = useState({
    services: [],      // MÚLTIPLES servicios seleccionados
    date: null,
    time: null,
    name: "",
    phone: "",
    notes: "",
  });
  const [step, setStep] = useState(1);
  const [booked, setBooked] = useState([]);
  const [calWeek, setCalWeek] = useState(todayStr());
  const [calMonth, setCalMonth] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });
  const [calendarView, setCalendarView] = useState("week"); // 'week' o 'month'

  // ── Estado del panel de administración ──
  const [token, setToken] = useState(() => localStorage.getItem("nail_pro_token"));
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loginErr, setLoginErr] = useState("");
  const [adminTab, setAdminTab] = useState("agenda");
  const [apts, setApts] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [stats, setStats] = useState(null);
  const [selApt, setSelApt] = useState(null);
  const [editSvc, setEditSvc] = useState(null);
  const [newSvc, setNewSvc] = useState({ name: "", duration: 60, price: 0, emoji: "💅" });
  const [editSalon, setEditSalon] = useState(false);
  const [galUrl, setGalUrl] = useState("");
  const [galCapt, setGalCapt] = useState("");
  const fileRef = useRef();
  const inspirationRef = useRef();
  const [inspirationFile, setInspirationFile] = useState(null);
  const [inspirationPreview, setInspirationPreview] = useState(null);
  const [inspirationUrl, setInspirationUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // ── Notas de clientas ──
  const [clientNotes, setClientNotes] = useState([]);
  const [selectedClientPhone, setSelectedClientPhone] = useState("");
  const [newNote, setNewNote] = useState("");

  // ── Filtros de estadísticas ──
  const [statsDesde, setStatsDesde] = useState("");
  const [statsHasta, setStatsHasta] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRemoveInspiration = () => {
    setInspirationFile(null);
    setInspirationPreview(null);
    setInspirationUrl("");
  };

  const handleInspirationSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast("Solo se permiten imágenes", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("La imagen no puede superar 5MB", "error");
      return;
    }
    setInspirationFile(file);
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = (e) => setInspirationPreview(e.target.result);
    reader.readAsDataURL(file);
    try {
      const data = await appointmentsAPI.uploadInspiration(file);
      setInspirationUrl(data.url);
      showToast("Foto subida correctamente 📸");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ─── Carga inicial de datos ────────────────────────────────────────────────
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [salonData, servicesData] = await Promise.all([
          salonAPI.get().catch(() => ({ name: "Nail Studio", tagline: "...", whatsapp: "", instagram: "", address: "Cardenal Spínola 68, Los Palacios y Villafranca" })),
          servicesAPI.getAll().catch(() => []),
        ]);
        setSalon(salonData);
        setServices(servicesData);
      } catch (error) {
        console.error("❌ Error cargando datos:", error);
        showToast("Error de conexión. Recarga la página.", "error");
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    if (token) {
      authAPI.verify()
        .then(() => setIsAdmin(true))
        .catch(() => {
          localStorage.removeItem("nail_pro_token");
          setToken(null);
        });
    }
  }, [token]);

  const loadAdminData = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const [aptsData, galData, statsData, salonData, svcsData] = await Promise.all([
        appointmentsAPI.getAll(),
        galleryAPI.getAll(),
        statsAPI.get(),
        salonAPI.get(),
        servicesAPI.getAll(),
      ]);
      setApts(aptsData);
      setGallery(galData);
      setStats(statsData);
      setSalon(salonData);
      setServices(svcsData);
    } catch (err) {
      showToast("Error cargando datos del servidor", "error");
    }
  }, [isAdmin]);

  useEffect(() => { loadAdminData(); }, [loadAdminData]);

  useEffect(() => {
    if (booking.date) {
      appointmentsAPI.getBooked(booking.date)
        .then(setBooked)
        .catch(() => setBooked([]));
    }
  }, [booking.date]);

  // ─── Cargar notas de clienta ───────────────────────────────────────────────
  const loadClientNotes = useCallback(async (phone) => {
    if (!phone) return;
    try {
      const notes = await clientNotesAPI.getByPhone(phone);
      setClientNotes(notes);
    } catch (err) {
      console.error("Error cargando notas:", err);
    }
  }, []);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    try {
      const { token: t } = await authAPI.login(loginData.username, loginData.password);
      localStorage.setItem("nail_pro_token", t);
      setToken(t);
      setIsAdmin(true);
      setView("admin");
      setLoginErr("");
    } catch {
      setLoginErr("Usuario o contraseña incorrectos");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("nail_pro_token");
    setToken(null);
    setIsAdmin(false);
    setView("home");
  };

  // Calcular duración total de servicios seleccionados
  const getTotalDuration = () => {
    return booking.services.reduce((sum, s) => sum + s.duration, 0);
  };

  // Calcular precio total
  const getTotalPrice = () => {
    return booking.services.reduce((sum, s) => sum + s.price, 0);
  };

  const handleConfirmBooking = async () => {
    if (booking.services.length === 0) {
      showToast("Selecciona al menos un servicio", "error");
      return;
    }
    // Añadir +34 automáticamente si no es email y no empieza ya por +
    const phoneEnviar = booking.phone.includes("@")
      ? booking.phone
      : booking.phone.startsWith("+")
        ? booking.phone
        : `+34${booking.phone.replace(/\s/g, "")}`;
    try {
      await appointmentsAPI.create({
        clientName: booking.name,
        phone: phoneEnviar,
        serviceIds: booking.services.map(s => s.id),
        date: booking.date,
        time: booking.time,
        notes: booking.notes,
        inspirationUrl: inspirationUrl,
      });
      setView("confirm");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await appointmentsAPI.updateStatus(id, status);
      await loadAdminData();
      setSelApt(null);
      const mensajes = {
        confirmada: "Cita confirmada ✓",
        completada: "¡Marcada como completada! 🎉",
        cancelada: "Cita cancelada",
      };
      showToast(mensajes[status] || "Estado actualizado");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleAddService = async () => {
    if (!newSvc.name) return;
    try {
      await servicesAPI.create(newSvc);
      setNewSvc({ name: "", duration: 60, price: 0, emoji: "💅" });
      await loadAdminData();
      showToast("Servicio agregado ✨");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleUpdateService = async () => {
    try {
      await servicesAPI.update(editSvc.id, editSvc);
      setEditSvc(null);
      await loadAdminData();
      showToast("Servicio actualizado ✓");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteService = async (id) => {
    try {
      await servicesAPI.delete(id);
      await loadAdminData();
      showToast("Servicio eliminado");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    fd.append("caption", galCapt);
    try {
      await galleryAPI.uploadFile(fd);
      setGalCapt("");
      await loadAdminData();
      showToast("Foto subida correctamente 📸");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleAddGalleryUrl = async () => {
    if (!galUrl.trim()) return;
    try {
      await galleryAPI.addUrl(galUrl, galCapt);
      setGalUrl("");
      setGalCapt("");
      await loadAdminData();
      showToast("Foto agregada a la galería 📸");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteGallery = async (id) => {
    try {
      await galleryAPI.delete(id);
      await loadAdminData();
      showToast("Foto eliminada");
    } catch { }
  };

  const handleSaveSalon = async () => {
    try {
      await salonAPI.update(salon);
      setEditSalon(false);
      showToast("Configuración guardada ✓");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // ─── Notas de clientas handlers ────────────────────────────────────────────
  const handleAddClientNote = async () => {
    if (!newNote.trim() || !selectedClientPhone) return;
    try {
      const apt = apts.find(a => a.phone === selectedClientPhone);
      await clientNotesAPI.create({
        phone: selectedClientPhone,
        clientName: apt?.client_name || "Cliente",
        note: newNote,
      });
      setNewNote("");
      await loadClientNotes(selectedClientPhone);
      showToast("Nota añadida ✓");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const waMsg = apt => ({
    confirmacion: `Hola ${apt.client_name} 💅\n\nTu cita está *CONFIRMADA*:\n📅 ${formatDate(apt.date)} · ${apt.time}\n💅 ${apt.service_name} — ${apt.service_price}€\n⏱ ${formatDuration(apt.total_duration || 60)}\n\n¡Te esperamos! 🌸 — ${salon.name}`,
    recordatorio: `Hola ${apt.client_name} 👋\n\nRecuerda que *mañana* tienes cita:\n📅 ${formatDate(apt.date)} a las ${apt.time}\n💅 ${apt.service_name}\n⏱ ${formatDuration(apt.total_duration || 60)}\n\n¡Te esperamos! — ${salon.name}`,
    gracias: `Hola ${apt.client_name} 💕\n\nGracias por visitarnos hoy. ¡Esperamos que hayas quedado encantada! ✨\n— ${salon.name}`,
  });

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--noir)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }} className="float">💅</div>
        <div style={{ color: "var(--muted)", fontSize: 13, letterSpacing: "2px", textTransform: "uppercase" }}>Cargando...</div>
      </div>
    </div>
  );

  // ── VISTA: HOME ────────────────────────────────────────────────────────────
  if (view === "home") return (
    <div style={{ minHeight: "100vh", background: "var(--noir)" }}>
      <nav className="nav">
        <span style={{ fontFamily: "var(--ff-display)", fontSize: 20, fontWeight: 400, color: "var(--gold2)" }}>
          ✦ {salon.name}
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          {salon.whatsapp && (
            <button className="btn-ghost" style={{ fontSize: 12 }}
              onClick={() => openWA(salon.whatsapp, `Hola, quiero información sobre los servicios de ${salon.name} 💅`)}>
              WhatsApp
            </button>
          )}
          <button className="btn-ghost" style={{ fontSize: 12 }}
            onClick={() => setView(isAdmin ? "admin" : "adminLogin")}>
            Admin
          </button>
        </div>
      </nav>

      <div className="hero-bg" style={{ padding: "72px 20px 56px", textAlign: "center" }}>
        <div className="anim-fade-up">
          <div className="section-label" style={{ textAlign: "center", marginBottom: 18 }}>Bienvenida</div>
          <h1 className="display-title gold-glow"
            style={{ transform: 'scale(1.2)', fontFamily: "'Passions Conflict', cursive", fontSize: "clamp(44px, 10vw, 72px)", marginBottom: 16 }}>
            {salon.name}
          </h1>
          <p style={{ fontFamily: "var(--ff-display)", fontStyle: "italic", fontSize: 20, color: "var(--muted)", marginBottom: 32 }}>
            {salon.tagline}
          </p>
          
          {/* Dirección clickable */}
          <a
            href="https://www.google.com/maps/search/?api=1&query=Cardenal+Spínola+68+Los+Palacios+y+Villafranca"
            target="_blank"
            rel="noopener noreferrer"
            className="address-link"
          >
            <span>📍</span>
            <span>Cardenal Spínola 68, Los Palacios y Villafranca</span>
            <span>↗</span>
          </a>

          <button className="btn-primary" style={{ fontSize: 14, padding: "17px 44px" }}
            onClick={() => {
              setStep(1);
              setBooking({ services: [], date: null, time: null, name: "", phone: "", notes: "" });
              setInspirationUrl("");
              setInspirationPreview(null);
              setView("booking");
            }}>
            Reservar Cita
          </button>
          {salon.instagram && (
            <p style={{ marginTop: 20, fontSize: 11, color: "var(--muted)", letterSpacing: "2px" }}>
              INSTAGRAM <span style={{ color: "var(--gold)" }}>{salon.instagram}</span>
            </p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 20px 80px" }}>
        <div style={{ marginTop: 56 }} className="anim-fade-up d1">
          <div className="section-label">Servicios</div>
          <h2 className="display-title" style={{ fontSize: 18, marginBottom: 28, fontFamily: "'Jost', sans-serif" }}>Arte en cada detalle</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
            {services.map((s, i) => (
              <div key={s.id}
                className={`svc-card anim-fade-up d${Math.min(i + 1, 6)}`}
                onClick={() => {
                  setStep(1);
                  setBooking({ services: [s], date: null, time: null, name: "", phone: "", notes: "" });
                  setView("booking");
                }}
                style={{ padding: "16px", boxSizing: "border-box" }}>
                <div style={{ fontSize: 30, marginBottom: 12 }}>{s.emoji}</div>
                <div className="display-title" style={{ fontSize: 22, marginBottom: 4, fontFamily: "'Jost', sans-serif", width: '100%', wordWrap: 'break-word' }}>
                  {s.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12, letterSpacing: ".5px" }}>
                  ⏱ {s.duration} min
                </div>
                <div className="gold-line" style={{ margin: "12px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="display-title" style={{ fontSize: 26, color: "var(--gold2)", fontWeight: 300, fontFamily: "'Jost', sans-serif" }}>{s.price}€</span>
                  <span style={{ fontSize: 10, color: "var(--gold)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                    Reservar →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {gallery.length > 0 && (
          <div style={{ marginTop: 56 }} className="anim-fade-up d2">
            <div className="section-label">Galería</div>
            <h2 className="display-title" style={{ fontSize: 32, marginBottom: 28 }}>Nuestros trabajos</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {gallery.map(img => (
                <div key={img.id} className="gal-item" onClick={() => setLightbox(img)}>
                  <img src={img.url} alt={img.caption} onError={e => { e.target.style.display = "none"; }} />
                  <div className="gal-overlay" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <div style={{ maxWidth: 500, width: "100%", textAlign: "center" }}>
            <img src={lightbox.url} alt={lightbox.caption}
              style={{ width: "100%", borderRadius: 16, maxHeight: "75vh", objectFit: "contain", border: "1px solid var(--border2)" }} />
            {lightbox.caption && (
              <p style={{ color: "var(--muted)", marginTop: 12, fontSize: 14, fontFamily: "var(--ff-display)", fontStyle: "italic" }}>
                {lightbox.caption}
              </p>
            )}
          </div>
        </div>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );

  // ── VISTA: BOOKING ─────────────────────────────────────────────────────────
  if (view === "booking") {
    const weekDays = getWeekDays(calWeek);
    const monthDays = getMonthDays(calMonth.year, calMonth.month);
    const totalDuration = getTotalDuration();
    const totalPrice = getTotalPrice();

    return (
      <div style={{ minHeight: "100vh", background: "var(--noir)" }}>
        <nav className="nav" style={{ background: "rgba(255,255,255,0.97)", borderBottom: "1px solid var(--border2)", boxShadow: "0 2px 12px rgba(194,86,122,0.08)" }}>
          <button className="btn-ghost" style={{ padding: "8px 16px" }} onClick={() => setView("home")}>←</button>
          <span className="display-title" style={{ fontSize: 18, color: "var(--gold2)" }}>Reservar Cita</span>
          <div style={{ width: 60 }} />
        </nav>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: "26px 0 18px" }}>
          {["Servicios", "Fecha", "Datos"].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className={`step-dot ${step > i + 1 ? "step-done" : step === i + 1 ? "step-active" : "step-pending"}`}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 11, letterSpacing: "1px", textTransform: "uppercase", color: step === i + 1 ? "var(--gold2)" : "var(--muted)" }}>
                {s}
              </span>
              {i < 2 && <span style={{ color: "var(--border2)", margin: "0 2px" }}>—</span>}
            </div>
          ))}
        </div>

        <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 20px 60px" }}>
          {/* PASO 1: Selección múltiple de servicios */}
          {step === 1 && (
            <div className="anim-scale-in">
              <div className="section-label">Paso 1</div>
              <h2 className="display-title" style={{ fontSize: 28, marginBottom: 12 }}>Selecciona tus servicios</h2>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
                Puedes elegir varios servicios. El tiempo total será: <strong style={{ color: "var(--gold)" }}>{formatDuration(totalDuration)}</strong>
              </p>
              
              {services.map((s, i) => {
                const isSelected = booking.services.some(sel => sel.id === s.id);
                return (
                  <div key={s.id}
                    className={`service-checkbox anim-fade-up d${Math.min(i + 1, 6)}${isSelected ? " selected" : ""}`}
                    onClick={() => {
                      setBooking(b => ({
                        ...b,
                        services: isSelected
                          ? b.services.filter(sel => sel.id !== s.id)
                          : [...b.services, s]
                      }));
                    }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                    />
                    <span style={{ fontSize: 28 }}>{s.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div className="display-title" style={{ fontSize: 16 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>⏱ {s.duration} min</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="display-title" style={{ fontSize: 20, color: "var(--gold2)", fontWeight: 300 }}>{s.price}€</div>
                    </div>
                  </div>
                );
              })}

              {booking.services.length > 0 && (
                <div className="card" style={{ padding: 16, marginTop: 16, background: "rgba(201,149,108,.08)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>
                      {booking.services.length} servicio(s) seleccionado(s)
                    </span>
                    <span className="display-title" style={{ fontSize: 22, color: "var(--gold2)" }}>
                      {totalPrice}€ · {formatDuration(totalDuration)}
                    </span>
                  </div>
                </div>
              )}

              <button className="btn-primary btn-full" style={{ marginTop: 20 }}
                disabled={booking.services.length === 0} onClick={() => setStep(2)}>
                Continuar
              </button>
            </div>
          )}

          {/* PASO 2: Calendario mensual + hora */}
          {step === 2 && (
            <div className="anim-scale-in">
              <div className="section-label">Paso 2</div>
              <h2 className="display-title" style={{ fontSize: 28, marginBottom: 16 }}>Elige día y hora</h2>
              
              {/* Selector de vista calendario */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <button
                  className={`btn-outline ${calendarView === 'week' ? 'btn-primary' : ''}`}
                  style={{ flex: 1, padding: "10px" }}
                  onClick={() => setCalendarView('week')}>
                  Semana
                </button>
                <button
                  className={`btn-outline ${calendarView === 'month' ? 'btn-primary' : ''}`}
                  style={{ flex: 1, padding: "10px" }}
                  onClick={() => setCalendarView('month')}>
                  Mes
                </button>
              </div>

              {/* Vista semanal */}
              {calendarView === 'week' && (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <button className="btn-ghost" style={{ padding: "8px 16px" }}
                      onClick={() => setCalWeek(addDays(calWeek, -7))}>‹</button>
                    <span className="display-title" style={{ fontSize: 20, color: "var(--gold2)" }}>
                      {MONTHS[new Date(calWeek).getMonth()]}
                    </span>
                    <button className="btn-ghost" style={{ padding: "8px 16px" }}
                      onClick={() => setCalWeek(addDays(calWeek, 7))}>›</button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 24 }}>
                    {weekDays.map(d => {
                      const esPasado = diaNoDisponible(d);
                      const esSeleccionado = booking.date === d;
                      const citasDelDia = apts.filter(a => a.date === d && a.status !== 'cancelada');
                      return (
                        <div key={d}
                          className={`day-cell${esSeleccionado ? " selected" : esPasado ? " disabled" : ""}${citasDelDia.length > 0 ? " has-appointments" : ""}`}
                          onClick={() => !esPasado && setBooking(b => ({ ...b, date: d, time: null }))}>
                          <div style={{ fontSize: 9, letterSpacing: "1px", textTransform: "uppercase", color: esSeleccionado ? "rgba(0,0,0,.7)" : "var(--muted)" }}>
                            {DAYS_ES[(() => { const [y,m,day] = d.split("-").map(Number); return new Date(y,m-1,day).getDay(); })()]}
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2, color: esSeleccionado ? "var(--noir)" : "var(--cream)" }}>
                            {Number(d.split("-")[2])}
                          </div>
                          {citasDelDia.length > 0 && (
                            <div style={{ fontSize: 8, color: "var(--gold)", marginTop: 2 }}>
                              {citasDelDia.length} citas
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Vista mensual */}
              {calendarView === 'month' && (
                <div className="month-calendar" style={{ marginBottom: 24 }}>
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                    <div key={day} className="month-calendar-header">{day}</div>
                  ))}
                  {monthDays.map((d, i) => {
                    if (!d) return <div key={i} />;
                    const esPasado = diaNoDisponible(d);
                    const esSeleccionado = booking.date === d;
                    const citasDelDia = apts.filter(a => a.date === d && a.status !== 'cancelada');
                    return (
                      <div key={d}
                        className={`month-calendar-day${esSeleccionado ? " selected" : esPasado ? " disabled" : ""}${citasDelDia.length > 0 ? " has-appointments" : ""}`}
                        onClick={() => !esPasado && setBooking(b => ({ ...b, date: d, time: null }))}>
                        <span className="day-number">{Number(d.split("-")[2])}</span>
                        {citasDelDia.length > 0 && (
                          <span className="appointment-count">{citasDelDia.length}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Navegación de meses */}
              {calendarView === 'month' && (
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <button className="btn-outline btn-full"
                    onClick={() => setCalMonth(prev => ({
                      year: prev.month === 0 ? prev.year - 1 : prev.year,
                      month: prev.month === 0 ? 11 : prev.month - 1
                    }))}>
                    ‹ Mes anterior
                  </button>
                  <button className="btn-outline btn-full"
                    onClick={() => setCalMonth(prev => ({
                      year: prev.month === 11 ? prev.year + 1 : prev.year,
                      month: prev.month === 11 ? 0 : prev.month + 1
                    }))}>
                    Mes siguiente ›
                  </button>
                </div>
              )}

              {booking.date && (
                <>
                  <div className="section-label" style={{ marginBottom: 10 }}>
                    Horarios — {formatDate(booking.date)} · {formatDuration(totalDuration)}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 24 }}>
                    {getHorasDisponibles(booking.date).map(h => {
                      const estaOcupado = booked.includes(h);
                      const estaSeleccionado = booking.time === h;
                      return (
                        <div key={h}
                          className={`time-slot${estaSeleccionado ? " selected" : estaOcupado ? " busy" : ""}`}
                          onClick={() => !estaOcupado && setBooking(b => ({ ...b, time: h }))}>
                          {h}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-outline" style={{ flex: 1 }} onClick={() => setStep(1)}>← Atrás</button>
                <button className="btn-primary" style={{ flex: 2 }}
                  disabled={!booking.date || !booking.time} onClick={() => setStep(3)}>
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: Datos personales */}
          {step === 3 && (
            <div className="anim-scale-in">
              <div className="section-label">Paso 3</div>
              <h2 className="display-title" style={{ fontSize: 28, marginBottom: 20 }}>Tus datos</h2>

              <div className="card" style={{ padding: 20, marginBottom: 24, background: "rgba(201,149,108,.06)", borderColor: "var(--border2)" }}>
                <div style={{ marginBottom: 12 }}>
                  <div className="section-label" style={{ marginBottom: 8 }}>Servicios seleccionados</div>
                  {booking.services.map(s => (
                    <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                      <span>{s.emoji} {s.name}</span>
                      <span>{s.price}€ ({s.duration}min)</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, marginTop: 8, borderTop: "2px solid var(--border)" }}>
                  <span style={{ fontWeight: 600 }}>TOTAL</span>
                  <span className="display-title" style={{ fontSize: 24, color: "var(--gold2)" }}>
                    {totalPrice}€ · {formatDuration(totalDuration)}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
                  📅 {formatDate(booking.date)} · {booking.time}
                </div>
              </div>

              {[
                ["Nombre completo *", "text", "María García", "name"],
              ].map(([label, tipo, placeholder, campo]) => (
                <div key={campo} className="field" style={{ marginBottom: 16 }}>
                  <label>{label}</label>
                  <input className="input" type={tipo} placeholder={placeholder}
                    value={booking[campo]}
                    onChange={e => setBooking(b => ({ ...b, [campo]: e.target.value }))} />
                </div>
              ))}

              <div className="field" style={{ marginBottom: 16 }}>
                <label>Teléfono o Email *</label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                    fontSize: 14, color: "var(--muted)", pointerEvents: "none", userSelect: "none"
                  }}>
                    {booking.phone?.includes("@") ? "" : "+34 "}
                  </span>
                  <input className="input" type="text"
                    placeholder="600 000 000 o tu email"
                    style={{ paddingLeft: booking.phone?.includes("@") ? 17 : 52 }}
                    value={booking.phone}
                    onChange={e => {
                      let val = e.target.value;
                      // Si escribe el +34 a mano, quitarlo para no duplicarlo
                      if (val.startsWith("+34")) val = val.slice(3).trimStart();
                      if (val.startsWith("34") && val.length > 9) val = val.slice(2);
                      setBooking(b => ({ ...b, phone: val }));
                    }} />
                </div>
                <span style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, display: "block" }}>
                  El prefijo +34 se añade automáticamente. Si usas email escríbelo tal cual.
                </span>
              </div>

              <div className="field" style={{ marginBottom: 24 }}>
                <label>Notas adicionales (opcional)</label>
                <textarea className="input" placeholder="Ej: quiero diseño floral..."
                  value={booking.notes}
                  onChange={e => setBooking(b => ({ ...b, notes: e.target.value }))} />
              </div>

              <div className="field" style={{ marginBottom: 24 }}>
                <label>Foto de inspiración (opcional)</label>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12, lineHeight: 1.5 }}>
                  📸 Sube una foto del diseño que te gustaría para que podamos prepararnos antes de tu cita.
                </p>

                {inspirationPreview ? (
                  <div style={{ position: "relative", marginBottom: 12 }}>
                    <img src={inspirationPreview} alt="Foto de inspiración"
                      style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 14, border: "2px solid var(--border2)" }} />
                    {uploadingPhoto && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.8)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                        <span className="spinning" style={{ fontSize: 24 }}>⏳</span>
                        <span style={{ fontSize: 13, color: "var(--gold)" }}>Subiendo foto...</span>
                      </div>
                    )}
                    {!uploadingPhoto && inspirationUrl && (
                      <div style={{ position: "absolute", top: 10, right: 10, background: "#10b981", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>✓</span>
                      </div>
                    )}
                    <button onClick={handleRemoveInspiration}
                      style={{ position: "absolute", top: 10, left: 10, background: "rgba(239,68,68,0.85)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      ×
                    </button>
                  </div>
                ) : (
                  <div onClick={() => inspirationRef.current.click()}
                    style={{ border: "2px dashed var(--border2)", borderRadius: 14, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: "rgba(255,255,255,0.6)", transition: "background 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.9)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.6)"}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
                    <div style={{ fontSize: 14, color: "var(--gold2)", fontWeight: 600, marginBottom: 4 }}>Toca para subir una foto</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>JPG, PNG o WEBP · Máx. 5MB</div>
                  </div>
                )}

                <input ref={inspirationRef} type="file" accept="image/*"
                  style={{ display: "none" }} onChange={handleInspirationSelect} />
              </div>

              <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 20, lineHeight: 1.6 }}>
                💡 Si pones tu email recibirás confirmación automática por correo.
              </p>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-outline" style={{ flex: 1 }} onClick={() => setStep(2)}>← Atrás</button>
                <button className="btn-primary" style={{ flex: 2 }}
                  disabled={!booking.name || !booking.phone || uploadingPhoto}
                  onClick={handleConfirmBooking}>
                  {uploadingPhoto ? "Subiendo foto..." : `Confirmar Cita (${totalPrice}€)`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── VISTA: CONFIRM ─────────────────────────────────────────────────────────
  if (view === "confirm") return (
    <div style={{ minHeight: "100vh", background: "var(--noir)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }} className="anim-scale-in">
        <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
        <div className="section-label" style={{ textAlign: "center", marginBottom: 8 }}>¡Reserva exitosa!</div>
        <h1 className="display-title" style={{ fontSize: 40, marginBottom: 32 }}>Cita Confirmada</h1>
        
        <div className="card" style={{ padding: 24, marginBottom: 24, textAlign: "left" }}>
          {[
            ["Servicios", booking.services.map(s => `${s.emoji} ${s.name}`).join(" + ")],
            ["Fecha", formatDate(booking.date)],
            ["Hora", booking.time],
            ["Nombre", booking.name],
            ["Precio Total", `${getTotalPrice()}€`],
            ["Duración", formatDuration(getTotalDuration())],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "1.5px", textTransform: "uppercase" }}>{k}</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>

        {booking.phone.includes("@") && (
          <p style={{ fontSize: 12, color: "var(--gold)", marginBottom: 16, letterSpacing: ".5px" }}>
            📧 Te enviamos un email de confirmación
          </p>
        )}

        {salon.whatsapp && (
          <button className="btn-green"
            style={{ width: "100%", padding: "14px", borderRadius: 12, marginBottom: 12, fontSize: 14 }}
            onClick={() => openWA(salon.whatsapp,
              `Hola! Acabo de reservar cita:\n📅 ${formatDate(booking.date)} · ${booking.time}\n💅 ${booking.services.map(s => s.name).join(" + ")}\nMi nombre: ${booking.name}`)}>
            📲 Confirmar por WhatsApp
          </button>
        )}
        <button className="btn-outline btn-full" onClick={() => setView("home")}>Volver al Inicio</button>
      </div>
    </div>
  );

  // ── VISTA: ADMIN LOGIN ─────────────────────────────────────────────────────
  if (view === "adminLogin") return (
    <div style={{ minHeight: "100vh", background: "var(--noir)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ maxWidth: 360, width: "100%", textAlign: "center" }} className="anim-scale-in">
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
        <div className="section-label" style={{ textAlign: "center", marginBottom: 8 }}>Acceso Privado</div>
        <h2 className="display-title" style={{ fontSize: 34, marginBottom: 28 }}>Panel Admin</h2>
        <div className="field" style={{ marginBottom: 14, textAlign: "left" }}>
          <label>Usuario</label>
          <input className="input" placeholder="admin" value={loginData.username}
            onChange={e => setLoginData(p => ({ ...p, username: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <div className="field" style={{ marginBottom: 8, textAlign: "left" }}>
          <label>Contraseña</label>
          <input className="input" type="password" placeholder="••••••••" value={loginData.password}
            onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        {loginErr && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{loginErr}</p>}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button className="btn-outline" style={{ flex: 1 }} onClick={() => setView("home")}>Cancelar</button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={handleLogin}>Entrar</button>
        </div>
      </div>
    </div>
  );

  // ── VISTA: ADMIN ───────────────────────────────────────────────────────────
  if (view === "admin") {
    const weekDays = getWeekDays(calWeek);
    const monthDays = getMonthDays(calMonth.year, calMonth.month);
    const todayApts = apts.filter(a => a.date === todayStr() && a.status !== "cancelada").sort((a, b) => a.time.localeCompare(b.time));
    const allApts = [...apts].sort((a, b) => b.created_at.localeCompare(a.created_at));

    // ── Cálculos de estadísticas con filtro ──
    const aptsFiltradas = apts.filter(a => {
      if (statsDesde && a.date < statsDesde) return false;
      if (statsHasta && a.date > statsHasta) return false;
      return true;
    });
    const ingresosFiltrados = aptsFiltradas
      .filter(a => a.status === "completada")
      .reduce((sum, a) => sum + Number(a.service_price || 0), 0);
    const clientesUnicos = new Set(aptsFiltradas.map(a => a.phone)).size;
    const porMesFiltrado = aptsFiltradas.reduce((acc, a) => {
      const [y, m] = a.date.split("-");
      const key = `${m}-${y}`;
      if (!acc[key]) acc[key] = { month: key, citas: 0, ingresos: 0 };
      acc[key].citas++;
      if (a.status === "completada") acc[key].ingresos += Number(a.service_price || 0);
      return acc;
    }, {});
    const porServicioFiltrado = aptsFiltradas
      .filter(a => a.status !== "cancelada")
      .reduce((acc, a) => {
        acc[a.service_name] = (acc[a.service_name] || 0) + 1;
        return acc;
      }, {});

    return (
      <div style={{ minHeight: "100vh", background: "var(--noir)" }}>
        <nav className="nav" style={{ background: "rgba(255,255,255,0.97)", borderBottom: "1px solid var(--border2)", boxShadow: "0 2px 12px rgba(194,86,122,0.08)" }}>
          <span className="display-title" style={{ fontSize: 20, color: "var(--gold2)", fontWeight: 300 }}>✦ Admin Pro</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => setView("home")}>Ver Sitio</button>
            <button className="btn-ghost" style={{ fontSize: 11, color: "#ef4444" }} onClick={handleLogout}>Salir</button>
          </div>
        </nav>

        <div style={{ display: "flex", background: "rgba(255,255,255,0.95)", borderBottom: "1px solid var(--border2)", overflowX: "auto", boxShadow: "0 2px 12px rgba(194,86,122,0.08)" }}>
          {[
            ["agenda", "📅 Agenda"],
            ["citas", "📋 Citas"],
            ["clientas", "👥 Clientas"],
            ["estadisticas", "📊 Stats"],
            ["servicios", "💅 Servicios"],
            ["galeria", "📸 Galería"],
            ["config", "⚙️ Config"],
          ].map(([tab, label]) => (
            <button key={tab} className={`admin-tab${adminTab === tab ? " active" : ""}`}
              onClick={() => setAdminTab(tab)}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px" }}>
          {/* PESTAÑA: AGENDA */}
          {adminTab === "agenda" && (
            <div className="anim-slide-up">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 28 }}>
                {[
                  ["Hoy", todayApts.length, "📅"],
                  ["Pendientes", apts.filter(a => a.status === "pendiente").length, "⏳"],
                  ["Clientes", stats?.totalClients || 0, "👥"],
                  ["Ingresos", `${stats?.totalRevenue || 0}€`, "💰"],
                ].map(([label, valor, emoji]) => (
                  <div key={label} className="kpi">
                    <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
                    <div className="display-title" style={{ fontSize: 26, color: "var(--gold2)", fontWeight: 300, marginBottom: 4 }}>{valor}</div>
                    <div style={{ fontSize: 20 }}>{emoji}</div>
                  </div>
                ))}
              </div>

              {/* Calendario mensual completo */}
              <div className="card card-hover" style={{ padding: 24, marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span className="display-title" style={{ fontSize: 18, color: "var(--gold2)" }}>
                    {MONTHS[calMonth.month]} {calMonth.year}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-ghost" style={{ padding: "6px 14px" }}
                      onClick={() => setCalMonth(prev => ({
                        year: prev.month === 0 ? prev.year - 1 : prev.year,
                        month: prev.month === 0 ? 11 : prev.month - 1
                      }))}>‹</button>
                    <button className="btn-ghost" style={{ padding: "6px 14px" }}
                      onClick={() => setCalMonth(prev => ({
                        year: prev.month === 11 ? prev.year + 1 : prev.year,
                        month: prev.month === 11 ? 0 : prev.month + 1
                      }))}>›</button>
                  </div>
                </div>
                
                <div className="month-calendar">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                    <div key={day} className="month-calendar-header">{day}</div>
                  ))}
                  {monthDays.map((d, i) => {
                    if (!d) return <div key={i} />;
                    const citasDelDia = apts.filter(a => a.date === d && a.status !== 'cancelada');
                    const esHoy = d === todayStr();
                    return (
                      <div key={d} className={`month-calendar-day${esHoy ? " selected" : ""}`}
                        style={{ minHeight: 40, padding: 2 }}>
                        <span className="day-number" style={{ fontSize: 11 }}>{new Date(d).getDate()}</span>
                        {citasDelDia.length > 0 && (
                          <div style={{ fontSize: 8, color: "var(--gold)", marginTop: 2 }}>
                            {citasDelDia.length} citas
                          </div>
                        )}
                        {citasDelDia.slice(0, 2).map(a => (
                          <div key={a.id} style={{ fontSize: 7, background: "rgba(201,149,108,.12)", borderRadius: 2, padding: "1px 3px", marginTop: 1, color: "var(--gold)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {a.time}
                          </div>
                        ))}
                        {citasDelDia.length > 2 && (
                          <div style={{ fontSize: 7, color: "var(--muted)" }}>+{citasDelDia.length - 2}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="section-label">Citas de hoy</div>
              <h2 className="display-title" style={{ fontSize: 24, marginBottom: 16 }}>Agenda del día</h2>
              {todayApts.length === 0 ? (
                <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🌸</div>
                  <div className="display-title" style={{ fontSize: 18 }}>No hay citas hoy</div>
                </div>
              ) : (
                todayApts.map(a => (
                  <div key={a.id} className="card card-lift" style={{ padding: "18px 22px", marginBottom: 12 }}
                    onClick={() => { setSelApt(a); setSelectedClientPhone(a.phone); loadClientNotes(a.phone); }}>
                    <div className="row">
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <span style={{ fontSize: 30 }}>{a.service_emoji}</span>
                        <div>
                          <div className="display-title" style={{ fontSize: 18 }}>{a.client_name}</div>
                          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{a.time} · {a.service_name}</div>
                          <div style={{ fontSize: 11, color: "var(--gold)" }}>⏱ {formatDuration(a.total_duration || 60)}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span className={`badge badge-${a.status}`}>{a.status}</span>
                        <button className="btn-green" onClick={e => { e.stopPropagation(); openWA(a.phone, waMsg(a).recordatorio); }}>
                          📲 WA
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PESTAÑA: CLIENTAS (NOTAS) */}
          {adminTab === "clientas" && (
            <div className="anim-slide-up">
              <div className="section-label">Historial</div>
              <h2 className="display-title" style={{ fontSize: 28, marginBottom: 20 }}>Notas de Clientas</h2>
              
              <div className="field" style={{ marginBottom: 20 }}>
                <label>Buscar clienta por nombre o teléfono</label>
                <input className="input" placeholder="Nombre o teléfono..."
                  value={selectedClientPhone}
                  onChange={e => { setSelectedClientPhone(e.target.value); loadClientNotes(e.target.value); }} />
              </div>

              {selectedClientPhone && (
                <>
                  <div className="client-notes-panel">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>Historial de notas</span>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{clientNotes.length} notas</span>
                    </div>
                    {clientNotes.length === 0 ? (
                      <div style={{ textAlign: "center", color: "var(--muted)", padding: 20 }}>
                        No hay notas para esta clienta
                      </div>
                    ) : (
                      clientNotes.map(note => (
                        <div key={note.id} className="client-note-item">
                          <div className="client-note-date">{note.client_name} · {formatDate(note.created_at?.split('T')[0])}</div>
                          <div>{note.note}</div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="field" style={{ marginTop: 16 }}>
                    <label>Añadir nueva nota</label>
                    <textarea className="input" placeholder="Ej: Prefiere esmalte semipermanente, alérgica a..."
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      style={{ minHeight: 100 }} />
                    <button className="btn-primary btn-full" style={{ marginTop: 12 }}
                      onClick={handleAddClientNote} disabled={!newNote.trim()}>
                      Guardar Nota
                    </button>
                  </div>
                </>
              )}

              <div className="card" style={{ padding: 20, marginTop: 24 }}>
                <div className="section-label" style={{ marginBottom: 12 }}>Últimas clientas</div>
                {[...new Map(apts.map(a => [a.phone, a])).values()].slice(0, 10).map(apt => (
                  <div key={apt.phone}
                    className="service-checkbox"
                    onClick={() => { setSelectedClientPhone(apt.phone); loadClientNotes(apt.phone); }}
                    style={{ padding: "12px", cursor: "pointer" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{apt.client_name}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{apt.phone}</div>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>
                      {apts.filter(a => a.phone === apt.phone).length} citas
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PESTAÑA: CITAS */}
          {adminTab === "citas" && (
            <div className="anim-slide-up">
              <div className="section-label">Gestión</div>
              <h2 className="display-title" style={{ fontSize: 28, marginBottom: 20 }}>
                Todas las Citas ({allApts.length})
              </h2>
              {allApts.map(a => (
                <div key={a.id} className="card card-lift" style={{ padding: "18px 22px", marginBottom: 12 }}
                  onClick={() => { setSelApt(a); setSelectedClientPhone(a.phone); loadClientNotes(a.phone); }}>
                  <div className="row">
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ fontSize: 28 }}>{a.service_emoji}</span>
                      <div>
                        <div className="display-title" style={{ fontSize: 17 }}>{a.client_name}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 1 }}>{formatDate(a.date)} · {a.time}</div>
                        <div style={{ fontSize: 12, color: "var(--gold)", marginTop: 1 }}>
                          {a.service_name} · <strong>{a.service_price}€</strong> · ⏱ {formatDuration(a.total_duration || 60)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                      <span className={`badge badge-${a.status}`}>{a.status}</span>
                      <button className="btn-green" onClick={e => { e.stopPropagation(); openWA(a.phone, waMsg(a).confirmacion); }}>
                        📲 WA
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PESTAÑA: ESTADÍSTICAS */}
          {adminTab === "estadisticas" && stats && (
            <div className="anim-slide-up">
              <div className="section-label">Análisis</div>
              <h2 className="display-title" style={{ fontSize: 28, marginBottom: 16 }}>Estadísticas</h2>

              {/* Filtro de fechas */}
              <div className="card" style={{ padding: 16, marginBottom: 20, background: "rgba(201,149,108,.05)" }}>
                <div className="section-label" style={{ marginBottom: 10 }}>Filtrar por período</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div className="field">
                    <label>Desde</label>
                    <input className="input" type="date" value={statsDesde}
                      onChange={e => setStatsDesde(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Hasta</label>
                    <input className="input" type="date" value={statsHasta}
                      onChange={e => setStatsHasta(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {[
                    ["Este mes", () => {
                      const hoy = new Date();
                      setStatsDesde(`${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,"0")}-01`);
                      setStatsHasta(todayStr());
                    }],
                    ["Último mes", () => {
                      const hoy = new Date();
                      const primerDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth()-1, 1);
                      const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
                      setStatsDesde(primerDiaMesAnterior.toISOString().split("T")[0]);
                      setStatsHasta(ultimoDiaMesAnterior.toISOString().split("T")[0]);
                    }],
                    ["Este año", () => {
                      setStatsDesde(`${new Date().getFullYear()}-01-01`);
                      setStatsHasta(todayStr());
                    }],
                    ["Todo", () => { setStatsDesde(""); setStatsHasta(""); }],
                  ].map(([label, fn]) => (
                    <button key={label} className="btn-ghost" style={{ fontSize: 11, padding: "6px 12px" }} onClick={fn}>
                      {label}
                    </button>
                  ))}
                </div>
                {(statsDesde || statsHasta) && (
                  <div style={{ fontSize: 11, color: "var(--gold)", marginTop: 8 }}>
                    Mostrando {aptsFiltradas.length} citas {statsDesde ? `desde ${formatDate(statsDesde)}` : ""} {statsHasta ? `hasta ${formatDate(statsHasta)}` : ""}
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                {[
                  ["Ingresos", `${ingresosFiltrados.toFixed(2)}€`, "💰"],
                  ["Total citas", aptsFiltradas.length, "📋"],
                  ["Clientes únicos", clientesUnicos, "👥"],
                  ["Tasa completadas", `${aptsFiltradas.length ? Math.round(aptsFiltradas.filter(a => a.status === "completada").length / aptsFiltradas.length * 100) : 0}%`, "✅"],
                ].map(([label, valor, emoji]) => (
                  <div key={label} className="kpi">
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
                        <div className="display-title" style={{ fontSize: 26, color: "var(--gold2)", fontWeight: 300 }}>{valor}</div>
                      </div>
                      <span style={{ fontSize: 24 }}>{emoji}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Gráfica por mes */}
              {Object.keys(porMesFiltrado).length > 0 && (
                <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                  <div className="section-label" style={{ marginBottom: 12 }}>Citas e ingresos por mes</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={Object.values(porMesFiltrado).sort((a,b) => a.month.localeCompare(b.month))}>
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="citas" fill="#c2567a" name="Citas" radius={[4,4,0,0]} />
                      <Bar dataKey="ingresos" fill="#e8729a" name="Ingresos €" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Servicios más populares */}
              {Object.keys(porServicioFiltrado).length > 0 && (
                <div className="card" style={{ padding: 20 }}>
                  <div className="section-label" style={{ marginBottom: 12 }}>Servicios más solicitados</div>
                  {Object.entries(porServicioFiltrado)
                    .sort((a,b) => b[1] - a[1])
                    .map(([nombre, count], i) => {
                      const max = Math.max(...Object.values(porServicioFiltrado));
                      return (
                        <div key={nombre} style={{ marginBottom: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 13 }}>{nombre}</span>
                            <span style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600 }}>{count}</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${(count/max)*100}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* PESTAÑA: SERVICIOS */}
          {adminTab === "servicios" && (
            <div className="anim-slide-up">
              <div className="section-label">Gestión</div>
              <h2 className="display-title" style={{ fontSize: 28, marginBottom: 20 }}>Servicios</h2>
              {services.map(s => (
                <div key={s.id} className="card card-hover" style={{ padding: "18px 22px", marginBottom: 12 }}>
                  {editSvc?.id === s.id ? (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                        {[
                          ["Nombre", "text", "name"],
                          ["Emoji", "text", "emoji"],
                          ["Precio (€)", "number", "price"],
                          ["Duración (min)", "number", "duration"],
                        ].map(([label, tipo, campo]) => (
                          <div key={campo} className="field">
                            <label>{label}</label>
                            <input className="input" type={tipo} value={editSvc[campo]}
                              onChange={e => setEditSvc(p => ({ ...p, [campo]: tipo === "number" ? Number(e.target.value) : e.target.value }))} />
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn-primary btn-full" style={{ flex: 1 }} onClick={handleUpdateService}>Guardar</button>
                        <button className="btn-outline" style={{ flex: 1 }} onClick={() => setEditSvc(null)}>Cancelar</button>
                      </div>
                    </>
                  ) : (
                    <div className="row">
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <span style={{ fontSize: 30 }}>{s.emoji}</span>
                        <div>
                          <div className="display-title" style={{ fontSize: 18 }}>{s.name}</div>
                          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                            {s.duration} min · <span style={{ color: "var(--gold2)", fontWeight: 600 }}>{s.price}€</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn-ghost" style={{ padding: "8px 12px" }} onClick={() => setEditSvc({ ...s })}>✏️</button>
                        <button className="btn-danger" style={{ padding: "8px 12px" }} onClick={() => handleDeleteService(s.id)}>🗑️</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div className="card" style={{ padding: 24, border: "1px dashed var(--border2)" }}>
                <div className="section-label">Nuevo Servicio</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  {[
                    ["Nombre", "text", "name"],
                    ["Emoji", "text", "emoji"],
                    ["Precio (€)", "number", "price"],
                    ["Duración (min)", "number", "duration"],
                  ].map(([label, tipo, campo]) => (
                    <div key={campo} className="field">
                      <label>{label}</label>
                      <input className="input" type={tipo} value={newSvc[campo]}
                        onChange={e => setNewSvc(p => ({ ...p, [campo]: tipo === "number" ? Number(e.target.value) : e.target.value }))} />
                    </div>
                  ))}
                </div>
                <button className="btn-primary btn-full" onClick={handleAddService}>Agregar Servicio</button>
              </div>
            </div>
          )}

          {/* PESTAÑA: GALERÍA */}
          {adminTab === "galeria" && (
            <div className="anim-slide-up">
              <div className="section-label">Portafolio</div>
              <h2 className="display-title" style={{ fontSize: 28, marginBottom: 8 }}>Galería de Trabajos</h2>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>
                Las fotos que agregues aquí aparecerán en la página pública para atraer más clientas.
              </p>
              <div className="card" style={{ padding: 24, border: "1px dashed var(--border2)", marginBottom: 20 }}>
                <div className="section-label">Agregar foto</div>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label>URL de imagen externa</label>
                  <input className="input" placeholder="https://..." value={galUrl}
                    onChange={e => setGalUrl(e.target.value)} />
                </div>
                <div className="field" style={{ marginBottom: 16 }}>
                  <label>Descripción (opcional)</label>
                  <input className="input" placeholder="Ej: Nail art flores primavera" value={galCapt}
                    onChange={e => setGalCapt(e.target.value)} />
                </div>
                <button className="btn-primary btn-full" style={{ marginBottom: 10 }} onClick={handleAddGalleryUrl}>
                  Agregar por URL
                </button>
                <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 12, margin: "10px 0" }}>— o —</div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleUploadFile} />
                <button className="btn-outline btn-full" onClick={() => fileRef.current.click()}>
                  📁 Subir desde mi dispositivo
                </button>
              </div>
              {gallery.length === 0 ? (
                <div className="card" style={{ padding: 48, textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
                  <div className="display-title" style={{ fontSize: 20, color: "var(--muted)" }}>Galería vacía</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>Agrega tus trabajos para mostrarlos</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {gallery.map(img => (
                    <div key={img.id} className="gal-item" style={{ position: "relative" }}>
                      <img src={img.url} alt={img.caption} onClick={() => setLightbox(img)}
                        onError={e => { e.target.style.display = "none"; }} />
                      <div className="gal-overlay" />
                      <button onClick={() => handleDeleteGallery(img.id)}
                        style={{ position: "absolute", top: 6, right: 6, background: "rgba(239,68,68,.85)", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", color: "#fff", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PESTAÑA: CONFIG */}
          {adminTab === "config" && (
            <div className="anim-slide-up">
              <div className="card card-hover" style={{ padding: 28 }}>
                <div className="section-label">Información del salón</div>
                <h2 className="display-title" style={{ fontSize: 24, marginBottom: 20 }}>Configuración</h2>
                {editSalon ? (
                  <>
                    {[
                      ["Nombre del salón", "name", "Nail Studio by Luna"],
                      ["Eslogan", "tagline", "L'art de la beauté..."],
                      ["Dirección", "address", "Calle, Ciudad"],
                      ["Teléfono", "phone", "+34 600 000 000"],
                      ["WhatsApp (sin + ni espacios)", "whatsapp", "34600000000"],
                      ["Instagram", "instagram", "@tunombre"],
                    ].map(([label, campo, placeholder]) => (
                      <div key={campo} className="field" style={{ marginBottom: 14 }}>
                        <label>{label}</label>
                        <input className="input" placeholder={placeholder}
                          value={salon[campo] || ""}
                          onChange={e => setSalon(p => ({ ...p, [campo]: e.target.value }))} />
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 10 }}>
                      <button className="btn-primary btn-full" style={{ flex: 1 }} onClick={handleSaveSalon}>Guardar</button>
                      <button className="btn-outline" style={{ flex: 1 }} onClick={() => setEditSalon(false)}>Cancelar</button>
                    </div>
                  </>
                ) : (
                  <>
                    {[
                      ["Salón", salon.name],
                      ["Eslogan", salon.tagline],
                      ["Dirección", salon.address || "—"],
                      ["WhatsApp", salon.whatsapp || "—"],
                      ["Instagram", salon.instagram || "—"],
                    ].map(([label, valor]) => (
                      <div key={label} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "1.5px", textTransform: "uppercase" }}>{label}</span>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{valor}</span>
                      </div>
                    ))}
                    <button className="btn-primary btn-full" style={{ marginTop: 20 }} onClick={() => setEditSalon(true)}>
                      ✏️ Editar
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODAL DE DETALLE DE CITA */}
        {selApt && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelApt(null); }}>
            <div className="modal-panel">
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 52, marginBottom: 10 }}>{selApt.service_emoji}</div>
                <h2 className="display-title" style={{ fontSize: 28, marginBottom: 6 }}>{selApt.client_name}</h2>
                <span className={`badge badge-${selApt.status}`}>{selApt.status}</span>
              </div>
              <div className="gold-line" />
              {[
                ["Servicio", selApt.service_name],
                ["Fecha", formatDate(selApt.date)],
                ["Hora", selApt.time],
                ["Duración", formatDuration(selApt.total_duration || 60)],
                ["Teléfono/Email", selApt.phone],
                ["Precio", `${selApt.service_price}€`],
                ["Notas", selApt.notes || "—"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "1.5px", textTransform: "uppercase" }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, maxWidth: "60%", textAlign: "right" }}>{v}</span>
                </div>
              ))}

              {/* Foto de inspiración */}
              {selApt.inspiration_url && (
                <div style={{ marginTop: 16 }}>
                  <div className="section-label" style={{ marginBottom: 8 }}>Foto de inspiración</div>
                  <img src={selApt.inspiration_url} alt="Inspiración"
                    onClick={() => setLightbox({ url: selApt.inspiration_url, caption: "Foto de inspiración" })}
                    style={{ width: "100%", borderRadius: 12, maxHeight: 220, objectFit: "cover", border: "1px solid var(--border2)", cursor: "pointer" }} />
                  <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>Toca la foto para ampliarla</p>
                </div>
              )}
              
              {/* Notas de la clienta */}
              <div style={{ marginTop: 16 }}>
                <div className="section-label" style={{ marginBottom: 8 }}>Notas de la clienta</div>
                <button className="btn-outline btn-full"
                  onClick={() => { setAdminTab('clientas'); setSelectedClientPhone(selApt.phone); loadClientNotes(selApt.phone); setSelApt(null); }}>
                  📝 Ver historial completo
                </button>
              </div>

              <div className="gold-line" />
              <div style={{ marginTop: 20, marginBottom: 16 }}>
                <div className="section-label" style={{ marginBottom: 10 }}>Enviar por WhatsApp</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    ["✅ Confirmación", "confirmacion", "linear-gradient(135deg,#25D366,#128C7E)"],
                    ["🔔 Recordatorio", "recordatorio", "linear-gradient(135deg,#3b82f6,#6366f1)"],
                    ["💕 Gracias", "gracias", "linear-gradient(135deg,var(--gold),var(--rose))"],
                  ].map(([label, tipo, fondo]) => (
                    <button key={tipo} className="btn-primary btn-full"
                      style={{ background: fondo, color: "#fff", fontSize: 13, padding: "12px" }}
                      onClick={() => openWA(selApt.phone, waMsg(selApt)[tipo])}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="gold-line" />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {selApt.status === "pendiente" && (
                  <button className="btn-primary" style={{ flex: 1, background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff" }}
                    onClick={() => handleUpdateStatus(selApt.id, "confirmada")}>
                    ✅ Confirmar
                  </button>
                )}
                {selApt.status === "confirmada" && (
                  <button className="btn-primary" style={{ flex: 1, background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff" }}
                    onClick={() => handleUpdateStatus(selApt.id, "completada")}>
                    🎉 Completada
                  </button>
                )}
                {!["cancelada", "completada"].includes(selApt.status) && (
                  <button className="btn-danger" style={{ flex: 1 }}
                    onClick={() => handleUpdateStatus(selApt.id, "cancelada")}>
                    ❌ Cancelar
                  </button>
                )}
                <button className="btn-outline" style={{ flex: 1 }} onClick={() => setSelApt(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}

        {lightbox && (
          <div className="lightbox" onClick={() => setLightbox(null)}>
            <div style={{ maxWidth: 500, width: "100%", textAlign: "center" }}>
              <img src={lightbox.url} alt={lightbox.caption}
                style={{ width: "100%", borderRadius: 16, maxHeight: "75vh", objectFit: "contain", border: "1px solid var(--border2)" }} />
            </div>
          </div>
        )}

        {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      </div>
    );
  }

  return null;
}