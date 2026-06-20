// Login Admin
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../utils/api";
import { useTranslation } from "./components/TranslationContext.jsx";
import pnjLogo from "../assets/PEENJE.png";

export default function LoginPage() {
    const PNJLogo = () => (
    <div className="hidden md:flex items-center justify-center">
      <img
        src={pnjLogo}
        className="w-48 h-48 md:w-64 md:h-64 object-contain"
        alt="PEENJE Logo"
      />
    </div>
  );

  const InventoryIcon = () => (
    <div className="flex md:hidden items-center justify-center mb-6">
      <img
        src={pnjLogo}
        className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
        alt="Inventory Icon"
      />
    </div>
  );

  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setError(t("login.error.empty"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await authAPI.login({
        username: formData.username,
        password: formData.password,
      });

      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("admin", JSON.stringify(data.data.admin));
        localStorage.setItem("isLoggedIn", "true");

        navigate("/dashboard");
      } else {
        setError(data.message || t("login.error.failed"));
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || t("login.error.network"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotMessage("");
    setIsForgotLoading(true);
    try {
      const data = await authAPI.forgotPassword(forgotEmail);
      if (data.success) {
        setForgotMessage(t(data.message));
      } else {
        setForgotError(t(data.message));
      }
    } catch (err) {
      setForgotError(err.message ? t(err.message) : t("login.error.network"));
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-16 lg:space-x-24 max-w-5xl w-full border border-gray-200 shadow-sm bg-white rounded-3xl p-10 md:p-16 lg:p-20 relative">
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 right-6 md:top-8 md:right-8 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors text-2xl font-bold rounded-full hover:bg-gray-100"
        >
          ✕
        </button>

        <div className="flex-shrink-0">
          <PNJLogo />
        </div>

        <div className="w-full max-w-sm md:max-w-md flex flex-col justify-center">
          <div className="text-center mb-6">
            <InventoryIcon />
            <h1 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">
              {t("login.title")}
            </h1>
            <p className="text-sm text-gray-600">
              {t("login.subtitle")}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            ) : null}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">
                {t("login.username")}
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder={t("login.usernamePlaceholder")}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">
                {t("login.password")}
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-600">
                  {t("login.remember")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-sm font-medium hover:underline text-blue-600"
              >
                {t("login.forgotPassword")}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 text-white rounded-md hover:opacity-90 transition-all font-medium"
              style={{ backgroundColor: "#048494" }}
            >
              {isLoading ? t("login.signingIn") : t("login.signIn")}
            </button>
          </form>
        </div>
      </div>

      {/* Modal Lupa Kata Sandi */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >✕</button>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">{t("login.forgotPassword")}</h3>
            <p className="text-sm text-gray-600 mb-4">{t("login.forgotPasswordDesc")}</p>
            {forgotMessage && <div className="mb-4 p-2 bg-green-50 text-green-700 text-sm rounded">{forgotMessage}</div>}
            {forgotError && <div className="mb-4 p-2 bg-red-50 text-red-700 text-sm rounded">{forgotError}</div>}
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mb-4 outline-none"
                required
              />
              <button
                type="submit"
                disabled={isForgotLoading}
                className="w-full py-2 text-white rounded hover:opacity-90 disabled:opacity-50 font-medium"
                style={{ backgroundColor: "#048494" }}
              >
                {isForgotLoading ? t("login.sending") : t("login.sendResetLink")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}