'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../lib/authContext';
import { useTheme } from '../lib/ThemeContext';
import { useRouter } from 'next/navigation';
import { ApplicationService } from '../services/internship/InternshipService';
import Sidebar from '../components/Sidebar';

const StudentDashboardPage = () => {
  const { user, token } = useAuth(); // Get both user and token from auth context
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  // Fetch student profile
  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (token) {
        try {
          const { getStudentProfile } = await import('../lib/apiService');
          const profile = await getStudentProfile(token);
          setStudentProfile(profile);
        } catch (error) {
          console.error('Error fetching student profile:', error);
        }
      }
    };

    fetchStudentProfile();
  }, [token]);

  // Redirect based on user role
  useEffect(() => {
    if (user) {
      if (user.role === 'company') {
        router.push('/dashboard');
      } else if (user.role === 'admin') {
        router.push('/dashboard-admin');
      }
    }
  }, [user, router]);


  // Toggle sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // If user is not loaded yet or not a student, show loading or redirect
  if (!user || user.role !== 'student') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p>Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  const [stats, setStats] = useState([
    { title: 'Lamaran Aktif', value: '0', change: 'Memuat...', icon: '📋', color: 'blue' },
    { title: 'Total Lamaran', value: '0', change: 'Memuat...', icon: '📊', color: 'green' },
    { title: 'Wawancara Dijadwalkan', value: '0', change: 'Memuat...', icon: '📅', color: 'purple' },
  ]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch application statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (token) {
        try {
          const applicationService = new ApplicationService();
          const apps = await applicationService.getStudentApplications(token);

          // Calculate stats from applications
          const activeApps = apps.filter((app: any) =>
            app.status === 'Submitted' || app.status === 'Reviewed'
          ).length;

          const totalApps = apps.length;

          const interviewScheduled = apps.filter((app: any) =>
            app.status === 'Accepted'
          ).length; // In our system, 'Accepted' might mean interview scheduled

          const newStats = [
            { title: 'Lamaran Aktif', value: activeApps.toString(), change: `+${activeApps > 0 ? 1 : 0} minggu ini`, icon: '📋', color: 'blue' },
            { title: 'Total Lamaran', value: totalApps.toString(), change: `+${totalApps > 0 ? Math.min(2, totalApps) : 0} minggu ini`, icon: '📊', color: 'green' },
            { title: 'Wawancara Dijadwalkan', value: interviewScheduled.toString(), change: `+${interviewScheduled > 0 ? 1 : 0} minggu ini`, icon: '📅', color: 'purple' },
          ];

          setStats(newStats);
        } catch (error) {
          console.error('Error fetching stats:', error);
          // Keep default values or show error
          const errorStats = [
            { title: 'Lamaran Aktif', value: 'Error', change: 'Gagal memuat', icon: '📋', color: 'blue' },
            { title: 'Total Lamaran', value: 'Error', change: 'Gagal memuat', icon: '📊', color: 'green' },
            { title: 'Wawancara Dijadwalkan', value: 'Error', change: 'Gagal memuat', icon: '📅', color: 'purple' },
          ];
          setStats(errorStats);
        } finally {
          setLoadingStats(false);
        }
      }
    };

    fetchStats();
  }, [token]);

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingDeadlines, setLoadingDeadlines] = useState(true);

  // Fetch recent activities (applications, updates, etc.) for the student dashboard
  useEffect(() => {
    const fetchRecentActivities = async () => {
      if (token) {
        try {
          const applicationService = new ApplicationService();
          const apps = await applicationService.getStudentApplications(token);

          // Format applications as recent activities
          const activities = apps.slice(0, 4).map((app: any, index: number) => ({
            id: index + 1,
            activity: `Melamar magang di ${app.company}`,
            time: formatTimeAgo(new Date(app.appliedDate)),
            type: 'application'
          }));

          // Add some other activities
          activities.push(
            ...[
              { id: activities.length + 1, activity: 'Status lamaran diperbarui', time: '1 hari yang lalu', type: 'update' },
              { id: activities.length + 2, activity: 'Menerima pesan dari perusahaan', time: '2 hari yang lalu', type: 'message' },
              { id: activities.length + 3, activity: 'Menyelesaikan profil pribadi', time: '3 hari yang lalu', type: 'completion' },
            ].filter((_, idx) => activities.length + idx < 4) // Only add if we need more to reach 4
          );

          setRecentActivities(activities);
        } catch (error) {
          console.error('Error fetching recent activities:', error);
          // Set default mock data in case of error
          setRecentActivities([
            { id: 1, activity: 'Melamar magang di PT Maju Jaya', time: '2 jam yang lalu', type: 'application' },
            { id: 2, activity: 'Status lamaran diperbarui', time: '1 hari yang lalu', type: 'update' },
            { id: 3, activity: 'Menerima pesan dari perusahaan', time: '2 hari yang lalu', type: 'message' },
            { id: 4, activity: 'Menyelesaikan profil pribadi', time: '3 hari yang lalu', type: 'completion' },
          ]);
        } finally {
          setLoadingActivities(false);
        }
      }
    };

    // Fetch upcoming application deadlines
    const fetchDeadlines = async () => {
      if (token) {
        try {
          const applicationService = new ApplicationService();
          const apps = await applicationService.getStudentApplications(token);

          // Format application deadlines
          const appDeadlines = apps
            .filter((app: any) => app.deadline) // Only apps with deadlines
            .slice(0, 3) // Take first 3
            .map((app: any, index: number) => {
              const deadlineDate = new Date(app.deadline);
              const today = new Date();
              const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

              return {
                id: index + 1,
                title: `${app.title} di ${app.company}`,
                company: app.company,
                deadline: app.deadline,
                daysLeft: daysLeft
              };
            });

          // If we need more data to reach 3, add mock data
          if (appDeadlines.length < 3) {
            const mockDeadlines = [
              { id: appDeadlines.length + 1, title: 'UI/UX Designer di PT Digital Solution', company: 'PT Digital Solution', deadline: '2025-02-15', daysLeft: 16 },
              { id: appDeadlines.length + 2, title: 'Data Analyst di PT Riset Cerdas', company: 'PT Riset Cerdas', deadline: '2025-02-20', daysLeft: 21 },
              { id: appDeadlines.length + 3, title: 'Machine Learning Engineer di PT AI Cerdas', company: 'PT AI Cerdas', deadline: '2025-02-25', daysLeft: 26 },
            ];

            appDeadlines.push(...mockDeadlines.slice(0, 3 - appDeadlines.length));
          }

          setDeadlines(appDeadlines);
        } catch (error) {
          console.error('Error fetching deadlines:', error);
          // Set default mock data in case of error
          setDeadlines([
            { id: 1, title: 'UI/UX Designer di PT Digital Solution', company: 'PT Digital Solution', deadline: '2025-02-15', daysLeft: 16 },
            { id: 2, title: 'Data Analyst di PT Riset Cerdas', company: 'PT Riset Cerdas', deadline: '2025-02-20', daysLeft: 21 },
            { id: 3, title: 'Machine Learning Engineer di PT AI Cerdas', company: 'PT AI Cerdas', deadline: '2025-02-25', daysLeft: 26 },
          ]);
        } finally {
          setLoadingDeadlines(false);
        }
      }
    };

    fetchRecentActivities();
    fetchDeadlines();
  }, [token]);

  // Helper function to format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Baru saja';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} menit yang lalu`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} jam yang lalu`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} hari yang lalu`;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 backdrop-blur-sm z-50 border-b ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-[#e5e7eb]'}`}>
        <div className="max-w-[1200px] mx-auto px-[40px] py-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden mr-4"
              >
                <svg className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Dashboard Mahasiswa</div>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-4">
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
              <div className="flex items-center space-x-2">
                <div className={`h-10 w-10 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                    {studentProfile?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className={`hidden md:block ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  {studentProfile?.name || user?.email?.split('@')[0] || 'Mahasiswa'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        {(sidebarOpen || (typeof window !== "undefined" && window.innerWidth >= 768)) && (
          <div className="hidden md:block">
            <Sidebar
              darkMode={darkMode}
              userProfile={user ? { name: user.email.split('@')[0], email: user.email } : undefined}
            />
          </div>
        )}

        {/* Mobile sidebar overlay */}
        {sidebarOpen && typeof window !== "undefined" && window.innerWidth < 768 && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {sidebarOpen && typeof window !== "undefined" && window.innerWidth < 768 && (
          <div className="fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] md:hidden">
            <Sidebar
              darkMode={darkMode}
              userProfile={user ? { name: user.email.split('@')[0], email: user.email } : undefined}
            />
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${sidebarOpen ? 'md:ml-64' : ''} p-6 pt-12`}>
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard Mahasiswa</h1>
                <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Kelola profil, lamaran, dan pencarian magang Anda</p>
              </div>
              <div className={`mt-4 md:mt-0 px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                <span className="font-medium">Semester 5</span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.title}</p>
                      <p className={`text-2xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                      <p className={`text-sm mt-2 ${stat.change.startsWith('+')
                        ? 'text-green-500'
                        : stat.change.startsWith('-')
                          ? 'text-red-500'
                          : 'text-gray-500'
                        }`}>{stat.change}</p>
                    </div>
                    <div className={`text-2xl ${stat.color === 'blue' ? 'text-blue-500' :
                      stat.color === 'green' ? 'text-green-500' :
                        'text-purple-500'
                      }`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activities */}
              <div className={`lg:col-span-2 rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Aktivitas Terkini</h2>
                  <button
                    onClick={() => router.push('/dashboard-student/my-applications')}
                    className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                  >
                    Lihat semua
                  </button>
                </div>
                <div className="space-y-4">
                  {loadingActivities ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#f59e0b]"></div>
                    </div>
                  ) : recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                        <div className={`mr-3 mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'application' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                          activity.type === 'update' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                            activity.type === 'message' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                              'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                          }`}>
                          {activity.type === 'application' ? '📋' :
                            activity.type === 'update' ? '🔄' :
                              activity.type === 'message' ? '💬' :
                                '✅'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{activity.activity}</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{activity.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      Tidak ada aktivitas terkini
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Batas Waktu Mendatang</h2>
                  <button
                    onClick={() => router.push('/dashboard-student/find-internships')}
                    className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                  >
                    Lihat semua
                  </button>
                </div>
                <div className="space-y-4">
                  {loadingDeadlines ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#f59e0b]"></div>
                    </div>
                  ) : deadlines.length > 0 ? (
                    deadlines.map((deadline) => (
                      <div key={deadline.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{deadline.title}</p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{deadline.company}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${deadline.daysLeft <= 5
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                            : deadline.daysLeft <= 10
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            }`}>
                            {deadline.daysLeft} hari
                          </span>
                        </div>
                        <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Batas: {new Date(deadline.deadline).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      Tidak ada batas waktu mendatang
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboardPage;