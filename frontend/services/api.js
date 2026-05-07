import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("token");
    }
    return Promise.reject(error);
  }
);

// ─── Products ────────────────────────────────────────────────────────────────

export async function fetchProducts(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== "" && v !== "NaN" && !Number.isNaN(v))
  );
  const { data } = await api.get("/api/products/", { params: clean });
  return data;
}

export async function fetchProduct(id) {
  const { data } = await api.get(`/api/products/${id}/`);
  return data;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export async function fetchCart() {
  const { data } = await api.get("/api/cart/");
  return data;
}

export async function addToCart(productId, quantity = 1) {
  const { data } = await api.post("/api/cart/", {
    product_id: productId,
    quantity,
  });
  return data;
}

export async function updateCartItem(itemId, quantity) {
  const { data } = await api.put(`/api/cart/${itemId}/`, { quantity });
  return data;
}

export async function deleteCartItem(itemId) {
  await api.delete(`/api/cart/${itemId}/`);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function register({ email, username, password }) {
  const { data } = await api.post("/api/auth/register/", {
    email,
    username,
    password,
  });
  return data;
}

export async function login({ email, password }) {
  const { data } = await api.post("/api/auth/login/", { email, password });
  return data;
}

export async function getMe() {
  const { data } = await api.get("/api/auth/me/");
  return data;
}
