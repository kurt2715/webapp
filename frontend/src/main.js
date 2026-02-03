const postList = document.getElementById("post-list");
const postCount = document.getElementById("post-count");
const emptyState = document.getElementById("empty-state");
const editorStatus = document.getElementById("editor-status");
const titleInput = document.getElementById("title");
const bodyInput = document.getElementById("body");
const wordCount = document.getElementById("word-count");
const updatedAt = document.getElementById("updated-at");
const postForm = document.getElementById("post-form");
const cancelEdit = document.getElementById("cancel-edit");
const newPost = document.getElementById("new-post");
const categorySelect = document.getElementById("category");
const tagList = document.getElementById("tag-list");
const loginForm = document.getElementById("login-form");
const loginUsername = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");
const userPanel = document.getElementById("user-panel");
const currentUserLabel = document.getElementById("current-user");
const logoutBtn = document.getElementById("logout");

const API_BASE = "/api/v1";
const TOKEN_KEY = "auth_token";

let editingId = null;
let postsCache = [];
let categoriesCache = [];
let tagsCache = [];
let currentUser = null;

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

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

const truncate = (text, length = 80) => {
  if (text.length <= length) return text;
  return `${text.slice(0, length)}…`;
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

const setAuthUi = () => {
  if (currentUser) {
    loginForm.classList.add("hidden");
    userPanel.classList.remove("hidden");
    currentUserLabel.textContent = `${currentUser.username} (${currentUser.role})`;
  } else {
    loginForm.classList.remove("hidden");
    userPanel.classList.add("hidden");
    currentUserLabel.textContent = "";
  }
};

const fetchCurrentUser = async () => {
  const token = getToken();
  if (!token) {
    currentUser = null;
    setAuthUi();
    return;
  }
  try {
    currentUser = await apiRequest("/auth/me");
  } catch (error) {
    console.error(error);
    setToken("");
    currentUser = null;
  }
  setAuthUi();
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

const renderPosts = async () => {
  try {
    const posts = await apiRequest("/posts/");
    postsCache = Array.isArray(posts) ? posts : [];
  } catch (error) {
    console.error(error);
    postsCache = [];
    alert("获取文章列表失败，请检查后端服务。\n" + error.message);
  }

  postList.innerHTML = "";

  postsCache.forEach((post, index) => {
    const card = document.createElement("article");
    card.className = "post-card";
    card.style.animationDelay = `${index * 0.05}s`;
    card.innerHTML = `
      <h3>${post.title}</h3>
      <div class="post-meta">更新于 ${formatDate(post.updated_at || post.created_at)}</div>
      <p class="post-preview">${truncate(post.body.replace(/\n/g, " "))}</p>
      <div class="post-actions">
        <button type="button" class="edit">编辑</button>
        <button type="button" class="read">阅读全文</button>
        <button type="button" class="delete">删除</button>
      </div>
    `;

    const editButton = card.querySelector(".edit");
    const readButton = card.querySelector(".read");
    const deleteButton = card.querySelector(".delete");

    const startEdit = () => {
      editingId = post.id;
      titleInput.value = post.title;
      bodyInput.value = post.body;
      categorySelect.value = post.category_id ? String(post.category_id) : "";
      setSelectedTagIds((post.tags || []).map((tag) => tag.id));
      updateEditorStatus(post);
      updateWordCount();
    };

    card.addEventListener("click", startEdit);

    editButton.addEventListener("click", (event) => {
      event.stopPropagation();
      startEdit();
    });

    readButton.addEventListener("click", (event) => {
      event.stopPropagation();
      window.location.href = `/reader.html?id=${encodeURIComponent(post.id)}`;
    });

    deleteButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      if (!currentUser) {
        alert("请先登录后再删除。");
        return;
      }
      const ok = window.confirm("确定删除这篇文章吗？");
      if (!ok) return;
      try {
        await apiRequest(`/posts/${post.id}`, { method: "DELETE" });
        if (editingId === post.id) {
          resetEditor();
        }
        await renderPosts();
      } catch (error) {
        console.error(error);
        alert("删除失败：" + error.message);
      }
    });

    postList.appendChild(card);
  });

  postCount.textContent = `${postsCache.length} 篇`;
  emptyState.style.display = postsCache.length ? "none" : "block";
};

const resetEditor = () => {
  editingId = null;
  titleInput.value = "";
  bodyInput.value = "";
  categorySelect.value = "";
  setSelectedTagIds([]);
  updateEditorStatus(null);
  updateWordCount();
};

const updateWordCount = () => {
  const text = bodyInput.value;
  const count = text.replace(/\s/g, "").length;
  wordCount.textContent = String(count);
};

postForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser) {
    alert("请先登录后再发布文章。");
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
    await renderPosts();
    resetEditor();
  } catch (error) {
    console.error(error);
    alert("保存失败：" + error.message);
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();
  if (!username || !password) return;

  try {
    const body = new URLSearchParams({ username, password });
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "登录失败");
    }
    const data = await response.json();
    setToken(data.access_token);
    await fetchCurrentUser();
    loginPassword.value = "";
  } catch (error) {
    console.error(error);
    alert("登录失败：" + error.message);
  }
});

logoutBtn.addEventListener("click", () => {
  setToken("");
  currentUser = null;
  setAuthUi();
});

cancelEdit.addEventListener("click", () => {
  resetEditor();
});

newPost.addEventListener("click", () => {
  resetEditor();
  titleInput.focus();
});

bodyInput.addEventListener("input", updateWordCount);

const init = async () => {
  await fetchCurrentUser();
  await loadMeta();
  await renderPosts();
  resetEditor();
};

init();
