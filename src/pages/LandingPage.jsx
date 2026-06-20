// Landing Page
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "./components/TranslationContext.jsx";
import pnjLogo from "../assets/PEENJE.png";

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 md:p-8">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600&display=swap');`}
      </style>
      <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-16 lg:space-x-24 max-w-5xl w-full border border-gray-200 shadow-sm bg-white rounded-3xl p-10 md:p-16 lg:p-20">
        <div className="flex-shrink-0">
          <PNJLogo />
        </div>

        <div className="text-center w-full max-w-sm md:max-w-md flex flex-col justify-center">
          <InventoryIcon />
          <h1 
            className="text-5xl md:text-6xl lg:text-[4.5rem] font-semibold text-gray-900 mb-4 text-center md:text-left leading-tight md:leading-none"
            style={{ fontFamily: '"Sora", sans-serif' }}
          >
            {t("landing.title1")}
            <br />
            {t("landing.title2")}
          </h1>
          <p className="text-[1.1rem] text-gray-600 mb-6 md:mb-8 text-center md:text-left leading-tight">{t("landing.purpose")}</p>

          <div className="space-y-3 w-full max-w-xs mx-auto md:mx-0 md:w-64">
            <button
              onClick={() => navigate("/borrow")}
              className="w-full py-3 px-6 text-white rounded-md hover:opacity-90 transition-all font-medium"
              style={{ backgroundColor: "#048494" }}
            >
              {t("landing.borrow")}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 px-6 rounded-md hover:opacity-90 transition-all font-medium"
              style={{ backgroundColor: "#eae9e5", color: "#212122" }}
            >
              {t("landing.loginAdmin")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}