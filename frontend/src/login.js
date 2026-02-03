const loginForm = document.getElementById("login-page-form");
const loginUsername = document.getElementById("login-page-username");
const loginPassword = document.getElementById("login-page-password");
const loginError = document.getElementById("login-page-error");

const API_BASE = "/api/v1";
const TOKEN_KEY = "auth_token";

const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

if (!loginForm || !loginUsername || !loginPassword || !loginError) {
  console.error("Login form elements not found.");
} else {
  loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.classList.add("hidden");
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
    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || "登录失败");
    }
    const data = text ? JSON.parse(text) : {};
    if (!data.access_token) {
      throw new Error("登录失败：缺少令牌");
    }
    setToken(data.access_token);
    window.location.href = "/";
  } catch (error) {
    console.error(error);
    loginError.textContent = `登录失败：${error.message}`;
    loginError.classList.remove("hidden");
  }
  });
}
