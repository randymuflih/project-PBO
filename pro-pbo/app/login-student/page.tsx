'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/authContext';

const StudentLoginPage = () => {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    login(
      { id: 'demo-student', email: 'mahasiswa@demo.com', role: 'student' },
      'demo-token'
    );
    router.push('/dashboard-student');
  }, []);

  return null;
};

export default StudentLoginPage;