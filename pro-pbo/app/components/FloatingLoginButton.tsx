'use client';

// FloatingLoginButton.tsx
import { ToggleDarkModeProps } from '../interfaces';
import { useState } from 'react';
import Link from 'next/link';

const FloatingLoginButton = ({ darkMode, toggleDarkMode }: { darkMode: boolean } & ToggleDarkModeProps) => {
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
      {/* Login Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowLoginDropdown(!showLoginDropdown)}
          className="bg-[#f59e0b] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#d97706] transition-colors shadow-lg"
        >
          Masuk
        </button>

        {showLoginDropdown && (
          <div className={`absolute bottom-full right-0 mb-2 w-48 rounded-md shadow-lg py-1 z-50 ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <Link
              href="/login-student"
              className={`block px-4 py-2 text-sm ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setShowLoginDropdown(false)}
            >
              Mahasiswa
            </Link>
            <Link
              href="/login-company"
              className={`block px-4 py-2 text-sm ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setShowLoginDropdown(false)}
            >
              Perusahaan
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingLoginButton;