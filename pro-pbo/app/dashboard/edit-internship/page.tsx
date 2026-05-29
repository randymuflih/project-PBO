// app/dashboard/edit-internship/page.tsx

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../../lib/authContext';
import { useTheme } from '../../lib/ThemeContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { getInternshipById, updateInternship } from '../../services/internshipService';

type FormData = {
  title: string;
  description: string;
  requirements: {
    majors: string[];
    skills: string[];
    gpa: string;
    other: string;
    minSemester: string;
    duration: string;
  };
  jobType: 'wfo' | 'wfh' | 'hybrid';
  location: string;
  closingDate: string;
  duration: string;
  isPaid: boolean;
  salary: string;
  is_active: boolean;
};

const EditInternshipContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const internshipId = searchParams.get('id');
  const { token } = useAuth();
  const [showSubmitConfirmDialog, setShowSubmitConfirmDialog] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    requirements: {
      majors: [] as string[],
      skills: [] as string[],
      gpa: '',
      other: '',
      minSemester: '',
      duration: ''
    },
    jobType: 'wfo',
    location: '',
    closingDate: '',
    duration: '',
    isPaid: false,
    salary: '',
    is_active: true
  });



  // Load internship data
  useEffect(() => {
    const loadInternship = async () => {
      if (!token || !internshipId) {
        setError('Missing token or internship ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const internship = await getInternshipById(internshipId);

        if (internship) {
          // Parse requirements
          const requirements = internship.requirements || {};

          setFormData({
            title: internship.title || '',
            description: internship.description || '',
            requirements: {
              majors: requirements.majors || [],
              skills: requirements.skills || [],
              gpa: requirements.gpa || '',
              other: requirements.other || '',
              minSemester: requirements.minSemester?.toString() || '',
              duration: requirements.duration || ''
            },
            jobType: internship.type || 'wfo',
            location: internship.location || '',
            closingDate: internship.deadline ? new Date(internship.deadline).toISOString().split('T')[0] : '',
            duration: requirements.duration || '',
            isPaid: requirements.isPaid || false,
            salary: requirements.salary || '',
            is_active: internship.is_active ?? true
          });
        }
      } catch (err) {
        console.error('Error loading internship:', err);
        setError('Failed to load internship data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInternship();
  }, [token, internshipId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      // Handle nested properties like 'requirements.majors'
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as object),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: (name === 'is_active' || name === 'isPaid') ? value === 'true' : value
      }));
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleRequirementsChange = (field: keyof FormData['requirements'], value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [field]: value
      }
    }));
  };

  const addMajor = (major: string) => {
    if (major && !formData.requirements.majors.includes(major)) {
      handleRequirementsChange('majors', [...formData.requirements.majors, major]);
    }
  };

  const removeMajor = (index: number) => {
    const newMajors = [...formData.requirements.majors];
    newMajors.splice(index, 1);
    handleRequirementsChange('majors', newMajors);
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.requirements.skills.includes(skill)) {
      handleRequirementsChange('skills', [...formData.requirements.skills, skill]);
    }
  };

  const removeSkill = (index: number) => {
    const newSkills = [...formData.requirements.skills];
    newSkills.splice(index, 1);
    handleRequirementsChange('skills', newSkills);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.duration) {
      alert('Mohon isi durasi magang');
      return;
    }

    if (formData.isPaid && !formData.salary) {
      alert('Mohon isi besaran gaji');
      return;
    }

    // Show confirmation dialog instead of submitting immediately
    setShowSubmitConfirmDialog(true);
  };

  const handleFormSubmit = async () => {
    if (!token || !internshipId) {
      alert('Missing token or internship ID');
      return;
    }

    try {
      // Prepare the internship data for submission
      const internshipData = {
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        location: formData.location,
        jobType: formData.jobType,
        closingDate: formData.closingDate,
        isPaid: formData.isPaid,
        salary: formData.salary,
        is_active: formData.is_active,
        requirements: {
          majors: formData.requirements.majors,
          skills: formData.requirements.skills,
          gpa: formData.requirements.gpa,
          other: formData.requirements.other,
          minSemester: formData.requirements.minSemester || '1',
          duration: formData.requirements.duration
        },
      };

      // Update the internship using the service
      await updateInternship(token, internshipId, internshipData);

      // Hide the confirmation dialog and show success popup
      setShowSubmitConfirmDialog(false);
      setShowSuccessPopup(true);
    } catch (error) {
      console.error('Error updating internship:', error);
      alert('Terjadi kesalahan saat memperbarui program magang. Silakan coba lagi.');
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f59e0b]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="flex justify-center items-center min-h-screen">
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <p className={`text-red-500 ${darkMode ? 'text-red-400' : ''}`}>{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className={`mt-4 px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            >
              Kembali ke Dashboard
            </button>
          </div>
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
              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Edit Program Magang</div>
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
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}`}>P</span>
                </div>
                <span className={`hidden md:block ${darkMode ? 'text-white' : 'text-gray-700'}`}>PT Maju Jaya</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Main Content */}
        <main className="flex-1 p-6 pt-12">
          <div className="max-w-[1200px] mx-auto">
            <div className="mb-8">
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Edit Program Magang</h1>
              <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Perbarui informasi program magang untuk menarik kandidat terbaik
              </p>
            </div>

            <div className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="title" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Judul Posisi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border ${darkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                        }`}
                      placeholder="Contoh: Program Magang Pemasaran Digital"
                    />
                  </div>

                  <div>
                    <label htmlFor="jobType" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Tipe Magang <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="jobType"
                      name="jobType"
                      value={formData.jobType}
                      onChange={(e) => setFormData({ ...formData, jobType: e.target.value as 'wfo' | 'wfh' | 'hybrid' })}
                      required
                      className={`w-full px-4 py-3 rounded-lg border ${darkMode
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                        }`}
                    >
                      <option value="wfo">WFO (Work From Office)</option>
                      <option value="wfh">WFH (Work From Home)</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="location" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Lokasi
                    </label>
                    <select
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border ${darkMode
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                        }`}
                    >
                      <option value="">Pilih Lokasi</option>
                      <option value="Jakarta">Jakarta</option>
                      <option value="Surabaya">Surabaya</option>
                      <option value="Bandung">Bandung</option>
                      <option value="Yogyakarta">Yogyakarta</option>
                      <option value="Medan">Medan</option>
                      <option value="Makassar">Makassar</option>
                      <option value="Semarang">Semarang</option>
                      <option value="Malang">Malang</option>
                      <option value="Bali">Bali</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="closingDate" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Batas Akhir Pendaftaran <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="closingDate"
                      name="closingDate"
                      value={formData.closingDate}
                      onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                      required
                      className={`w-full px-4 py-3 rounded-lg border ${darkMode
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                        }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="duration" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Durasi Magang (bulan) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      required
                      min="1"
                      className={`w-full px-4 py-3 rounded-lg border ${darkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                        }`}
                      placeholder="Contoh: 3, 6"
                    />
                  </div>

                  <div>
                    <label className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Status Gaji
                    </label>
                    <div className="flex space-x-4">
                      <label
                        className={`flex items-center px-4 py-3 rounded-lg border cursor-pointer transition-colors w-full text-center ${!formData.isPaid
                            ? (darkMode ? 'border-[#f59e0b] bg-[#f59e0b]/10 text-[#f59e0b]' : 'border-[#f59e0b] bg-[#fef3c7] text-[#f59e0b]')
                            : (darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-white text-gray-700')
                          }`}
                      >
                        <input
                          type="radio"
                          name="isPaid"
                          checked={!formData.isPaid}
                          onChange={() => handleCheckboxChange('isPaid', false)}
                          className="hidden"
                        />
                        <span className="mx-auto font-medium">Unpaid</span>
                      </label>
                      <label
                        className={`flex items-center px-4 py-3 rounded-lg border cursor-pointer transition-colors w-full text-center ${formData.isPaid
                            ? (darkMode ? 'border-[#f59e0b] bg-[#f59e0b]/10 text-[#f59e0b]' : 'border-[#f59e0b] bg-[#fef3c7] text-[#f59e0b]')
                            : (darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-white text-gray-700')
                          }`}
                      >
                        <input
                          type="radio"
                          name="isPaid"
                          checked={formData.isPaid}
                          onChange={() => handleCheckboxChange('isPaid', true)}
                          className="hidden"
                        />
                        <span className="mx-auto font-medium">Paid</span>
                      </label>
                    </div>
                  </div>

                  {/* Active Status Toggle */}
                  <div>
                    <label className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Status Lowongan
                    </label>
                    <div className="flex space-x-4">
                      <label
                        className={`flex items-center px-4 py-3 rounded-lg border cursor-pointer transition-colors w-full text-center ${formData.is_active
                            ? (darkMode ? 'border-[#f59e0b] bg-[#f59e0b]/10 text-[#f59e0b]' : 'border-[#f59e0b] bg-[#fef3c7] text-[#f59e0b]')
                            : (darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-white text-gray-700')
                          }`}
                      >
                        <input
                          type="radio"
                          name="is_active"
                          value="true"
                          checked={formData.is_active === true}
                          onChange={(e) => handleCheckboxChange('is_active', e.target.value === 'true')}
                          className="hidden"
                        />
                        <span className="mx-auto font-medium">Aktif</span>
                      </label>
                      <label
                        className={`flex items-center px-4 py-3 rounded-lg border cursor-pointer transition-colors w-full text-center ${!formData.is_active
                            ? (darkMode ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-red-500 bg-red-100 text-red-500')
                            : (darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-white text-gray-700')
                          }`}
                      >
                        <input
                          type="radio"
                          name="is_active"
                          value="false"
                          checked={formData.is_active === false}
                          onChange={(e) => handleCheckboxChange('is_active', e.target.value === 'true')}
                          className="hidden"
                        />
                        <span className="mx-auto font-medium">Non-Aktif</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="description" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Deskripsi Pekerjaan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={5}
                    className={`w-full px-4 py-3 rounded-lg border ${darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                      }`}
                    placeholder="Jelaskan tentang program magang, tanggung jawab utama, dan pengalaman yang akan didapatkan oleh peserta magang..."
                  ></textarea>
                </div>

                {/* Salary Field - Only shown when isPaid is true */}
                {formData.isPaid && (
                  <div className="mb-6 p-4 rounded-lg border border-dashed border-[#f59e0b] bg-[#f59e0b]/10 dark:bg-[#f59e0b]/10">
                    <div>
                      <label htmlFor="salary" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Besaran Gaji <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="salary"
                        name="salary"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        required={formData.isPaid}
                        className={`w-full px-4 py-3 rounded-lg border ${darkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                          }`}
                        placeholder="Contoh: 1.500.000 IDR per bulan"
                      />
                      <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Format bebas, contoh: "Rp 1.500.000 per bulan"
                      </p>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Persyaratan <span className="text-red-500">*</span>
                  </h3>

                  {/* Majors Field */}
                  <div className="mb-4">
                    <label className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Jurusan (Bidang Studi)
                    </label>
                    <select
                      id="majorInput"
                      className={`w-full px-4 py-3 rounded-lg border ${darkMode
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                        }`}
                      value=""
                      onChange={(e) => {
                        if (e.target.value && !formData.requirements.majors.includes(e.target.value)) {
                          handleRequirementsChange('majors', [...formData.requirements.majors, e.target.value]);
                          // Reset selection after adding
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">Pilih Jurusan</option>
                      <option value="Teknik Informatika">Teknik Informatika</option>
                      <option value="Sistem Informasi">Sistem Informasi</option>
                      <option value="Teknik Elektro">Teknik Elektro</option>
                      <option value="Teknik Industri">Teknik Industri</option>
                      <option value="Desain Komunikasi Visual">Desain Komunikasi Visual</option>
                      <option value="Ilmu Komunikasi">Ilmu Komunikasi</option>
                      <option value="Manajemen">Manajemen</option>
                      <option value="Akuntansi">Akuntansi</option>
                      <option value="Teknik Mesin">Teknik Mesin</option>
                      <option value="Psikologi">Psikologi</option>
                      <option value="Hukum">Hukum</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.requirements.majors.map((major, index) => (
                        <div
                          key={index}
                          className={`flex items-center px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
                            }`}
                        >
                          {major}
                          <button
                            type="button"
                            className="ml-2 text-red-500 hover:text-red-700"
                            onClick={() => removeMajor(index)}
                            tabIndex={-1}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills Field */}
                  <div className="mb-4">
                    <label className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Keterampilan
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        id="skillInput"
                        className={`flex-1 px-4 py-3 rounded-l-lg border ${darkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                          }`}
                        placeholder="Tambahkan keterampilan (misal: JavaScript, Desain Grafis)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                            e.preventDefault();
                            addSkill((e.target as HTMLInputElement).value.trim());
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="bg-[#f59e0b] text-white px-4 rounded-r-lg font-medium hover:bg-[#d97706] transition-colors"
                        onClick={() => {
                          const input = document.getElementById('skillInput') as HTMLInputElement;
                          if (input && input.value.trim()) {
                            addSkill(input.value.trim());
                            input.value = '';
                          }
                        }}
                      >
                        Tambah
                      </button>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.requirements.skills.map((skill, index) => (
                        <div
                          key={index}
                          className={`flex items-center px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
                            }`}
                        >
                          {skill}
                          <button
                            type="button"
                            className="ml-2 text-red-500 hover:text-red-700"
                            onClick={() => removeSkill(index)}
                            tabIndex={-1}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GPA Field */}
                  <div className="mb-4">
                    <label htmlFor="gpa" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      IPK Minimal
                    </label>
                    <input
                      type="number"
                      id="gpa"
                      step="0.01"
                      min="0"
                      max="4"
                      value={formData.requirements.gpa}
                      onChange={(e) => handleRequirementsChange('gpa', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${darkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                        }`}
                      placeholder="Contoh: 3.0"
                    />
                  </div>

                  {/* Minimal Semester Field */}
                  <div className="mb-4">
                    <label htmlFor="minSemester" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Minimal Semester
                    </label>
                    <select
                      id="minSemester"
                      value={formData.requirements.minSemester}
                      onChange={(e) => handleRequirementsChange('minSemester', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${darkMode
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                        }`}
                    >
                      <option value="">Pilih Minimal Semester</option>
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                      <option value="3">Semester 3</option>
                      <option value="4">Semester 4</option>
                      <option value="5">Semester 5</option>
                      <option value="6">Semester 6</option>
                      <option value="7">Semester 7</option>
                      <option value="8">Semester 8</option>
                    </select>
                  </div>

                  {/* Other Requirements Field */}
                  <div>
                    <label htmlFor="otherRequirements" className={`block mb-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Persyaratan Lainnya
                    </label>
                    <textarea
                      id="otherRequirements"
                      value={formData.requirements.other}
                      onChange={(e) => handleRequirementsChange('other', e.target.value)}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg border ${darkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#f59e0b] focus:border-[#f59e0b]'
                        }`}
                      placeholder="Tambahkan persyaratan tambahan lainnya..."
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className={`px-6 py-3 rounded-lg font-medium ${darkMode
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-[#f59e0b] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#d97706] transition-colors"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>

      {/* Submission Confirmation Dialog */}
      {showSubmitConfirmDialog && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 shadow-lg w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Konfirmasi Pembaruan Magang
            </h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Apakah Anda yakin ingin memperbarui program magang ini? Pastikan semua informasi telah diperbarui dengan benar.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowSubmitConfirmDialog(false)}
                className={`px-4 py-2 rounded-lg font-medium ${darkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleFormSubmit();
                }}
                className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                Ya, Perbarui Program Magang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 shadow-lg w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className={`text-lg font-bold mt-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Berhasil!
              </h3>
              <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Program magang berhasil diperbarui.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessPopup(false);
                    // Redirect to dashboard after success
                    router.push('/dashboard');
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${darkMode
                      ? 'bg-[#f59e0b] text-white hover:bg-[#d97706]'
                      : 'bg-[#f59e0b] text-white hover:bg-[#d97706]'
                    }`}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EditInternshipPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <EditInternshipContent />
  </Suspense>
);

export default EditInternshipPage;