import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // Create a Supabase client with the user's token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = user.id;

    // Fetch user responses (question-level data)
    const { data: responses, error: respError } = await supabase
      .from('user_responses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (respError) throw respError;

    // Fetch test attempts (test-level data)
    const { data: attempts, error: attError } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (attError) throw attError;

    // Build comprehensive performance summary
    const totalQuestions = responses?.length || 0;
    const correctAnswers = responses?.filter(r => r.is_correct === true || r.is_correct === 'True').length || 0;
    const incorrectAnswers = responses?.filter(r => r.is_correct === false || r.is_correct === 'False').length || 0;
    const overallAccuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Total marks and rating
    const totalMarks = responses?.reduce((acc, r) => acc + (r.marks_obtained || 0), 0) || 0;
    const rating = 1200 + Math.round(totalMarks);

    // Subject-wise breakdown
    const subjects = [...new Set(responses?.map(r => r.subject_name).filter(Boolean) || [])];
    const subjectPerformance = subjects.map(subject => {
      const subRows = responses.filter(r => r.subject_name === subject);
      const correct = subRows.filter(r => r.is_correct === true || r.is_correct === 'True').length;
      const totalTime = subRows.reduce((acc, r) => acc + (r.time_spent_seconds || 0), 0);
      const avgTimePerQuestion = subRows.length > 0 ? Math.round(totalTime / subRows.length) : 0;

      // Difficulty breakdown
      const difficulties = [...new Set(subRows.map(r => r.difficulty).filter(Boolean))];
      const difficultyBreakdown = difficulties.map(diff => {
        const diffRows = subRows.filter(r => r.difficulty === diff);
        const diffCorrect = diffRows.filter(r => r.is_correct === true || r.is_correct === 'True').length;
        return {
          level: diff,
          total: diffRows.length,
          correct: diffCorrect,
          accuracy: Math.round((diffCorrect / diffRows.length) * 100),
          avgTime: Math.round(diffRows.reduce((a, r) => a + (r.time_spent_seconds || 0), 0) / diffRows.length)
        };
      });

      return {
        subject,
        totalQuestions: subRows.length,
        correct,
        accuracy: Math.round((correct / subRows.length) * 100),
        avgTimePerQuestion,
        difficultyBreakdown
      };
    });

    // Recent test attempts (last 10)
    const recentTests = (attempts || []).slice(0, 10).map(a => ({
      testId: a.test_id || a.session_id,
      date: a.created_at,
      correct: a.correct_answers,
      incorrect: a.incorrect_answers,
      unattempted: a.unattempted,
      marks: a.obtained_marks,
      accuracy: a.accuracy
    }));

    // Improvement trend (last 10 vs previous 10 responses)
    const last10 = (responses || []).slice(0, 10);
    const prev10 = (responses || []).slice(10, 20);
    const getAcc = (arr) => arr.length ? (arr.filter(r => r.is_correct === true || r.is_correct === 'True').length / arr.length) * 100 : 0;
    const recentAccuracy = getAcc(last10);
    const previousAccuracy = getAcc(prev10);
    const improvementTrend = prev10.length > 0 ? +(recentAccuracy - previousAccuracy).toFixed(1) : 0;

    // Weak areas (subjects/difficulties with < 50% accuracy)
    const weakAreas = [];
    subjectPerformance.forEach(s => {
      if (s.accuracy < 50) {
        weakAreas.push({ area: s.subject, accuracy: s.accuracy, type: 'subject' });
      }
      s.difficultyBreakdown.forEach(d => {
        if (d.accuracy < 50 && d.total >= 3) {
          weakAreas.push({ area: `${s.subject} - ${d.level}`, accuracy: d.accuracy, type: 'difficulty' });
        }
      });
    });

    // Sessions and time stats
    const sessions = [...new Set(responses?.map(r => r.session_id).filter(Boolean) || [])];
    const totalTimeSpent = responses?.reduce((acc, r) => acc + (r.time_spent_seconds || 0), 0) || 0;
    const avgSessionTime = sessions.length > 0 ? Math.round((totalTimeSpent / sessions.length) / 60) : 0;

    const performanceSummary = {
      user: {
        id: userId,
        name: user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split('@')[0],
        email: user.email
      },
      overview: {
        totalQuestions,
        correctAnswers,
        incorrectAnswers,
        overallAccuracy,
        totalMarks,
        rating,
        totalSessions: sessions.length,
        avgSessionTimeMinutes: avgSessionTime,
        totalTimeSpentMinutes: Math.round(totalTimeSpent / 60),
        improvementTrend
      },
      subjectPerformance,
      recentTests,
      weakAreas,
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json(performanceSummary);
  } catch (error) {
    console.error('Error fetching user performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data', details: error.message },
      { status: 500 }
    );
  }
}

// CORS support for AI Tutor cross-origin requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
