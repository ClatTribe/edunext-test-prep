"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import TestSolution from '../components/TestSolution';

export default function SolutionPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId;
  
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessionId = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: queryError } = await supabase
          .from('test_attempts')
          .select('session_id')
          .eq('id', attemptId)
          .maybeSingle();

        if (queryError) throw new Error(`Database error: ${queryError.message}`);
        if (!data) throw new Error('Test attempt not found.');
        if (!data.session_id) throw new Error('Session data is missing.');

        setSessionId(data.session_id);
        
      } catch (err) {
        console.error('💥 Error fetching session:', err);
        setError(err.message || 'Failed to load test data');
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchSessionId();
    } else {
      setError('Invalid attempt ID');
      setLoading(false);
    }
  }, [attemptId]);

  const navigateToAnalysis = () => {
    router.push(`/results/${attemptId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#060818' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#F59E0B] mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Solutions...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#060818' }}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-2xl font-bold mb-3">Unable to Load Solutions</h2>
          <p className="text-gray-400 mb-6">{error || 'Failed to load test data'}</p>
          <button
            onClick={() => router.push(`/results/${attemptId}`)}
            className="w-full px-6 py-3 bg-[#F59E0B] text-white rounded-lg font-semibold hover:bg-[#D97706] transition-colors"
          >
            ← Back to Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#060818' }}>
      <TestSolution 
        attemptId={attemptId}
        sessionId={sessionId}
        onNavigateToAnalysis={navigateToAnalysis}
      />
    </div>
  );
}