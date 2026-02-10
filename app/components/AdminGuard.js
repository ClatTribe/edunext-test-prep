'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminGuard({ children }) {
  const router = useRouter();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn');
      if (loggedIn !== 'true') {
        router.replace('/admi'); // Redirect to login if not authenticated
      } else {
        setStatus('authorized');
      }
    };

    checkAuth();
  }, [router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-[#ff8c00] animate-pulse font-bold">Verifying Session...</div>
      </div>
    );
  }

  return children;
}