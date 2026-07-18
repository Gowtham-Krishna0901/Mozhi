/* =========================================================
   MOZHI — Family dashboard
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  const user = await enforceSessionOrRedirect("family");
  if (!user) return;

  renderGreeting();
  wireLogout();

  // Patient and family share one login (same email + password),
  // so "the patient this family view is about" is just this same
  // account's own id — there's no separate linked account anymore.
  const patientId = user.id;

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
  let greetingKey = "greeting_evening";
  if (hour < 12) greetingKey = "greeting_morning";
  else if (hour < 17) greetingKey = "greeting_afternoon";
  const el = document.getElementById("greeting-text");
  if (el) el.textContent = t(greetingKey);
}

function wireLogout() {
  const btn = document.getElementById("logout-btn");
  if (btn) btn.addEventListener("click", signOutAndRedirect);
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
    if (card) card.innerHTML = `<p class="empty-state">${t("overview_load_failed")}</p>`;
    return;
  }

  const lastMsg = recentMessages && recentMessages[0];

  const lastCommEl = document.getElementById("last-communication");
  const lastActiveEl = document.getElementById("last-active");
  const alertsEl = document.getElementById("recent-alerts");

  if (lastCommEl) {
    lastCommEl.textContent = lastMsg ? `"${lastMsg.phrase}"` : t("val_no_messages_yet");
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
      alertsEl.innerHTML = `<span class="small-note">${t("val_none_24h")}</span>`;
    } else {
      alertsEl.innerHTML = `<span class="alert-pill">${getIcon("alert-triangle", 15)} ${t("val_alerts_24h", { n: alerts.length })}</span>`;
    }
  }
}

function timeAgo(isoDate) {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return t("time_just_now");
  if (mins < 60) return t(mins === 1 ? "time_min_ago" : "time_mins_ago", { n: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t(hours === 1 ? "time_hour_ago" : "time_hours_ago", { n: hours });
  const days = Math.floor(hours / 24);
  return t(days === 1 ? "time_day_ago" : "time_days_ago", { n: days });
}
