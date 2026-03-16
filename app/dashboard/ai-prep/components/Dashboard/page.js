'use client'

import { useState, useEffect, useCallback } from 'react'; // ✅ Add useCallback
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Dashboard from '../Dashboard';

export default function DashboardPage() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const [stats, setStats] = useState({
    streak: 0,
    rating: 0,
    league: 'Bronze',
    globalRank: null,
    leagueProgress: 0,
    preparednessScore: 0,
    activityHeatmap: {},
    subjectAnalytics: [],
    topPerformers: [],
    recommendedStudy: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No user found');
        setLoading(false);
        return;
      }

      console.log('✅ User ID fetched:', user.id); // ✅ Add this
      setCurrentUserId(user.id);

      setStats({
        streak: 0,
        rating: 0,
        league: 'Bronze',
        globalRank: null,
        leagueProgress: 0,
        preparednessScore: 0,
        activityHeatmap: {},
        subjectAnalytics: [],
        topPerformers: [],
        recommendedStudy: []
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  // ✅✅ WRAP handleNavigate with useCallback ✅✅
  const handleNavigate = useCallback((viewState, examType) => {
    console.log('🔥 Navigate clicked:', viewState, examType);
    
    switch(viewState) {
      case 'ANALYTICS':
        console.log('Going to analytics');
        router.push('/dashboard/ai-prep/components/analytics');
        break;
      case 'PRACTICE_CONFIG':
        console.log('Going to practice');
        router.push('/dashboard/ai-prep/components/practice');
        break;
      case 'TEST':
        console.log('Going to exam with type:', examType);
        router.push(`/dashboard/ai-prep/components/exam?type=${examType || 'JEE_MAIN'}`);
        break;
      default:
        console.log('Unknown view state:', viewState);
    }
  }, [router]); // ✅ Add router as dependency

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0E172A]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  console.log('📤 Passing to Dashboard - User ID:', currentUserId); // ✅ Add this

  return <Dashboard stats={stats} onNavigate={handleNavigate} currentUserId={currentUserId} />;
}