'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle, XCircle, MinusCircle, Target, Award, TrendingUp, 
  BookOpen, Layers, List, Zap, Trophy, Crown, Medal, Users, Star, Flame, 
  Activity, BarChart3, Timer, Clock, Eye, AlertCircle, Brain, Lightbulb,
  TrendingDown, BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon,
  ChevronUp, ChevronDown, Filter, Search, Download, Share2, Sparkles, Home, Info, ArrowRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, ScatterChart, Scatter, ZAxis
} from 'recharts';
import 'katex/dist/katex.min.css';

// MathRenderer component for LaTeX support
const MathRenderer = ({ children }) => {
  const contentRef = useRef(null);
  
  useEffect(() => {
    if (contentRef.current && typeof window !== 'undefined') {
      if (!window.katex) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
        script.onload = () => renderMath();
        document.head.appendChild(script);
      } else {
        renderMath();
      }
    }
  }, [children]);

  const renderMath = () => {
    if (!contentRef.current || !window.katex) return;
    
    const blockMathElements = contentRef.current.querySelectorAll('.block-math-placeholder');
    const inlineMathElements = contentRef.current.querySelectorAll('.inline-math-placeholder');
    
    blockMathElements.forEach(element => {
      const formula = element.getAttribute('data-formula');
      if (formula) {
        try {
          window.katex.render(decodeURIComponent(formula), element, { 
            displayMode: true, 
            throwOnError: false 
          });
        } catch (e) {
          console.error('KaTeX render error:', e);
        }
      }
    });
    
    inlineMathElements.forEach(element => {
      const formula = element.getAttribute('data-formula');
      if (formula) {
        try {
          window.katex.render(decodeURIComponent(formula), element, { 
            displayMode: false, 
            throwOnError: false 
          });
        } catch (e) {
          console.error('KaTeX render error:', e);
        }
      }
    });
  };
  
  return <div ref={contentRef} className="math-content">{children}</div>;
};

// Process LaTeX in HTML content
const processLatexInHTML = (html) => {
  if (!html) return html;
  
  let processed = html.replace(/\$\$([^\$]+)\$\$/g, (match, formula) => {
    return `<span class="block-math-placeholder" data-formula="${encodeURIComponent(formula)}"></span>`;
  });
  
  processed = processed.replace(/\$([^\$]+)\$/g, (match, formula) => {
    return `<span class="inline-math-placeholder" data-formula="${encodeURIComponent(formula)}"></span>`;
  });
  
  processed = processed.replace(/\\\[([^\]]+)\\\]/g, (match, formula) => {
    return `<span class="block-math-placeholder" data-formula="${encodeURIComponent(formula)}"></span>`;
  });
  
  processed = processed.replace(/\\\(([^\)]+)\\\)/g, (match, formula) => {
    return `<span class="inline-math-placeholder" data-formula="${encodeURIComponent(formula)}"></span>`;
  });
  
  return processed;
};

export default function TestAnalysis({ onNavigateToSolution }) {
  const router = useRouter();
  const pathname = usePathname();
  const THEME_PRIMARY = "#F59E0B";
  const THEME_BG = "#0E172A";

  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState(null);
  const [activeTab, setActiveTab] = useState('performance'); // performance, leaderboard, solutions
  
  // Performance Stats State
  const [stats, setStats] = useState({
    totalQuestions: 0,
    correct: 0,
    incorrect: 0,
    unattempted: 0,
    attempted: 0,
    accuracy: 0,
    totalMarks: 0,
    obtainedMarks: 0,
    totalTimeSpent: 0,
    avgTimePerQuestion: 0
  });

  const [difficultyData, setDifficultyData] = useState({
    easy: { correct: 0, incorrect: 0, unattempted: 0, total: 0, totalTime: 0, avgTime: 0 },
    medium: { correct: 0, incorrect: 0, unattempted: 0, total: 0, totalTime: 0, avgTime: 0 },
    hard: { correct: 0, incorrect: 0, unattempted: 0, total: 0, totalTime: 0, avgTime: 0 }
  });

  const [subjectData, setSubjectData] = useState({});
  const [sectionData, setSectionData] = useState({});
  const [questionDetails, setQuestionDetails] = useState([]);
  const [subjectScores, setSubjectScores] = useState({});
  const [timeAnalysis, setTimeAnalysis] = useState([]);
  const [attemptPattern, setAttemptPattern] = useState([]);
  const [confidenceData, setConfidenceData] = useState([]);
  const [speedAccuracyData, setSpeedAccuracyData] = useState([]);
  
  // Advanced Insights
  const [strengthWeaknessData, setStrengthWeaknessData] = useState([]);
  const [reviewPatternData, setReviewPatternData] = useState({});
  
  // Leaderboard State
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState([]);
  const [contestName, setContestName] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isContest, setIsContest] = useState(false);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [contestStats, setContestStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [sortOrder, setSortOrder] = useState('asc');

  // Solutions State
  const [solutionSections, setSolutionSections] = useState([]);
  const [solutionQuestions, setSolutionQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeSolutionSection, setActiveSolutionSection] = useState('all');
  const [showAllQuestions, setShowAllQuestions] = useState(true);

  useEffect(() => {
    const pathSegments = pathname.split('/');
    const aid = pathSegments[pathSegments.length - 1];
    
    if (aid && aid !== 'results') {
      setAttemptId(aid);
      fetchAllData(aid);
    } else {
      setLoading(false);
    }
  }, [pathname]);

  useEffect(() => {
    filterAndSortLeaderboard();
  }, [searchQuery, sortBy, sortOrder, leaderboardData]);

 

  const fetchAllData = async (aid) => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);

      const { data: testAttempt } = await supabase
        .from('test_attempts')
        .select('session_id, test_id, time_spent_minutes')
        .eq('id', aid)
        .single();

      if (!testAttempt) {
        setLoading(false);
        return;
      }

      const sessionId = testAttempt.session_id;
      const testId = testAttempt.test_id;

      // Check if contest
      const { data: contest } = await supabase
        .from('contests')
        .select('id, title, total_marks, total_questions, duration_minutes')
        .eq('id', testId)
        .maybeSingle();

      let isContestMode = false;
      if (contest) {
        isContestMode = true;
        setIsContest(true);
        setContestName(contest.title || 'Live Contest');
        await fetchLeaderboardData(testId, user);
      }

      const { data: userResponses } = await supabase
        .from('user_responses')
        .select('*')
        .eq('session_id', sessionId);

      if (!userResponses || userResponses.length === 0) {
        setLoading(false);
        return;
      }

      const latestResponses = {};
      userResponses.forEach(r => {
        const qId = r.question_id;
        if (!latestResponses[qId] || r.visit_number > latestResponses[qId].visit_number) {
          latestResponses[qId] = r;
        }
      });

      const responses = Object.values(latestResponses);
      const questionIds = responses.map(r => r.question_id);

      const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .in('id', questionIds);

      const { data: options } = await supabase
        .from('question_options')
        .select('*')
        .in('question_id', questionIds)
        .order('option_order', { ascending: true });

      const { data: solutions } = await supabase
        .from('question_solutions')
        .select('*')
        .in('question_id', questionIds);

      const correctAnswersMap = {};
      options?.forEach(opt => {
        if (opt.is_correct) {
          if (!correctAnswersMap[opt.question_id]) {
            correctAnswersMap[opt.question_id] = [];
          }
          correctAnswersMap[opt.question_id].push(opt.option_label);
        }
      });

      const sectionsExist = questions.some(q => q.contest_section_id);
      let finalSections = [];
      let sortedQuestions = questions;
      let sectionsMap = {};

      if (sectionsExist && isContestMode) {
        const sectionIds = [...new Set(questions.map(q => q.contest_section_id).filter(Boolean))];
        
        const { data: sectionsData } = await supabase
          .from('contest_sections')
          .select('*')
          .in('id', sectionIds)
          .order('section_order', { ascending: true });

        sectionsData?.forEach(section => {
          sectionsMap[section.id] = { ...section, questions: [] };
        });

        const sectionsArray = Object.values(sectionsMap).sort((a, b) => 
          (a.section_order || 0) - (b.section_order || 0)
        );

        sortedQuestions = [];
        sectionsArray.forEach(section => {
          const sectionQuestions = questions.filter(q => q.contest_section_id === section.id);
          sortedQuestions.push(...sectionQuestions);
        });

        finalSections = sectionsArray;
      } else {
        const subjectMap = {};
        
        questions.forEach((q) => {
          const subject = q.subject || 'Other';
          
          if (!subjectMap[subject]) {
            subjectMap[subject] = {
              id: subject,
              section_name: subject,
              section_order: Object.keys(subjectMap).length,
              questions: []
            };
          }
          
          subjectMap[subject].questions.push(q);
        });
        
        const subjectSections = Object.values(subjectMap).sort((a, b) => 
          a.section_order - b.section_order
        );
        
        sortedQuestions = [];
        subjectSections.forEach(section => {
          sortedQuestions.push(...section.questions);
        });
        
        finalSections = subjectSections;
      }

      // fetchAllData function mein - Line ~200 ke aas paas

