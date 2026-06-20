import { useTranslation } from "./TranslationContext.jsx";

const Header = () => {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === "id" ? "en" : "id");
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-4">
          <div 
            onClick={toggleLanguage}
            className="relative inline-flex items-center h-8 w-16 bg-gray-200 rounded-full cursor-pointer transition-colors"
            title={language === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
          >
            <div className="absolute left-1.5 top-2 z-0 opacity-50 select-none">
              <img src="https://flagcdn.com/w20/gb.png" alt="EN" className="w-4 h-4 object-cover rounded-full" />
            </div>
            <div className="absolute right-1.5 top-2 z-0 opacity-50 select-none">
              <img src="https://flagcdn.com/w20/id.png" alt="ID" className="w-4 h-4 object-cover rounded-full" />
            </div>
            <span
              className={`absolute left-1 top-1 flex items-center justify-center w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200 ${
                language === 'id' ? 'translate-x-8' : 'translate-x-0'
              }`}
            >
              {language === 'id' ? (
                <img src="https://flagcdn.com/w20/id.png" alt="ID" className="w-4 h-4 object-cover rounded-full shadow-sm" />
              ) : (
                <img src="https://flagcdn.com/w20/gb.png" alt="EN" className="w-4 h-4 object-cover rounded-full shadow-sm" />
              )}
            </span>
          </div>
          
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;