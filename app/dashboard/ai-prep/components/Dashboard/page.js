'use client'

import { useState, useEffect } from 'react';
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

      setCurrentUserId(user.id);

      // TODO: Fetch actual stats from Supabase
      // Example queries you'll need to implement:
      
      // 1. Fetch user stats
      // const { data: userStats } = await supabase
      //   .from('user_stats')
      //   .select('*')
      //   .eq('user_id', user.id)
      //   .single();

      // 2. Fetch activity heatmap
      // const { data: activities } = await supabase
      //   .from('user_activities')
      //   .select('date, question_count')
      //   .eq('user_id', user.id)
      //   .order('date', { ascending: false })
      //   .limit(70);

      // 3. Fetch subject analytics
      // const { data: subjects } = await supabase
      //   .from('subject_analytics')
      //   .select('*, topics(*)')
      //   .eq('user_id', user.id);

      // 4. Fetch top performers
      // const { data: topUsers } = await supabase
      //   .from('users')
      //   .select('username, rating')
      //   .order('rating', { ascending: false })
      //   .limit(5);

      // For now, set empty stats
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

  const handleNavigate = (viewState, examType) => {
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
  };

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

  return <Dashboard stats={stats} onNavigate={handleNavigate} currentUserId={currentUserId} />;
}