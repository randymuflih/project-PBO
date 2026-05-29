'use client';

// app/components/auth/CompanyLoginForm.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, LoginResponse } from '../../lib/apiService';
import { useAuth } from '../../lib/authContext';
import Link from 'next/link';

const CompanyLoginForm = () => {
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
    setLoading(true);
    // TEMPORARY: bypass API, langsung login sebagai perusahaan demo
    login(
      { id: 'demo-company', email: formData.email || 'perusahaan@demo.com', role: 'company' },
      'demo-token'
    );
    router.push('/dashboard');
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-center">Masuk Perusahaan</h2>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1">Email Perusahaan:</label>
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
          {loading ? 'Memasuki...' : 'Masuk Sebagai Perusahaan'}
        </button>
      </form>
      <p className="mt-4 text-center">
        Belum punya akun? <Link href="/register" className="text-blue-600 hover:underline font-medium">Daftar di sini</Link>
      </p>
      <p className="mt-2 text-center">
        <Link href="/login-student" className="text-blue-600 hover:underline font-medium">Masuk sebagai Mahasiswa</Link>
      </p>
    </>
  );
};

export default CompanyLoginForm;