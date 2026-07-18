/* =========================================================
   MOZHI — Patient dashboard
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  const user = await enforceSessionOrRedirect("patient");
  if (!user) return; // already redirected to login

  renderGreeting(user);
  wireLogout();
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
