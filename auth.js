/* =========================================================
   MOZHI — Authentication
   Handles the login page (both tabs share one Supabase
   email/password sign-in) and the session-length rules that
   every protected page relies on.
   ========================================================= */

/**
 * Sign in with Supabase and record which role + when, so we
 * can enforce the 7-day / 24-hour session windows ourselves.
 */
async function signIn(email, password, role) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { ok: false, message: friendlyAuthError(error) };
  }

  // Confirm the account's stored role matches the tab they
  // logged in from, so a family member can't land on the
  // patient dashboard by mistake (or vice versa).
  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    await supabaseClient.auth.signOut();
    return { ok: false, message: "We couldn't find a profile for this account." };
  }

  if (profile.role !== role) {
    await supabaseClient.auth.signOut();
    const other = role === "patient" ? "Family" : "Patient";
    return {
      ok: false,
      message: `This account is registered as ${profile.role}. Please use the ${other === "Family" ? "Family" : "Patient"} tab instead.`,
    };
  }

  // Stamp the login time + role for our own session-length check.
  localStorage.setItem(STORAGE_KEYS.role, role);
  localStorage.setItem(STORAGE_KEYS.loginAt, Date.now().toString());

  return { ok: true, role };
}

/**
 * Turns raw Supabase auth errors into plain-language messages.
 */
function friendlyAuthError(error) {
  const msg = (error && error.message) || "";
  if (msg.toLowerCase().includes("invalid login credentials")) {
    return "That email or password doesn't match our records.";
  }
  if (msg.toLowerCase().includes("email not confirmed")) {
    return "Please confirm your email address before signing in.";
  }
  return "Something went wrong signing in. Please try again.";
}

/**
 * Call at the top of every protected page. Confirms there is
 * a live Supabase session AND that it hasn't exceeded this
 * role's allowed window (7 days for patients, 24 hours for
 * family). Redirects to the login page if either check fails.
 *
 * @param {"patient"|"family"} expectedRole
 * @returns {Promise<object|null>} the Supabase user, or null (already redirected)
 */
async function enforceSessionOrRedirect(expectedRole) {
  const { data } = await supabaseClient.auth.getSession();
  const session = data && data.session;

  const storedRole = localStorage.getItem(STORAGE_KEYS.role);
  const loginAt = Number(localStorage.getItem(STORAGE_KEYS.loginAt) || 0);
  const maxAge = SESSION_DURATIONS_MS[expectedRole] || SESSION_DURATIONS_MS.family;
  const isExpired = !loginAt || Date.now() - loginAt > maxAge;

  if (!session || storedRole !== expectedRole || isExpired) {
    await signOutAndRedirect();
    return null;
  }

  return session.user;
}

/**
 * Clears local session bookkeeping, signs out of Supabase,
 * and sends the person back to the login page.
 */
async function signOutAndRedirect() {
  localStorage.removeItem(STORAGE_KEYS.role);
  localStorage.removeItem(STORAGE_KEYS.loginAt);
  try {
    await supabaseClient.auth.signOut();
  } catch (e) {
    // ignore — we're leaving the page regardless
  }
  window.location.href = "index.html";
}

/* ---------------------------------------------------------
   Login page wiring (only runs if the login markup exists)
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".login-tab");
  const panels = document.querySelectorAll(".login-panel");

  if (tabButtons.length === 0) return; // not the login page

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      tabButtons.forEach((b) => b.classList.toggle("active", b === btn));
      panels.forEach((p) => p.classList.toggle("active", p.id === target));
    });
  });

  wireLoginForm("patient-form", "patient", "patient-dashboard.html");
  wireLoginForm("family-form", "family", "family-dashboard.html");
});

function wireLoginForm(formId, role, redirectTo) {
  const form = document.getElementById(formId);
  if (!form) return;

  const messageEl = form.querySelector(".form-message");
  const submitBtn = form.querySelector("button[type='submit']");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.querySelector("input[type='email']").value.trim();
    const password = form.querySelector("input[type='password']").value;

    messageEl.textContent = "";
    messageEl.classList.remove("success");
    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in...";

    const result = await signIn(email, password, role);

    if (!result.ok) {
      messageEl.textContent = result.message;
      submitBtn.disabled = false;
      submitBtn.textContent = "Log In";
      return;
    }

    messageEl.textContent = "Signed in! Taking you to your dashboard...";
    messageEl.classList.add("success");
    window.location.href = redirectTo;
  });
}
