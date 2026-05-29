'use client';

// HeaderSection.tsx
import { HeaderSectionProps, ToggleDarkModeProps } from '../interfaces';
import { useState } from 'react';

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

const HeaderSection = ({ darkMode, toggleDarkMode, showThemeToggle = true }: HeaderSectionProps) => {
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = [
    { name: 'Fitur', id: 'features' },
    { name: 'Keunggulan', id: 'benefits' },
    { name: 'Cara Kerja', id: 'how-it-works' },
    { name: 'FAQ', id: 'faqs' },
    { name: 'Kontak', id: 'contact' }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 backdrop-blur-sm z-50 border-b ${darkMode ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border-[#e5e7eb]'}`}>
      <div className="max-w-[1200px] mx-auto px-[40px] py-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="w-15 h-15 mr-3">
              {darkMode ? (
                <img
                  src="/Logo_Dark.png"
                  alt="InternSheep Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src="/Logo_Light.png"
                  alt="InternSheep Logo"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>InternSheep</div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.id);
                  setMobileMenuOpen(false); // Close mobile menu if open
                }}
                className={`${darkMode ? 'text-white hover:text-gray-300' : 'text-[#0f0f0f] hover:text-[#737373]'} transition-colors font-medium`}
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Desktop Login and Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Login Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                className="bg-[#f59e0b] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#d97706] transition-colors"
              >
                Masuk
              </button>

              {showLoginDropdown && (
                <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50 ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <a
                    href="/login-student"
                    className={`block px-4 py-2 text-sm ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setShowLoginDropdown(false)}
                  >
                    Mahasiswa
                  </a>
                  <a
                    href="/login-company"
                    className={`block px-4 py-2 text-sm ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setShowLoginDropdown(false)}
                  >
                    Perusahaan
                  </a>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            {showThemeToggle && (
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <button
              className={`md:hidden ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden mt-4 py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`${darkMode ? 'text-white hover:text-gray-300' : 'text-[#0f0f0f] hover:text-[#737373]'} transition-colors font-medium`}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-2">
                {showThemeToggle && (
                  <button
                    onClick={toggleDarkMode}
                    className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'} mr-2`}
                    aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                  >
                    {darkMode ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                  className="bg-[#f59e0b] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#d97706] transition-colors"
                >
                  Masuk
                </button>
              </div>
              {showLoginDropdown && (
                <div className={`mt-2 rounded-md shadow-lg py-1 z-50 ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <a
                    href="/login-student"
                    className={`block px-4 py-2 text-sm ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setShowLoginDropdown(false)}
                  >
                    Mahasiswa
                  </a>
                  <a
                    href="/login-company"
                    className={`block px-4 py-2 text-sm ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setShowLoginDropdown(false)}
                  >
                    Perusahaan
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderSection;