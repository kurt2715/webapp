const categoryList = document.getElementById("category-list");
const tagList = document.getElementById("tag-admin-list");
const addCategoryBtn = document.getElementById("add-category");
const addTagBtn = document.getElementById("add-tag");

const API_BASE = "/api/v1";
const TOKEN_KEY = "auth_token";

const getToken = () => localStorage.getItem(TOKEN_KEY);

const apiRequest = async (path, options = {}) => {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
};

const ensureAdmin = async () => {
  try {
    const me = await apiRequest("/auth/me");
    if (me.role !== "admin") {
      alert("需要管理员权限");
      window.location.href = "/";
      return false;
    }
    return true;
  } catch {
    window.location.href = "/login.html";
    return false;
  }
};

const renderCategories = async () => {
  const categories = await apiRequest("/categories/");
  categoryList.innerHTML = "";
  categories.forEach((cat) => {
    const row = document.createElement("div");
    row.className = "admin-row";
    row.innerHTML = `
      <div>
        <strong>${cat.name}</strong>
        <span class="muted">${cat.slug}</span>
      </div>
      <div class="admin-actions">
        <button class="ghost-btn edit">编辑</button>
        <button class="ghost-btn delete">删除</button>
      </div>
    `;
    row.querySelector(".edit").addEventListener("click", async () => {
      const name = window.prompt("新的分类名称", cat.name);
      if (!name) return;
      const slug = window.prompt("新的分类标识", cat.slug);
      if (!slug) return;
      await apiRequest(`/categories/${cat.id}`, {
        method: "PUT",
        body: JSON.stringify({ name, slug }),
      });
      await renderCategories();
    });
    row.querySelector(".delete").addEventListener("click", async () => {
      const ok = window.confirm("确定删除该分类吗？");
      if (!ok) return;
      await apiRequest(`/categories/${cat.id}`, { method: "DELETE" });
      await renderCategories();
    });
    categoryList.appendChild(row);
  });
};

const renderTags = async () => {
  const tags = await apiRequest("/tags/");
  tagList.innerHTML = "";
  tags.forEach((tag) => {
    const row = document.createElement("div");
    row.className = "admin-row";
    row.innerHTML = `
      <div>
        <strong>${tag.name}</strong>
        <span class="muted">${tag.slug}</span>
      </div>
      <div class="admin-actions">
        <button class="ghost-btn edit">编辑</button>
        <button class="ghost-btn delete">删除</button>
      </div>
    `;
    row.querySelector(".edit").addEventListener("click", async () => {
      const name = window.prompt("新的标签名称", tag.name);
      if (!name) return;
      const slug = window.prompt("新的标签标识", tag.slug);
      if (!slug) return;
      await apiRequest(`/tags/${tag.id}`, {
        method: "PUT",
        body: JSON.stringify({ name, slug }),
      });
      await renderTags();
    });
    row.querySelector(".delete").addEventListener("click", async () => {
      const ok = window.confirm("确定删除该标签吗？");
      if (!ok) return;
      await apiRequest(`/tags/${tag.id}`, { method: "DELETE" });
      await renderTags();
    });
    tagList.appendChild(row);
  });
};

addCategoryBtn.addEventListener("click", async () => {
  const name = window.prompt("分类名称");
  if (!name) return;
  const slug = window.prompt("分类标识");
  if (!slug) return;
  await apiRequest("/categories/", {
    method: "POST",
    body: JSON.stringify({ name, slug }),
  });
  await renderCategories();
});

addTagBtn.addEventListener("click", async () => {
  const name = window.prompt("标签名称");
  if (!name) return;
  const slug = window.prompt("标签标识");
  if (!slug) return;
  await apiRequest("/tags/", {
    method: "POST",
    body: JSON.stringify({ name, slug }),
  });
  await renderTags();
});

const init = async () => {
  const ok = await ensureAdmin();
  if (!ok) return;
  await renderCategories();
  await renderTags();
};

init();
