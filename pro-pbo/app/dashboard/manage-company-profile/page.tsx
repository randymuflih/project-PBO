// app/dashboard/manage-company-profile/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import { useTheme } from '../../lib/ThemeContext';
import { getCompanyProfile, updateCompanyProfile } from '../../lib/apiService';
import Sidebar from '../../components/Sidebar';

type CompanyProfile = {
  id: string;
  name: string;
  email: string;
  description: string;
  industry: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  logo?: string;
};

const ManageCompanyProfilePage = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<CompanyProfile>({
    id: '',
    name: '',
    email: '',
    description: '',
    industry: '',
    location: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    logo: '',
  });
  const [originalProfile, setOriginalProfile] = useState<CompanyProfile | null>(null); // Store original profile for comparison
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [loading, setLoading] = useState(true);

  const { user, token, login } = useAuth(); // Dapatkan user, token, dan fungsi login dari context



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

  // Load company profile
  useEffect(() => {
    const loadProfile = async () => {
      if (token) {
        try {
          setLoading(true);
          const data = await getCompanyProfile(token);
          setProfile(data);
          setOriginalProfile(data); // Store original profile for comparison
        } catch (error) {
          console.error('Error loading company profile:', error);
          setNotification({ message: 'Gagal memuat profil perusahaan. Silakan coba lagi.', type: 'error' });
        } finally {
          setLoading(false);
        }
      }
    };

    loadProfile();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profile.name.trim()) {
      newErrors.name = 'Nama perusahaan wajib diisi';
    }

    if (!profile.industry) {
      newErrors.industry = 'Bidang industri wajib dipilih';
    }

    if (!profile.description.trim()) {
      newErrors.description = 'Deskripsi perusahaan wajib diisi';
    }

    if (!profile.contactEmail.trim()) {
      newErrors.contactEmail = 'Email kontak wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(profile.contactEmail)) {
      newErrors.contactEmail = 'Format email tidak valid';
    }

    if (!profile.contactPhone.trim()) {
      newErrors.contactPhone = 'Nomor telepon wajib diisi';
    } else if (!/^\+?\d{10,15}$/.test(profile.contactPhone.replace(/\D/g, ''))) {
      newErrors.contactPhone = 'Format nomor telepon tidak valid';
    }

    if (profile.website && !/^https?:\/\/.*/.test(profile.website)) {
      newErrors.website = 'Format website harus dimulai dengan http:// atau https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        if (token) {
          await updateCompanyProfile(token, profile);

          // Update the auth context user data to reflect changes in the header
          if (user) {
            // Update user with company name from profile
            const updatedUser = {
              ...user,
              email: profile.email,
              // Update company-specific data in user context if needed
            };

            // Update auth context with new user data
            login(updatedUser, token); // Use login function to update user data in context
          }

          // Update the originalProfile to reflect the saved changes
          setOriginalProfile({ ...profile });

          setIsEditing(false);
          setErrors({});
          setNotification({ message: 'Profil perusahaan berhasil diperbarui!', type: 'success' });
        } else {
          setNotification({ message: 'Token autentikasi tidak ditemukan', type: 'error' });
        }
      } catch (error) {
        console.error('Error updating company profile:', error);
        setNotification({ message: 'Gagal memperbarui profil perusahaan. Silakan coba lagi.', type: 'error' });
      }
    }
  };

  const handleNotificationClose = () => {
    setNotification(null);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f59e0b]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' :
          notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' :
            'bg-blue-100 text-blue-800 border border-blue-300'
          }`}>
          <div className="flex justify-between items-center">
            <span>{notification.message}</span>
            <button onClick={handleNotificationClose} className="ml-4 text-xl">&times;</button>
          </div>
        </div>
      )}

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
              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Kelola Profil Perusahaan</div>
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
                    {(originalProfile || profile).name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className={`hidden md:block ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  {(originalProfile || profile).name}
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
            <div className="flex justify-between items-center mb-6">
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Kelola Profil Perusahaan</h1>
              <div className="flex space-x-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setErrors({});
                    }}
                    className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-300 hover:bg-gray-400'
                      } text-white`}
                  >
                    Batal
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                    } text-white`}
                >
                  {isEditing ? 'Lihat Profil' : 'Edit Profil'}
                </button>
              </div>
            </div>

            {/* Company Profile Card */}
            <div className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Company Logo */}
                  <div className="md:col-span-2 flex flex-col items-center">
                    <div className={`w-32 h-32 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'
                      } flex items-center justify-center mb-4`}>
                      {profile.logo ? (
                        <img src={profile.logo} alt="Company Logo" className="w-full h-full object-contain rounded-full" />
                      ) : (
                        <span className={`text-4xl ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>🏢</span>
                      )}
                    </div>
                    {isEditing && (
                      <label className={`px-4 py-2 rounded-lg cursor-pointer ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                        } text-white`}>
                        Ganti Logo
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setProfile(prev => ({
                                  ...prev,
                                  logo: reader.result as string
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Company Name */}
                  <div>
                    <label htmlFor="name" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Nama Perusahaan
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={profile.name}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded-lg border ${errors.name ? 'border-red-500' : ''
                            } ${darkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                      </>
                    ) : (
                      <div className={`px-3 py-2 rounded-lg border ${darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                        }`}>
                        {profile.name}
                      </div>
                    )}
                  </div>

                  {/* Industry */}
                  <div>
                    <label htmlFor="industry" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Bidang Industri
                    </label>
                    {isEditing ? (
                      <>
                        <select
                          id="industry"
                          name="industry"
                          value={profile.industry}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded-lg border ${errors.industry ? 'border-red-500' : ''
                            } ${darkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="">Pilih bidang industri</option>
                          <option value="Teknologi Informasi">Teknologi Informasi</option>
                          <option value="Keuangan">Keuangan</option>
                          <option value="Manufaktur">Manufaktur</option>
                          <option value="Pendidikan">Pendidikan</option>
                          <option value="Kesehatan">Kesehatan</option>
                          <option value="Pertanian">Pertanian</option>
                          <option value="Transportasi">Transportasi</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                        {errors.industry && <p className="mt-1 text-sm text-red-500">{errors.industry}</p>}
                      </>
                    ) : (
                      <div className={`px-3 py-2 rounded-lg border ${darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                        }`}>
                        {profile.industry || 'Belum dipilih'}
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Alamat Kantor
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={profile.location}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded-lg border ${errors.location ? 'border-red-500' : ''
                            } ${darkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
                      </>
                    ) : (
                      <div className={`px-3 py-2 rounded-lg border ${darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                        }`}>
                        {profile.location || 'Tidak disediakan'}
                      </div>
                    )}
                  </div>

                  {/* Contact Email */}
                  <div>
                    <label htmlFor="contactEmail" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Email Kontak
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="email"
                          id="contactEmail"
                          name="contactEmail"
                          value={profile.contactEmail}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded-lg border ${errors.contactEmail ? 'border-red-500' : ''
                            } ${darkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {errors.contactEmail && <p className="mt-1 text-sm text-red-500">{errors.contactEmail}</p>}
                      </>
                    ) : (
                      <div className={`px-3 py-2 rounded-lg border ${darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                        }`}>
                        {profile.contactEmail}
                      </div>
                    )}
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label htmlFor="contactPhone" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Telepon Kontak
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="tel"
                          id="contactPhone"
                          name="contactPhone"
                          value={profile.contactPhone}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded-lg border ${errors.contactPhone ? 'border-red-500' : ''
                            } ${darkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {errors.contactPhone && <p className="mt-1 text-sm text-red-500">{errors.contactPhone}</p>}
                      </>
                    ) : (
                      <div className={`px-3 py-2 rounded-lg border ${darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                        }`}>
                        {profile.contactPhone || 'Tidak disediakan'}
                      </div>
                    )}
                  </div>

                  {/* Website */}
                  <div>
                    <label htmlFor="website" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Website
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="url"
                          id="website"
                          name="website"
                          value={profile.website}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded-lg border ${errors.website ? 'border-red-500' : ''
                            } ${darkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {errors.website && <p className="mt-1 text-sm text-red-500">{errors.website}</p>}
                      </>
                    ) : (
                      <div className={`px-3 py-2 rounded-lg border ${darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                        }`}>
                        {profile.website ? (
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {profile.website}
                          </a>
                        ) : (
                          'Tidak disediakan'
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Description */}
                <div className="mb-6">
                  <label htmlFor="description" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Deskripsi Perusahaan
                  </label>
                  {isEditing ? (
                    <>
                      <textarea
                        id="description"
                        name="description"
                        value={profile.description}
                        onChange={handleInputChange}
                        rows={4}
                        className={`w-full px-3 py-2 rounded-lg border ${errors.description ? 'border-red-500' : ''
                          } ${darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                    </>
                  ) : (
                    <div className={`w-full px-3 py-2 rounded-lg border ${darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}>
                      {profile.description}
                    </div>
                  )}
                </div>

                {/* Submit Button - only shown when editing */}
                {isEditing && (
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setErrors({});
                      }}
                      className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-300 hover:bg-gray-400'
                        } text-white`}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className={`px-6 py-2 rounded-lg ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
                        } text-white`}
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageCompanyProfilePage;