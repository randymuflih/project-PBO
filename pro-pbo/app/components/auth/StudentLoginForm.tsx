'use client';

// app/components/auth/StudentLoginForm.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, LoginResponse } from '../../lib/apiService';
import { useAuth } from '../../lib/authContext';
import Link from 'next/link';

const StudentLoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

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
      
      // Verify that user is a student before allowing login
      if (result.user.role !== 'student') {
        setError('Akun ini bukan milik mahasiswa. Silakan gunakan login perusahaan.');
        return;
      }
      
      // If login successful and user is student, save user and token to context and localStorage
      login(result.user, result.token);
      // Redirect to student dashboard
      router.push('/dashboard-student');
    } catch (err) {
      console.error('Student login error:', err);
      setError((err as Error).message || 'Gagal masuk. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-center">Masuk Mahasiswa</h2>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1">Email Mahasiswa:</label>
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
        <button
          type="submit"
          disabled={loading}
          className={`bg-[#f59e0b] text-white p-2 rounded w-full ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#d97706] focus:ring-2 focus:outline-none focus:ring-[#f59e0b]'}`}
        >
          {loading ? 'Memasuki...' : 'Masuk Sebagai Mahasiswa'}
        </button>
      </form>
      <p className="mt-4 text-center">
        Belum punya akun? <Link href="/register" className="text-blue-600 hover:underline font-medium">Daftar di sini</Link>
      </p>
      <p className="mt-2 text-center">
        <Link href="/login-company" className="text-blue-600 hover:underline font-medium">Masuk sebagai Perusahaan</Link>
      </p>
    </>
  );
};

export default StudentLoginForm;