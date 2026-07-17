/* =========================================================
   MOZHI — Family dashboard
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  const user = await enforceSessionOrRedirect("family");
  if (!user) return;

  renderGreeting();
  wireLogout();

  const patientId = await resolveLinkedPatientId(user);
  if (!patientId) {
    showNoPatientLinked();
    return;
  }

  await loadOverview(patientId);

  // Keep the overview live as new messages come in.
  supabaseClient
    .channel(`family-overview-${patientId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `patient_id=eq.${patientId}` },
      () => loadOverview(patientId)
    )
    .subscribe();

  const categoriesBtn = document.getElementById("categories-btn");
  if (categoriesBtn) {
    categoriesBtn.addEventListener("click", () => (window.location.href = "category-management.html"));
  }
});

function renderGreeting() {
  const hour = new Date().getHours();
  let greeting = "Good Evening";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 17) greeting = "Good Afternoon";
  const el = document.getElementById("greeting-text");
  if (el) el.textContent = greeting;
}

function wireLogout() {
  const btn = document.getElementById("logout-btn");
  if (btn) btn.addEventListener("click", signOutAndRedirect);
}

/**
 * Finds which patient this family member is linked to via
 * profiles.patient_id. Falls back to null if unset.
 */
async function resolveLinkedPatientId(user) {
  const { data: profile } = await supabaseClient
    .from("profiles")
    .select("patient_id")
    .eq("id", user.id)
    .single();

  return profile && profile.patient_id ? profile.patient_id : null;
}

function showNoPatientLinked() {
  const card = document.getElementById("overview-card-body");
  if (card) {
    card.innerHTML = `<p class="empty-state">No patient is linked to this family account yet. Ask your administrator to set the "patient_id" field on your profile.</p>`;
  }
}

/**
 * Populates last communication, last active, and recent
 * alerts (emergency messages in the last 24 hours).
 */
async function loadOverview(patientId) {
  const { data: recentMessages, error } = await supabaseClient
    .from("messages")
    .select("category, phrase, created_at")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    const card = document.getElementById("overview-card-body");
    if (card) card.innerHTML = `<p class="empty-state">Couldn't load the patient overview right now.</p>`;
    return;
  }

  const lastMsg = recentMessages && recentMessages[0];

  const lastCommEl = document.getElementById("last-communication");
  const lastActiveEl = document.getElementById("last-active");
  const alertsEl = document.getElementById("recent-alerts");

  if (lastCommEl) {
    lastCommEl.textContent = lastMsg ? `"${lastMsg.phrase}"` : "No messages yet";
  }
  if (lastActiveEl) {
    lastActiveEl.textContent = lastMsg ? timeAgo(lastMsg.created_at) : "—";
  }
  if (alertsEl) {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const alerts = (recentMessages || []).filter(
      (m) => m.category === "emergency" && new Date(m.created_at).getTime() > dayAgo
    );
    if (alerts.length === 0) {
      alertsEl.innerHTML = `<span class="small-note">None in the last 24 hours</span>`;
    } else {
      alertsEl.innerHTML = `<span class="alert-pill">🚨 ${alerts.length} in the last 24 hours</span>`;
    }
  }
}

function timeAgo(isoDate) {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
