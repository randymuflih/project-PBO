'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/authContext';

const CompanyLoginPage = () => {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    login(
      { id: 'demo-company', email: 'perusahaan@demo.com', role: 'company' },
      'demo-token'
    );
    router.push('/dashboard');
  }, []);

  return null;
};

export default CompanyLoginPage;