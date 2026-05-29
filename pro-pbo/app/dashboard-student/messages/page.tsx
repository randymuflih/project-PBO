'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import { useTheme } from '../../lib/ThemeContext';
import { getStudentProfile } from '../../lib/apiService';
import Sidebar from '../../components/Sidebar';

const MessagesPage = () => {
  const { darkMode } = useTheme();

  const [userName, setUserName] = useState<string>('User');
  const [userEmail, setUserEmail] = useState<string>('user@example.com');
  const [userInitial, setUserInitial] = useState<string>('U');

  const { token } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        try {
          const profile = await getStudentProfile(token);
          setUserName(profile.name || profile.email.split('@')[0]); // Gunakan nama dari profil, atau username dari email jika tidak ada
          setUserEmail(profile.email);
          setUserInitial(profile.name?.charAt(0).toUpperCase() || profile.email.charAt(0).toUpperCase());
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [token]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 backdrop-blur-sm z-50 border-b ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-[#e5e7eb]'}`}>
        <div className="max-w-[1200px] mx-auto px-[40px] py-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Pesan</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`h-10 w-10 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                    {userInitial}
                  </span>
                </div>
                <span className={`hidden md:block ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  {userName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        <div className="hidden md:block">
          <Sidebar darkMode={darkMode} userProfile={{ name: userName, email: userEmail }} />
        </div>

        <main className="flex-1 md:ml-64 p-6 pt-12">
          <div className="max-w-[1200px] mx-auto">
            <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Pesan Mahasiswa</h1>
            <div className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Fitur ini akan segera tersedia.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MessagesPage;