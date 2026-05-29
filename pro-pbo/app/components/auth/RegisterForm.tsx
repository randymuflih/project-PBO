'use client';

// app/components/auth/RegisterForm.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Untuk redirect setelah register
import { registerUser, RegisterData } from '../../lib/apiService';
import { useAuth } from '../../lib/authContext'; // Untuk login otomatis setelah register
import Link from 'next/link'; // Untuk link ke login

const RegisterForm = () => {
  const [formData, setFormData] = useState<RegisterData>({ // Gunakan type RegisterData langsung
    email: '',
    password: '',
    password_confirmation: '', // Gunakan nama field yang benar
    role: 'student' as const, // Default role
    full_name: '',   // Tambahkan field sesuai kebutuhan
    company_name: '', // Tambahkan field sesuai kebutuhan
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth(); // Dapatkan fungsi login dari context

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validasi sederhana di frontend (sebaiknya tetap divalidasi di backend)
    if (formData.password !== formData.password_confirmation) { // Gunakan nama field yang benar
      setError('Password dan konfirmasi password harus sama.');
      setLoading(false);
      return;
    }

    // Buat data untuk dikirim, sesuaikan dengan yang diharapkan oleh backend RegisterRequest
    const dataToSend = {
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.password_confirmation, // Gunakan nama field yang benar
      role: formData.role,
      ...(formData.role === 'student' && { full_name: formData.full_name }),
      ...(formData.role === 'company' && { company_name: formData.company_name }),
      // Jangan kirim field yang tidak diharapkan oleh backend
    };

    try {
      const user = await registerUser(dataToSend);
      // Jika register berhasil, login otomatis
      // Dalam implementasi Sanctum kita, register tidak otomatis memberi token.
      // Login perlu dipanggil setelah register.
      // Kita asumsikan register hanya membuat user dan profil, dan kita perlu login.
      // Jika backend mengembalikan token di register, kita bisa langsung login(user, token_dari_register).
      // Untuk sekarang, kita panggil login setelah register.
      // CARA LAIN: Hanya register, lalu arahkan ke halaman login.
      // Kita ikuti cara kedua dulu untuk kesederhanaan.
      alert('Registrasi berhasil! Silakan login.');
      // Redirect ke halaman login yang sesuai dengan role yang didaftarkan
      if (formData.role === 'student') {
        router.push('/login-student');
      } else if (formData.role === 'company') {
        router.push('/login-company');
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Tampilkan field tambahan berdasarkan role
  const renderAdditionalFields = () => {
    if (formData.role === 'student') {
      return (
        <div>
          <label htmlFor="full_name" className="block mb-1">Nama Lengkap:</label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded mb-4"
          />
        </div>
      );
    } else if (formData.role === 'company') {
      return (
        <div>
          <label htmlFor="company_name" className="block mb-1">Nama Perusahaan:</label>
          <input
            type="text"
            id="company_name"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded mb-4"
          />
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-center">Daftar</h2>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="password_confirmation" className="block mb-1">Konfirmasi Password:</label>
          <input
            type="password"
            id="password_confirmation"
            name="password_confirmation" // Gunakan name yang benar
            value={formData.password_confirmation} // Gunakan value yang benar
            onChange={handleChange}
            required
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="role" className="block mb-1">Peran:</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="student">Mahasiswa</option>
            <option value="company">Perusahaan</option>
            <option value="admin">Admin (jika diperlukan)</option>
          </select>
        </div>
        {renderAdditionalFields()}
        <button
          type="submit"
          disabled={loading}
          className={`bg-[#f59e0b] text-white p-2 rounded w-full ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#d97706] focus:ring-2 focus:outline-none focus:ring-[#f59e0b]'}`}
        >
          {loading ? 'Mendaftar...' : 'Daftar'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <p>
          Sudah punya akun? <Link href="/login" className="text-blue-600 hover:underline font-medium">Masuk di sini</Link>
        </p>
        <p className="mt-2">
          <Link href="/login-student" className="text-blue-600 hover:underline font-medium">Login Mahasiswa</Link>
          {' | '}
          <Link href="/login-company" className="text-blue-600 hover:underline font-medium">Login Perusahaan</Link>
        </p>
      </div>
    </>
  );
};

export default RegisterForm;