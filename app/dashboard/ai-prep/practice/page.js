'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PracticeConfig from '../components/practice/PracticeConfig'; // ✅ Correct relative path

export default function PracticePage() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        console.log('✅ User ID set:', user.id);
      } else {
        console.error('❌ No user found');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0E172A]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <PracticeConfig 
      currentUserId={currentUserId}
      stats={{}}
    />
  );
}
