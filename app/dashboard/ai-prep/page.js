"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnalyticsView from '../../components/AnalyticsView';
import Dashboard from './components/Dashboard'; 
import { supabase } from '@/lib/supabase';

export default function AIPrepPage() {
  const router = useRouter();
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserAnalytics();
  }, []);

  const fetchUserAnalytics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_responses')
        .select('*');

      if (error) throw error;

      if (data) {
        const transformedData = transformData(data);
        setStats(transformedData);
      }
    } catch (err) {
      console.error("Error fetching analytics:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step: Updated Transform Logic for all Sidebar Stats
  const transformData = (rawData) => {
    if (!rawData || rawData.length === 0) return null;

    // 1. Sidebar Stats Calculations
    const totalSolved = rawData.length;
    
    // Avg Session Time calculation
    const sessions = [...new Set(rawData.map(r => r.session_id))];
    const totalTimeSpent = rawData.reduce((acc, curr) => acc + (curr.time_spent_seconds || 0), 0);
    const avgSessionMinutes = sessions.length > 0 
      ? Math.round((totalTimeSpent / sessions.length) / 60) 
      : 0;

    // Rating & Rating Change (+240 logic based on last performance)
    const totalMarks = rawData.reduce((acc, curr) => acc + (curr.marks_obtained || 0), 0);
    const lastMarks = rawData.slice(-10).reduce((acc, curr) => acc + (curr.marks_obtained || 0), 0);
    const ratingChange = lastMarks >= 0 ? `+${Math.round(lastMarks * 5)}` : `${Math.round(lastMarks * 5)}`;

    // 2. Subject Analytics Grouping
    const subjects = [...new Set(rawData.map(item => item.subject_name))];
    const subjectAnalytics = subjects.map(subName => {
      const subRows = rawData.filter(r => r.subject_name === subName);
      
      // Accuracy Trend
      const trendMap = {};
      subRows.forEach(row => {
        const date = new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!trendMap[date]) trendMap[date] = { correct: 0, total: 0 };
        trendMap[date].total++;
        if (row.is_correct === true || row.is_correct === 'True') trendMap[date].correct++;
      });

      const accuracyTrend = Object.keys(trendMap).map(date => ({
        date,
        value: Math.round((trendMap[date].correct / trendMap[date].total) * 100)
      }));

      // Topics Difficulty Grid
      const difficulties = [...new Set(subRows.map(r => r.difficulty))];
      const topics = difficulties.map(diff => {
        const diffRows = subRows.filter(r => r.difficulty === diff);
        const correct = diffRows.filter(r => (r.is_correct === true || r.is_correct === 'True')).length;
        return {
          topic: diff ? diff.charAt(0).toUpperCase() + diff.slice(1) : "General",
          avgTime: Math.round(diffRows.reduce((acc, curr) => acc + curr.time_spent_seconds, 0) / diffRows.length),
          accuracy: Math.round((correct / diffRows.length) * 100)
        };
      });

      return {
        subject: subName,
        accuracyTrend,
        topics
      };
    });

    // Final Object returned to AnalyticsView
    return {
      rating: 1200 + Math.round(totalMarks),
      ratingChange: ratingChange,
      globalPercentile: "99.2", // Mocked value
      totalSolved: totalSolved.toLocaleString(),
      avgSessionTime: `${avgSessionMinutes} mins`,
      subjectAnalytics
    };
  };

  if (loading) return <div className="min-h-screen bg-[#0E172A] flex items-center justify-center text-white">Loading your performance data...</div>;
  
  if (showAnalytics && stats) {
    return (
      <AnalyticsView 
        stats={stats} 
        onBack={() => setShowAnalytics(false)} 
      />
    );
  }

  return (
    <div className="relative">
      <Dashboard onOpenAnalytics={() => setShowAnalytics(true)}/> 
    </div>
  );
}