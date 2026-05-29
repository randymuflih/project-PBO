'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import { useTheme } from '../../lib/ThemeContext';
import { getStudentProfile } from '../../lib/apiService';
import { getStudentDocuments, uploadStudentDocument, deleteStudentDocument } from '../../services/internshipService';
import Sidebar from '../../components/Sidebar';

type DocumentType = 'Resume' | 'Cover Letter' | 'Transcript' | 'Certificate' | 'Portfolio' | 'Other';
type Document = {
  id: string; // Changed to string to match backend API
  name: string;
  type: DocumentType;
  size: string;
  uploadDate: string;
  description?: string;
  downloadUrl?: string;
  fileUrl?: string;
  fileType?: string;
};

const DocumentsPage = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filter, setFilter] = useState<DocumentType | 'All'>('All');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentType, setDocumentType] = useState<'resume' | 'cover_letter' | 'transcript' | 'certificate' | 'portfolio' | 'other'>('resume');
  const [documentDescription, setDocumentDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuth(); // Get the authentication token



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

  // Fetch documents from API
  useEffect(() => {
    const fetchDocuments = async () => {
      // Only proceed if we have a valid token
      if (!token || token.trim() === '') {
        console.warn('No authentication token available, skipping fetch');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedDocuments = await getStudentDocuments(token);
        setDocuments(fetchedDocuments);
      } catch (err: any) {
        // Safe error logging
        if (err && typeof err === 'object' && err.message) {
          console.error('Error fetching documents:', err.message);
        } else {
          console.error('Error fetching documents:', String(err || 'Unknown error'));
        }

        // Provide user-friendly error message
        let errorMessage = 'Gagal memuat dokumen. Silakan coba lagi nanti.';
        if (err && typeof err === 'object' && err.message && typeof err.message === 'string') {
          if (err.message.includes('Unauthenticated')) {
            errorMessage = 'Sesi Anda telah habis. Silakan login kembali.';
          } else if (err.message.includes('500')) {
            errorMessage = 'Kesalahan server saat memuat dokumen. Silakan coba lagi nanti.';
          }
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [token]); // Dependency on token so it re-fetches when token changes

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle document upload
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Silakan pilih file terlebih dahulu');
      return;
    }

    if (!token) {
      alert('Silakan login terlebih dahulu');
      return;
    }

    try {
      // Create FormData object to upload file
      const formData = new FormData();
      formData.append('file', selectedFile);
      // Use documentTitle if available, otherwise use the file name. If description is provided, append it to the title.
      let finalTitle = documentTitle || selectedFile.name;
      if (documentDescription && documentDescription.trim() !== '') {
        finalTitle = finalTitle + (documentTitle ? ': ' : ' - ') + documentDescription;
      }
      formData.append('title', finalTitle);
      formData.append('type', documentType);

      // Call the upload API
      const uploadedDocument = await uploadStudentDocument(token, formData);

      // Add the new document to the list
      setDocuments([uploadedDocument, ...documents]);
      setUploadModalOpen(false);
      setSelectedFile(null);
      setDocumentTitle('');
      setDocumentDescription('');
      alert('Dokumen berhasil diunggah!');
    } catch (error: any) {
      // Safe error logging to avoid potential console errors
      if (error && typeof error === 'object' && error.message) {
        console.error('Error uploading document:', error.message);
      } else {
        console.error('Error uploading document:', String(error || 'Unknown error'));
      }

      // Provide user-friendly error message
      let errorMessage = 'Gagal mengunggah dokumen. Silakan coba lagi.';
      if (error && typeof error === 'object' && error.message && typeof error.message === 'string') {
        if (error.message.includes('Unauthenticated')) {
          errorMessage = 'Sesi Anda telah habis. Silakan login kembali.';
        } else if (error.message.includes('413')) {
          errorMessage = 'Ukuran file terlalu besar. Silakan pilih file dengan ukuran maksimal 10MB.';
        } else if (error.message.includes('422')) {
          errorMessage = 'Format file tidak valid. Silakan unggah file PDF, JPG, JPEG, PNG, DOC, atau DOCX.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Kesalahan server saat mengunggah dokumen. Silakan coba lagi nanti.';
        }
      }
      alert(errorMessage);
    }
  };

  // Handle document deletion
  const handleDelete = async (docId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
      return;
    }

    if (!token) {
      alert('Silakan login terlebih dahulu');
      return;
    }

    try {
      // Call the delete API
      await deleteStudentDocument(token, docId);

      // Remove the deleted document from the list
      setDocuments(documents.filter(doc => doc.id !== docId));
      alert('Dokumen berhasil dihapus!');
    } catch (error: any) {
      // Safe error logging to avoid potential console errors
      if (error && typeof error === 'object' && error.message) {
        console.error('Error deleting document:', error.message);
      } else {
        console.error('Error deleting document:', String(error || 'Unknown error'));
      }

      // Provide user-friendly error message
      let errorMessage = 'Gagal menghapus dokumen. Silakan coba lagi.';
      if (error && typeof error === 'object' && error.message && typeof error.message === 'string') {
        if (error.message.includes('Unauthenticated')) {
          errorMessage = 'Sesi Anda telah habis. Silakan login kembali.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Dokumen tidak ditemukan. Mungkin sudah dihapus sebelumnya.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Kesalahan server saat menghapus dokumen. Silakan coba lagi nanti.';
        }
      }
      alert(errorMessage);
    }
  };

  // Function to convert backend document type to frontend display type
  const convertBackendTypeToFrontend = (backendType: string): DocumentType => {
    if (!backendType) return 'Other';

    const typeUpper = backendType.toUpperCase();
    if (typeUpper.includes('RESUME') || typeUpper.includes('CV')) {
      return 'Resume';
    } else if (typeUpper.includes('COVER') && typeUpper.includes('LETTER')) {
      return 'Cover Letter';
    } else if (typeUpper.includes('TRANSCRIPT')) {
      return 'Transcript';
    } else if (typeUpper.includes('CERTIFIC')) {
      return 'Certificate';
    } else if (typeUpper.includes('PORTFOLIO') || typeUpper.includes('IMAGE') || typeUpper.includes('PHOTO')) {
      return 'Portfolio';
    } else {
      return 'Other';
    }
  };

  // Filter documents based on selected filter
  const filteredDocuments = filter === 'All'
    ? documents
    : documents.filter(doc => {
      const frontendType = convertBackendTypeToFrontend(doc.type);
      return frontendType === filter;
    });


  // Get icon based on document type
  const getDocumentIcon = (type: DocumentType) => {
    // Convert the type to uppercase for comparison
    const typeUpper = (type || '').toUpperCase();

    if (typeUpper.includes('RESUME') || typeUpper.includes('CV')) {
      return '📄';
    } else if (typeUpper.includes('COVER') || typeUpper.includes('LETTER')) {
      return '✉️';
    } else if (typeUpper.includes('TRANSCRIPT')) {
      return '🎓';
    } else if (typeUpper.includes('CERTIFIC')) {
      return '🏆';
    } else if (typeUpper.includes('PORTFOLIO') || typeUpper.includes('IMAGE') || typeUpper.includes('PHOTO')) {
      return '🖼️';
    } else {
      return '📋';
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const [userName, setUserName] = useState<string>('User');
  const [userEmail, setUserEmail] = useState<string>('user@example.com');
  const [userInitial, setUserInitial] = useState<string>('U');

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
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden mr-4"
              >
                <svg className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Dokumen Saya</div>
            </div>
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
        {/* Sidebar */}
        {(sidebarOpen || (typeof window !== "undefined" && window.innerWidth >= 768)) && (
          <div className="hidden md:block">
            <Sidebar darkMode={darkMode} userProfile={{ name: userName, email: userEmail }} />
          </div>
        )}

        {/* Mobile sidebar overlay */}
        {sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768 && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768 && (
          <div className="fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] md:hidden">
            <Sidebar darkMode={darkMode} userProfile={{ name: userName, email: userEmail }} />
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${sidebarOpen ? 'md:ml-64' : ''} p-6 pt-12`}>
          <div className="max-w-[1200px] mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dokumen Saya</h1>
              <button
                onClick={() => setUploadModalOpen(true)}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white flex items-center`}
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Unggah Dokumen
              </button>
            </div>

            {/* Filters */}
            <div className={`rounded-xl p-6 shadow mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('All')}
                  className={`px-4 py-2 rounded-lg ${filter === 'All' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilter('Resume')}
                  className={`px-4 py-2 rounded-lg ${filter === 'Resume' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
                >
                  Resume
                </button>
                <button
                  onClick={() => setFilter('Cover Letter')}
                  className={`px-4 py-2 rounded-lg ${filter === 'Cover Letter' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
                >
                  Surat Lamaran
                </button>
                <button
                  onClick={() => setFilter('Transcript')}
                  className={`px-4 py-2 rounded-lg ${filter === 'Transcript' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
                >
                  Transkrip
                </button>
                <button
                  onClick={() => setFilter('Certificate')}
                  className={`px-4 py-2 rounded-lg ${filter === 'Certificate' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
                >
                  Sertifikat
                </button>
                <button
                  onClick={() => setFilter('Portfolio')}
                  className={`px-4 py-2 rounded-lg ${filter === 'Portfolio' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
                >
                  Portofolio
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Menemukan <span className="font-semibold">{filteredDocuments.length}</span> dokumen
              </p>
            </div>

            {/* Documents List */}
            <div className="space-y-4">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map(doc => (
                  <div
                    key={doc.id}
                    className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start md:items-center mb-4 md:mb-0">
                        <div className={`text-3xl mr-4 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                          {getDocumentIcon(doc.type)}
                        </div>
                        <div>
                          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{doc.name}</h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{doc.description || 'Tidak ada deskripsi'}</p>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm">
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Jenis: {doc.type}</span>
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ukuran: {doc.size}</span>
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tanggal: {formatDate(doc.uploadDate)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={async () => {
                            if (doc.id) {
                              if (token) {
                                try {
                                  // Create a temporary link with the authenticated request
                                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/documents/${doc.id}/serve`, {
                                    headers: {
                                      'Authorization': `Bearer ${token}`,
                                    },
                                  });

                                  if (response.ok) {
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    window.open(url, '_blank');
                                    window.URL.revokeObjectURL(url);
                                  } else {
                                    // Try to get error message from response
                                    let errorMsg = 'Gagal membuka dokumen. Silakan coba lagi.';
                                    try {
                                      const errorData = await response.json();
                                      if (errorData.message) {
                                        errorMsg = `Gagal membuka dokumen: ${errorData.message}`;
                                      }
                                    } catch (e) {
                                      // If response is not JSON, use status text
                                      errorMsg = `Gagal membuka dokumen (${response.status}): ${response.statusText}`;
                                    }
                                    alert(errorMsg);
                                  }
                                } catch (error: any) {
                                  // Safe error logging
                                  if (error && typeof error === 'object' && error.message) {
                                    console.error('Error fetching document:', error.message);
                                  } else {
                                    console.error('Error fetching document:', String(error || 'Unknown error'));
                                  }

                                  let errorMessage = 'Terjadi kesalahan saat mengambil dokumen. Silakan coba lagi.';
                                  if (error && typeof error === 'object' && error.message && typeof error.message === 'string') {
                                    if (error.message.includes('Unauthenticated')) {
                                      errorMessage = 'Sesi Anda telah habis. Silakan login kembali.';
                                    } else if (error.message.includes('404')) {
                                      errorMessage = 'Dokumen tidak ditemukan. Mungkin sudah dihapus.';
                                    } else if (error.message.includes('500')) {
                                      errorMessage = 'Kesalahan server saat mengambil dokumen. Silakan coba lagi nanti.';
                                    }
                                  }
                                  alert(errorMessage);
                                }
                              } else {
                                alert('Silakan login terlebih dahulu untuk melihat dokumen');
                              }
                            } else {
                              alert('ID dokumen tidak ditemukan');
                            }
                          }}
                          className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          Lihat
                        </button>
                        <button
                          onClick={async () => {
                            if (doc.id) {
                              if (token) {
                                try {
                                  // Create a temporary link with the authenticated request
                                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/documents/${doc.id}/serve`, {
                                    headers: {
                                      'Authorization': `Bearer ${token}`,
                                    },
                                  });

                                  if (response.ok) {
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);

                                    // Create a temporary link and trigger download
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = doc.name || 'document';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    window.URL.revokeObjectURL(url);
                                  } else {
                                    // Try to get error message from response
                                    let errorMsg = 'Gagal mengunduh dokumen. Silakan coba lagi.';
                                    try {
                                      const errorData = await response.json();
                                      if (errorData.message) {
                                        errorMsg = `Gagal mengunduh dokumen: ${errorData.message}`;
                                      }
                                    } catch (e) {
                                      // If response is not JSON, use status text
                                      errorMsg = `Gagal mengunduh dokumen (${response.status}): ${response.statusText}`;
                                    }
                                    alert(errorMsg);
                                  }
                                } catch (error: any) {
                                  // Safe error logging
                                  if (error && typeof error === 'object' && error.message) {
                                    console.error('Error downloading document:', error.message);
                                  } else {
                                    console.error('Error downloading document:', String(error || 'Unknown error'));
                                  }

                                  let errorMessage = 'Terjadi kesalahan saat mengunduh dokumen. Silakan coba lagi.';
                                  if (error && typeof error === 'object' && error.message && typeof error.message === 'string') {
                                    if (error.message.includes('Unauthenticated')) {
                                      errorMessage = 'Sesi Anda telah habis. Silakan login kembali.';
                                    } else if (error.message.includes('404')) {
                                      errorMessage = 'Dokumen tidak ditemukan. Mungkin sudah dihapus.';
                                    } else if (error.message.includes('500')) {
                                      errorMessage = 'Kesalahan server saat mengunduh dokumen. Silakan coba lagi nanti.';
                                    }
                                  }
                                  alert(errorMessage);
                                }
                              } else {
                                alert('Silakan login terlebih dahulu untuk mengunduh dokumen');
                              }
                            } else {
                              alert('ID dokumen tidak ditemukan');
                            }
                          }}
                          className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          Unduh
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-red-500 hover:bg-red-600'} text-white`}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`rounded-xl p-12 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                  <svg className={`w-16 h-16 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className={`mt-4 text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tidak ada dokumen ditemukan</h3>
                  <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Tidak ada dokumen yang cocok dengan filter Anda. Coba filter yang berbeda atau unggah dokumen baru.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/20 dark:bg-black/40 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-lg w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Unggah Dokumen Baru</h2>
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className={`text-2xl ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  &times;
                </button>
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Jenis Dokumen</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as 'resume' | 'cover_letter' | 'transcript' | 'certificate' | 'portfolio' | 'other')}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="resume">Resume</option>
                  <option value="cover_letter">Surat Lamaran</option>
                  <option value="transcript">Transkrip Nilai</option>
                  <option value="certificate">Sertifikat</option>
                  <option value="portfolio">Portofolio</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pilih File</label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="file-upload"
                    className={`cursor-pointer inline-flex flex-col items-center ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm">Klik untuk memilih file</span>
                    <p className="text-xs mt-1">PDF, DOC, JPG, PNG hingga 10MB</p>
                  </label>
                  {selectedFile && (
                    <p className={`mt-2 text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Deskripsi (Opsional)</label>
                <textarea
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  placeholder="Tambahkan deskripsi untuk dokumen ini..."
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Batal
                </button>
                <button
                  onClick={handleUpload}
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                >
                  Unggah
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;