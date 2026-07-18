/* =========================================================
   MOZHI — Supabase client
   Loaded before every other JS file. Exposes a single
   shared `supabaseClient` on window plus a few app-wide
   constants so every page configures itself the same way.
   ========================================================= */

// ---------------------------------------------------------
// 1. CONFIGURE ME
// Replace these two values with your own Supabase project's
// URL and public "anon" key (Project Settings -> API).
// ---------------------------------------------------------
const SUPABASE_URL = "https://zecrgymbisrorevnsxrr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplY3JneW1iaXNyb3Jldm5zeHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMjMyNjcsImV4cCI6MjA5OTc5OTI2N30._UUfOmVXlMQT2aDAUPXzt0cS1zzWdlV9v35IpFVVL80";

// ---------------------------------------------------------
// 2. Session length rules
// Supabase issues one JWT lifetime per project, so Mozhi
// enforces the two different session lengths itself: on
// every protected page we check how long ago the person
// logged in and sign them out once their role's window
// has passed. See js/auth.js -> enforceSessionOrRedirect().
// ---------------------------------------------------------
const SESSION_DURATIONS_MS = {
  patient: 7 * 24 * 60 * 60 * 1000, // 7 days
  family: 24 * 60 * 60 * 1000,      // 24 hours
};

// Keys used in localStorage to remember the role + login time
// alongside Supabase's own session storage.
const STORAGE_KEYS = {
  role: "mozhi_role",
  loginAt: "mozhi_login_at",
};

// Category metadata shared by the communicate flow and the
// family management screen — single source of truth so a
// new category only needs to be added in one place.
const CATEGORIES = [
  { id: "food", label: "Food", emoji: "🍚" },
  { id: "water", label: "Water", emoji: "💧" },
  { id: "washroom", label: "Washroom", emoji: "🚻" },
  { id: "medicine", label: "Medicine", emoji: "💊" },
  { id: "pain", label: "Pain", emoji: "😖" },
  { id: "sleep", label: "Sleep", emoji: "😴" },
  { id: "emergency", label: "Emergency", emoji: "🚨" },
];

// ---------------------------------------------------------
// 3. Create the client
// The Supabase library is loaded via CDN script tag in each
// HTML file before this file, exposing the global `supabase`.
// Guarded so that a failed/slow CDN load (common on mobile
// networks) shows a visible message instead of silently
// breaking every button on the page.
// ---------------------------------------------------------
let supabaseClient = null;

try {
  if (typeof supabase === "undefined" || !supabase.createClient) {
    throw new Error("Supabase library did not load.");
  }
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
} catch (err) {
  showMozhiFatalError(
    "Couldn't connect. Please check your internet connection and reload the page."
  );
}

/**
 * Shows a small fixed banner at the top of the page. Used when
 * the app can't even initialize (e.g. the Supabase library
 * failed to load), so the person sees *something* went wrong
 * instead of buttons silently doing nothing.
 */
function showMozhiFatalError(message) {
  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("mozhi-fatal-banner")) return;
    const banner = document.createElement("div");
    banner.id = "mozhi-fatal-banner";
    banner.setAttribute("role", "alert");
    banner.style.cssText =
      "position:fixed;top:0;left:0;right:0;z-index:999;background:#e0393f;color:#fff;" +
      "padding:12px 16px;text-align:center;font-weight:700;font-size:0.95rem;";
    banner.textContent = message;
    document.body.appendChild(banner);
  });
}

/**
 * Look up a category's display info by id.
 */
function getCategoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || null;
}

/* =========================================================
   MOZHI — Icon library
   Professional, consistent line icons (Lucide-style) used
   everywhere in place of emoji. Every icon shares the same
   stroke width and line style so sizing/coloring stays
   uniform across the app; color comes from CSS `color`
   (currentColor) on each icon's wrapping element, and size
   is set per call so icons fit whatever circle/button they
   sit inside.
   ========================================================= */
const ICON_PATHS = {
  // Category icons
  food: '<path d="M3 2v7a2 2 0 0 0 2 2v11"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3Zm0 0v7"/>',
  water: '<path d="M12 2.7s-6 6.6-6 10.8a6 6 0 0 0 12 0c0-4.2-6-10.8-6-10.8Z"/>',
  washroom: '<circle cx="12" cy="7.5" r="3.5"/><path d="M4.5 21c0-3.6 3.4-6.5 7.5-6.5s7.5 2.9 7.5 6.5"/>',
  medicine: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/>',
  pain: '<circle cx="12" cy="12" r="9.5"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
  sleep: '<path d="M20.8 12.9A8.5 8.5 0 1 1 11.1 3.2 7 7 0 0 0 20.8 12.9Z"/>',
  emergency: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.8-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',

  // General UI icons
  "message-circle": '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/>',
  clock: '<circle cx="12" cy="12" r="9.5"/><polyline points="12 7 12 12 15.5 14"/>',
  "alert-triangle": '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.8-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  "check-circle": '<circle cx="12" cy="12" r="9.5"/><path d="m8 12.5 2.5 2.5L16 9"/>',
  "folder-open": '<path d="M4 20h15a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-7.4a2 2 0 0 1-1.7-.9L8.8 4.2A2 2 0 0 0 7.1 3.3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>',
  "chevron-right": '<polyline points="9 18 15 12 9 6"/>',
  "arrow-left": '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  pencil: '<path d="m17.5 2.5 4 4L9 19l-5 1 1-5Z"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><line x1="12" y1="2.5" x2="12" y2="4.5"/><line x1="12" y1="19.5" x2="12" y2="21.5"/><line x1="4.9" y1="4.9" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.1" y2="19.1"/><line x1="2.5" y1="12" x2="4.5" y2="12"/><line x1="19.5" y1="12" x2="21.5" y2="12"/><line x1="4.9" y1="19.1" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.1" y2="4.9"/>',
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  dumbbell: '<path d="M6.5 6.5 4 4"/><path d="M17.5 6.5 20 4"/><path d="M6.5 17.5 4 20"/><path d="M17.5 17.5 20 20"/><rect x="7" y="7" width="10" height="10" rx="2"/>',
};

/**
 * Builds an inline SVG string for the given icon name. `size`
 * controls both width/height (defaults to 22px). Every icon
 * uses stroke="currentColor" so it always matches the color
 * of whatever element it's placed inside.
 */
function getIcon(name, size) {
  const px = size || 22;
  const inner = ICON_PATHS[name];
  if (!inner) return "";
  return `<svg width="${px}" height="${px}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

/**
 * Shortcut for a category's icon by category id (falls back
 * to the "food" icon if the id isn't recognized).
 */
function getCategoryIcon(categoryId, size) {
  return getIcon(ICON_PATHS[categoryId] ? categoryId : "food", size);
}
