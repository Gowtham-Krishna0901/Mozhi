/* =========================================================
   MOZHI — Category management (family side)
   Add / edit / delete phrases. Changes write straight to
   Supabase and appear for the patient instantly via the
   realtime subscription set up in js/communicate.js.
   ========================================================= */

let activeCategoryId = CATEGORIES[0].id;

document.addEventListener("DOMContentLoaded", async () => {
  const user = await enforceSessionOrRedirect("family");
  if (!user) return;

  renderCategoryChips();
  wireAddForm();
  await loadManageList();

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", signOutAndRedirect);
});

function renderCategoryChips() {
  const wrap = document.getElementById("category-chips");
  if (!wrap) return;

  wrap.innerHTML = CATEGORIES.map(
    (cat) => `
    <button class="chip ${cat.id === activeCategoryId ? "active" : ""} ${cat.id === "emergency" ? "emergency" : ""}" type="button" data-cat="${cat.id}">
      <span class="chip-icon" aria-hidden="true">${getCategoryIcon(cat.id, 22)}</span>
      <span class="chip-label">${cat.label}</span>
    </button>
  `
  ).join("");

  wrap.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", async () => {
      activeCategoryId = chip.dataset.cat;
      wrap.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === chip));
      await loadManageList();
    });
  });
}

function wireAddForm() {
  const form = document.getElementById("add-phrase-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("new-phrase-input");
    const text = input.value.trim();
    if (!text) return;

    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;

    const category = getCategoryById(activeCategoryId);
    const { error } = await supabaseClient.from("phrases").insert({
      category: activeCategoryId,
      text,
      emoji: category.emoji,
    });

    submitBtn.disabled = false;

    if (error) {
      showManageMessage("Couldn't add that phrase. Please try again.", true);
      return;
    }

    input.value = "";
    showManageMessage("Phrase added.");
    await loadManageList();
  });
}

async function loadManageList() {
  const listEl = document.getElementById("manage-list");
  if (!listEl) return;

  listEl.innerHTML = `<div class="loading-wrap"><div class="spinner" role="status" aria-label="Loading"></div></div>`;

  const { data: phrases, error } = await supabaseClient
    .from("phrases")
    .select("id, text, emoji")
    .eq("category", activeCategoryId)
    .order("created_at", { ascending: true });

  if (error) {
    listEl.innerHTML = `<p class="empty-state">Couldn't load phrases.</p>`;
    return;
  }

  if (!phrases || phrases.length === 0) {
    listEl.innerHTML = `<p class="empty-state">No phrases in this category yet. Add one below.</p>`;
    return;
  }

  listEl.innerHTML = phrases
    .map(
      (p) => `
      <div class="manage-row" data-id="${p.id}">
        <span class="manage-row-icon" aria-hidden="true">${getCategoryIcon(activeCategoryId, 20)}</span>
        <span class="manage-row-text" data-role="display">${escapeHtml(p.text)}</span>
        <div class="manage-row-actions">
          <button type="button" class="row-action-btn edit-btn" data-action="edit" aria-label="Edit phrase">${getIcon("pencil", 18)}</button>
          <button type="button" class="row-action-btn delete-btn" data-action="delete" aria-label="Delete phrase">${getIcon("trash", 18)}</button>
        </div>
      </div>
    `
    )
    .join("");

  listEl.querySelectorAll(".manage-row").forEach((row) => {
    const id = row.dataset.id;
    row.querySelector("[data-action='edit']").addEventListener("click", () => beginEdit(row, id));
    row.querySelector("[data-action='delete']").addEventListener("click", () => deletePhrase(row, id));
  });
}

function beginEdit(row, id) {
  const displayEl = row.querySelector("[data-role='display']");
  const currentText = displayEl.textContent;

  row.querySelector(".manage-row-actions").innerHTML = `
    <button type="button" class="row-action-btn save-btn" data-action="save" aria-label="Save phrase">${getIcon("check", 18)}</button>
    <button type="button" class="row-action-btn cancel-btn" data-action="cancel" aria-label="Cancel edit">${getIcon("x", 18)}</button>
  `;

  const input = document.createElement("input");
  input.type = "text";
  input.className = "edit-input";
  input.value = currentText;
  displayEl.replaceWith(input);
  input.focus();
  input.select();

  row.querySelector("[data-action='save']").addEventListener("click", () => saveEdit(row, id, input.value.trim()));
  row.querySelector("[data-action='cancel']").addEventListener("click", loadManageList);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveEdit(row, id, input.value.trim());
    if (e.key === "Escape") loadManageList();
  });
}

async function saveEdit(row, id, newText) {
  if (!newText) return;

  const { error } = await supabaseClient.from("phrases").update({ text: newText }).eq("id", id);

  if (error) {
    showManageMessage("Couldn't save changes. Please try again.", true);
    return;
  }

  showManageMessage("Phrase updated.");
  await loadManageList();
}

async function deletePhrase(row, id) {
  const confirmed = window.confirm("Delete this phrase? Patients will no longer see it.");
  if (!confirmed) return;

  const { error } = await supabaseClient.from("phrases").delete().eq("id", id);

  if (error) {
    showManageMessage("Couldn't delete that phrase. Please try again.", true);
    return;
  }

  showManageMessage("Phrase deleted.");
  await loadManageList();
}

function showManageMessage(message, isError) {
  const el = document.getElementById("manage-message");
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("success", !isError);
  el.style.color = isError ? "var(--red-600)" : "var(--green-600)";
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => (el.textContent = ""), 2600);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
