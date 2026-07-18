/* =========================================================
   MOZHI — Language switching (English / Tamil)
   Loaded before every other page script so `t()` and
   `categoryLabel()` are ready when patient.js, family.js,
   communicate.js, and category-management.js run.

   Tamil strings here are written the way people actually
   speak day-to-day — closer to casual conversation / 2000s
   Tamil film dialogue than formal literary Tamil. Common
   English loanwords (மெயில், பாஸ்வர்ட், அக்கவுன்ட்,
   எமர்ஜென்சி, மெசேஜ்) are kept because that's how they're
   actually said, not translated into "pure" Tamil equivalents
   nobody uses out loud.

   Scope: this translates the app's own interface (buttons,
   headings, labels, confirmations, category names). It does
   NOT translate phrases a family member types into the
   communication board themselves — that stays whatever
   language they typed it in, since there's no way to
   auto-translate someone's own free-text content reliably.
   ========================================================= */

const MOZHI_LANG_KEY = "mozhi_lang";

const TRANSLATIONS = {
  en: {
    brand_tagline: "Sign in to start talking",
    signing_in_as: "I'm signing in as",
    role_patient_title: "Patient",
    role_patient_sub: "Stays signed in 7 days",
    role_family_title: "Family member",
    role_family_sub: "Stays signed in 24 hours",

    label_email: "Email",
    label_password: "Password",
    placeholder_password: "Enter your password",
    btn_signin: "Sign in",
    btn_signing_in: "Signing in...",
    hint_patient_session: "You'll stay signed in for 7 days.",
    hint_family_session: "Family sessions stay signed in for 24 hours.",
    btn_create_account: "Create Account",
    btn_creating_account: "Creating account...",
    label_patient_name: "Patient Name",
    label_your_name: "Your Name",
    placeholder_patient_name: "Patient's full name",
    placeholder_your_name: "Your full name",
    placeholder_choose_password: "Choose a password",
    label_confirm_password: "Confirm Password",
    placeholder_reenter_password: "Re-enter your password",
    link_already_have_account: "Already have an account? Sign in",
    footnote_same_credentials: "Use the same email and password for both logins.",
    session_note: "Your session duration depends on the role you choose.",
    msg_signed_in_redirecting: "Signed in! Taking you to your dashboard...",
    msg_account_created_redirecting: "Account created! Taking you to your dashboard...",
    msg_fill_all_fields: "Please fill in every field.",
    msg_enter_full_name: "Please enter a full name.",
    msg_enter_valid_email: "Please enter a valid email address.",
    msg_password_min_length: "Password must be at least 6 characters.",
    msg_passwords_dont_match: "Passwords don't match.",

    greeting_morning: "Good Morning",
    greeting_afternoon: "Good Afternoon",
    greeting_evening: "Good Evening",
    greeting_subtitle_patient: "Tap the big button below whenever you need something.",
    btn_communicate: "Communicate",
    btn_rehabilitation: "Rehabilitation",
    badge_coming_soon: "Coming Soon",
    alert_rehab_coming_soon: "Rehabilitation is coming soon!",
    logout: "Log Out",

    title_what_need: "What do you need?",
    hint_tap_phrase: "Tap a phrase to send it.",
    toast_message_sent_prefix: "Message Sent: ",
    toast_send_failed: "Couldn't send. Please try again.",
    empty_no_phrases: "No phrases here yet. Ask a family member to add some.",
    empty_load_failed: "Couldn't load phrases. Please try again.",

    cat_food: "Food",
    cat_water: "Water",
    cat_washroom: "Washroom",
    cat_medicine: "Medicine",
    cat_pain: "Pain",
    cat_sleep: "Sleep",
    cat_emergency: "Emergency",

    greeting_subtitle_family: "Here's how your patient is doing.",
    card_title_overview: "Patient Overview",
    label_last_communication: "Last communication",
    label_last_active: "Last active",
    label_recent_alerts: "Recent alerts",
    val_no_messages_yet: "No messages yet",
    val_none_24h: "None in the last 24 hours",
    val_alerts_24h: "{n} in the last 24 hours",
    categories_hero_title: "Communication Categories",
    categories_hero_subtitle: "Manage phrases and categories",
    overview_load_failed: "Couldn't load the patient overview right now.",

    time_just_now: "Just now",
    time_min_ago: "{n} min ago",
    time_mins_ago: "{n} mins ago",
    time_hour_ago: "{n} hour ago",
    time_hours_ago: "{n} hours ago",
    time_day_ago: "{n} day ago",
    time_days_ago: "{n} days ago",

    hint_select_category: "Select a category to manage its phrases.",
    placeholder_add_phrase: "Add a new phrase…",
    empty_no_phrases_category: "No phrases in this category yet. Add one below.",
    empty_load_failed_manage: "Couldn't load phrases.",
    msg_phrase_added: "Phrase added.",
    msg_phrase_updated: "Phrase updated.",
    msg_phrase_deleted: "Phrase deleted.",
    msg_add_failed: "Couldn't add that phrase. Please try again.",
    msg_save_failed: "Couldn't save changes. Please try again.",
    msg_delete_failed: "Couldn't delete that phrase. Please try again.",
    confirm_delete_phrase: "Delete this phrase? Patients will no longer see it.",

    lang_toggle_label: "Language",
    lang_name_en: "English",
    lang_name_ta: "தமிழ்",
  },

  ta: {
    brand_tagline: "பேசறதுக்கு சைன் இன் பண்ணுங்க",
    signing_in_as: "நீங்க யாரா லாகின் ஆகுறீங்க?",
    role_patient_title: "பேஷன்ட்",
    role_patient_sub: "7 நாட்களுக்கு லாகின் இருக்கும்",
    role_family_title: "குடும்பத்தினர்",
    role_family_sub: "24 மணி நேரத்திற்கு லாகின் இருக்கும்",

    label_email: "மெயில்",
    label_password: "பாஸ்வர்ட்",
    placeholder_password: "பாஸ்வர்ட் போடுங்க",
    btn_signin: "சைன் இன் பண்ணுங்க",
    btn_signing_in: "சைன் இன் ஆகுது...",
    hint_patient_session: "7 நாட்களுக்கு லாகின் ஆகி இருப்பீங்க.",
    hint_family_session: "24 மணி நேரத்திற்கு லாகின் ஆகி இருப்பீங்க.",
    btn_create_account: "அக்கவுன்ட் பண்ணுங்க",
    btn_creating_account: "அக்கவுன்ட் பண்றோம்...",
    label_patient_name: "பேஷன்ட் பேரு",
    label_your_name: "உங்க பேரு",
    placeholder_patient_name: "பேஷன்ட்டோட முழு பேரு",
    placeholder_your_name: "உங்க முழு பேரு",
    placeholder_choose_password: "ஒரு பாஸ்வர்ட் வையுங்க",
    label_confirm_password: "பாஸ்வர்ட் மறுபடி போடுங்க",
    placeholder_reenter_password: "பாஸ்வர்டை மறுபடி டைப் பண்ணுங்க",
    link_already_have_account: "ஏற்கனவே அக்கவுன்ட் இருக்கா? சைன் இன் பண்ணுங்க",
    footnote_same_credentials: "ரெண்டு லாகினுக்கும் ஒரே மெயில், பாஸ்வர்டை யூஸ் பண்ணுங்க.",
    session_note: "நீங்க செலக்ட் பண்ற டேபுக்கு ஏத்தாற்போல உங்க செஷன் நேரம் மாறும்.",
    msg_signed_in_redirecting: "சைன் இன் ஆகிட்டீங்க! உங்க டாஷ்போர்டுக்கு கூட்டிட்டு போறோம்...",
    msg_account_created_redirecting: "அக்கவுன்ட் பண்ணாச்சு! உங்க டாஷ்போர்டுக்கு கூட்டிட்டு போறோம்...",
    msg_fill_all_fields: "எல்லா ஃபீல்டையும் நிரப்புங்க.",
    msg_enter_full_name: "முழு பேரையும் போடுங்க.",
    msg_enter_valid_email: "சரியான மெயில் அட்ரஸை போடுங்க.",
    msg_password_min_length: "பாஸ்வர்ட் குறைந்தது 6 எழுத்துகள் இருக்கணும்.",
    msg_passwords_dont_match: "பாஸ்வர்ட் ரெண்டும் மேட்ச் ஆகல.",

    greeting_morning: "காலை வணக்கம்",
    greeting_afternoon: "மதிய வணக்கம்",
    greeting_evening: "மாலை வணக்கம்",
    greeting_subtitle_patient: "எதுக்கு வேணும்னாலும் கீழே இருக்குற பெரிய பட்டனை தட்டுங்க.",
    btn_communicate: "பேசு",
    btn_rehabilitation: "மறுவாழ்வு",
    badge_coming_soon: "வர போகுது",
    alert_rehab_coming_soon: "மறுவாழ்வு பீச்சர் வர போகுது!",
    logout: "லாக் அவுட்",

    title_what_need: "உங்களுக்கு என்ன வேணும்?",
    hint_tap_phrase: "அனுப்ப வேண்டிய வாக்கியத்தை தட்டுங்க.",
    toast_message_sent_prefix: "மெசேஜ் அனுப்பிட்டாச்சு: ",
    toast_send_failed: "அனுப்ப முடியல, மறுபடி முயற்சி பண்ணுங்க.",
    empty_no_phrases: "இன்னும் வாக்கியம் ஒண்ணும் இல்ல. குடும்பத்தினரிடம் சேர்க்கச் சொல்லுங்க.",
    empty_load_failed: "வாக்கியங்களை லோட் பண்ண முடியல. மறுபடி முயற்சி பண்ணுங்க.",

    cat_food: "சாப்பாடு",
    cat_water: "தண்ணி",
    cat_washroom: "டாய்லெட்",
    cat_medicine: "மருந்து",
    cat_pain: "வலி",
    cat_sleep: "தூக்கம்",
    cat_emergency: "எமர்ஜென்சி",

    greeting_subtitle_family: "உங்க பேஷன்ட் எப்படி இருக்காங்கனு இங்க பாருங்க.",
    card_title_overview: "பேஷன்ட் விவரங்கள்",
    label_last_communication: "கடைசியா பேசினது",
    label_last_active: "கடைசியா ஆக்டிவா இருந்தது",
    label_recent_alerts: "சமீபத்திய அலர்ட்ஸ்",
    val_no_messages_yet: "இன்னும் மெசேஜ் எதுவும் இல்ல",
    val_none_24h: "கடந்த 24 மணி நேரத்துல ஒண்ணும் இல்ல",
    val_alerts_24h: "கடந்த 24 மணி நேரத்துல {n} அலர்ட்ஸ்",
    categories_hero_title: "பேச்சு கேட்டகிரீஸ்",
    categories_hero_subtitle: "வாக்கியங்களையும் கேட்டகிரீஸையும் மேனேஜ் பண்ணுங்க",
    overview_load_failed: "பேஷன்ட் விவரங்களை இப்போ லோட் பண்ண முடியல.",

    time_just_now: "இப்போதான்",
    time_min_ago: "{n} நிமிடம் முன்",
    time_mins_ago: "{n} நிமிடங்கள் முன்",
    time_hour_ago: "{n} மணி நேரம் முன்",
    time_hours_ago: "{n} மணி நேரங்களுக்கு முன்",
    time_day_ago: "{n} நாள் முன்",
    time_days_ago: "{n} நாட்களுக்கு முன்",

    hint_select_category: "எந்த கேட்டகிரிக்கு வாக்கியம் மேனேஜ் பண்ணனும்னு செலக்ட் பண்ணுங்க.",
    placeholder_add_phrase: "புது வாக்கியம் சேருங்க…",
    empty_no_phrases_category: "இந்த கேட்டகிரியில இன்னும் வாக்கியம் இல்ல. கீழே ஒண்ணு சேருங்க.",
    empty_load_failed_manage: "வாக்கியங்களை லோட் பண்ண முடியல.",
    msg_phrase_added: "வாக்கியம் சேர்க்கப்பட்டுச்சு.",
    msg_phrase_updated: "வாக்கியம் அப்டேட் ஆச்சு.",
    msg_phrase_deleted: "வாக்கியம் டெலீட் ஆச்சு.",
    msg_add_failed: "வாக்கியத்தை சேர்க்க முடியல. மறுபடி முயற்சி பண்ணுங்க.",
    msg_save_failed: "மாற்றங்களை சேவ் பண்ண முடியல. மறுபடி முயற்சி பண்ணுங்க.",
    msg_delete_failed: "வாக்கியத்தை டெலீட் பண்ண முடியல. மறுபடி முயற்சி பண்ணுங்க.",
    confirm_delete_phrase: "இந்த வாக்கியத்தை டெலீட் பண்ணணுமா? பேஷன்ட்டுக்கு இது இனிமே தெரியாது.",

    lang_toggle_label: "மொழி",
    lang_name_en: "English",
    lang_name_ta: "தமிழ்",
  },
};

