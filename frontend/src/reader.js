const readerTitle = document.getElementById("reader-title");
const readerMeta = document.getElementById("reader-meta");
const readerBody = document.getElementById("reader-body");
const commentList = document.getElementById("comment-list");
const commentCount = document.getElementById("comment-count");
const commentForm = document.getElementById("comment-form");
const commentInput = document.getElementById("comment-input");
const commentHint = document.getElementById("comment-hint");

const API_BASE = "/api/v1";
const TOKEN_KEY = "auth_token";

let currentUser = null;
let currentPostId = null;

const getToken = () => localStorage.getItem(TOKEN_KEY);

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

const getPostId = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
};

const fetchCurrentUser = async () => {
  const token = getToken();
  if (!token) {
    currentUser = null;
    commentHint.classList.remove("hidden");
    return;
  }
  try {
    currentUser = await apiRequest("/auth/me");
    commentHint.classList.add("hidden");
  } catch {
    currentUser = null;
    commentHint.classList.remove("hidden");
  }
};

const renderReader = async () => {
  const id = getPostId();
  currentPostId = id;
  if (!id) {
    readerTitle.textContent = "未找到文章";
    readerMeta.textContent = "请返回列表重新选择。";
    readerBody.textContent = "";
    return;
  }

  try {
    const post = await apiRequest(`/posts/${id}`);
    readerTitle.textContent = post.title;
    readerMeta.textContent = `更新于 ${formatDate(post.updated_at || post.created_at)}`;
    readerBody.textContent = post.body;
  } catch {
    readerTitle.textContent = "未找到文章";
    readerMeta.textContent = "请返回列表重新选择。";
    readerBody.textContent = "";
  }
};

const renderComments = async () => {
  if (!currentPostId) return;
  let comments = [];
  try {
    comments = await apiRequest(`/comments/?post_id=${currentPostId}`);
  } catch {
    comments = [];
  }

  commentList.innerHTML = "";
  comments.forEach((comment) => {
    const item = document.createElement("div");
    item.className = "comment-item";
    const canDelete = currentUser && (currentUser.role === "admin" || currentUser.id === comment.author_id);
    item.innerHTML = `
      <div class="comment-meta">用户 #${comment.author_id} · ${formatDate(comment.created_at)}</div>
      <p>${comment.content}</p>
      ${canDelete ? '<button type="button" class="ghost-btn comment-delete">删除</button>' : ""}
    `;

    const deleteBtn = item.querySelector(".comment-delete");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        const ok = window.confirm("确定删除这条评论吗？");
        if (!ok) return;
        try {
          await apiRequest(`/comments/${comment.id}`, { method: "DELETE" });
          await renderComments();
        } catch (error) {
          alert("删除失败：" + error.message);
        }
      });
    }

    commentList.appendChild(item);
  });

  commentCount.textContent = `${comments.length} 条`;
};

commentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser) {
    alert("请先登录后再评论。");
    return;
  }
  const content = commentInput.value.trim();
  if (!content) return;

  try {
    await apiRequest("/comments/", {
      method: "POST",
      body: JSON.stringify({ post_id: Number(currentPostId), content }),
    });
    commentInput.value = "";
    await renderComments();
  } catch (error) {
    alert("评论失败：" + error.message);
  }
});

const init = async () => {
  await fetchCurrentUser();
  await renderReader();
  await renderComments();
};

init();
