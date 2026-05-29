'use client';

// app/components/auth/ProtectedRoute.tsx

import { useAuth } from '../../lib/authContext'; // Impor useAuth
import { useRouter } from 'next/navigation'; // Impor useRouter
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[]; // Array role yang diizinkan, misalnya ['student', 'company']. Jika undefined, semua role diperbolehkan setelah login.
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jika auth sedang dimuat, tidak melakukan apa-apa
    if (isLoading) {
      return;
    }

    // Jika tidak login, redirect ke login
    if (!user) {
      router.push('/login');
      return;
    }

    // Jika role tidak diizinkan, redirect atau tampilkan error
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Contoh: redirect ke halaman home atau tampilkan pesan
      router.push('/');
      return;
    }
  }, [user, isLoading, allowedRoles, router]);

  // Tunggu status auth dimuat
  if (isLoading) {
    return <div className="container mx-auto p-4">Memuat...</div>; // Atau komponen loading lain
  }

  // Jika tidak login atau role tidak diizinkan, tampilkan pesan loading untuk mencegah render
  if (!user || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    // Kita tidak perlu return apa-apa karena useEffect akan menangani redirect
    return <div className="container mx-auto p-4">Memproses...</div>;
  }

  // Jika lolos semua pengecekan, render komponen anak
  return <>{children}</>;
};

export default ProtectedRoute;