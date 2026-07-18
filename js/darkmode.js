/* =========================================================
   MOZHI — Dark mode toggle
   Self-contained: this file injects its own floating button
   and its own tiny stylesheet, so no HTML markup changes are
   needed anywhere — just add <script src="js/darkmode.js">
   to a page and the toggle shows up top-right automatically.

   How it re-themes the app: it just adds/removes a
   "mozhi-dark" class on <html>. All the actual color changes
   live in css/style.css under the "DARK MODE" section, which
   overrides the shared CSS variables (var(--white), etc.)
   that the rest of the stylesheet is already built on.
   ========================================================= */

(function () {
  const STORAGE_KEY = "mozhi_theme"; // "dark" | "light"

  function getStoredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
    // No explicit choice yet — fall back to the device's
    // system preference, if the browser exposes one.
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function applyThemeClass(theme) {
    document.documentElement.classList.toggle("mozhi-dark", theme === "dark");
  }

  // Applied immediately (before DOMContentLoaded) so the page
  // never flashes the wrong theme for a frame on load.
  let currentTheme = getStoredTheme();
  applyThemeClass(currentTheme);

  const SUN_ICON =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/>' +
    '<line x1="12" y1="2.5" x2="12" y2="4.5"/><line x1="12" y1="19.5" x2="12" y2="21.5"/>' +
    '<line x1="4.9" y1="4.9" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.1" y2="19.1"/>' +
    '<line x1="2.5" y1="12" x2="4.5" y2="12"/><line x1="19.5" y1="12" x2="21.5" y2="12"/>' +
    '<line x1="4.9" y1="19.1" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.1" y2="4.9"/></svg>';

  const MOON_ICON =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M20.8 12.9A8.5 8.5 0 1 1 11.1 3.2 7 7 0 0 0 20.8 12.9Z"/></svg>';

  function injectStyles() {
    if (document.getElementById("mozhi-theme-toggle-styles")) return;
    const style = document.createElement("style");
    style.id = "mozhi-theme-toggle-styles";
    style.textContent = `
      .mozhi-theme-toggle-btn {
        position: fixed;
        top: 14px;
        right: 14px;
        z-index: 95;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 2px solid var(--blue-100, #dbeafe);
        background: var(--white, #ffffff);
        color: var(--blue-700, #1d4ed8);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: var(--shadow-card, 0 8px 24px rgba(15,23,42,0.12));
        transition: background-color 0.25s ease, border-color 0.25s ease,
                    color 0.25s ease, transform 0.15s ease;
      }
      .mozhi-theme-toggle-btn:hover { transform: translateY(-1px); }
      .mozhi-theme-toggle-btn:active { transform: scale(0.93); }
      @media (max-width: 380px) {
        .mozhi-theme-toggle-btn { width: 42px; height: 42px; top: 10px; right: 10px; }
      }
    `;
    document.head.appendChild(style);
  }

  let toggleBtn = null;

  function updateButton() {
    if (!toggleBtn) return;
    // Icon shows the mode you'll SWITCH TO, which is the usual
    // convention (sun visible in dark mode = "tap for light").
    toggleBtn.innerHTML = currentTheme === "dark" ? SUN_ICON : MOON_ICON;
    toggleBtn.setAttribute(
      "aria-label",
      currentTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
  }

  function setTheme(theme) {
    currentTheme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
    applyThemeClass(theme);
    updateButton();
  }

  function createButton() {
    if (document.getElementById("mozhi-theme-toggle")) return;
    toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.id = "mozhi-theme-toggle";
    toggleBtn.className = "mozhi-theme-toggle-btn";
    toggleBtn.addEventListener("click", () => {
      setTheme(currentTheme === "dark" ? "light" : "dark");
    });
    document.body.appendChild(toggleBtn);
    updateButton();
  }

  document.addEventListener("DOMContentLoaded", () => {
    injectStyles();
    createButton();
  });
})();
