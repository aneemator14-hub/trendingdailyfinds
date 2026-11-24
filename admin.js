// ============================================================
// TrendingDailyFinds Admin Panel
// 1. Create a Supabase project.
// 2. Put your Project URL and anon key below.
// 3. Create the database using supabase.sql.
// ============================================================

const SUPABASE_URL = "PASTE_YOUR_SUPABASE_PROJECT_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY_HERE";

const configured =
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("PASTE_") &&
  !SUPABASE_ANON_KEY.includes("PASTE_");

let db = null;
if (configured) db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const $ = (id) => document.getElementById(id);

const loginScreen = $("loginScreen");
const app = $("app");
const loginForm = $("loginForm");
const loginMessage = $("loginMessage");
const productRows = $("productRows");
const statusMessage = $("statusMessage");
const productForm = $("productForm");
const formMessage = $("formMessage");

function showMessage(el, msg, error=false) {
  el.textContent = msg;
  el.style.color = error ? "#c62828" : "#526071";
}

function requireConfig() {
  if (!configured) {
    showMessage(loginMessage, "Set SUPABASE_URL and SUPABASE_ANON_KEY in admin.js first.", true);
    return false;
  }
  return true;
}

async function checkSession() {
  if (!requireConfig()) return;
  const { data } = await db.auth.getSession();
  if (data.session) showApp();
}

function showApp() {
  loginScreen.classList.add("hidden");
  app.classList.remove("hidden");
  loadProducts();
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!requireConfig()) return;

  showMessage(loginMessage, "Signing in...");
  const { error } = await db.auth.signInWithPassword({
    email: $("email").value.trim(),
    password: $("password").value
  });

  if (error) {
    showMessage(loginMessage, error.message, true);
  } else {
    showApp();
  }
});

$("logoutBtn").addEventListener("click", async () => {
  if (db) await db.auth.signOut();
  location.reload();
});

document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    if (btn.dataset.view === "add") openAddForm();
    else showProducts();
  });
});

function showProducts() {
  $("productsView").classList.remove("hidden");
  $("formView").classList.add("hidden");
  $("pageTitle").textContent = "Products";
}

function openAddForm() {
  productForm.reset();
  $("productId").value = "";
  $("rating").value = "5";
  $("isActive").checked = true;
  $("pageTitle").textContent = "Add Product";
  $("productsView").classList.add("hidden");
  $("formView").classList.remove("hidden");
  showMessage(formMessage, "");
}

$("newProductBtn").addEventListener("click", openAddForm);
$("cancelBtn").addEventListener("click", showProducts);

async function loadProducts() {
  if (!db) return;
  showMessage(statusMessage, "Loading...");
  const { data, error } = await db
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    showMessage(statusMessage, error.message, true);
    return;
  }

  window.allProducts = data || [];
  renderProducts();
  showMessage(statusMessage, `${window.allProducts.length} product(s)`);
}

function renderProducts() {
  const search = $("productSearch").value.toLowerCase().trim();
  const cat = $("categoryFilter").value;

  const list = (window.allProducts || []).filter(p =>
    (!search || p.name.toLowerCase().includes(search)) &&
    (!cat || p.category === cat)
  );

  productRows.innerHTML = list.map(p => `
    <tr>
      <td>
        <div class="product-cell">
          <div class="thumb">${p.image_url ? `<img src="${escapeHtml(p.image_url)}" style="width:100%;height:100%;object-fit:cover;border-radius:9px">` : "🛍️"}</div>
          <div>
            <div class="product-name">${escapeHtml(p.name)}</div>
            <small>${escapeHtml(p.description || "")}</small>
          </div>
        </div>
      </td>
      <td>${escapeHtml(p.category)}</td>
      <td>${escapeHtml(p.price || "—")}</td>
      <td>${p.badge ? `<span class="badge">${escapeHtml(p.badge)}</span>` : "—"}</td>
      <td>${p.is_active ? "Yes" : "No"}</td>
      <td>
        <div class="actions">
          <button class="action" onclick="editProduct('${p.id}')">Edit</button>
          <button class="action delete" onclick="deleteProduct('${p.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="6">No products found.</td></tr>`;
}

$("productSearch").addEventListener("input", renderProducts);
$("categoryFilter").addEventListener("change", renderProducts);

window.editProduct = function(id) {
  const p = window.allProducts.find(x => x.id === id);
  if (!p) return;

  $("productId").value = p.id;
  $("name").value = p.name || "";
  $("category").value = p.category || "";
  $("price").value = p.price || "";
  $("rating").value = p.rating ?? 5;
  $("reviews").value = p.reviews ?? 0;
  $("badge").value = p.badge || "";
  $("imageUrl").value = p.image_url || "";
  $("affiliateUrl").value = p.affiliate_url || "";
  $("description").value = p.description || "";
  $("isActive").checked = !!p.is_active;

  $("pageTitle").textContent = "Edit Product";
  $("productsView").classList.add("hidden");
  $("formView").classList.remove("hidden");
};

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!db) return;

  const payload = {
    name: $("name").value.trim(),
    category: $("category").value,
    price: $("price").value.trim(),
    rating: Number($("rating").value || 0),
    reviews: Number($("reviews").value || 0),
    badge: $("badge").value || null,
    image_url: $("imageUrl").value.trim() || null,
    affiliate_url: $("affiliateUrl").value.trim(),
    description: $("description").value.trim() || null,
    is_active: $("isActive").checked
  };

  showMessage(formMessage, "Saving...");

  const id = $("productId").value;
  const result = id
    ? await db.from("products").update(payload).eq("id", id)
    : await db.from("products").insert(payload);

  if (result.error) {
    showMessage(formMessage, result.error.message, true);
    return;
  }

  showMessage(formMessage, "Product saved successfully.");
  await loadProducts();
  setTimeout(showProducts, 600);
});

window.deleteProduct = async function(id) {
  const p = window.allProducts.find(x => x.id === id);
  if (!p || !confirm(`Delete "${p.name}"?`)) return;

  const { error } = await db.from("products").delete().eq("id", id);
  if (error) {
    showMessage(statusMessage, error.message, true);
    return;
  }
  await loadProducts();
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

checkSession();
