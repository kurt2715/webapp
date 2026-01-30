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

const STORAGE_KEY = "simple-blog-posts";
let editingId = null;

const loadPosts = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const savePosts = (posts) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

const formatDate = (value) => {
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
    updatedAt.textContent = formatDate(post.updatedAt);
  } else {
    editorStatus.textContent = "新建";
    updatedAt.textContent = "-";
  }
};

const renderPosts = () => {
  const posts = loadPosts().sort((a, b) => b.updatedAt - a.updatedAt);
  postList.innerHTML = "";

  posts.forEach((post, index) => {
    const card = document.createElement("article");
    card.className = "post-card";
    card.style.animationDelay = `${index * 0.05}s`;
    card.innerHTML = `
      <h3>${post.title}</h3>
      <div class="post-meta">更新于 ${formatDate(post.updatedAt)}</div>
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

    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const ok = window.confirm("确定删除这篇文章吗？");
      if (!ok) return;
      const updated = loadPosts().filter((item) => item.id !== post.id);
      savePosts(updated);
      renderPosts();
      if (editingId === post.id) {
        resetEditor();
      }
    });

    postList.appendChild(card);
  });

  postCount.textContent = `${posts.length} 篇`;
  emptyState.style.display = posts.length ? "none" : "block";
};

const resetEditor = () => {
  editingId = null;
  titleInput.value = "";
  bodyInput.value = "";
  updateEditorStatus(null);
  updateWordCount();
};

const updateWordCount = () => {
  const text = bodyInput.value;
  const count = text.replace(/\s/g, "").length;
  wordCount.textContent = String(count);
};

postForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  if (!title || !body) return;

  const posts = loadPosts();
  const now = Date.now();

  if (editingId) {
    const index = posts.findIndex((post) => post.id === editingId);
    if (index !== -1) {
      posts[index] = {
        ...posts[index],
        title,
        body,
        updatedAt: now,
      };
    }
  } else {
    posts.push({
      id: crypto.randomUUID(),
      title,
      body,
      createdAt: now,
      updatedAt: now,
    });
  }

  savePosts(posts);
  renderPosts();
  resetEditor();
});

cancelEdit.addEventListener("click", () => {
  resetEditor();
});

newPost.addEventListener("click", () => {
  resetEditor();
  titleInput.focus();
});

bodyInput.addEventListener("input", updateWordCount);

renderPosts();
resetEditor();
