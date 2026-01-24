'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, MinusCircle, Target, Award, TrendingUp, BookOpen, Layers, List, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function TestAnalysis({ onNavigateToSolution }) {
  const router = useRouter();
  const pathname = usePathname();
  const THEME_PRIMARY = "#F59E0B";
  const THEME_BG = "#0E172A";

  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState(null);
  
  const [stats, setStats] = useState({
    totalQuestions: 0,
    correct: 0,
    incorrect: 0,
    unattempted: 0,
    attempted: 0,
    accuracy: 0,
    totalMarks: 0,
    obtainedMarks: 0
  });

  const [difficultyData, setDifficultyData] = useState({
    easy: { correct: 0, incorrect: 0, unattempted: 0, total: 0 },
    medium: { correct: 0, incorrect: 0, unattempted: 0, total: 0 },
    hard: { correct: 0, incorrect: 0, unattempted: 0, total: 0 }
  });

  const [subjectData, setSubjectData] = useState({});
  const [sectionData, setSectionData] = useState({});
  const [questionDetails, setQuestionDetails] = useState([]);
  const [subjectScores, setSubjectScores] = useState({});

  useEffect(() => {
    const pathSegments = pathname.split('/');
    const aid = pathSegments[pathSegments.length - 1];
    
    if (aid && aid !== 'results') {
      setAttemptId(aid);
      fetchAnalysisData(aid);
    } else {
      setLoading(false);
    }
  }, [pathname]);

  const fetchAnalysisData = async (aid) => {
    try {
      setLoading(true);
      
      const { data: testAttempt } = await supabase
        .from('test_attempts')
        .select('session_id')
        .eq('id', aid)
        .single();

      if (!testAttempt) {
        setLoading(false);
        return;
      }

      const sessionId = testAttempt.session_id;

      const { data: userResponses } = await supabase
        .from('user_responses')
        .select('*')
        .eq('session_id', sessionId);

      if (!userResponses) {
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

      if (questionIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: questions } = await supabase
        .from('questions')
        .select('id, difficulty, subject, numerical_answer, question_type, contest_section_id, positive_marks, negative_marks, chapter, topic')
        .in('id', questionIds);

      if (!questions) {
        setLoading(false);
        return;
      }

      const { data: options } = await supabase
        .from('question_options')
        .select('question_id, option_label, is_correct')
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

      const sectionIds = [...new Set(questions.map(q => q.contest_section_id).filter(Boolean))];
      const { data: sections } = await supabase
        .from('contest_sections')
        .select('id, section_name')
        .in('id', sectionIds);

      const sectionMap = {};
      sections?.forEach(s => {
        sectionMap[s.id] = s.section_name;
      });

      let totalCorrect = 0;
      let totalIncorrect = 0;
      let totalUnattempted = 0;
      let totalMarks = 0;
      let obtainedMarks = 0;

      const diffAnalysis = {
        easy: { correct: 0, incorrect: 0, unattempted: 0, total: 0 },
        medium: { correct: 0, incorrect: 0, unattempted: 0, total: 0 },
        hard: { correct: 0, incorrect: 0, unattempted: 0, total: 0 }
      };

      const subjAnalysis = {};
      const sectAnalysis = {};
      const questionDetailsList = [];
      const subjectScoresCalc = {};

      responses.forEach((response, index) => {
        const question = questions.find(q => q.id === response.question_id);
        
        if (!question) return;

        const posMarks = question.positive_marks || 0;
        const negMarks = question.negative_marks || 0;
        const difficulty = (question.difficulty || 'medium').toLowerCase();
        const subject = question.subject || 'Unknown';
        const sectionName = sectionMap[question.contest_section_id] || 'General';

        totalMarks += posMarks;

        if (diffAnalysis[difficulty]) {
          diffAnalysis[difficulty].total++;
        }

        if (!subjAnalysis[subject]) {
          subjAnalysis[subject] = { correct: 0, incorrect: 0, unattempted: 0, total: 0 };
          subjectScoresCalc[subject] = { obtained: 0, total: 0 };
        }
        subjAnalysis[subject].total++;
        subjectScoresCalc[subject].total += posMarks;

        if (!sectAnalysis[sectionName]) {
          sectAnalysis[sectionName] = { correct: 0, incorrect: 0, unattempted: 0, total: 0 };
        }
        sectAnalysis[sectionName].total++;

        let isCorrect = false;
        let isAnswered = false;

        if (response.is_answered) {
          isAnswered = true;

          if (question.question_type === 'numerical') {
            const userAns = response.numerical_answer;
            const correctAns = question.numerical_answer;

            if (userAns && correctAns) {
              const userNum = parseFloat(userAns);
              const correctNum = parseFloat(correctAns);

              if (!isNaN(userNum) && !isNaN(correctNum)) {
                isCorrect = Math.abs(userNum - correctNum) < 0.01;
              }
            }
          } else {
            const userAns = response.selected_option_label;
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
          } else {
            totalIncorrect++;
            obtainedMarks += negMarks;
            
            if (diffAnalysis[difficulty]) diffAnalysis[difficulty].incorrect++;
            subjAnalysis[subject].incorrect++;
            subjectScoresCalc[subject].obtained += negMarks;
            sectAnalysis[sectionName].incorrect++;
          }
        } else {
          totalUnattempted++;
          
          if (diffAnalysis[difficulty]) diffAnalysis[difficulty].unattempted++;
          subjAnalysis[subject].unattempted++;
          sectAnalysis[sectionName].unattempted++;
        }

        let answerStatus = 'Unattempted';
        let answerColor = 'text-slate-400';

        if (!response.is_answered && !response.is_marked_for_review) {
          answerStatus = 'Unattempted';
          answerColor = 'text-slate-400';
        } else if (response.is_answered && response.is_marked_for_review) {
          if (isCorrect) {
            answerStatus = '✅ Correct & Marked';
            answerColor = 'text-green-400';
          } else {
            answerStatus = '❌ Incorrect & Marked';
            answerColor = 'text-red-400';
          }
        } else if (!response.is_answered && response.is_marked_for_review) {
          answerStatus = '🟣 Marked';
          answerColor = 'text-purple-400';
        } else if (response.is_answered && !response.is_marked_for_review) {
          if (isCorrect) {
            answerStatus = '✅ Correct';
            answerColor = 'text-green-400';
          } else {
            answerStatus = '❌ Incorrect';
            answerColor = 'text-red-400';
          }
        }

        questionDetailsList.push({
          qno: index + 1,
          chapter: question.chapter || '-',
          topic: question.topic || '-',
          difficulty: question.difficulty || 'Medium',
          timeSpent: response.time_spent_seconds || 0,
          attempted: response.is_attempted ? 'Yes' : 'No',
          answer: answerStatus,
          answerColor: answerColor,
          subject: subject
        });
      });

      const totalAttempted = totalCorrect + totalIncorrect;
      const accuracy = totalAttempted > 0 ? parseFloat((totalCorrect / totalAttempted * 100).toFixed(2)) : 0;

      setStats({
        totalQuestions: responses.length,
        correct: totalCorrect,
        incorrect: totalIncorrect,
        unattempted: totalUnattempted,
        attempted: totalAttempted,
        accuracy,
        totalMarks,
        obtainedMarks
      });

      setDifficultyData(diffAnalysis);
      setSubjectData(subjAnalysis);
      setSectionData(sectAnalysis);
      setQuestionDetails(questionDetailsList);
      setSubjectScores(subjectScoresCalc);

      setLoading(false);
    } catch (err) {
      console.error('💥 Error:', err);
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleGoBack = () => {
    router.back();
  };

  const COLORS = {
    correct: '#22C55E',
    incorrect: '#EF4444',
    unattempted: '#64748B'
  };

  const renderPieChart = (data) => {
    const chartData = [
      { name: 'Correct', value: data.correct, color: COLORS.correct },
      { name: 'Incorrect', value: data.incorrect, color: COLORS.incorrect },
      { name: 'Unattempted', value: data.unattempted, color: COLORS.unattempted }
    ].filter(item => item.value > 0);

    if (chartData.length === 0) {
      return (
        <div className="h-[200px] flex items-center justify-center">
          <p className="text-slate-500 text-sm">No data</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
          />
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

    if (chartData.length === 0) {
      return (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-slate-500 text-sm">No data</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Legend />
          <Bar dataKey="Correct" fill={COLORS.correct} />
          <Bar dataKey="Incorrect" fill={COLORS.incorrect} />
          <Bar dataKey="Unattempted" fill={COLORS.unattempted} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const getDifficultyColor = (diff) => {
    const d = diff.toLowerCase();
    if (d === 'easy') return 'text-green-400';
    if (d === 'medium') return 'text-yellow-400';
    if (d === 'hard') return 'text-red-400';
    return 'text-slate-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: THEME_BG }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Loading analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col text-slate-100 overflow-hidden" style={{ backgroundColor: THEME_BG }}>
      {/* Top Navbar */}
      <nav className="h-16 border-b border-white/5 glass-panel px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass-panel border border-white/10 hover:border-white/20 transition-all group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center rotate-3 shadow-lg" style={{ backgroundColor: THEME_PRIMARY }}>
              <Zap size={20} className="text-white fill-white" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-white uppercase">
                TEST ANALYSIS
              </h1>
              {attemptId && (
                <p className="text-[10px] text-slate-500 font-medium">ID: {attemptId}</p>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-y-scroll p-6 scrollbar-thin overscroll-contain">
        <div className="max-w-[1600px] mx-auto space-y-6 pb-20">

          {/* Score Card */}
          <div className="glass-panel rounded-3xl p-8 border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-all" style={{ backgroundColor: `${THEME_PRIMARY}11` }}></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center border shadow-inner" style={{ backgroundColor: `${THEME_PRIMARY}11`, borderColor: `${THEME_PRIMARY}33` }}>
                  <Award size={40} style={{ color: THEME_PRIMARY }} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: THEME_PRIMARY }}>
                    YOUR SCORE
                  </div>
                  <p className="text-5xl font-black text-white leading-none">
                    {stats.obtainedMarks}
                    <span className="text-2xl text-slate-400"> / {stats.totalMarks}</span>
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-2">
                    {stats.totalMarks > 0 
                      ? `${((stats.obtainedMarks / stats.totalMarks) * 100).toFixed(2)}% marks obtained`
                      : 'No marks data'}
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Performance</p>
                <div className="text-6xl">
                  {stats.obtainedMarks >= stats.totalMarks * 0.8 ? '🔥' : 
                   stats.obtainedMarks >= stats.totalMarks * 0.6 ? '👍' : 
                   stats.obtainedMarks >= stats.totalMarks * 0.4 ? '📈' : '💪'}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="glass-panel rounded-3xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <CheckCircle size={24} className="text-green-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Correct</p>
                  <p className="text-3xl font-black text-green-500">{stats.correct}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {stats.totalQuestions > 0 ? ((stats.correct / stats.totalQuestions) * 100).toFixed(2) : 0}% of total
              </p>
            </div>

            <div className="glass-panel rounded-3xl p-6 border border-red-500/20 hover:border-red-500/40 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <XCircle size={24} className="text-red-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Incorrect</p>
                  <p className="text-3xl font-black text-red-500">{stats.incorrect}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {stats.totalQuestions > 0 ? ((stats.incorrect / stats.totalQuestions) * 100).toFixed(2) : 0}% of total
              </p>
            </div>

            <div className="glass-panel rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center">
                  <MinusCircle size={24} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Unattempted</p>
                  <p className="text-3xl font-black text-slate-400">{stats.unattempted}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {stats.totalQuestions > 0 ? ((stats.unattempted / stats.totalQuestions) * 100).toFixed(2) : 0}% of total
              </p>
            </div>

            <div className="glass-panel rounded-3xl p-6 border hover:border-amber-500/40 transition-all group" style={{ borderColor: `${THEME_PRIMARY}33` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${THEME_PRIMARY}11`, borderColor: `${THEME_PRIMARY}33` }}>
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
              <div className="glass-panel rounded-2xl p-5 border border-white/5">
                <h3 className="text-xs font-black text-green-400 mb-3 uppercase tracking-wider">
                  Easy ({difficultyData.easy.total} questions)
                </h3>
                {renderPieChart(difficultyData.easy)}
                <div className="mt-4 space-y-1">
                  <p className="text-[10px] text-slate-400 font-bold">✅ Correct: {difficultyData.easy.correct}</p>
                  <p className="text-[10px] text-slate-400 font-bold">❌ Incorrect: {difficultyData.easy.incorrect}</p>
                  <p className="text-[10px] text-slate-400 font-bold">⚪ Unattempted: {difficultyData.easy.unattempted}</p>
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-5 border border-white/5">
                <h3 className="text-xs font-black text-yellow-400 mb-3 uppercase tracking-wider">
                  Medium ({difficultyData.medium.total} questions)
                </h3>
                {renderPieChart(difficultyData.medium)}
                <div className="mt-4 space-y-1">
                  <p className="text-[10px] text-slate-400 font-bold">✅ Correct: {difficultyData.medium.correct}</p>
                  <p className="text-[10px] text-slate-400 font-bold">❌ Incorrect: {difficultyData.medium.incorrect}</p>
                  <p className="text-[10px] text-slate-400 font-bold">⚪ Unattempted: {difficultyData.medium.unattempted}</p>
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-5 border border-white/5">
                <h3 className="text-xs font-black text-red-400 mb-3 uppercase tracking-wider">
                  Hard ({difficultyData.hard.total} questions)
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

          {/* Subject Summary Table */}
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
                    <th className="text-left p-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Not Visited</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-black text-white">Overall</td>
                    <td className="p-4 font-bold" style={{ color: THEME_PRIMARY }}>{stats.obtainedMarks}/{stats.totalMarks}</td>
                    <td className="p-4 text-slate-300 font-medium">{stats.correct}/{stats.totalQuestions}</td>
                    <td className="p-4 text-slate-300 font-medium">{stats.incorrect}/{stats.totalQuestions}</td>
                    <td className="p-4 text-slate-300 font-medium">{stats.unattempted}/{stats.totalQuestions}</td>
                    <td className="p-4 text-slate-300 font-medium">0/{stats.totalQuestions}</td>
                  </tr>

                  {Object.entries(subjectData).map(([subject, data]) => {
                    const subjectObtainedMarks = subjectScores[subject]?.obtained || 0;
                    const subjectTotalMarks = subjectScores[subject]?.total || 0;

                    return (
                      <tr key={subject} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-slate-200">{subject}</td>
                        <td className="p-4 font-bold text-blue-400">
                          {subjectObtainedMarks}/{subjectTotalMarks}
                        </td>
                        <td className="p-4 text-slate-300">{data.correct}/{data.total}</td>
                        <td className="p-4 text-slate-300">{data.incorrect}/{data.total}</td>
                        <td className="p-4 text-slate-300">{data.unattempted}/{data.total}</td>
                        <td className="p-4 text-slate-300">0/{data.total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subject Performance Chart */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen size={24} className="text-purple-400" />
              <h2 className="text-xl font-black">Subject-wise Performance Chart</h2>
            </div>
            {Object.keys(subjectData).length > 0 ? (
              renderBarChart(subjectData)
            ) : (
              <div className="text-center text-slate-500 py-8">No subject data available</div>
            )}
          </div>

          {/* Section Performance Chart */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <Layers size={24} className="text-cyan-400" />
              <h2 className="text-xl font-black">Section-wise Performance</h2>
            </div>
            {Object.keys(sectionData).length > 0 ? (
              renderBarChart(sectionData)
            ) : (
              <div className="text-center text-slate-500 py-8">No section data available</div>
            )}
          </div>

          {/* Question-wise Analysis Table */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <List size={24} className="text-orange-400" />
              <h2 className="text-xl font-black">Question-wise Analysis</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-3 font-bold text-slate-400 uppercase text-xs">QNO</th>
                    <th className="text-left p-3 font-bold text-slate-400 uppercase text-xs">Chapter</th>
                    <th className="text-left p-3 font-bold text-slate-400 uppercase text-xs">Topic</th>
                    <th className="text-left p-3 font-bold text-slate-400 uppercase text-xs">Difficulty</th>
                    <th className="text-left p-3 font-bold text-slate-400 uppercase text-xs">Spent</th>
                    <th className="text-left p-3 font-bold text-slate-400 uppercase text-xs">Attempted</th>
                    <th className="text-left p-3 font-bold text-slate-400 uppercase text-xs">Answer</th>
                  </tr>
                </thead>
                <tbody>
                  {questionDetails.map((q, idx) => (
                    <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 text-slate-300 font-bold">{q.qno}</td>
                      <td className="p-3 text-slate-400">{q.chapter}</td>
                      <td className="p-3 text-slate-400">{q.topic}</td>
                      <td className={`p-3 font-semibold ${getDifficultyColor(q.difficulty)}`}>
                        {q.difficulty}
                      </td>
                      <td className="p-3 text-slate-400">{formatTime(q.timeSpent)}</td>
                      <td className="p-3">
                        <span className={q.attempted === 'Yes' ? 'text-blue-400' : 'text-slate-500'}>
                          {q.attempted}
                        </span>
                      </td>
                      <td className={`p-3 font-semibold ${q.answerColor}`}>
                        {q.answer}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

{/* View Solutions Button - Bottom positioned */}
<div className="mt-6">
  <button
    onClick={onNavigateToSolution}
    className="group relative w-full px-8 py-4 rounded-xl text-base font-bold text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex items-center justify-center gap-3"
    style={{ backgroundColor: THEME_PRIMARY }}
  >
    {/* Animated gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
    
    {/* Button content */}
    <span className="relative z-10 flex items-center gap-3">
      <svg 
        className="w-6 h-6 transition-transform group-hover:rotate-12" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
      <span className="text-lg">View Complete Solutions</span>
      <svg 
        className="w-5 h-5 transition-transform group-hover:translate-x-1" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </span>
    
    {/* Glow effect */}
    <div className="absolute inset-0 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300" style={{ backgroundColor: THEME_PRIMARY }}></div>
  </button>
</div>
        </div>
      </div>
    </div>
  );
}