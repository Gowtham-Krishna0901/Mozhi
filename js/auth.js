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
  if (!supabaseClient) {
    return { ok: false, message: "Couldn't connect. Please check your internet connection and reload the page." };
  }

  let data, error;
  try {
    ({ data, error } = await supabaseClient.auth.signInWithPassword({ email, password }));
  } catch (err) {
    return { ok: false, message: "Network error. Please check your connection and try again." };
  }

  if (error) {
    return { ok: false, message: friendlyAuthError(error) };
  }

  // Confirm the account's stored role matches the tab they
  // logged in from, so a family member can't land on the
  // patient dashboard by mistake (or vice versa).
  let profile, profileError;
  try {
    ({ data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single());
  } catch (err) {
    return { ok: false, message: "Network error. Please check your connection and try again." };
  }

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
  if (!supabaseClient) {
    showMozhiFatalError("Couldn't connect. Please check your internet connection and reload the page.");
    return null;
  }

  let data;
  try {
    ({ data } = await supabaseClient.auth.getSession());
  } catch (err) {
    showMozhiFatalError("Couldn't connect. Please check your internet connection and reload the page.");
    return null;
  }
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

/* =========================================================
   MOZHI — Create Account (Sign Up)
   Adds registration via Supabase Auth alongside the existing
   sign-in flow above. Nothing above this point is modified —
   sign-in, session enforcement, and logout behave exactly as
   before for both patient and family roles.
   ========================================================= */

/**
 * Registers a new user with Supabase Auth, creates their
 * profile row with the chosen role, and — if the Supabase
 * project allows sessions without email confirmation — signs
 * them straight in using the same session bookkeeping as
 * signIn() above.
 */
async function signUp(email, password, role) {
  if (!supabaseClient) {
    return { ok: false, message: "Couldn't connect. Please check your internet connection and reload the page." };
  }

  let data, error;
  try {
    ({ data, error } = await supabaseClient.auth.signUp({ email, password }));
  } catch (err) {
    return { ok: false, message: "Network error. Please check your connection and try again." };
  }

  if (error) {
    return { ok: false, message: friendlySignUpError(error) };
  }

  const newUser = data.user;
  if (!newUser) {
    return { ok: false, message: "Something went wrong creating your account. Please try again." };
  }

  // Give the new account a profile row right away so it has
  // a role the moment it can sign in.
  const { error: profileError } = await supabaseClient
    .from("profiles")
    .upsert({ id: newUser.id, role });

  if (profileError) {
    return {
      ok: false,
      message: "Your account was created, but we couldn't finish setting it up. Please contact support.",
    };
  }

  if (data.session) {
    // Email confirmation isn't required on this project, so
    // Supabase already returned a live session — log them in
    // immediately, the same way signIn() does.
    localStorage.setItem(STORAGE_KEYS.role, role);
    localStorage.setItem(STORAGE_KEYS.loginAt, Date.now().toString());
    return { ok: true, immediate: true };
  }

  // Email confirmation is required — they'll need to confirm
  // before their first sign-in.
  return { ok: true, immediate: false };
}

/**
 * Turns raw Supabase sign-up errors into plain-language messages.
 */
function friendlySignUpError(error) {
  const msg = (error && error.message) || "";
  const lower = msg.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already exists") || lower.includes("already in use") || lower.includes("user already")) {
    return "An account with this email already exists. Please sign in instead.";
  }
  if (lower.includes("password") && (lower.includes("short") || lower.includes("least") || lower.includes("weak") || lower.includes("character"))) {
    return "Please choose a password with at least 6 characters.";
  }
  if (lower.includes("valid email") || lower.includes("invalid email") || lower.includes("unable to validate email")) {
    return "Please enter a valid email address.";
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (lower.includes("signups not allowed") || lower.includes("signup is disabled")) {
    return "New account creation is currently turned off. Please contact your administrator.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "Network error. Please check your connection and try again.";
  }
  return "Something went wrong creating your account. Please try again.";
}

/**
 * A simple, permissive email-format check — just enough to
 * catch obvious typos before spending a network round trip.
 * Supabase still does its own authoritative validation.
 */
function isValidEmailFormat(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ---------------------------------------------------------
   Sign-up UI wiring (login page only)
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  wireSignUpToggle("patient");
  wireSignUpToggle("family");

  wireSignUpForm("patient-signup-form", "patient", "patient-dashboard.html");
  wireSignUpForm("family-signup-form", "family", "family-dashboard.html");
});

/**
 * Wires the "Create Account" / "Already have an account?"
 * links that swap between the sign-in form and the sign-up
 * form within a role's panel.
 */
function wireSignUpToggle(role) {
  const loginForm = document.getElementById(`${role}-form`);
  const signupForm = document.getElementById(`${role}-signup-form`);
  const openBtn = document.getElementById(`${role}-signup-toggle`);
  const closeBtn = document.getElementById(`${role}-signin-toggle`);
  if (!loginForm || !signupForm || !openBtn || !closeBtn) return;

  const openBtnWrap = openBtn.closest("p");

  openBtn.addEventListener("click", () => {
    loginForm.hidden = true;
    if (openBtnWrap) openBtnWrap.hidden = true;
    signupForm.hidden = false;
  });

  closeBtn.addEventListener("click", () => {
    signupForm.hidden = true;
    loginForm.hidden = false;
    if (openBtnWrap) openBtnWrap.hidden = false;
  });
}

function wireSignUpForm(formId, role, redirectTo) {
  const form = document.getElementById(formId);
  if (!form) return;

  const messageEl = form.querySelector(".form-message");
  const submitBtn = form.querySelector("button[type='submit']");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.querySelector("input[type='email']").value.trim();
    const password = form.querySelector("input[data-role='signup-password']").value;
    const confirm = form.querySelector("input[data-role='signup-confirm']").value;

    messageEl.textContent = "";
    messageEl.classList.remove("success");

    if (!email || !password || !confirm) {
      messageEl.textContent = "Please fill in every field.";
      return;
    }

    if (!isValidEmailFormat(email)) {
      messageEl.textContent = "Please enter a valid email address.";
      return;
    }

    if (password.length < 6) {
      messageEl.textContent = "Password must be at least 6 characters.";
      return;
    }

    if (password !== confirm) {
      messageEl.textContent = "Passwords don't match.";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    const result = await signUp(email, password, role);

    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";

    if (!result.ok) {
      messageEl.textContent = result.message;
      return;
    }

    if (result.immediate) {
      messageEl.textContent = "Account created! Taking you to your dashboard...";
      messageEl.classList.add("success");
      window.location.href = redirectTo;
      return;
    }

    messageEl.textContent = "Account created! Please check your email to confirm, then sign in above.";
    messageEl.classList.add("success");
    form.reset();
  });
}
