import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authAPI } from "../utils/api.mjs";
import { useTranslation } from "./components/TranslationContext.jsx";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError(t("resetPassword.errorMismatch") || "Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const data = await authAPI.resetPassword(token, newPassword);
      if (data.success) {
        setMessage(t(data.message));
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(t(data.message));
      }
    } catch (err) {
      setError(err.message ? t(err.message) : t("resetPassword.error.failed"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow p-6 max-w-sm w-full text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Invalid Link</h2>
          <p className="text-gray-600 mb-4">No reset token provided.</p>
          <button onClick={() => navigate("/login")} className="text-blue-600 hover:underline">Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{t("resetPassword.title")}</h1>
        <p className="text-sm text-gray-600 mb-6">{t("resetPassword.subtitle")}</p>

        {message ? (
          <div className="p-4 bg-green-50 text-green-700 rounded-md">
            <p>{message}</p>
            <p className="text-sm mt-2">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("resetPassword.newPassword")}</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("resetPassword.confirmPassword")}</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-2.5 text-white rounded-md hover:opacity-90 font-medium" style={{ backgroundColor: "#048494" }}>{isLoading ? t("resetPassword.submitting") : t("resetPassword.submit")}</button>
          </form>
        )}
      </div>
    </div>
  );
}