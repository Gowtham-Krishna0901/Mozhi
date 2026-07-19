/* =========================================================
   MOZHI — Offline support
   Loaded on every page, right after supabase-client.js.

   Three jobs:
   1. Register the service worker (sw.js) so the app shell
      itself loads with no connection.
   2. Queue a patient's messages locally when offline (or when
      a send fails), and automatically retry them once the
      connection returns — nothing typed/tapped gets lost.
   3. Cache each category's phrase list locally so the phrase
      BUTTONS themselves still show up and are tappable while
      offline, not just an error message.
   ========================================================= */

const OFFLINE_QUEUE_KEY = "mozhi_offline_queue";
const PHRASE_CACHE_PREFIX = "mozhi_phrases_cache_";

/* ---------------------------------------------------------
   1. Service worker registration
   --------------------------------------------------------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((err) => {
      console.warn("Mozhi: service worker registration failed", err);
    });
  });
}

/* ---------------------------------------------------------
   Connectivity banner — small, non-alarming heads-up so
   patient/family understand why a message shows "saved"
   instead of "sent". Reuses the same amber tone as the
   "Coming Soon" badge elsewhere in the app.
   --------------------------------------------------------- */
function showOfflineBanner() {
  if (document.getElementById("mozhi-offline-banner")) return;
  const banner = document.createElement("div");
  banner.id = "mozhi-offline-banner";
  banner.setAttribute("role", "status");
  banner.textContent = "You're offline — anything you send will go through once you're back online.";
  banner.style.cssText =
    "position:fixed;top:0;left:0;right:0;z-index:998;background:#f59e0b;color:#1f2937;" +
    "padding:10px 16px;text-align:center;font-weight:700;font-size:0.9rem;";
  document.body.appendChild(banner);
}

function hideOfflineBanner() {
  const banner = document.getElementById("mozhi-offline-banner");
  if (banner) banner.remove();
}

function updateConnectivityUI() {
  if (navigator.onLine) {
    hideOfflineBanner();
  } else {
    showOfflineBanner();
  }
}

window.addEventListener("online", () => {
  updateConnectivityUI();
  flushOfflineQueue();
});
window.addEventListener("offline", updateConnectivityUI);
document.addEventListener("DOMContentLoaded", updateConnectivityUI);

/* ---------------------------------------------------------
   2. Offline message queue
   --------------------------------------------------------- */
function readQueue() {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function writeQueue(queue) {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    // Storage full/unavailable — nothing more we can do.
  }
}

function queueMessage(patientId, category, phrase) {
  const queue = readQueue();
  queue.push({
    localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    patient_id: patientId,
    category,
    phrase,
    queued_at: new Date().toISOString(),
  });
  writeQueue(queue);
}

/**
 * The single place every "send a phrase" action goes through
 * (both the main communicate flow and the recent-suggestions
 * chips). Tries a real insert first; if that's not possible —
 * offline, or the request itself fails — queues it locally
 * instead of losing it.
 *
 * @returns {Promise<{ok: boolean, queued: boolean}>}
 */
async function sendPatientMessage(patientId, category, phrase) {
  if (!navigator.onLine) {
    queueMessage(patientId, category, phrase);
    return { ok: true, queued: true };
  }

  try {
    const { error } = await supabaseClient.from("messages").insert({
      patient_id: patientId,
      category,
      phrase,
    });

    if (error) {
      // Could be a genuine validation/permission error, or a
      // network blip that surfaced as an error object instead
      // of a thrown exception. Either way, don't lose the
      // message — queue it so it's retried automatically.
      queueMessage(patientId, category, phrase);
      return { ok: true, queued: true };
    }

    return { ok: true, queued: false };
  } catch (err) {
    // The fetch itself failed outright (no connection).
    queueMessage(patientId, category, phrase);
    return { ok: true, queued: true };
  }
}

/**
 * Attempts to send every queued message. Successes are removed
 * from the queue; failures stay queued for the next attempt.
 * Safe to call repeatedly.
 */
let flushInProgress = false;
async function flushOfflineQueue() {
  if (flushInProgress) return;
  if (!navigator.onLine) return;
  const queue = readQueue();
  if (queue.length === 0) return;
  if (!supabaseClient) return;

  flushInProgress = true;
  const stillQueued = [];

  for (const item of queue) {
    try {
      const { error } = await supabaseClient.from("messages").insert({
        patient_id: item.patient_id,
        category: item.category,
        phrase: item.phrase,
      });
      if (error) stillQueued.push(item);
    } catch (err) {
      stillQueued.push(item);
    }
  }

  writeQueue(stillQueued);
  flushInProgress = false;
}

// Retry periodically too, in case the browser's 'online' event
// doesn't fire reliably (common on some mobile browsers when
// wifi flaps rather than cleanly disconnecting).
setInterval(() => {
  if (navigator.onLine) flushOfflineQueue();
}, 20000);

// Also try once on every page load, in case messages were
// queued during a previous offline session and the person has
// since reopened the app back online.
document.addEventListener("DOMContentLoaded", () => {
  if (navigator.onLine) flushOfflineQueue();
});

/* ---------------------------------------------------------
   3. Phrase list caching — lets category.html still show
   tappable buttons offline instead of an error state.
   --------------------------------------------------------- */
function cachePhrasesForCategory(categoryId, phrases) {
  try {
    localStorage.setItem(PHRASE_CACHE_PREFIX + categoryId, JSON.stringify(phrases));
  } catch (err) {
    // Ignore — worst case, offline fallback has no data yet
    // for this category (e.g. it's never been opened online).
  }
}

function getCachedPhrasesForCategory(categoryId) {
  try {
    const raw = localStorage.getItem(PHRASE_CACHE_PREFIX + categoryId);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}
