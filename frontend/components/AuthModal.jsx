"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { login as apiLogin, register as apiRegister, getMe } from "@/services/api";
import Cookies from "js-cookie";

const INITIAL = { email: "", username: "", password: "" };

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { saveLogin } = useAuth();
  const { loadCart } = useCart();

  function validate(currentForm = form) {
    const e = {};
    if (!currentForm.email.trim()) e.email = "Поле обязательно для заполнения";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentForm.email))
      e.email = "Введите корректный email";
    if (!currentForm.password) e.password = "Поле обязательно для заполнения";
    else if (currentForm.password.length < 8)
      e.password = "Минимум 8 символов";
    if (mode === "register") {
      if (!currentForm.username.trim()) e.username = "Поле обязательно для заполнения";
      else if (currentForm.username.length < 3) e.username = "Минимум 3 символа";
      else if (currentForm.username.length > 100) e.username = "Максимум 100 символов";
    }
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    setForm(newForm);
    if (submitted) {
      setErrors(validate(newForm));
    } else {
      setErrors((er) => ({ ...er, [name]: undefined }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      let token;
      if (mode === "register") {
        await apiRegister({ email: form.email, username: form.username, password: form.password });
        const res = await apiLogin({ email: form.email, password: form.password });
        token = res.access_token;
      } else {
        const res = await apiLogin({ email: form.email, password: form.password });
        token = res.access_token;
      }
      Cookies.set("token", token, { expires: 7 });
      const userData = await getMe();
      saveLogin(token, userData);
      await loadCart();
      toast.success(mode === "login" ? "Добро пожаловать!" : "Аккаунт создан!");
      onClose();
    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      if (status === 401) {
        setErrors({ password: "Неверный email или пароль" });
      } else if (status === 409) {
        if (typeof detail === "string" && detail.toLowerCase().includes("email")) {
          setErrors({ email: "Email уже занят" });
        } else if (typeof detail === "string" && detail.toLowerCase().includes("имя")) {
          setErrors({ username: "Имя пользователя уже занято" });
        } else {
          toast.error(detail || "Конфликт данных");
        }
      } else if (detail?.errors) {
        const mapped = {};
        Object.entries(detail.errors).forEach(([k, v]) => { mapped[k] = v; });
        setErrors(mapped);
      } else {
        toast.error(detail || "Произошла ошибка, попробуйте позже");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-1">
          {mode === "login" ? "Вход" : "Регистрация"}
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          {mode === "login"
            ? "Войдите, чтобы управлять корзиной"
            : "Создайте аккаунт для покупок"}
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {mode === "register" && (
            <Field
              label="Имя пользователя"
              name="username"
              value={form.username}
              error={errors.username}
              onChange={handleChange}
              placeholder="username"
            />
          )}
          <Field
            label="Email"
            name="email"
            type="email"
            value={form.email}
            error={errors.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
          <Field
            label="Пароль"
            name="password"
            type="password"
            value={form.password}
            error={errors.password}
            onChange={handleChange}
            placeholder="Минимум 8 символов"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-medium transition"
          >
            {loading ? "Загрузка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setErrors({});
              setForm(INITIAL);
              setSubmitted(false);
            }}
            className="text-blue-600 hover:underline font-medium"
          >
            {mode === "login" ? "Зарегистрироваться" : "Войти"}
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", value, error, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition ${
          error
            ? "border-red-400 focus:ring-2 focus:ring-red-200"
            : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