let currentLang = localStorage.getItem(MOZHI_LANG_KEY) || "en";

/**
 * Translate a key for the current language, falling back to
 * English and then to the raw key if nothing matches. Supports
 * a single {n} placeholder for simple count interpolation.
 */
function t(key, vars) {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  let str = dict[key] || TRANSLATIONS.en[key] || key;
  if (vars && typeof vars.n !== "undefined") {
    str = str.replace("{n}", vars.n);
  }
  return str;
}

/**
 * Translated label for a category id (e.g. "food" -> "சாப்பாடு"
 * when Tamil is selected). Falls back to the category's English
 * label if no translation key exists.
 */
function categoryLabel(categoryId) {
  const key = "cat_" + categoryId;
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  if (dict[key]) return dict[key];
  const cat = typeof getCategoryById === "function" ? getCategoryById(categoryId) : null;
  return (cat && cat.label) || categoryId;
}

/**
 * Applies translations to every element on the page tagged
 * with data-i18n (textContent) or data-i18n-placeholder
 * (input placeholder).
 */
function applyTranslations() {
  document.documentElement.lang = currentLang === "ta" ? "ta" : "en";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.placeholder = t(key);
  });
}

/**
 * Switches the language, persists the choice, and reloads the
 * page. A full reload is deliberate here — several pages build
 * dynamic content (category grids, greetings, phrase lists) in
 * JS, and re-running each page's normal load sequence with the
 * new language already in localStorage is simpler and more
 * reliable than trying to re-render every dynamic piece in place.
 */
