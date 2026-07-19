/* =========================================================
   MOZHI — Patient dashboard
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  const user = await enforceSessionOrRedirect("patient");
  if (!user) return; // already redirected to login

  renderGreeting(user);
  wireLogout();
  loadRecentSuggestions(user);
});

/**
 * "Good Morning / Afternoon / Evening" based on local time,
 * plus the patient's name if we have one on their profile.
 */
async function renderGreeting(user) {
  const hour = new Date().getHours();
  let greeting = "Good Evening ";
  if (hour < 12) greeting = "Good Morning ";
  else if (hour < 17) greeting = "Good Afternoon ";

  const greetingEl = document.getElementById("greeting-text");
  if (greetingEl) greetingEl.textContent = greeting;

  const { data: profile } = await supabaseClient
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const nameEl = document.getElementById("greeting-name");
  if (nameEl && profile && profile.full_name) {
    nameEl.textContent = profile.full_name;
  }
}

function wireLogout() {
  const btn = document.getElementById("logout-btn");
  if (btn) btn.addEventListener("click", signOutAndRedirect);
}

/* ---------------------------------------------------------
   Recent suggestions — the 3 most recently sent DISTINCT
   phrases, shown as quick-tap chips between the Communicate
   and Rehabilitation buttons. Tapping one resends it without
   navigating through the category flow.
   --------------------------------------------------------- */
async function loadRecentSuggestions(user) {
  const wrap = document.getElementById("recent-suggestions");
  const row = document.getElementById("recent-chip-row");
  if (!wrap || !row) return;

  // Pull a decent-sized recent window, then dedupe client-side —
  // simpler than a DISTINCT-with-order query, and the volume here
  // is small (one patient's own recent messages).
  const { data: recentMessages, error } = await supabaseClient
    .from("messages")
    .select("category, phrase, created_at")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !recentMessages || recentMessages.length === 0) {
    wrap.style.display = "none";
    return;
  }

  const seen = new Set();
  const uniqueRecent = [];
  for (const m of recentMessages) {
    const key = `${m.category}::${m.phrase}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueRecent.push(m);
    if (uniqueRecent.length === 3) break;
  }

  if (uniqueRecent.length === 0) {
    wrap.style.display = "none";
    return;
  }

  wrap.style.display = "block";
  row.innerHTML = uniqueRecent
    .map(
      (m) => `
      <button class="recent-chip ${m.category === "emergency" ? "emergency" : ""}" type="button"
              data-category="${m.category}" data-phrase="${escapeHtmlPatient(m.phrase)}">
        <span class="recent-chip-icon" aria-hidden="true">${getCategoryIcon(m.category, 18)}</span>
        <span>${escapeHtmlPatient(m.phrase)}</span>
      </button>
    `
    )
    .join("");

  row.querySelectorAll(".recent-chip").forEach((chip) => {
    chip.addEventListener("click", () => resendRecentPhrase(user, chip));
  });
}

async function resendRecentPhrase(user, chip) {
  if (chip.classList.contains("sending")) return;
  chip.classList.add("sending");

  const category = chip.dataset.category;
  const phrase = chip.dataset.phrase;

  // Same instant-feedback pattern as the main communicate flow:
  // speak right away, don't wait on the network.
  speakPhrasePatient(phrase);

  const { error } = await supabaseClient.from("messages").insert({
    patient_id: user.id,
    category,
    phrase,
  });

  chip.classList.remove("sending");

  if (error) {
    showToastPatient("Couldn't send. Please try again.", true);
    return;
  }

  showToastPatient(`Message Sent: "${phrase}"`);
  loadRecentSuggestions(user); // refresh so order reflects the new send
}

function speakPhrasePatient(text) {
  if (!("speechSynthesis" in window) || !text) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    // Fail silently — never let speech errors block sending.
  }
}

function showToastPatient(message, isError) {
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

function escapeHtmlPatient(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
