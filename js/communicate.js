/* =========================================================
   MOZHI — Communicate flow (patient side)
   Powers two pages:
     • communicate.html  -> category grid
     • category.html     -> phrase list for one category
   ========================================================= */

let currentPatientUser = null;

document.addEventListener("DOMContentLoaded", async () => {
  currentPatientUser = await enforceSessionOrRedirect("patient");
  if (!currentPatientUser) return;

  const grid = document.getElementById("category-grid");
  const phraseList = document.getElementById("phrase-list");

  if (grid) renderCategoryGrid(grid);
  if (phraseList) initCategoryPage(phraseList);
});

/* ---------------------------------------------------------
   Category grid (communicate.html)
   --------------------------------------------------------- */
function renderCategoryGrid(grid) {
  grid.innerHTML = CATEGORIES.map((cat) => `
    <button class="category-tile ${cat.id === "emergency" ? "emergency" : ""}" type="button"
            onclick="window.location.href='category.html?cat=${cat.id}'">
      <span class="tile-icon" aria-hidden="true">${getCategoryIcon(cat.id, 26)}</span>
      <span class="tile-label">${categoryLabel(cat.id)}</span>
    </button>
  `).join("");
}

/* ---------------------------------------------------------
   Phrase list (category.html)
   --------------------------------------------------------- */
async function initCategoryPage(listEl) {
  const params = new URLSearchParams(window.location.search);
  const categoryId = params.get("cat");
  const category = getCategoryById(categoryId);

  if (!category) {
    window.location.href = "communicate.html";
    return;
  }

  // Header
  const titleEl = document.getElementById("category-title");
  if (titleEl) {
    titleEl.innerHTML = `<span class="page-title-icon" aria-hidden="true">${getCategoryIcon(category.id, 22)}</span>${categoryLabel(category.id)}`;
  }
  const backBtn = document.getElementById("back-btn");
  if (backBtn) backBtn.onclick = () => (window.location.href = "communicate.html");

  await loadPhrases(category, listEl);

  // Live updates: if a family member edits the board while the
  // patient is looking at it, refresh instantly.
  supabaseClient
    .channel(`phrases-${category.id}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "phrases", filter: `category=eq.${category.id}` },
      () => loadPhrases(category, listEl)
    )
    .subscribe();
}

async function loadPhrases(category, listEl) {
  listEl.innerHTML = `<div class="loading-wrap"><div class="spinner" role="status" aria-label="Loading"></div></div>`;

  const { data: phrases, error } = await supabaseClient
    .from("phrases")
    .select("id, text, emoji")
    .eq("category", category.id)
    .order("created_at", { ascending: true });

  if (error) {
    listEl.innerHTML = `<p class="empty-state">${t("empty_load_failed")}</p>`;
    return;
  }

  if (!phrases || phrases.length === 0) {
    listEl.innerHTML = `<p class="empty-state">${t("empty_no_phrases")}</p>`;
    return;
  }

  listEl.innerHTML = phrases
    .map(
      (p) => `
      <button class="phrase-btn" type="button" data-phrase-id="${p.id}" data-phrase-text="${escapeHtml(p.text)}">
        <span class="phrase-emoji" aria-hidden="true">${getCategoryIcon(category.id, 20)}</span>
        <span>${escapeHtml(p.text)}</span>
      </button>
    `
    )
    .join("");

  listEl.querySelectorAll(".phrase-btn").forEach((btn) => {
    btn.addEventListener("click", () => sendPhrase(category, btn));
  });
}

/* ---------------------------------------------------------
   Sending a phrase -> messages table + confirmation toast
   --------------------------------------------------------- */
async function sendPhrase(category, btn) {
  if (btn.classList.contains("sending")) return;
  btn.classList.add("sending");

  const phraseText = btn.dataset.phraseText;

  // Speak right away — this shouldn't wait on the network, so
  // the patient gets instant audio feedback even on a slow
  // connection, and it still happens even if the send fails.
  speakPhrase(phraseText);

  const { error } = await supabaseClient.from("messages").insert({
    patient_id: currentPatientUser.id,
    category: category.id,
    phrase: phraseText,
  });

  btn.classList.remove("sending");

  if (error) {
    showToast(t("toast_send_failed"), true);
    return;
  }

  showToast(`${t("toast_message_sent_prefix")}"${phraseText}"`);

  // Emergency phrases get an extra visual pulse for urgency.
  if (category.id === "emergency") {
    btn.animate(
      [{ boxShadow: "0 0 0 0 rgba(220,38,38,0.5)" }, { boxShadow: "0 0 0 18px rgba(220,38,38,0)" }],
      { duration: 600 }
    );
  }
}

/* ---------------------------------------------------------
   Text-to-speech (Web Speech API) — reads a phrase aloud.
   Built-in to the browser, no API key or network call needed.
   Fails silently on browsers/embedded webviews that don't
   support it, so it never blocks sending a message.
   --------------------------------------------------------- */
function speakPhrase(text) {
  if (!("speechSynthesis" in window) || !text) return;

  try {
    // Stop anything already playing so taps don't queue up and
    // talk over each other if someone taps a few phrases fast.
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Match the device's Tamil voice when the app is in Tamil
    // mode (if one is installed) — falls back to whatever the
    // browser does with the tag if not.
    utterance.lang = typeof currentLang !== "undefined" && currentLang === "ta" ? "ta-IN" : "en-US";
    utterance.rate = 0.9; // slightly slower — clearer for elderly listeners
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    // Some embedded webviews throw instead of just not supporting
    // the API — never let that break the send flow.
  }
}

function showToast(message, isError) {
  let toast = document.getElementById("mozhi-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "mozhi-toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span aria-hidden="true">${isError ? getIcon("alert-triangle", 18) : getIcon("check-circle", 18)}</span><span>${message}</span>`;
  toast.classList.toggle("error", !!isError);
  toast.classList.add("show");

  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