const enrichedQuestions = sortedQuestions.map(q => {
  const userResponse = latestResponses[q.id];
  const questionOptions = (options || []).filter(opt => opt.question_id === q.id);
  const questionSolution = (solutions || []).find(sol => sol.question_id === q.id);

  let isCorrect = false;
  if (userResponse?.is_answered) {
    if (q.question_type === 'numerical') {
      // ✅ FIX: Pehle final_numerical_answer check karo, phir numerical_answer
      const userAns = userResponse.final_numerical_answer || userResponse.numerical_answer;
      const correctAns = q.numerical_answer;
      if (userAns && correctAns) {
        const userNum = parseFloat(userAns);
        const correctNum = parseFloat(correctAns);
        if (!isNaN(userNum) && !isNaN(correctNum)) {
          isCorrect = Math.abs(userNum - correctNum) < 0.01;
        }
      }
    } else {
      const userAns = userResponse.selected_option_label || userResponse.final_selected_option_label;
      const correctOptions = correctAnswersMap[q.id] || [];
      isCorrect = correctOptions.includes(userAns);
    }
  }

  return {
    ...q,
    options: questionOptions,
    solution: questionSolution || null,
    userResponse: userResponse || null,
    isCorrect: isCorrect,
    isAttempted: userResponse?.is_answered || false,
    isMarked: userResponse?.is_marked_for_review || false,
    timeSpent: userResponse?.time_spent_seconds || 0,
    selectedOptionId: userResponse?.selected_option_id,
    selectedOptionLabel: userResponse?.selected_option_label || userResponse?.final_selected_option_label,
    // ✅ FIX: Pehle final_numerical_answer priority do
    numericalAnswer: userResponse?.final_numerical_answer || userResponse?.numerical_answer || '',
    marksObtained: userResponse?.marks_obtained || 0
  };
});

      setSolutionSections(finalSections);
      setSolutionQuestions(enrichedQuestions);

      await processAnalysisData(responses, questions, correctAnswersMap, sectionsMap);

      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  // MODIFIED PART 3 - REPLACE OLD PART 3 (Add incorrectMarkedCount calculation)

  const processAnalysisData = async (responses, questions, correctAnswersMap, sectionMap) => {
    let totalCorrect = 0, totalIncorrect = 0, totalUnattempted = 0;
    let totalMarks = 0, obtainedMarks = 0, totalTimeSpent = 0;

    const diffAnalysis = {
      easy: { correct: 0, incorrect: 0, unattempted: 0, total: 0, totalTime: 0, avgTime: 0 },
      medium: { correct: 0, incorrect: 0, unattempted: 0, total: 0, totalTime: 0, avgTime: 0 },
      hard: { correct: 0, incorrect: 0, unattempted: 0, total: 0, totalTime: 0, avgTime: 0 }
    };

    const subjAnalysis = {};
    const sectAnalysis = {};
    const questionDetailsList = [];
    const subjectScoresCalc = {};
    const timeAnalysisList = [];
    const topicPerformance = {};
    
    const reviewPatternCalc = {
      answeredAndMarked: 0,
      answeredNotMarked: 0,
      markedNotAnswered: 0,
      notAnsweredNotMarked: 0,
      incorrectMarkedCount: 0  // NEW: Track incorrect + marked separately
    };

    responses.forEach((response, index) => {
      const question = questions.find(q => q.id === response.question_id);
      if (!question) return;

      const posMarks = question.positive_marks || 0;
      const negMarks = question.negative_marks || 0;
      const difficulty = (question.difficulty || 'medium').toLowerCase();
      const subject = question.subject || 'Unknown';
      const sectionName = sectionMap[question.contest_section_id]?.section_name || 'General';
      const timeSpent = response.time_spent_seconds || 0;
      const topic = question.topic || '-';
      const chapter = question.chapter || 'General';

      totalMarks += posMarks;
      totalTimeSpent += timeSpent;

      if (diffAnalysis[difficulty]) {
        diffAnalysis[difficulty].total++;
        diffAnalysis[difficulty].totalTime += timeSpent;
      }

      if (!subjAnalysis[subject]) {
        subjAnalysis[subject] = { correct: 0, incorrect: 0, unattempted: 0, total: 0, totalTime: 0 };
        subjectScoresCalc[subject] = { obtained: 0, total: 0 };
      }
      subjAnalysis[subject].total++;
      subjAnalysis[subject].totalTime += timeSpent;
      subjectScoresCalc[subject].total += posMarks;

      if (!sectAnalysis[sectionName]) {
        sectAnalysis[sectionName] = { correct: 0, incorrect: 0, unattempted: 0, total: 0 };
      }
      sectAnalysis[sectionName].total++;

      if (!topicPerformance[topic]) {
        topicPerformance[topic] = { correct: 0, total: 0, subject, chapter };
      }
      topicPerformance[topic].total++;

      let isCorrect = false;
      let isAnswered = false;

      if (response.is_answered) {
        isAnswered = true;

        // processAnalysisData function mein - Line ~350 ke aas paas

if (question.question_type === 'numerical') {
  // ✅ FIX: Pehle final_numerical_answer
  const userAns = response.final_numerical_answer || response.numerical_answer;
  const correctAns = question.numerical_answer;

  if (userAns && correctAns) {
    const userNum = parseFloat(userAns);
    const correctNum = parseFloat(correctAns);
    if (!isNaN(userNum) && !isNaN(correctNum)) {
      isCorrect = Math.abs(userNum - correctNum) < 0.01;
    }
  }
        } else {
          const userAns = response.selected_option_label || response.final_selected_option_label;
          const correctOptions = correctAnswersMap[question.id] || [];
          isCorrect = correctOptions.includes(userAns);
        }

        if (isCorrect) {
          totalCorrect++;
          obtainedMarks += posMarks;
          if (diffAnalysis[difficulty]) diffAnalysis[difficulty].correct++;
          subjAnalysis[subject].correct++;
          subjectScoresCalc[subject].obtained += posMarks;
          sectAnalysis[sectionName].correct++;
          topicPerformance[topic].correct++;
        } else {
          totalIncorrect++;
          obtainedMarks -= Math.abs(negMarks);
          if (diffAnalysis[difficulty]) diffAnalysis[difficulty].incorrect++;
          subjAnalysis[subject].incorrect++;
          subjectScoresCalc[subject].obtained -= Math.abs(negMarks);
          sectAnalysis[sectionName].incorrect++;
        }
      } else {
        totalUnattempted++;
        if (diffAnalysis[difficulty]) diffAnalysis[difficulty].unattempted++;
        subjAnalysis[subject].unattempted++;
        sectAnalysis[sectionName].unattempted++;
      }

      // Review pattern - FIXED
      if (response.is_answered && response.is_marked_for_review) {
        reviewPatternCalc.answeredAndMarked++;
        if (!isCorrect) {
          reviewPatternCalc.incorrectMarkedCount++;  // Count incorrect + marked
        }
      } else if (response.is_answered && !response.is_marked_for_review) {
        reviewPatternCalc.answeredNotMarked++;
      } else if (!response.is_answered && response.is_marked_for_review) {
        reviewPatternCalc.markedNotAnswered++;
      } else {
        reviewPatternCalc.notAnsweredNotMarked++;
      }

      let answerStatus = 'Unattempted';
      let answerColor = 'text-slate-400';

      if (response.is_answered && response.is_marked_for_review) {
        answerStatus = isCorrect ? '✅ Correct & Marked' : '❌ Incorrect & Marked';
        answerColor = isCorrect ? 'text-green-400' : 'text-red-400';
      } else if (!response.is_answered && response.is_marked_for_review) {
        answerStatus = '🟣 Marked';
        answerColor = 'text-purple-400';
      } else if (response.is_answered) {
        answerStatus = isCorrect ? '✅ Correct' : '❌ Incorrect';
        answerColor = isCorrect ? 'text-green-400' : 'text-red-400';
      }

      timeAnalysisList.push({
        qno: index + 1,
        time: timeSpent,
        difficulty,
        isCorrect
      });

      questionDetailsList.push({
        qno: index + 1,
        chapter: question.chapter || '-',
        topic: question.topic || '-',
        difficulty: question.difficulty || 'Medium',
        timeSpent,
        attempted: response.is_attempted ? 'Yes' : 'No',
        answer: answerStatus,
        answerColor: answerColor,
        subject: subject,
        visitNumber: response.visit_number || 1,
        totalVisits: response.total_visits || 1,
        marksObtained: response.marks_obtained || (isCorrect ? posMarks : -Math.abs(negMarks))
      });
    });

    // Calculate averages
    Object.keys(diffAnalysis).forEach(diff => {
      if (diffAnalysis[diff].total > 0) {
        diffAnalysis[diff].avgTime = (diffAnalysis[diff].totalTime / diffAnalysis[diff].total).toFixed(1);
      }
    });

    // Strength/Weakness
    const strengthWeaknessList = [];
    Object.entries(topicPerformance).forEach(([topic, data]) => {
      if (data.total > 0) {
        const accuracy = (data.correct / data.total) * 100;
        strengthWeaknessList.push({
          topic,
          accuracy: accuracy.toFixed(1),
          correct: data.correct,
          total: data.total,
          subject: data.subject,
          chapter: data.chapter,
          type: accuracy >= 70 ? 'strength' : accuracy >= 40 ? 'moderate' : 'weakness'
        });
      }
    });
    strengthWeaknessList.sort((a, b) => parseFloat(b.accuracy) - parseFloat(a.accuracy));

    const totalAttempted = totalCorrect + totalIncorrect;
    const accuracy = totalAttempted > 0 ? parseFloat((totalCorrect / totalAttempted * 100).toFixed(2)) : 0;
    const avgTimePerQuestion = responses.length > 0 ? (totalTimeSpent / responses.length).toFixed(1) : 0;

    setStats({
      totalQuestions: questions.length,
      correct: totalCorrect,
      incorrect: totalIncorrect,
      unattempted: totalUnattempted,
      attempted: totalAttempted,
      accuracy,
      totalMarks,
      obtainedMarks,
      totalTimeSpent,
      avgTimePerQuestion
    });

    setDifficultyData(diffAnalysis);
    setSubjectData(subjAnalysis);
    setSectionData(sectAnalysis);
    setQuestionDetails(questionDetailsList);
    setSubjectScores(subjectScoresCalc);
    setTimeAnalysis(timeAnalysisList);
    setStrengthWeaknessData(strengthWeaknessList);
    setReviewPatternData(reviewPatternCalc);
  };

  const fetchLeaderboardData = async (testId, user) => {
    try {
      console.log('🔍 START: fetchLeaderboardData');
      console.log('User ID:', user?.id);
      console.log('Test ID:', testId);
      
      const { data: allAttempts } = await supabase
        .from('test_attempts')
        .select('id, user_id, obtained_marks, accuracy, time_spent_minutes, correct_answers, incorrect_answers, total_questions, created_at')
        .eq('test_id', testId);
  
      console.log('Total Attempts fetched:', allAttempts?.length);
  
      if (!allAttempts || allAttempts.length === 0) return;
  
      // ✅ FILTER: Keep only LATEST attempt per user
      const latestAttemptsMap = {};
      allAttempts.forEach(attempt => {
        const userId = attempt.user_id;
        if (!latestAttemptsMap[userId] || 
            new Date(attempt.created_at) > new Date(latestAttemptsMap[userId].created_at)) {
          latestAttemptsMap[userId] = attempt;
        }
      });
      
      const uniqueAttempts = Object.values(latestAttemptsMap);
      console.log('✅ Filtered to latest attempts:', uniqueAttempts.length);
  
      const userIds = [...new Set(uniqueAttempts.map(a => a.user_id))];
  
      // Display names fetch
      let userMap = {};
      
      try {
        const response = await fetch('/api/get-display-names', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userIds })
        });
  
        if (!response.ok) {
          throw new Error(`API failed with status: ${response.status}`);
        }
  
        const text = await response.text();
        
        if (!text) {
          console.warn('Empty response from API');
        } else {
          const data = JSON.parse(text);
          userMap = data.userMap || {};
        }
      } catch (apiError) {
        console.error('Error fetching display names:', apiError);
      }
  
      // Sort attempts
      const sortedAttempts = uniqueAttempts.sort((a, b) => {
        if (b.obtained_marks !== a.obtained_marks) return b.obtained_marks - a.obtained_marks;
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        return (a.time_spent_minutes || 999999) - (b.time_spent_minutes || 999999);
      });
  
      console.log('Sorted top 5:');
      sortedAttempts.slice(0, 5).forEach((a, i) => {
        console.log(`  ${i}. Marks: ${a.obtained_marks}, Acc: ${a.accuracy}%, Time: ${a.time_spent_minutes}m`);
      });
  
      // ✅✅ CALCULATE CONTEST STATS ✅✅
      const totalParticipants = sortedAttempts.length;
      const totalMarks = sortedAttempts.reduce((sum, a) => sum + (a.obtained_marks || 0), 0);
      const totalAccuracy = sortedAttempts.reduce((sum, a) => sum + (a.accuracy || 0), 0);
      const totalTime = sortedAttempts.reduce((sum, a) => sum + (a.time_spent_minutes || 0), 0);
      
      const avgScore = totalParticipants > 0 ? (totalMarks / totalParticipants).toFixed(2) : '0';
      const avgAccuracy = totalParticipants > 0 ? (totalAccuracy / totalParticipants).toFixed(2) : '0';
      const avgTime = totalParticipants > 0 ? (totalTime / totalParticipants).toFixed(1) : '0';
      const topScore = sortedAttempts.length > 0 ? sortedAttempts[0].obtained_marks : 0;
  
      console.log('📊 Contest Stats:', {
        totalParticipants,
        avgScore,
        avgAccuracy,
        avgTime,
        topScore
      });
  
      // ✅ SET CONTEST STATS
      setContestStats({
        totalParticipants,
        avgScore,
        avgAccuracy,
        avgTime,
        topScore
      });
  
      let currentRank = 1;
      let previousMarks = null;
      let previousAccuracy = null;
  
      const rankedData = sortedAttempts.map((attempt, index) => {
        // Rank calculation
        if (
          previousMarks === attempt.obtained_marks &&
          previousAccuracy === attempt.accuracy
        ) {
          // Same rank
        } else {
          currentRank = index + 1;
        }
  
        previousMarks = attempt.obtained_marks;
        previousAccuracy = attempt.accuracy;
  
        // ✅ CALCULATE PERCENTILE
        const percentile = totalParticipants > 1 
          ? (((totalParticipants - currentRank) / (totalParticipants - 1)) * 100).toFixed(1)
          : '100';
  
        const isCurrentUser = attempt.user_id === user?.id;
  
        if (isCurrentUser) {
          console.log('');
          console.log('==========================================');
          console.log('🎯 YOUR DATA (FINAL):');
          console.log('==========================================');
          console.log('Index in array:', index);
          console.log('Calculated Rank:', currentRank);
          console.log('Your Marks:', attempt.obtained_marks);
          console.log('Your Accuracy:', attempt.accuracy);
          console.log('Your Time:', attempt.time_spent_minutes);
          console.log('Your Percentile:', percentile + '%');
          console.log('==========================================');
          console.log('');
          
          setCurrentUserRank(currentRank);
        }
  
        return {
          rank: currentRank,
          username: userMap[attempt.user_id] || 'Anonymous',
          userId: attempt.user_id,
          obtainedMarks: attempt.obtained_marks,
          accuracy: attempt.accuracy,
          timeSpent: attempt.time_spent_minutes,
          correctAnswers: attempt.correct_answers,
          incorrectAnswers: attempt.incorrect_answers,
          totalQuestions: attempt.total_questions,
          percentile: parseFloat(percentile),  // ✅ ADD PERCENTILE
          isCurrentUser: attempt.user_id === user?.id
        };
      });
  
      console.log('Total ranked entries:', rankedData.length);
      console.log('✅ END: fetchLeaderboardData');
  
      setLeaderboardData(rankedData);
      setFilteredLeaderboard(rankedData);
      
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };
 
  const filterAndSortLeaderboard = () => {
    let filtered = [...leaderboardData];

    if (searchQuery.trim()) {
      filtered = filtered.filter(entry => 
        entry.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let compareA, compareB;
      switch(sortBy) {
        case 'marks': compareA = a.obtainedMarks; compareB = b.obtainedMarks; break;
        case 'accuracy': compareA = a.accuracy; compareB = b.accuracy; break;
        case 'time': compareA = a.timeSpent; compareB = b.timeSpent; break;
        default: compareA = a.rank; compareB = b.rank;
      }
      return sortOrder === 'asc' ? compareA - compareB : compareB - compareA;
    });

    setFilteredLeaderboard(filtered);
  };

  // Solutions handlers
  const getCurrentSectionQuestions = useMemo(() => {
    if (showAllQuestions || solutionSections.length === 0) {
      return solutionQuestions;
    }

    if (activeSolutionSection === 'all') {
      return solutionQuestions;
    }

    return solutionQuestions.filter(q => {
      if (typeof activeSolutionSection === 'string' && activeSolutionSection.includes('-')) {
        return q.contest_section_id === activeSolutionSection;
      } else {
        return q.subject === activeSolutionSection;
      }
    });
  }, [solutionSections, activeSolutionSection, solutionQuestions, showAllQuestions]);

  const getQuestionStatus = (question) => {
    const isAnswered = question.isAttempted;
    const isMarked = question.isMarked;
    const isCorrect = question.isCorrect;

    if (isAnswered && isMarked && isCorrect) return 'correct-marked';
    if (isAnswered && isMarked && !isCorrect) return 'incorrect-marked';
    if (isAnswered && isCorrect) return 'correct';
    if (isAnswered && !isCorrect) return 'incorrect';
    if (isMarked) return 'marked';
    return 'not-attempted';
  };

  const handleQuestionClick = (globalIndex) => {
    setCurrentQuestionIndex(globalIndex);
    
    const clickedQuestion = solutionQuestions[globalIndex];
    if (clickedQuestion && !showAllQuestions) {
      const sectionId = clickedQuestion.contest_section_id || clickedQuestion.subject;
      
      if (sectionId) {
        const questionSection = solutionSections.find(s => s.id === sectionId);
        if (questionSection && activeSolutionSection !== sectionId) {
          setActiveSolutionSection(sectionId);
        }
      }
    }
  };

  const handleSectionChange = (sectionId) => {
    setActiveSolutionSection(sectionId);
    setShowAllQuestions(false);
    
    const firstQuestion = solutionQuestions.find(q => {
      if (typeof sectionId === 'string' && sectionId.includes('-')) {
        return q.contest_section_id === sectionId;
      } else {
        return q.subject === sectionId;
      }
    });
    
    if (firstQuestion) {
      const index = solutionQuestions.findIndex(q => q.id === firstQuestion.id);
      if (index !== -1) {
        setCurrentQuestionIndex(index);
      }
    }
  };

  const handleShowAllQuestions = () => {
    setShowAllQuestions(true);
    setActiveSolutionSection('all');
    setCurrentQuestionIndex(0);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      
      const newQuestion = solutionQuestions[newIndex];
      if (newQuestion && newQuestion.contest_section_id && !showAllQuestions) {
        setActiveSolutionSection(newQuestion.contest_section_id);
      }
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < solutionQuestions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      
      const newQuestion = solutionQuestions[newIndex];
      if (newQuestion && newQuestion.contest_section_id && !showAllQuestions) {
        setActiveSolutionSection(newQuestion.contest_section_id);
      }
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatTotalTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const handleGoBack = () => router.back();

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder(column === 'time' || column === 'rank' ? 'asc' : 'desc');
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="text-yellow-400" size={24} />;
    if (rank === 2) return <Award className="text-gray-300" size={24} />;
    if (rank === 3) return <Medal className="text-amber-600" size={24} />;
    return <span className="text-slate-400 font-bold">#{rank}</span>;
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/40 text-yellow-400 shadow-lg shadow-yellow-500/20';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/40 text-gray-300 shadow-lg shadow-gray-400/20';
    if (rank === 3) return 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-amber-600/40 text-amber-500 shadow-lg shadow-amber-500/20';
    return 'bg-slate-700/20 border-slate-600/40 text-slate-400';
  };

  const getPerformanceBadge = (accuracy) => {
    if (accuracy >= 90) return { text: 'EXCELLENT', color: 'text-green-400', bg: 'bg-green-500/10' };
    if (accuracy >= 75) return { text: 'GREAT', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    if (accuracy >= 60) return { text: 'GOOD', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    return { text: 'NEEDS WORK', color: 'text-red-400', bg: 'bg-red-500/10' };
  };

  const getDifficultyColor = (diff) => {
    const d = (diff || '').toLowerCase();
    if (d === 'easy') return 'text-green-400';
    if (d === 'medium') return 'text-yellow-400';
    if (d === 'hard') return 'text-red-400';
    return 'text-slate-400';
  };

  const COLORS = {
    correct: '#22C55E',
    incorrect: '#EF4444',
    unattempted: '#64748B'
  };

  // Legend counts
  const correctCount = solutionQuestions.filter(q => q.isAttempted && q.isCorrect && !q.isMarked).length;
  const incorrectCount = solutionQuestions.filter(q => q.isAttempted && !q.isCorrect && !q.isMarked).length;
  const notAttemptedCount = solutionQuestions.filter(q => !q.isAttempted && !q.isMarked).length;
  const markedOnlyCount = solutionQuestions.filter(q => q.isMarked && !q.isAttempted).length;
  const correctMarkedCount = solutionQuestions.filter(q => q.isAttempted && q.isCorrect && q.isMarked).length;
  const incorrectMarkedCount = solutionQuestions.filter(q => q.isAttempted && !q.isCorrect && q.isMarked).length;

  const currentQuestion = solutionQuestions[currentQuestionIndex];

  

  const renderPieChart = (data) => {
    const chartData = [
      { name: 'Correct', value: data.correct, color: COLORS.correct },
      { name: 'Incorrect', value: data.incorrect, color: COLORS.incorrect },
      { name: 'Unattempted', value: data.unattempted, color: COLORS.unattempted }
    ].filter(item => item.value > 0);

    if (chartData.length === 0) return <div className="h-[200px] flex items-center justify-center"><p className="text-slate-500 text-sm">No data</p></div>;

    return (
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderBarChart = (dataObj) => {
    const chartData = Object.entries(dataObj).map(([name, data]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      Correct: data.correct,
      Incorrect: data.incorrect,
      Unattempted: data.unattempted
    }));

    if (chartData.length === 0) return <div className="h-[300px] flex items-center justify-center"><p className="text-slate-500 text-sm">No data</p></div>;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
          <Legend />
          <Bar dataKey="Correct" fill={COLORS.correct} />
          <Bar dataKey="Incorrect" fill={COLORS.incorrect} />
          <Bar dataKey="Unattempted" fill={COLORS.unattempted} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderTimeAnalysisChart = () => {
    if (timeAnalysis.length === 0) return null;
    const chartData = timeAnalysis.slice(0, 20).map(item => ({ qno: `Q${item.qno}`, time: item.time }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={THEME_PRIMARY} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={THEME_PRIMARY} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="qno" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} label={{ value: 'Time (s)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
          <Area type="monotone" dataKey="time" stroke={THEME_PRIMARY} fillOpacity={1} fill="url(#colorTime)" />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const renderRadarChart = () => {
    const radarData = Object.entries(subjectData).slice(0, 6).map(([subject, data]) => ({
      subject: subject.length > 10 ? subject.substring(0, 10) : subject,
      score: (data.total > 0 ? (data.correct / data.total) * 100 : 0).toFixed(1)
    }));

    if (radarData.length === 0) return null;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
          <Radar name="Accuracy %" dataKey="score" stroke={THEME_PRIMARY} fill={THEME_PRIMARY} fillOpacity={0.6} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: THEME_BG }}>
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-amber-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <Trophy className="absolute inset-0 m-auto text-amber-500" size={32} />
          </div>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">Loading Ultimate Analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col text-slate-100 overflow-hidden" style={{ backgroundColor: activeTab === 'solutions' ? '#FFFFFF' : THEME_BG }}>
      
      {/* Top Navbar - Hide when in Solutions tab */}
      {activeTab !== 'solutions' && (
        <nav className="h-20 border-b border-white/5 glass-panel px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={handleGoBack} className="flex items-center gap-2 px-5 py-3 rounded-xl glass-panel border border-white/10 hover:border-amber-500/50 transition-all group">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Back</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center rotate-3 shadow-xl border border-amber-500/20" style={{ backgroundColor: THEME_PRIMARY }}>
                <Zap size={24} className="text-white fill-white -rotate-3" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white uppercase">ULTIMATE ANALYSIS</h1>
                <p className="text-xs text-slate-400 font-medium">{isContest ? contestName : 'Test Analysis'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel border border-white/5">
              <Clock size={16} className="text-amber-500" />
              <span className="text-sm font-bold text-white">{formatTotalTime(stats.totalTimeSpent)}</span>
              <span className="text-xs text-slate-400">Total Time</span>
            </div>
            {isContest && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel border border-white/5">
                <Users size={16} className="text-amber-500" />
                <span className="text-sm font-bold text-white">{contestStats.totalParticipants}</span>
                <span className="text-xs text-slate-400">Players</span>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Tab Navigation - Hide when in Solutions tab */}
      {activeTab !== 'solutions' && (
        <div className="border-b border-white/5 glass-panel px-6 py-3 flex gap-2 shrink-0">
          <button onClick={() => setActiveTab('performance')} className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${activeTab === 'performance' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'glass-panel border border-white/10 hover:border-amber-500/30 text-slate-400'}`}>
            <div className="flex items-center gap-2"><BarChart3 size={18} /><span>Performance</span></div>
          </button>
          
          {/* {isContest && (
            <button onClick={() => setActiveTab('leaderboard')} className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${activeTab === 'leaderboard' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'glass-panel border border-white/10 hover:border-amber-500/30 text-slate-400'}`}>
              <div className="flex items-center gap-2"><Trophy size={18} /><span>Leaderboard</span></div>
            </button>
          )} */}

          <button onClick={() => setActiveTab('solutions')} className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${activeTab === 'solutions' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'glass-panel border border-white/10 hover:border-amber-500/30 text-slate-400'}`}>
            <div className="flex items-center gap-2"><Lightbulb size={18} /><span>Solutions</span></div>
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin" style={{ backgroundColor: activeTab === 'solutions' ? '#FFFFFF' : 'transparent', padding: activeTab === 'solutions' ? '0' : '24px' }}>
        <div className={activeTab === 'solutions' ? 'h-full' : 'max-w-[1600px] mx-auto space-y-6 pb-20'}>

          {/* PERFORMANCE TAB */}
          {activeTab === 'performance' && (
            <>
              {/* Score Card - MODIFIED */}
              <div className="glass-panel rounded-3xl p-8 border-2 border-amber-500/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full -mr-32 -mt-32 group-hover:bg-amber-500/10 transition-all"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 blur-3xl rounded-full -ml-24 -mb-24"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Sparkles size={24} className="text-amber-500" />
                      <h3 className="text-sm font-black uppercase tracking-widest text-amber-400">YOUR PERFORMANCE</h3>
                    </div>
                    <div className={`px-4 py-2 rounded-full ${getPerformanceBadge(stats.accuracy).bg} border border-white/10`}>
                      <span className={`text-xs font-bold ${getPerformanceBadge(stats.accuracy).color}`}>
                        {getPerformanceBadge(stats.accuracy).text}
                      </span>
                    </div>
                  </div>

                  {/* First Row - Your Score, Rank, Accuracy, Percentile */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-6xl mb-2">
                        {stats.obtainedMarks >= stats.totalMarks * 0.8 ? '🔥' : 
                         stats.obtainedMarks >= stats.totalMarks * 0.6 ? '👍' : 
                         stats.obtainedMarks >= stats.totalMarks * 0.4 ? '📈' : '💪'}
                      </div>
                      <p className="text-5xl font-black text-white mb-1">{stats.obtainedMarks}</p>
                      <p className="text-sm text-slate-400">Your Score</p>
                      <p className="text-xs text-slate-500 mt-1">out of {stats.totalMarks}</p>
                    </div>

                    {isContest && currentUserRank ? (
                      <div className="text-center">
                        <div className="text-6xl mb-2">
                          {currentUserRank === 1 ? '🏆' : 
                           currentUserRank === 2 ? '🥈' :
                           currentUserRank === 3 ? '🥉' : '⭐'}
                        </div>
                        <p className="text-5xl font-black text-white mb-1">#{currentUserRank}</p>
                        <p className="text-sm text-slate-400">Your Rank</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {currentUserRank <= 3 ? 'TOP 3! 🎉' : `Top ${Math.ceil((currentUserRank / contestStats.totalParticipants) * 100)}%`}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center mx-auto mb-3">
                          <Trophy size={32} className="text-slate-400" />
                        </div>
                        <p className="text-3xl font-black text-white mb-1">N/A</p>
                        <p className="text-sm text-slate-400">Rank</p>
                        <p className="text-xs text-slate-500 mt-1">Not a contest</p>
                      </div>
                    )}

                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                        <Target size={32} className="text-blue-400" />
                      </div>
                      <p className="text-3xl font-black text-white mb-1">{stats.accuracy}%</p>
                      <p className="text-sm text-slate-400">Accuracy</p>
                      <p className="text-xs text-slate-500 mt-1">{stats.correct}/{stats.attempted} attempted</p>
                    </div>

                    {isContest && leaderboardData.find(e => e.isCurrentUser) ? (
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3">
                          <TrendingUp size={32} className="text-purple-400" />
                        </div>
                        <p className="text-3xl font-black text-white mb-1">{leaderboardData.find(e => e.isCurrentUser).percentile}%</p>
                        <p className="text-sm text-slate-400">Percentile</p>
                        <p className="text-xs text-slate-500 mt-1">Top performer</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center mx-auto mb-3">
                          <Star size={32} className="text-slate-400" />
                        </div>
                        <p className="text-3xl font-black text-white mb-1">N/A</p>
                        <p className="text-sm text-slate-400">Percentile</p>
                        <p className="text-xs text-slate-500 mt-1">Not a contest</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid - MODIFIED with Marked for Review */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel rounded-3xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle size={24} className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Answered & Correct</p>
                      <p className="text-3xl font-black text-green-500">{stats.correct}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Marked: {reviewPatternData.answeredAndMarked || 0}
                  </p>
                </div>

                <div className="glass-panel rounded-3xl p-6 border border-red-500/20 hover:border-red-500/40 transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <XCircle size={24} className="text-red-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Answered & Incorrect</p>
                      <p className="text-3xl font-black text-red-500">{stats.incorrect}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Marked: {reviewPatternData.incorrectMarkedCount || 0}
                  </p>
                </div>

                <div className="glass-panel rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MinusCircle size={24} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Unattempted</p>
                      <p className="text-3xl font-black text-slate-400">{stats.unattempted}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Marked: {reviewPatternData.markedNotAnswered || 0}
                  </p>
                </div>

                <div className="glass-panel rounded-3xl p-6 border hover:border-amber-500/40 transition-all group" style={{ borderColor: `${THEME_PRIMARY}33` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border group-hover:scale-110 transition-transform" style={{ backgroundColor: `${THEME_PRIMARY}11`, borderColor: `${THEME_PRIMARY}33` }}>
                      <Target size={24} style={{ color: THEME_PRIMARY }} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Accuracy</p>
                      <p className="text-3xl font-black" style={{ color: THEME_PRIMARY }}>{stats.accuracy}%</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    {stats.correct} correct out of {stats.attempted} attempted
                  </p>
                </div>
              </div>

              {/* Difficulty Analysis */}
              <div className="glass-panel rounded-3xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp size={20} style={{ color: THEME_PRIMARY }} />
                  <h2 className="text-lg font-black uppercase tracking-tighter">DIFFICULTY ANALYSIS</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-panel rounded-2xl p-5 border border-white/5 hover:border-green-500/30 transition-all">
                    <h3 className="text-xs font-black text-green-400 mb-3 uppercase tracking-wider flex items-center justify-between">
                      <span>Easy ({difficultyData.easy.total} questions)</span>
                      <span className="text-[10px] text-slate-500">Avg: {difficultyData.easy.avgTime}s</span>
                    </h3>
                    {renderPieChart(difficultyData.easy)}
                    <div className="mt-4 space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold">✅ Correct: {difficultyData.easy.correct}</p>
                      <p className="text-[10px] text-slate-400 font-bold">❌ Incorrect: {difficultyData.easy.incorrect}</p>
                      <p className="text-[10px] text-slate-400 font-bold">⚪ Unattempted: {difficultyData.easy.unattempted}</p>
                    </div>
                  </div>

                  <div className="glass-panel rounded-2xl p-5 border border-white/5 hover:border-yellow-500/30 transition-all">
                    <h3 className="text-xs font-black text-yellow-400 mb-3 uppercase tracking-wider flex items-center justify-between">
                      <span>Medium ({difficultyData.medium.total} questions)</span>
                      <span className="text-[10px] text-slate-500">Avg: {difficultyData.medium.avgTime}s</span>
                    </h3>
                    {renderPieChart(difficultyData.medium)}
                    <div className="mt-4 space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold">✅ Correct: {difficultyData.medium.correct}</p>
                      <p className="text-[10px] text-slate-400 font-bold">❌ Incorrect: {difficultyData.medium.incorrect}</p>
                      <p className="text-[10px] text-slate-400 font-bold">⚪ Unattempted: {difficultyData.medium.unattempted}</p>
                    </div>
                  </div>

                  <div className="glass-panel rounded-2xl p-5 border border-white/5 hover:border-red-500/30 transition-all">
                    <h3 className="text-xs font-black text-red-400 mb-3 uppercase tracking-wider flex items-center justify-between">
                      <span>Hard ({difficultyData.hard.total} questions)</span>
                      <span className="text-[10px] text-slate-500">Avg: {difficultyData.hard.avgTime}s</span>
                    </h3>
                    {renderPieChart(difficultyData.hard)}
                    <div className="mt-4 space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold">✅ Correct: {difficultyData.hard.correct}</p>
                      <p className="text-[10px] text-slate-400 font-bold">❌ Incorrect: {difficultyData.hard.incorrect}</p>
                      <p className="text-[10px] text-slate-400 font-bold">⚪ Unattempted: {difficultyData.hard.unattempted}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="glass-panel rounded-3xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen size={20} style={{ color: THEME_PRIMARY }} />
                  <h2 className="text-lg font-black uppercase tracking-tighter">SUBJECT-WISE SUMMARY</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Subject</th>
                        <th className="text-left p-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Score</th>
                        <th className="text-left p-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Correct</th>
                        <th className="text-left p-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Incorrect</th>
                        <th className="text-left p-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Unattempted</th>
                        <th className="text-left p-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Total Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-black text-white">Overall</td>
                        <td className="p-4 font-bold" style={{ color: THEME_PRIMARY }}>{stats.obtainedMarks}/{stats.totalMarks}</td>
                        <td className="p-4 text-slate-300 font-medium">{stats.correct}/{stats.totalQuestions}</td>
                        <td className="p-4 text-slate-300 font-medium">{stats.incorrect}/{stats.totalQuestions}</td>
                        <td className="p-4 text-slate-300 font-medium">{stats.unattempted}/{stats.totalQuestions}</td>
                        <td className="p-4 text-slate-300 font-medium">{formatTotalTime(stats.totalTimeSpent)}</td>
                      </tr>

                      {Object.entries(subjectData).map(([subject, data]) => {
                        const subjectObtainedMarks = subjectScores[subject]?.obtained || 0;
                        const subjectTotalMarks = subjectScores[subject]?.total || 0;
                        const totalTime = data.totalTime || 0;

                        return (
                          <tr key={subject} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4 font-bold text-slate-200">{subject}</td>
                            <td className="p-4 font-bold text-blue-400">
                              {subjectObtainedMarks}/{subjectTotalMarks}
                            </td>
                            <td className="p-4 text-slate-300">{data.correct}/{data.total}</td>
                            <td className="p-4 text-slate-300">{data.incorrect}/{data.total}</td>
                            <td className="p-4 text-slate-300">{data.unattempted}/{data.total}</td>
                            <td className="p-4 text-slate-300">{formatTotalTime(totalTime)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel rounded-3xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <BarChart2 size={20} className="text-purple-400" />
                    <h2 className="text-lg font-black uppercase tracking-tighter">Subject Performance</h2>
                  </div>
                  {Object.keys(subjectData).length > 0 ? renderBarChart(subjectData) : (
                    <div className="text-center text-slate-500 py-8">No subject data</div>
                  )}
                </div>

                {/* Section Performance - MODIFIED with correct order */}
                <div className="glass-panel rounded-3xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <Layers size={20} className="text-cyan-400" />
                    <h2 className="text-lg font-black uppercase tracking-tighter">Section Performance</h2>
                  </div>
                  {(() => {
                    // Sort sections by their original order from solutionSections
                    const orderedSectionData = {};
                    solutionSections.forEach(section => {
                      const sectionName = section.section_name;
                      if (sectionData[sectionName]) {
                        orderedSectionData[sectionName] = sectionData[sectionName];
                      }
                    });
                    
                    return Object.keys(orderedSectionData).length > 0 ? renderBarChart(orderedSectionData) : (
                      <div className="text-center text-slate-500 py-8">No section data</div>
                    );
                  })()}
                </div>

                <div className="glass-panel rounded-3xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <LineChartIcon size={20} className="text-cyan-400" />
                    <h2 className="text-lg font-black uppercase tracking-tighter">TIME ANALYSIS</h2>
                  </div>
                  {renderTimeAnalysisChart()}
                </div>

                <div className="glass-panel rounded-3xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <PieChartIcon size={20} className="text-pink-400" />
                    <h2 className="text-lg font-black uppercase tracking-tighter">SUBJECT RADAR</h2>
                  </div>
                  {renderRadarChart()}
                </div>
              </div>

              {/* Strengths & Weaknesses - MODIFIED by Chapters */}
              <div className="glass-panel rounded-3xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <Brain size={20} className="text-purple-400" />
                  <h2 className="text-lg font-black uppercase tracking-tighter">CHAPTER-WISE ANALYSIS</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths - Show by Chapters */}
                  <div className="max-h-[500px] overflow-y-auto pr-2">
                    <h3 className="text-sm font-black text-green-400 mb-4 uppercase tracking-wider flex items-center gap-2 sticky top-0 bg-[#0E172A] pb-2 z-10">
                      <TrendingUp size={16} />Strong Chapters
                    </h3>
                    <div className="space-y-3">
                      {(() => {
                        // Group by chapters
                        const chapterPerformance = {};
                        strengthWeaknessData.forEach(item => {
                          const chapter = item.chapter || 'Other';
                          if (!chapterPerformance[chapter]) {
                            chapterPerformance[chapter] = {
                              correct: 0,
                              total: 0,
                              subject: item.subject,
                              topics: []
                            };
                          }
                          chapterPerformance[chapter].correct += item.correct;
                          chapterPerformance[chapter].total += item.total;
                          chapterPerformance[chapter].topics.push(item.topic);
                        });

                        const chapterList = Object.entries(chapterPerformance).map(([chapter, data]) => ({
                          chapter,
                          accuracy: ((data.correct / data.total) * 100).toFixed(1),
                          correct: data.correct,
                          total: data.total,
                          subject: data.subject,
                          topics: data.topics.join(', ')
                        })).sort((a, b) => parseFloat(b.accuracy) - parseFloat(a.accuracy));

                        const strengths = chapterList.filter(item => parseFloat(item.accuracy) >= 70);

                        return strengths.length > 0 ? strengths.map((item, idx) => (
                          <div key={idx} className="glass-panel rounded-xl p-4 border border-green-500/20">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex-1">
                                <span className="font-bold text-white block">{item.chapter}</span>
                                <span className="text-xs text-slate-500">{item.subject}</span>
                              </div>
                              <span className="text-green-400 font-black text-lg ml-3">{item.accuracy}%</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                              <span>{item.correct}/{item.total} correct</span>
                            </div>
                            <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: `${item.accuracy}%` }}></div>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2">Topics: {item.topics}</p>
                          </div>
                        )) : (
                          <div className="text-slate-500 text-sm">No strong chapters yet</div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Weaknesses - Show by Chapters */}
                  <div className="max-h-[500px] overflow-y-auto pr-2">
                    <h3 className="text-sm font-black text-red-400 mb-4 uppercase tracking-wider flex items-center gap-2 sticky top-0 bg-[#0E172A] pb-2 z-10">
                      <TrendingDown size={16} />Chapters to Improve
                    </h3>
                    <div className="space-y-3">
                      {(() => {
                        // Group by chapters
                        const chapterPerformance = {};
                        strengthWeaknessData.forEach(item => {
                          const chapter = item.chapter || 'Other';
                          if (!chapterPerformance[chapter]) {
                            chapterPerformance[chapter] = {
                              correct: 0,
                              total: 0,
                              subject: item.subject,
                              topics: []
                            };
                          }
                          chapterPerformance[chapter].correct += item.correct;
                          chapterPerformance[chapter].total += item.total;
                          chapterPerformance[chapter].topics.push(item.topic);
                        });

                        const chapterList = Object.entries(chapterPerformance).map(([chapter, data]) => ({
                          chapter,
                          accuracy: ((data.correct / data.total) * 100).toFixed(1),
                          correct: data.correct,
                          total: data.total,
                          subject: data.subject,
                          topics: data.topics.join(', ')
                        })).sort((a, b) => parseFloat(a.accuracy) - parseFloat(b.accuracy));

                        const weaknesses = chapterList.filter(item => parseFloat(item.accuracy) < 70);

                        return weaknesses.length > 0 ? weaknesses.map((item, idx) => (
                          <div key={idx} className="glass-panel rounded-xl p-4 border border-red-500/20">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex-1">
                                <span className="font-bold text-white block">{item.chapter}</span>
                                <span className="text-xs text-slate-500">{item.subject}</span>
                              </div>
                              <span className="text-red-400 font-black text-lg ml-3">{item.accuracy}%</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                              <span>{item.correct}/{item.total} correct</span>
                            </div>
                            <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full" style={{ width: `${item.accuracy}%` }}></div>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2">Topics: {item.topics}</p>
                          </div>
                        )) : (
                          <div className="text-slate-500 text-sm">All chapters are strong!</div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Analysis Table */}
              <div className="glass-panel rounded-3xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <List size={20} className="text-orange-400" />
                  <h2 className="text-lg font-black uppercase tracking-tighter">QUESTION ANALYSIS</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-3 font-bold text-slate-400 uppercase text-xs">QNO</th>
                        <th className="text-left p-3 font-bold text-slate-400 uppercase text-xs">Chapter</th>
                        <th className="text-left p-3 font-bold text-slate-400 uppercase text-xs">Topic</th>
                        <th className="text-left p-3 font-bold text-slate-400 uppercase text-xs">Difficulty</th>
                        <th className="text-left p-3 font-bold text-slate-400 uppercase text-xs">Time</th>
                        <th className="text-left p-3 font-bold text-slate-400 uppercase text-xs">Visits</th>
                        <th className="text-left p-3 font-bold text-slate-400 uppercase text-xs">Marks</th>
                        <th className="text-left p-3 font-bold text-slate-400 uppercase text-xs">Answer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questionDetails.map((q, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-3 text-slate-300 font-bold">{q.qno}</td>
                          <td className="p-3 text-slate-400">{q.chapter}</td>
                          <td className="p-3 text-slate-400">{q.topic}</td>
                          <td className={`p-3 font-semibold ${getDifficultyColor(q.difficulty)}`}>{q.difficulty}</td>
                          <td className="p-3 text-slate-400">{formatTime(q.timeSpent)}</td>
                          <td className="p-3 text-slate-400">{q.visitNumber}/{q.totalVisits}</td>
                          <td className="p-3 text-slate-300 font-bold">{q.marksObtained}</td>
                          <td className={`p-3 font-semibold ${q.answerColor}`}>{q.answer}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* LEADERBOARD TAB - MODIFIED (Removed Your Rank Card) */}
          {/* {activeTab === 'leaderboard' && isContest && ( */}
            <>
              {/* Contest Stats */}
              {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-amber-500/30 transition-all group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BarChart3 size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Avg Score</p>
                      <p className="text-2xl font-black text-white">{contestStats.avgScore}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">Average across all players</p>
                </div>

                <div className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-amber-500/30 transition-all group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Target size={20} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Avg Accuracy</p>
                      <p className="text-2xl font-black text-white">{contestStats.avgAccuracy}%</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">Average accuracy rate</p>
                </div>

                <div className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-amber-500/30 transition-all group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Timer size={20} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Avg Time</p>
                      <p className="text-2xl font-black text-white">{contestStats.avgTime}m</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">Average completion time</p>
                </div>

                <div className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-amber-500/30 transition-all group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Star size={20} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Top Score</p>
                      <p className="text-2xl font-black text-white">{contestStats.topScore}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">Highest score achieved</p>
                </div>
              </div> */}

              {/* Search Bar */}
              {/* <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl glass-panel border border-white/10 focus:border-amber-500/50 outline-none text-sm text-white placeholder-slate-500"
                  />
                </div>
              </div> */}

              {/* Leaderboard Table */}
              {/* <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy size={22} style={{ color: THEME_PRIMARY }} />
                    <h2 className="text-xl font-black uppercase tracking-tighter">RANKINGS</h2>
                    <span className="ml-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
                      {filteredLeaderboard.length} Players
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th onClick={() => toggleSort('rank')} className="text-left p-5 font-black text-slate-400 uppercase text-[11px] tracking-widest cursor-pointer hover:text-amber-400 transition-colors">
                          <div className="flex items-center gap-2">
                            RANK
                            {sortBy === 'rank' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                          </div>
                        </th>
                        <th className="text-left p-5 font-black text-slate-400 uppercase text-[11px] tracking-widest">PLAYER</th>
                        <th onClick={() => toggleSort('marks')} className="text-left p-5 font-black text-slate-400 uppercase text-[11px] tracking-widest cursor-pointer hover:text-amber-400 transition-colors">
                          <div className="flex items-center gap-2">
                            SCORE
                            {sortBy === 'marks' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                          </div>
                        </th>
                        <th onClick={() => toggleSort('accuracy')} className="text-left p-5 font-black text-slate-400 uppercase text-[11px] tracking-widest cursor-pointer hover:text-amber-400 transition-colors">
                          <div className="flex items-center gap-2">
                            ACCURACY
                            {sortBy === 'accuracy' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                          </div>
                        </th>
                        <th className="text-left p-5 font-black text-slate-400 uppercase text-[11px] tracking-widest">CORRECT/WRONG</th>
                        <th onClick={() => toggleSort('time')} className="text-left p-5 font-black text-slate-400 uppercase text-[11px] tracking-widest cursor-pointer hover:text-amber-400 transition-colors">
                          <div className="flex items-center gap-2">
                            TIME
                            {sortBy === 'time' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                          </div>
                        </th>
                        <th className="text-left p-5 font-black text-slate-400 uppercase text-[11px] tracking-widest">PERCENTILE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeaderboard.map((entry, index) => (
                        <tr key={index} className={`border-b border-white/5 transition-all hover:bg-white/5 ${entry.isCurrentUser ? 'bg-gradient-to-r from-amber-500/10 to-transparent' : ''}`}>
                          <td className="p-5">
                            <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${getRankBadgeColor(entry.rank)}`}>
                              {getRankIcon(entry.rank)}
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg ${entry.isCurrentUser ? 'bg-amber-500' : 'bg-slate-700'} flex items-center justify-center font-black text-white`}>
                                {entry.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold text-base ${entry.isCurrentUser ? 'text-amber-400' : 'text-white'}`}>{entry.username}</span>
                                  {entry.isCurrentUser && (
                                    <span className="text-[9px] px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 font-black border border-amber-500/30">YOU</span>
                                  )}
                                </div>
                                {entry.rank <= 3 && (
                                  <span className="text-xs text-slate-500">
                                    {entry.rank === 1 ? '👑 Champion' : entry.rank === 2 ? '⭐ Runner Up' : '🥉 Third Place'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-5">
                            <span className="font-black text-green-400 text-xl">{entry.obtainedMarks}</span>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all" style={{ width: `${entry.accuracy}%` }}></div>
                              </div>
                              <span className="font-bold text-blue-400 text-base">{entry.accuracy.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-green-400">
                                <span className="font-bold">{entry.correctAnswers}</span>
                                <span className="text-xs">✓</span>
                              </div>
                              <div className="w-px h-4 bg-slate-700"></div>
                              <div className="flex items-center gap-1 text-red-400">
                                <span className="font-bold">{entry.incorrectAnswers}</span>
                                <span className="text-xs">✗</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-2 text-purple-400">
                              <Clock size={16} />
                              <span className="font-bold text-base">{entry.timeSpent}</span>
                              <span className="text-xs text-slate-500">min</span>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-2">
                              <TrendingUp size={16} className="text-amber-500" />
                              <span className="font-bold text-amber-400 text-base">{entry.percentile}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div> */}
            </>
          {/* )} */}

          {/* SOLUTIONS TAB - COMPLETE ORIGINAL DESIGN */}
          {activeTab === 'solutions' && (
            <div className="flex h-full">
              {/* Left Side - Question Display */}
              <div className="flex flex-col flex-1">
                {/* Solutions Header */}
                <div className="bg-white border-b border-gray-300 flex items-center px-3 py-0.5">
                  <button
                    onClick={() => setActiveTab('performance')}
                    className="bg-[#ee0303] text-white px-3 py-1 text-xs font-medium hover:bg-[#4a75b4] flex items-center gap-2"
                    style={{ borderRadius: '4px 4px 0 0' }}
                  >
                    <ArrowLeft size={14} />
                    Back
                  </button>
                  <div className="bg-[#35ae4d] text-white px-3 py-1 text-xs font-medium ml-2" style={{ borderRadius: '4px 4px 0 0' }}>
                    Test Solutions
                  </div>
                </div>

                {/* Section Tabs */}
                <div className="bg-white border-b border-gray-300 flex items-center justify-between px-3 py-1">
                  <div className="flex items-center overflow-x-auto" style={{ gap: '0px' }}>
                    <span className="text-xs font-medium text-gray-700 mr-2">Section</span>
                    
                    <button
                      onClick={handleShowAllQuestions}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-semibold transition-all whitespace-nowrap"
                      style={{ 
                        fontSize: '10px',
                        backgroundColor: showAllQuestions ? '#5B86C5' : '#EAF1FB',
                        color: showAllQuestions ? '#FFFFFF' : '#2F6FB2',
                        border: showAllQuestions ? 'none' : '1px solid #5B86C5',
                        borderRadius: '0px'
                      }}
                    >
                      ALL QUESTIONS
                    </button>

                    {solutionSections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => handleSectionChange(section.id)}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-semibold transition-all whitespace-nowrap"
                        style={{ 
                          fontSize: '10px',
                          backgroundColor: (!showAllQuestions && activeSolutionSection === section.id) ? '#5B86C5' : '#EAF1FB',
                          color: (!showAllQuestions && activeSolutionSection === section.id) ? '#FFFFFF' : '#2F6FB2',
                          border: (!showAllQuestions && activeSolutionSection === section.id) ? 'none' : '1px solid #5B86C5',
                          borderRadius: '0px'
                        }}
                      >
                        {section.section_name.toUpperCase()}
                        <Info size={12} className="opacity-70" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Content */}
                <div className="flex-1 overflow-auto p-6 bg-white">
                  {currentQuestion ? (
                    <MathRenderer key={currentQuestion.id}>
                      <div>
                        <div className="mb-2 text-xs text-gray-600 flex items-center justify-between flex-wrap">
                          <div className="flex items-center gap-2">
                            <span>{currentQuestion.subject || 'Subject'}</span>
                            <span>•</span>
                            <span>Ch: {currentQuestion.chapter || 'N/A'}</span>
                            <span>•</span>
                            <span>Topic: {currentQuestion.topic || 'N/A'}</span>
                            <span>•</span>
                            <span className={
                              currentQuestion.difficulty === 'easy' ? 'text-green-600' :
                              currentQuestion.difficulty === 'medium' ? 'text-yellow-600' :
                              'text-red-600'
                            }>
                              {currentQuestion.difficulty?.toUpperCase() || 'MEDIUM'}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-purple-700">
                            Score: {currentQuestion.marksObtained}/{currentQuestion.positive_marks || 4}
                          </div>
                        </div>

                        <div className="mb-4">
                          <span className="text-lg font-bold text-gray-800">
                            Question {currentQuestionIndex + 1}
                          </span>
                        </div>

                        <div 
                          className="text-base mb-6 leading-relaxed"
                          style={{ fontSize: '14px', color: '#000000', lineHeight: '1.6' }}
                          dangerouslySetInnerHTML={{ __html: processLatexInHTML(currentQuestion.question_text || '') }}
                        />

                        {currentQuestion.question_image_url && (
                          <div className="my-4">
                            <img 
                              src={currentQuestion.question_image_url} 
                              alt="Question"
                              className="rounded shadow-sm"
                              style={{ maxWidth: '400px', maxHeight: '300px', height: 'auto' }}
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          </div>
                        )}

                        {/* MCQ Options */}
                        {currentQuestion.question_type !== 'numerical' && currentQuestion.options && currentQuestion.options.length > 0 && (
                          <div className="space-y-3 mb-6">
                            {currentQuestion.options.map((option) => {
                              const isSelected = option.option_label === currentQuestion.selectedOptionLabel;
                              const isCorrect = option.is_correct;

                              let borderColor = '#D0D0D0';
                              let bgColor = '#FFFFFF';

                              if (isCorrect) {
                                borderColor = '#3CB44B';
                                bgColor = '#3CB44B11';
                              } else if (isSelected) {
                                borderColor = '#E4572E';
                                bgColor = '#E4572E11';
                              }

                              return (
                                <label
                                  key={option.id}
                                  className="flex items-start p-4 rounded-lg cursor-default transition-all"
                                  style={{ 
                                    border: `2px solid ${borderColor}`,
                                    backgroundColor: bgColor
                                  }}
                                >
                                  <input
                                    type="radio"
                                    checked={isSelected}
                                    readOnly
                                    className="mt-1 mr-3 w-4 h-4"
                                  />
                                  <div className="flex-1">
                                    <span className="font-bold mr-2" style={{ fontSize: '16px' }}>
                                      {option.option_label}.
                                    </span>
                                    
                                    <span 
                                      style={{ fontSize: '16px', color: '#000000' }}
                                      dangerouslySetInnerHTML={{ __html: processLatexInHTML(option.option_text || '') }}
                                    />
                                    
                                    {option.option_image_url && (
                                      <img 
                                        src={option.option_image_url} 
                                        alt={`Option ${option.option_label}`}
                                        className="mt-2 rounded shadow-sm"
                                        style={{ maxWidth: '300px', maxHeight: '200px', height: 'auto' }}
                                        onError={(e) => e.target.style.display = 'none'}
                                      />
                                    )}
                                  </div>
                                  
                                  {isCorrect && (
                                    <span className="ml-2 px-2 py-1 bg-[#3CB44B] text-white text-xs font-bold rounded">
                                      ✓ Correct
                                    </span>
                                  )}
                                  {isSelected && !isCorrect && (
                                    <span className="ml-2 px-2 py-1 bg-[#E4572E] text-white text-xs font-bold rounded">
                                      ✗ Your Answer
                                    </span>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {/* Numerical Answer */}
                        {currentQuestion.question_type === 'numerical' && (
                          <div className="flex gap-4 mb-6">
                            <div className="flex-1">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Your Answer:
                              </label>
                              <input
                                type="text"
                                value={currentQuestion.numericalAnswer || ''}
                                readOnly
                                placeholder="Not answered"
                                className="w-full px-4 py-3 border-2 rounded-lg text-base"
                                style={{
                                  borderColor: currentQuestion.isCorrect ? '#3CB44B' : '#E4572E',
                                  backgroundColor: currentQuestion.isCorrect ? '#3CB44B11' : '#E4572E11'
                                }}
                              />
                            </div>
                            
                            <div className="flex-1">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Correct Answer:
                              </label>
                              <input
                                type="text"
                                value={currentQuestion.numerical_answer || 'N/A'}
                                readOnly
                                className="w-full px-4 py-3 border-2 border-[#3CB44B] rounded-lg text-base font-semibold text-[#3CB44B]"
                                style={{ backgroundColor: '#3CB44B11' }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Solution */}
                        <div className="mt-8">
                          <h3 className="text-base font-bold text-blue-700 mb-3">
                            💡 Solution
                          </h3>
                          
                          {currentQuestion.solution?.solution_text ? (
                            <div 
                              className="text-sm leading-relaxed mb-3"
                              style={{ color: '#000000', lineHeight: '1.6' }}
                              dangerouslySetInnerHTML={{ __html: processLatexInHTML(currentQuestion.solution.solution_text) }}
                            />
                          ) : (
                            <div className="text-sm text-gray-600">Solution not available for this question.</div>
                          )}

                          {currentQuestion.solution?.solution_image_url && (
                            <img 
                              src={currentQuestion.solution.solution_image_url} 
                              alt="Solution"
                              className="rounded shadow-sm mb-3 mt-3"
                              style={{ maxWidth: '400px', maxHeight: '300px' }}
                            />
                          )}

                          {currentQuestion.solution?.solution_video_url && (
                            <video 
                              controls 
                              className="rounded shadow-sm mt-3"
                              style={{ maxWidth: '500px' }}
                            >
                              <source src={currentQuestion.solution.solution_video_url} type="video/mp4" />
                            </video>
                          )}
                        </div>
                      </div>
                    </MathRenderer>
                  ) : (
                    <div className="text-center text-gray-500 py-12">No question available</div>
                  )}
                </div>

                {/* Bottom Navigation - WITH VIEW COMPLETE ANALYSIS BUTTON */}
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 bg-white rounded hover:bg-gray-50 font-medium text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ border: '2px solid #757575', color: '#757575' }}
                  >
                    <ArrowLeft size={16} />
                    Previous
                  </button>

                  <button
                    onClick={() => setActiveTab('performance')}
                    className="px-6 py-3 bg-[#5B86C5] text-white rounded-lg hover:bg-[#4a75b4] font-bold text-sm flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                  >
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    View Complete Analysis
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={currentQuestionIndex === solutionQuestions.length - 1}
                    className="px-4 py-2 bg-white rounded hover:bg-gray-50 font-medium text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ border: '2px solid #757575', color: '#757575' }}
                  >
                    Next
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Right Side - Question Palette */}
              <div className="overflow-y-auto border-l h-full" style={{ width: '300px', backgroundColor: '#EAF6FA', borderLeftColor: '#D0D0D0' }}>
                <div style={{ padding: '12px', fontFamily: '"Segoe UI", Arial, Helvetica, sans-serif' }}>
                  
                  {/* <div className="p-3 bg-white rounded-lg shadow-sm" style={{ border: '1px solid #E0E0E0', marginBottom: '16px' }}>
                    <div 
                      onClick={() => setActiveTab('performance')}
                      style={{ fontSize: '11px', color: '#1E88E5', cursor: 'pointer' }}
                    >
                      View Analysis
                    </div>
                  </div> */}

                  {/* Legend */}
                  <div className="mb-4">
                    <div className="flex" style={{ gap: '12px', marginBottom: '6px' }}>
                      <div className="flex items-center" style={{ gap: '6px' }}>
                        <div 
                          className="flex items-center justify-center text-white font-bold"
                          style={{ 
                            width: '26px', 
                            height: '26px',
                            backgroundColor: '#3CB44B',
                            fontSize: '12px',
                            fontWeight: '700',
                            clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)',
                            borderRadius: '4px 4px 0 0'
                          }}
                        >
                          {correctCount}
                        </div>
                        <span style={{ fontSize: '11px', color: '#333333', fontWeight: '500' }}>Correct</span>
                      </div>

                      <div className="flex items-center" style={{ gap: '6px' }}>
                        <div 
                          className="flex items-center justify-center text-white font-bold"
                          style={{ 
                            width: '26px', 
                            height: '26px',
                            backgroundColor: '#E4572E',
                            fontSize: '12px',
                            fontWeight: '700',
                            clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)',
                            borderRadius: '4px 4px 0 0'
                          }}
                        >
                          {incorrectCount}
                        </div>
                        <span style={{ fontSize: '11px', color: '#333333', fontWeight: '500' }}>Incorrect</span>
                      </div>
                    </div>

                    <div className="flex" style={{ gap: '12px', marginBottom: '6px' }}>
                      <div className="flex items-center" style={{ gap: '6px' }}>
                        <div 
                          className="flex items-center justify-center font-bold"
                          style={{ 
                            width: '26px', 
                            height: '26px',
                            backgroundColor: '#F2F2F2',
                            color: '#4A4A4A',
                            fontSize: '12px',
                            fontWeight: '700',
                            borderRadius: '4px',
                            border: '1px solid #BDBDBD'
                          }}
                        >
                          {notAttemptedCount}
                        </div>
                        <span style={{ fontSize: '11px', color: '#333333', fontWeight: '500' }}>Not Attempted</span>
                      </div>

                      <div className="flex items-center" style={{ gap: '6px' }}>
                        <div 
                          className="flex items-center justify-center text-white font-bold"
                          style={{ 
                            width: '26px', 
                            height: '26px',
                            backgroundColor: '#5A2CA0',
                            fontSize: '12px',
                            fontWeight: '700',
                            borderRadius: '50%'
                          }}
                        >
                          {markedOnlyCount}
                        </div>
                        <span style={{ fontSize: '11px', color: '#333333', fontWeight: '500' }}>Marked for Review</span>
                      </div>
                    </div>

                    <div className="flex" style={{ gap: '12px', marginBottom: '6px' }}>
                      <div className="flex items-center" style={{ gap: '6px' }}>
                        <div 
                          className="relative flex items-center justify-center text-white font-bold"
                          style={{ 
                            width: '26px', 
                            height: '26px',
                            backgroundColor: '#5A2CA0',
                            fontSize: '12px',
                            fontWeight: '700',
                            borderRadius: '50%'
                          }}
                        >
                          {correctMarkedCount}
                          <div 
                            className="absolute flex items-center justify-center rounded-full"
                            style={{
                              width: '10px',
                              height: '10px',
                              backgroundColor: '#00C853',
                              bottom: '1px',
                              right: '1px',
                              fontSize: '7px',
                              fontWeight: 'bold',
                              color: 'white'
                            }}
                          >
                            ✓
                          </div>
                        </div>
                        <div style={{ fontSize: '10px', color: '#333333', fontWeight: '500', lineHeight: '1.3' }}>
                          Correct & Marked
                        </div>
                      </div>

                      <div className="flex items-center" style={{ gap: '6px' }}>
                        <div 
                          className="relative flex items-center justify-center text-white font-bold"
                          style={{ 
                            width: '26px', 
                            height: '26px',
                            backgroundColor: '#5A2CA0',
                            fontSize: '12px',
                            fontWeight: '700',
                            borderRadius: '50%'
                          }}
                        >
                          {incorrectMarkedCount}
                          <div 
                            className="absolute flex items-center justify-center rounded-full"
                            style={{
                              width: '10px',
                              height: '10px',
                              backgroundColor: '#DC2626',
                              bottom: '1px',
                              right: '1px',
                              fontSize: '7px',
                              fontWeight: 'bold',
                              color: 'white'
                            }}
                          >
                            ✗
                          </div>
                        </div>
                        <div style={{ fontSize: '10px', color: '#333333', fontWeight: '500', lineHeight: '1.3' }}>
                          Incorrect & Marked
                        </div>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="text-white font-bold"
                    style={{ 
                      backgroundColor: '#5B86C5',
                      fontSize: '15px',
                      fontWeight: '700',
                      padding: '10px 12px',
                      marginBottom: '8px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showAllQuestions 
                      ? 'All Questions' 
                      : (solutionSections.find(s => s.id === activeSolutionSection)?.section_name || activeSolutionSection || 'Questions')}
                  </div>

                  <div 
                    style={{ 
                      fontSize: '13px', 
                      fontWeight: '600', 
                      color: '#222222',
                      marginBottom: '8px'
                    }}
                  >
                    Choose a Question
                  </div>

                  {/* Question Palette Grid - FIXED */}
                  <div className="grid grid-cols-4" style={{ gap: '8px 8px', marginBottom: '16px' }}>
                    {getCurrentSectionQuestions.map((question, sectionIndex) => {
                      const globalIndex = solutionQuestions.findIndex(q => q.id === question.id);
                      const status = getQuestionStatus(question);
                      const isCurrentQuestion = currentQuestionIndex === globalIndex;

                      let bgColor = '#F2F2F2';
                      let textColor = '#4A4A4A';
                      let useShield = false;
                      let showBadge = null;
                      let shapeStyle = {};
                      
                      // FIXED: Proper status handling
                      if (status === 'correct-marked') {
                        bgColor = '#5A2CA0';
                        textColor = '#FFFFFF';
                        useShield = false;
                        showBadge = 'correct';
                        shapeStyle = { borderRadius: '50%' };
                      } else if (status === 'incorrect-marked') {
                        bgColor = '#5A2CA0';  // Purple for marked
                        textColor = '#FFFFFF';
                        useShield = false;
                        showBadge = 'incorrect';  // Show incorrect badge
                        shapeStyle = { borderRadius: '50%' };
                      } else if (status === 'correct') {
                        bgColor = '#3CB44B';
                        textColor = '#FFFFFF';
                        useShield = true;
                      } else if (status === 'incorrect') {
                        bgColor = '#E4572E';
                        textColor = '#FFFFFF';
                        useShield = true;
                      } else if (status === 'marked') {
                        bgColor = '#5A2CA0';
                        textColor = '#FFFFFF';
                        useShield = false;
                        shapeStyle = { borderRadius: '50%' };
                      } else {
                        bgColor = '#F2F2F2';
                        textColor = '#4A4A4A';
                        useShield = false;
                        shapeStyle = { borderRadius: '6px', border: '1px solid #BDBDBD' };
                      }

                      const displayNumber = showAllQuestions ? globalIndex + 1 : sectionIndex + 1;

                      return (
                        <button
                          key={question.id}
                          onClick={() => handleQuestionClick(globalIndex)}
                          className={`relative flex items-center justify-center font-bold transition-all hover:opacity-90 ${
                            isCurrentQuestion ? 'ring-2 ring-offset-1 ring-blue-500' : ''
                          }`}
                          style={{
                            width: '52px',
                            height: '52px',
                            fontSize: '16px',
                            fontWeight: '700',
                            backgroundColor: bgColor,
                            color: textColor,
                            border: useShield ? '1px solid #BDBDBD' : (shapeStyle.border || 'none'),
                            clipPath: useShield ? 'polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)' : 'none',
                            borderRadius: useShield ? '4px 4px 0 0' : (shapeStyle.borderRadius || '0')
                          }}
                        >
                          {displayNumber}
                          {showBadge && (
                            <div 
                              className="absolute flex items-center justify-center rounded-full"
                              style={{
                                width: '16px',
                                height: '16px',
                                backgroundColor: showBadge === 'correct' ? '#00C853' : '#DC2626',
                                bottom: '4px',
                                right: '4px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                color: 'white'
                              }}
                            >
                              {showBadge === 'correct' ? '✓' : '✗'}
                            </div>
                          )}
                        </button>
                      );
                    })}
                    </div>
  
                  </div>
                </div>
              </div>
            )}
  
          </div>
        </div>
      </div>
    );
  }
                  