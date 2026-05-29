'use client';

// app/components/auth/LoginForm.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Untuk redirect setelah login
import { loginUser, LoginResponse } from '../../lib/apiService';
import { useAuth } from '../../lib/authContext'; // Untuk menyimpan state login
import Link from 'next/link'; // Untuk link ke register

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth(); // Dapatkan fungsi login dari context

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result: LoginResponse = await loginUser(formData.email, formData.password);
      // Jika login berhasil, simpan user dan token ke context dan localStorage
      login(result.user, result.token);
      // Redirect ke dashboard berdasarkan role
      if (result.user.role === 'student') {
        router.push('/dashboard-student');
      } else if (result.user.role === 'company') {
        router.push('/dashboard'); // Arahkan ke dashboard utama untuk company
      } else {
        // Redirect default atau tampilkan error jika role tidak dikenal
        router.push('/'); // Atau halaman error
      }
    } catch (err) {
      console.error('Login error:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <> {/* Gunakan Fragment untuk mengembalikan beberapa elemen tanpa div pembungkus */}
      <h2 className="text-2xl font-bold mb-4 text-center">Masuk Universal</h2> {/* Tambahkan text-center */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4"> {/* Tambahkan space-y-4 untuk jarak antar elemen form */}
        <div>
          <label htmlFor="email" className="block mb-1">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" // Tambahkan focus styles
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
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" // Tambahkan focus styles
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`bg-[#f59e0b] text-white p-2 rounded w-full ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#d97706] focus:ring-2 focus:outline-none focus:ring-[#f59e0b]'}`} // Tambahkan hover dan focus styles
        >
          {loading ? 'Memasuki...' : 'Masuk'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <p>
          Belum punya akun? <Link href="/register" className="text-blue-600 hover:underline font-medium">Daftar di sini</Link>
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

export default LoginForm;