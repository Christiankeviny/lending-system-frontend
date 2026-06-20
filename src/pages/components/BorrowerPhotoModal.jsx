import React from "react";
import { useTranslation } from "./TranslationContext.jsx";

const BorrowerPhotoModal = ({ isOpen, onClose, nim, borrowerName }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  // We point the image source directly to our backend API route
  // The browser will automatically make a GET request to fetch the image!
  const photoUrl = `http://${window.location.hostname}:3000/api/borrow/student-photo/${nim}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("borrowerPhoto.title", { name: borrowerName })}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex justify-center bg-gray-100 min-h-[200px] items-center">
          {nim ? (
            <img
              src={photoUrl}
              alt={t("borrowerPhoto.alt", { name: borrowerName })}
              className="max-w-full h-auto rounded shadow-sm object-contain"
              onError={(e) => {
                // Fallback image if the backend fails to find the photo
                e.target.onerror = null; 
                const fallbackText = t("borrowerPhoto.noPhotoText").replace(/ /g, "+");
                e.target.src = `https://via.placeholder.com/400x250?text=${fallbackText}`;
              }}
            />
          ) : (
            <p className="text-gray-500 italic">{t("borrowerPhoto.noNim")}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BorrowerPhotoModal;