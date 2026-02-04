const postList = document.getElementById("post-list");
const postCount = document.getElementById("post-count");
const emptyState = document.getElementById("empty-state");
const newPost = document.getElementById("new-post");
const loginLink = document.getElementById("login-link");
const logoutBtn = document.getElementById("logout");
const adminLink = document.getElementById("admin-link");

const API_BASE = "/api/v1";
const TOKEN_KEY = "auth_token";

let postsCache = [];
let currentUser = null;

const getToken = () => localStorage.getItem(TOKEN_KEY);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const apiRequest = async (path, options = {}) => {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
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
    currentUser = await apiRequest("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error(error);
    currentUser = null;
    localStorage.removeItem(TOKEN_KEY);
  }
};

const updateAuthUi = () => {
  if (currentUser) {
    newPost.classList.remove("hidden");
    loginLink.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    if (currentUser.role === "admin") {
      adminLink.classList.remove("hidden");
    } else {
      adminLink.classList.add("hidden");
    }
  } else {
    newPost.classList.add("hidden");
    loginLink.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    adminLink.classList.add("hidden");
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

const truncate = (text, length = 80) => {
  if (text.length <= length) return text;
  return `${text.slice(0, length)}…`;
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
      if (!currentUser) {
        window.location.href = "/login.html";
        return;
      }
      window.location.href = `/edit.html?id=${post.id}`;
    };

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
        window.location.href = "/login.html";
        return;
      }
      const ok = window.confirm("确定删除这篇文章吗？");
      if (!ok) return;
      try {
        await apiRequest(`/posts/${post.id}`, { method: "DELETE" });
        await renderPosts();
      } catch (error) {
        console.error(error);
        alert("删除失败：" + error.message);
      }
    });

    if (!currentUser) {
      editButton.classList.add("hidden");
      deleteButton.classList.add("hidden");
    }

    postList.appendChild(card);
  });

  postCount.textContent = `${postsCache.length} 篇`;
  emptyState.style.display = postsCache.length ? "none" : "block";
};

newPost.addEventListener("click", () => {
  if (!currentUser) {
    window.location.href = "/login.html";
    return;
  }
  window.location.href = "/edit.html";
});

logoutBtn.addEventListener("click", () => {
  clearToken();
  currentUser = null;
  updateAuthUi();
  renderPosts();
});

const init = async () => {
  await fetchCurrentUser();
  updateAuthUi();
  await renderPosts();
};

init();
