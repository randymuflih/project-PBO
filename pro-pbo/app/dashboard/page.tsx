'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../lib/authContext';
import { useTheme } from '../lib/ThemeContext';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';

type StatCard = {
  title: string;
  value: string;
  change: string;
  icon: string;
};

type Activity = {
  id: number;
  user: string;
  action: string;
  time: string;
};

const DashboardPage = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Move this to the top with other state declarations
  const { user, isLoading, token } = useAuth(); // Get the token as well
  const router = useRouter();

  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [stats, setStats] = useState<StatCard[]>([]);
  const [applicationStats, setApplicationStats] = useState({
    accepted: 0,
    inProcess: 0,
    rejected: 0,
    conversionRate: 0
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [topJobs, setTopJobs] = useState<any[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);

  // Redirect based on user role - this should be one of the first hooks
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'student') {
        router.push('/dashboard-student');
      } else if (user.role === 'company') {
        // Stay on this page for company users
      } else if (user.role === 'admin') {
        router.push('/dashboard-admin');
      }
    } else if (!isLoading && !user) {
      // If user is not authenticated, redirect to login
      router.push('/login');
    }
  }, [user, isLoading, router]);


  // Fetch company profile
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      if (!token) {
        console.warn('No token available, cannot fetch company profile');
        return;
      }

      console.log('Fetching company profile with token:', token);
      try {
        const { getCompanyProfile } = await import('../services/internshipService');
        const companyData = await getCompanyProfile(token);
        console.log('Fetched company profile data:', companyData);
        setCompanyProfile(companyData);
      } catch (error) {
        console.error('Error fetching company profile:', error);
        // Use fallback if profile fetch fails
      }
    };

    if (token) {
      fetchCompanyProfile();
    }
  }, [token]);

  // Fetch dashboard stats and activities
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        console.warn('No token available, cannot fetch dashboard data');
        return;
      }

      try {
        // Fetch company's jobs
        const jobsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/jobs/company`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        let totalInternships = 0;
        let jobsData: any = { data: [] };
        if (jobsResponse.ok) {
          jobsData = await jobsResponse.json();
          totalInternships = jobsData.data?.length || 0;
        }

        // Fetch company's applications
        const applicationsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/company/applications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        let applicationsData = [];
        let appliedStudents = 0;
        let totalApplications = 0;
        let acceptedApplications = 0;
        if (applicationsResponse.ok) {
          const appData = await applicationsResponse.json();
          applicationsData = appData.data || [];
          totalApplications = applicationsData.length;

          // Count unique students
          const uniqueStudents = new Set(applicationsData.map((app: any) => app.student_id));
          appliedStudents = uniqueStudents.size;

          // Count accepted applications
          acceptedApplications = applicationsData.filter((app: any) => app.status === 'Accepted').length;
        }

        // Calculate application status statistics
        let acceptedCount = 0;
        let inProcessCount = 0; // This would typically include 'Applied', 'Reviewed', 'Interview' statuses
        let rejectedCount = 0;

        applicationsData.forEach((app: any) => {
          if (app.status === 'Accepted') {
            acceptedCount++;
          } else if (app.status === 'Rejected') {
            rejectedCount++;
          } else {
            // Other statuses ('Applied', 'Reviewed', 'Interview') count as in process
            inProcessCount++;
          }
        });

        // Calculate conversion rate (Accepted / Total Applications * 100)
        const conversionRate = totalApplications > 0
          ? Math.round((acceptedCount / totalApplications) * 100)
          : 0;

        // Update stats
        setStats([
          { title: 'Total Magang', value: totalInternships.toString(), change: '+0 bulan ini', icon: '💼' },
          { title: 'Mahasiswa Aktif', value: appliedStudents.toString(), change: '+0 bulan ini', icon: '👥' },
          { title: 'Lamaran Masuk', value: totalApplications.toString(), change: '+0 bulan ini', icon: '📋' },
          { title: 'Diterima', value: acceptedCount.toString(), change: '+0 bulan ini', icon: '✅' },
        ]);

        // Update application status stats
        setApplicationStats({
          accepted: acceptedCount,
          inProcess: inProcessCount,
          rejected: rejectedCount,
          conversionRate: conversionRate
        });

        // Get recent activities from applications data
        const activities = applicationsData.slice(0, 4).map((app: any, index: number) => ({
          id: index + 1,
          user: app.student_name,
          action: `Melamar magang di ${app.job_title}`,
          time: new Date(app.applied_date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })
        }));

        setRecentActivities(activities);

        // Calculate popular internships (based on application count)
        const applicationCountByJob: Record<string, number> = {};
        applicationsData.forEach((app: any) => {
          if (applicationCountByJob[app.job_title]) {
            applicationCountByJob[app.job_title]++;
          } else {
            applicationCountByJob[app.job_title] = 1;
          }
        });

        // Get top 5 most applied jobs
        const topJobs = Object.entries(applicationCountByJob)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([jobTitle, count], index) => ({
            rank: index + 1,
            title: jobTitle,
            applications: count
          }));

        setTopJobs(topJobs);

        // Calculate upcoming deadlines (for this example, we'll use mock upcoming deadlines based on jobs)
        // In a real implementation, you'd want to get this from the jobs data which should include closing dates
        const mockDeadlines = totalInternships > 0 ? [
          {
            title: jobsData.data[0]?.title || 'Program Magang Terbaru',
            daysLeft: 5,
            pendingApplications: totalApplications
          }
        ] : [];
        setUpcomingDeadlines(mockDeadlines);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Keep loading state or show error to user if needed
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

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

  // Handle loading and user validation after all hooks are defined
  // Show loading state while auth status is being determined
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p>Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  // If user is not loaded and not loading anymore, redirect to login
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p>Anda harus login terlebih dahulu.</p>
        </div>
      </div>
    );
  }

  // If user is loaded but not a company, redirect appropriately
  if (user.role !== 'company') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p>Halaman tidak ditemukan atau tidak diizinkan.</p>
        </div>
      </div>
    );
  }



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
              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Dashboard Perusahaan</div>
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
                    {companyProfile?.name
                      ? companyProfile.name.charAt(0).toUpperCase()
                      : user?.email?.charAt(0).toUpperCase() || 'C'}
                  </span>
                </div>
                <span className={`hidden md:block ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  {companyProfile?.name || user?.email?.split('@')[0] || 'Perusahaan'}
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
            <Sidebar darkMode={darkMode} />
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
            <Sidebar darkMode={darkMode} />
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${sidebarOpen ? 'md:ml-64' : ''} p-6 pt-12`}>
          <div className="max-w-[1200px] mx-auto">
            <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Selamat Datang di Dashboard Perusahaan</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.title}</p>
                      <p className={`text-2xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                      <p className={`text-sm mt-2 ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{stat.change}</p>
                    </div>
                    <div className="text-2xl">{stat.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts and Applications Overview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Application Status Overview */}
              <div className={`lg:col-span-2 rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ikhtisar Lamaran</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Diterima</p>
                    <p className="text-2xl font-bold text-green-500">{applicationStats.accepted}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Dalam Proses</p>
                    <p className="text-2xl font-bold text-yellow-500">{applicationStats.inProcess}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ditolak</p>
                    <p className="text-2xl font-bold text-red-500">{applicationStats.rejected}</p>
                  </div>
                </div>

                {/* Progress and Conversion Rate */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tingkat Konversi Lamaran</span>
                    <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{applicationStats.conversionRate}%</span>
                  </div>
                  <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="bg-green-500 h-3 rounded-full"
                      style={{ width: `${applicationStats.conversionRate}%` }}
                    ></div>
                  </div>
                </div>

                {/* Recent Applications */}
                <div>
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Lamaran Terbaru</h3>
                  <div className="space-y-4">
                    {recentActivities.length > 0 ? (
                      recentActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700"
                        >
                          <div>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{activity.user}</p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{activity.action}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Baru</span>
                        </div>
                      ))
                    ) : (
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tidak ada aktivitas terbaru</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Upcoming Deadlines and Top Internships */}
              <div className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tugas Mendatang</h2>

                <div className="mb-6">
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Batas Waktu Mendatang</h3>
                  {upcomingDeadlines.length > 0 ? (
                    upcomingDeadlines.map((deadline, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/20' : 'bg-red-50'} border ${darkMode ? 'border-red-800' : 'border-red-200'}`}
                      >
                        <p className={`font-medium ${darkMode ? 'text-red-300' : 'text-red-700'}`}>{deadline.title}</p>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>Batas waktu: {deadline.daysLeft} hari lagi</p>
                        <p className={`text-xs mt-2 ${darkMode ? 'text-red-500' : 'text-red-500'}`}>{deadline.pendingApplications} lamaran menunggu review</p>
                      </div>
                    ))
                  ) : (
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tidak ada batas waktu mendatang</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Program Terpopuler</h3>
                  <div className="space-y-3">
                    {topJobs.length > 0 ? (
                      topJobs.map((job) => (
                        <div key={job.rank} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${job.rank === 1
                              ? (darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800')
                              : (darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700')
                              }`}>
                              {job.rank}
                            </span>
                            <div>
                              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{job.title}</p>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{job.applications} lamaran</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tidak ada data program terpopuler</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;