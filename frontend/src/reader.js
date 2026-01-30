const readerTitle = document.getElementById("reader-title");
const readerMeta = document.getElementById("reader-meta");
const readerBody = document.getElementById("reader-body");

const STORAGE_KEY = "simple-blog-posts";

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

const getPostId = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
};

const renderReader = () => {
  const id = getPostId();
  const post = loadPosts().find((item) => item.id === id);

  if (!post) {
    readerTitle.textContent = "未找到文章";
    readerMeta.textContent = "请返回列表重新选择。";
    readerBody.textContent = "";
    return;
  }

  readerTitle.textContent = post.title;
  readerMeta.textContent = `更新于 ${formatDate(post.updatedAt)}`;
  readerBody.textContent = post.body;
};

renderReader();
