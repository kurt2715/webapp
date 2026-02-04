const editorStatus = document.getElementById("editor-status");
const titleInput = document.getElementById("title");
const bodyInput = document.getElementById("body");
const wordCount = document.getElementById("word-count");
const updatedAt = document.getElementById("updated-at");
const postForm = document.getElementById("post-form");
const cancelEdit = document.getElementById("cancel-edit");
const categorySelect = document.getElementById("category");
const tagList = document.getElementById("tag-list");

const API_BASE = "/api/v1";
const TOKEN_KEY = "auth_token";

let editingId = null;
let categoriesCache = [];
let tagsCache = [];
let currentUser = null;

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

const fetchCurrentUser = async () => {
  const token = getToken();
  if (!token) {
    currentUser = null;
    return;
  }
  try {
    currentUser = await apiRequest("/auth/me");
  } catch (error) {
    console.error(error);
    currentUser = null;
  }
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const renderCategories = () => {
  categorySelect.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "选择分类";
  categorySelect.appendChild(defaultOption);

  categoriesCache.forEach((category) => {
    const option = document.createElement("option");
    option.value = String(category.id);
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
};

const renderTags = () => {
  tagList.innerHTML = "";
  tagsCache.forEach((tag) => {
    const label = document.createElement("label");
    label.className = "tag-chip";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = String(tag.id);
    const span = document.createElement("span");
    span.textContent = tag.name;
    label.appendChild(input);
    label.appendChild(span);
    tagList.appendChild(label);
  });
};

const loadMeta = async () => {
  try {
    categoriesCache = await apiRequest("/categories/");
    tagsCache = await apiRequest("/tags/");
  } catch (error) {
    console.error(error);
    categoriesCache = [];
    tagsCache = [];
  }
  renderCategories();
  renderTags();
};

const getSelectedTagIds = () => {
  const inputs = tagList.querySelectorAll("input[type='checkbox']");
  return Array.from(inputs)
    .filter((input) => input.checked)
    .map((input) => Number(input.value));
};

const setSelectedTagIds = (tagIds) => {
  const set = new Set(tagIds || []);
  const inputs = tagList.querySelectorAll("input[type='checkbox']");
  inputs.forEach((input) => {
    input.checked = set.has(Number(input.value));
  });
};

const updateEditorStatus = (post) => {
  if (post) {
    editorStatus.textContent = "编辑中";
    updatedAt.textContent = formatDate(post.updated_at || post.created_at);
  } else {
    editorStatus.textContent = "新建";
    updatedAt.textContent = "-";
  }
};

const updateWordCount = () => {
  const text = bodyInput.value;
  const count = text.replace(/\s/g, "").length;
  wordCount.textContent = String(count);
};

const loadPost = async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    editingId = null;
    updateEditorStatus(null);
    updateWordCount();
    return;
  }

  try {
    const post = await apiRequest(`/posts/${id}`);
    editingId = post.id;
    titleInput.value = post.title;
    bodyInput.value = post.body;
    categorySelect.value = post.category_id ? String(post.category_id) : "";
    setSelectedTagIds((post.tags || []).map((tag) => tag.id));
    updateEditorStatus(post);
    updateWordCount();
  } catch (error) {
    alert("加载文章失败：" + error.message);
  }
};

postForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser) {
    window.location.href = "/login.html";
    return;
  }
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  if (!title || !body) return;

  const payload = {
    title,
    body,
    summary: body.length > 120 ? `${body.slice(0, 120)}…` : body,
    category_id: categorySelect.value ? Number(categorySelect.value) : null,
    tag_ids: getSelectedTagIds(),
    published_at: new Date().toISOString(),
  };

  try {
    if (editingId) {
      await apiRequest(`/posts/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } else {
      await apiRequest("/posts/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }
    window.location.href = "/";
  } catch (error) {
    alert("保存失败：" + error.message);
  }
});

cancelEdit.addEventListener("click", () => {
  window.location.href = "/";
});

bodyInput.addEventListener("input", updateWordCount);

const init = async () => {
  await fetchCurrentUser();
  if (!currentUser) {
    window.location.href = "/login.html";
    return;
  }
  await loadMeta();
  await loadPost();
};

init();
