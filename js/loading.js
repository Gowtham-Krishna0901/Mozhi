/* =========================================================
   MOZHI — Loading / splash screen
   Self-contained, same pattern as js/darkmode.js: this file
   injects its own overlay markup and its own tiny stylesheet,
   so the only change needed on a page is adding
   <script src="js/loading.js"></script> as the very first
   thing inside <body> (before any other content), so it
   covers the page before anything else has a chance to paint.

   It shows the Mozhi "M" mark centered, with a few soft
   shapes (speech bubble, heart, sparkle, chat dots) floating
   upward around it for a bit of life, then fades itself out
   once the page has actually finished loading (and at least
   a short minimum time has passed, so it never feels like a
   flash even on a fast connection).
   ========================================================= */

(function () {
  const MIN_VISIBLE_MS = 1000; // never disappear faster than this
  const FADE_MS = 450;

  function injectStyles() {
    if (document.getElementById("mozhi-splash-styles")) return;
    const style = document.createElement("style");
    style.id = "mozhi-splash-styles";
    style.textContent = `
      #mozhi-splash {
        position: fixed;
        inset: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background: linear-gradient(160deg, #dbeafe 0%, #e0f2fe 35%, #d1fae5 75%, #bbf7d0 100%);
        transition: opacity ${FADE_MS}ms ease, visibility ${FADE_MS}ms ease;
      }
      #mozhi-splash.mozhi-splash-hide {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
      }

      #mozhi-splash .mozhi-splash-float {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.8);
        box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
        color: var(--blue-600, #2563eb);
        animation: mozhi-splash-float 5.5s ease-in-out infinite;
        will-change: transform, opacity;
      }
      #mozhi-splash .mozhi-splash-float svg { display: block; }
      #mozhi-splash .mozhi-splash-float.f-green { color: var(--green-600, #10b981); }
      #mozhi-splash .mozhi-splash-float.f-red { color: var(--red-600, #ef4444); }

      @keyframes mozhi-splash-float {
        0%   { transform: translateY(18px) scale(0.85) rotate(-6deg); opacity: 0; }
        15%  { opacity: 1; }
        50%  { transform: translateY(-26px) scale(1) rotate(4deg); opacity: 1; }
        85%  { opacity: 0.15; }
        100% { transform: translateY(-58px) scale(0.9) rotate(-4deg); opacity: 0; }
      }

      #mozhi-splash .mozhi-splash-core {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
      }

      #mozhi-splash .mozhi-splash-mark {
        width: 88px;
        height: 88px;
        border-radius: 26px;
        background: linear-gradient(145deg, var(--blue-600, #2563eb), var(--green-600, #10b981));
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.6rem;
        font-weight: 700;
        font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        box-shadow: 0 16px 34px rgba(37, 99, 235, 0.3);
        animation: mozhi-splash-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both,
                   mozhi-splash-breathe 2.4s ease-in-out 0.6s infinite;
      }

      @keyframes mozhi-splash-in {
        from { transform: scale(0.4) rotate(-12deg); opacity: 0; }
        to   { transform: scale(1) rotate(0deg); opacity: 1; }
      }
      @keyframes mozhi-splash-breathe {
        0%, 100% { transform: scale(1); }
        50%      { transform: scale(1.06); }
      }

      #mozhi-splash .mozhi-splash-name {
        font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 1.9rem;
        font-weight: 700;
        color: var(--blue-700, #1d4ed8);
        letter-spacing: -0.02em;
        opacity: 0;
        animation: mozhi-splash-fade-up 0.5s ease 0.35s both;
      }

      #mozhi-splash .mozhi-splash-tagline {
        font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 0.95rem;
        color: #475569;
        opacity: 0;
        animation: mozhi-splash-fade-up 0.5s ease 0.55s both;
      }

      @keyframes mozhi-splash-fade-up {
        from { transform: translateY(8px); opacity: 0; }
        to   { transform: translateY(0); opacity: 1; }
      }

      #mozhi-splash .mozhi-splash-dots {
        display: flex;
        gap: 7px;
        margin-top: 4px;
        opacity: 0;
        animation: mozhi-splash-fade-up 0.5s ease 0.7s both;
      }
      #mozhi-splash .mozhi-splash-dots span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--blue-600, #2563eb);
        animation: mozhi-splash-bounce 1.1s ease-in-out infinite;
      }
      #mozhi-splash .mozhi-splash-dots span:nth-child(2) {
        background: var(--green-600, #10b981);
        animation-delay: 0.15s;
      }
      #mozhi-splash .mozhi-splash-dots span:nth-child(3) {
        background: var(--blue-600, #2563eb);
        animation-delay: 0.3s;
      }
      @keyframes mozhi-splash-bounce {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
        40%           { transform: translateY(-7px); opacity: 1; }
      }

      @media (prefers-reduced-motion: reduce) {
        #mozhi-splash .mozhi-splash-float,
        #mozhi-splash .mozhi-splash-mark,
        #mozhi-splash .mozhi-splash-name,
        #mozhi-splash .mozhi-splash-tagline,
        #mozhi-splash .mozhi-splash-dots,
        #mozhi-splash .mozhi-splash-dots span {
          animation: none !important;
          opacity: 1 !important;
        }
      }

      @media (max-width: 380px) {
        #mozhi-splash .mozhi-splash-mark { width: 74px; height: 74px; font-size: 2.2rem; border-radius: 22px; }
        #mozhi-splash .mozhi-splash-name { font-size: 1.6rem; }
      }
    `;
    document.head.appendChild(style);
  }

  // A handful of small round icon chips that drift upward
  // around the logo — purely decorative, aria-hidden.
  const FLOATERS = [
    { icon: "chat", top: "18%", left: "16%", size: 46, delay: "0s", cls: "" },
    { icon: "heart", top: "24%", left: "78%", size: 38, delay: "0.9s", cls: "f-red" },
    { icon: "spark", top: "68%", left: "20%", size: 40, delay: "1.6s", cls: "f-green" },
    { icon: "drop", top: "72%", left: "76%", size: 36, delay: "0.5s", cls: "" },
    { icon: "spark", top: "12%", left: "50%", size: 30, delay: "2.2s", cls: "f-green" },
  ];

  const ICONS = {
    chat: '<path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    heart: '<path d="M12 20.5s-7.5-4.6-10-9.3C.4 7.9 2 4.5 5.3 4A5 5 0 0 1 12 6.5 5 5 0 0 1 18.7 4c3.3.5 4.9 3.9 3.3 7.2C19.5 15.9 12 20.5 12 20.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    spark: '<path d="M12 2.5 14 9l6.5 2-6.5 2-2 6.5-2-6.5L3.5 11 10 9l2-6.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    drop: '<path d="M12 2.7s-6 6.6-6 10.8a6 6 0 0 0 12 0c0-4.2-6-10.8-6-10.8Z" fill="none" stroke="currentColor" stroke-width="2"/>',
  };

  function svgFor(name, size) {
    return `<svg width="${size * 0.46}" height="${size * 0.46}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;
  }

  function buildSplash() {
    const overlay = document.createElement("div");
    overlay.id = "mozhi-splash";
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-label", "Loading Mozhi");

    const floatersHtml = FLOATERS.map(
      (f) => `
      <span class="mozhi-splash-float ${f.cls}" aria-hidden="true"
            style="top:${f.top}; left:${f.left}; width:${f.size}px; height:${f.size}px; animation-delay:${f.delay};">
        ${svgFor(f.icon, f.size)}
      </span>`
    ).join("");

    overlay.innerHTML = `
      ${floatersHtml}
      <div class="mozhi-splash-core">
        <div class="mozhi-splash-mark" aria-hidden="true">M</div>
        <div class="mozhi-splash-name">Mozhi</div>
        <div class="mozhi-splash-tagline">A simple way to be heard.</div>
        <div class="mozhi-splash-dots" aria-hidden="true"><span></span><span></span><span></span></div>
      </div>
    `;

    return overlay;
  }

  function lockScroll(lock) {
    document.documentElement.style.overflow = lock ? "hidden" : "";
  }

  injectStyles();
  const splash = buildSplash();
  // Insert as early in <body> as possible so it covers
  // everything else that's about to be parsed/painted.
  (document.body || document.documentElement).appendChild(splash);
  lockScroll(true);

  const shownAt = Date.now();

  function dismiss() {
    const elapsed = Date.now() - shownAt;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    setTimeout(() => {
      splash.classList.add("mozhi-splash-hide");
      lockScroll(false);
      setTimeout(() => splash.remove(), FADE_MS + 50);
    }, wait);
  }

  if (document.readyState === "complete") {
    dismiss();
  } else {
    window.addEventListener("load", dismiss, { once: true });
    // Safety net: never let a slow subresource keep the splash
    // up indefinitely.
    setTimeout(dismiss, 4000);
  }
})();
