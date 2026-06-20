import { useState, useEffect, useRef } from "react";

const SearchableSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder, 
  required,
  wrapperClassName = "relative w-full",
  inputClassName = "w-full px-3 py-2.5 text-base md:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white",
  iconPadding = "px-3"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  const safeOptions = Array.isArray(options) ? options : [];
  const selectedOption = safeOptions.find((opt) => String(opt.value) === String(value));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    // Use pointerdown for seamless mobile touch support
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  const filteredOptions = safeOptions.filter((opt) =>
    String(opt.label || "").toLowerCase().includes((search || "").toLowerCase())
  );

  return (
    <div className={wrapperClassName} ref={wrapperRef}>
      <input
        type="text"
        className={inputClassName}
        placeholder={selectedOption ? selectedOption.label : placeholder}
        value={isOpen ? search : selectedOption ? selectedOption.label : ""}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onPointerDown={() => setIsOpen(true)}
        required={required && !value}
      />
      <div className={`absolute inset-y-0 right-0 flex items-center ${iconPadding} pointer-events-none`}>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {isOpen && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, index) => (
              <li 
                key={index} 
                className="px-3 py-3 md:py-2 cursor-pointer hover:bg-blue-50 text-base md:text-sm text-gray-700" 
                onMouseDown={(e) => e.preventDefault()} // Prevents input from losing focus without breaking mobile scroll
                onClick={() => { 
                  onChange(opt.value); 
                  setIsOpen(false); 
                  setSearch(""); 
                }}>
                {opt.label}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-gray-500">No options found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchableSelect;