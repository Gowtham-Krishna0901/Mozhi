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
// ---------------------------------------------------------
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Look up a category's display info by id.
 */
function getCategoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || null;
}
