"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import TestAnalysis from './components/TestAnalysis';

export default function ResultsPage() {
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

          console.log('🔍 Fetching data for Attempt ID:', attemptId);
        console.log('📦 Query Result:', data);
        console.log('❌ Query Error:', queryError);

        if (queryError) {
          console.error('❌ Supabase Error:', queryError);
          throw new Error(`Database error: ${queryError.message}`);
        }

        if (!data) {
          console.warn('⚠️ No test attempt found for ID:', attemptId);
          throw new Error('Test attempt not found. This attempt may not exist or has been deleted.');
        }

        if (!data.session_id) {
          console.warn('⚠️ session_id is null for attempt:', attemptId);
          throw new Error('Session data is missing. Please retake the test.');
        }

        console.log('✅ Session ID found:', data.session_id);
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

  const navigateToSolution = () => {
    router.push(`/results/${attemptId}/solution`);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#060818' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#F59E0B] mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Results...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#060818' }}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-2xl font-bold mb-3">Unable to Load Results</h2>
          <p className="text-gray-400 mb-6">{error || 'Failed to load test data'}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-[#F59E0B] text-white rounded-lg font-semibold hover:bg-[#D97706] transition-colors"
            >
              🔄 Retry
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/ai-prep'}
              className="w-full px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-[#D97706] transition-colors"
            >
              🏠 Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#060818' }}>
      <TestAnalysis 
        sessionIdProp={sessionId} 
        attemptId={attemptId}
        onNavigateToSolution={navigateToSolution}
      />
    </div>
  );
}