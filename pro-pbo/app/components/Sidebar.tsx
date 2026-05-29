'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type MenuItem = {
  id: string;
  label: string;
  icon: string;
  href: string;
};

type UserProfile = {
  name: string;
  email: string;
};

const Sidebar = ({ darkMode, userProfile }: { darkMode: boolean; userProfile?: UserProfile }) => {
  const pathname = usePathname();

  // Determine which menu items to show based on the current path
  const isStudentDashboard = pathname?.startsWith('/dashboard-student');

  const menuItems = isStudentDashboard ? [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard-student' },
    { id: 'find-internships', label: 'Cari Magang', icon: '🔍', href: '/dashboard-student/find-internships' },
    { id: 'my-applications', label: 'Lamaran Saya', icon: '📋', href: '/dashboard-student/my-applications' },
    { id: 'profile', label: 'Profil Saya', icon: '👤', href: '/dashboard-student/profile' },
    { id: 'documents', label: 'Dokumen', icon: '📄', href: '/dashboard-student/documents' },
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard' },
    { id: 'manage-internships', label: 'Kelola Magang', icon: '📋', href: '/dashboard/manage-internships' },
    { id: 'applications', label: 'Lamaran', icon: '📋', href: '/dashboard/applications' },
    { id: 'manage-company', label: 'Profil Perusahaan', icon: '🏢', href: '/dashboard/manage-company-profile' },
  ];

  return (
    <aside className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r z-40`}>
      <div className="p-4 pt-12">
        <div className={`text-xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>InternSheep</div>

        {/* User Profile Section */}
        {userProfile && (
          <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  {userProfile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className={`font-semibold truncate max-w-[120px] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {userProfile.name}
                </div>
                <div className={`text-xs truncate max-w-[120px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {userProfile.email}
                </div>
              </div>
            </div>
          </div>
        )}

        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.id}>
                  <Link href={item.href}>
                    <div
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors cursor-pointer ${
                        isActive
                          ? darkMode
                            ? 'bg-[#f59e0b] text-white'
                            : 'bg-[#f59e0b] text-white'
                          : darkMode
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;