function setLang(lang) {
  if (lang !== "en" && lang !== "ta") return;
  localStorage.setItem(MOZHI_LANG_KEY, lang);
  window.location.reload();
}

/* ---------------------------------------------------------
   Floating language toggle widget
   Self-contained (styles injected here) so it works on every
   page just by including this script — no markup changes
   needed anywhere else.
   --------------------------------------------------------- */
function renderLangToggle() {
  if (document.getElementById("mozhi-lang-toggle")) return;

  const style = document.createElement("style");
  style.textContent = `
    .mozhi-lang-toggle {
      position: fixed;
      top: 14px;
      right: 14px;
      z-index: 80;
      font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    .mozhi-lang-btn {
      min-height: 44px;
      padding: 8px 14px;
      border-radius: 999px;
      border: 2px solid rgba(37,99,235,0.15);
      background: #ffffff;
      color: #1d4ed8;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(15,23,42,0.1);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .mozhi-lang-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: #ffffff;
      border-radius: 14px;
      box-shadow: 0 10px 28px rgba(15,23,42,0.16);
      padding: 6px;
      min-width: 140px;
      display: none;
    }
    .mozhi-lang-menu.open { display: block; }
    .mozhi-lang-option {
      width: 100%;
      text-align: left;
      padding: 10px 12px;
      border-radius: 10px;
      border: none;
      background: none;
      font-size: 0.95rem;
      font-weight: 600;
      color: #0f172a;
      cursor: pointer;
      min-height: 40px;
    }
    .mozhi-lang-option:hover { background: #eff6ff; }
    .mozhi-lang-option.active { color: #1d4ed8; background: #eff6ff; }
    @media (max-width: 380px) {
      .mozhi-lang-toggle { top: 10px; right: 10px; }
      .mozhi-lang-btn { padding: 7px 11px; font-size: 0.82rem; }
    }
  `;
  document.head.appendChild(style);

  const wrap = document.createElement("div");
  wrap.className = "mozhi-lang-toggle";
  wrap.id = "mozhi-lang-toggle";
  wrap.innerHTML = `
    <button type="button" class="mozhi-lang-btn" id="mozhi-lang-btn" aria-haspopup="true" aria-expanded="false">
      <span aria-hidden="true">🌐</span><span>${currentLang === "ta" ? "த" : "EN"}</span>
    </button>
    <div class="mozhi-lang-menu" id="mozhi-lang-menu" role="menu">
      <button type="button" class="mozhi-lang-option ${currentLang === "en" ? "active" : ""}" data-lang="en" role="menuitem">English</button>
      <button type="button" class="mozhi-lang-option ${currentLang === "ta" ? "active" : ""}" data-lang="ta" role="menuitem">தமிழ்</button>
    </div>
  `;
  document.body.appendChild(wrap);

  const btn = document.getElementById("mozhi-lang-btn");
  const menu = document.getElementById("mozhi-lang-menu");

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.toggle("open");
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  document.addEventListener("click", () => {
    menu.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  });

  menu.querySelectorAll(".mozhi-lang-option").forEach((opt) => {
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      setLang(opt.dataset.lang);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyTranslations();
  renderLangToggle();
});
