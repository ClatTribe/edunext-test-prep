// components/Dashboard.jsx
'use client';

import { useEffect, useState } from 'react';
import { Flame, Trophy, Target, Zap, LayoutGrid, ChevronRight, BarChart3, Clock, Users, CalendarDays, Brain, Star, TrendingUp, BookOpen, AlertCircle, CheckCircle, Search, ChevronDown, ChevronUp, Eye, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Dashboard({ stats = {}, currentUserId, onNavigate }) {
  const router = useRouter(); 
  const THEME_PRIMARY = "#F59E0B";
  const THEME_BG = "#0E172A";

  const [contests, setContests] = useState([]);
  const [previousContests, setPreviousContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);
  const [showPreviousContests, setShowPreviousContests] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [creatingViewMode, setCreatingViewMode] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    // ✅ Only call if currentUserId exists
    if (currentUserId) {
      fetchContests();
      calculateStreak();
    }
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [currentUserId]); // ✅ Add currentUserId as dependency

  const calculateStreak = async () => {
    try {
      // ✅ Check if user ID exists
      if (!currentUserId) {
        console.log('⚠️ No user ID found, skipping streak calculation');
        setCurrentStreak(0);
        return;
      }
  
      // Get all contests sorted by start time
      const { data: allContests, error: contestsError } = await supabase
        .from('contests')
        .select('id, start_time, end_time')
        .order('start_time', { ascending: false });
  
      if (contestsError) throw contestsError;
  
      // Get user's attempts - ✅ REMOVED is_view_only filter temporarily
      const { data: userAttempts, error: attemptsError } = await supabase
        .from('test_attempts')
        .select('session_id, created_at')
        .eq('user_id', currentUserId);
        // ❌ Removed: .eq('is_view_only', false);
  
      if (attemptsError) {
        console.error('❌ Supabase error:', attemptsError);
        throw attemptsError;
      }
  
      const attemptedContestIds = new Set(userAttempts?.map(a => a.session_id) || []);
      
      let streak = 0;
      const now = new Date();
  
      // Check contests from most recent to oldest
      for (const contest of allContests) {
        const endTime = new Date(contest.end_time);
        
        // Skip future contests
        if (endTime > now) continue;
  
        // If user attempted this contest, increment streak
        if (attemptedContestIds.has(contest.id)) {
          streak++;
        } else {
          // User missed this contest, streak breaks
          break;
        }
      }
  
      console.log('🔥 Streak calculated:', streak);
      setCurrentStreak(streak);
      
    } catch (error) {
      console.error('Error calculating streak:', error);
      setCurrentStreak(0);
    }
  };

  const fetchContests = async () => {
    try {
      setLoading(true);
      
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('contests')
        .select('id, title, contest_number, description, duration_minutes, total_marks, total_questions, start_time, end_time')
        .order('start_time', { ascending: true });

      if (sessionsError) throw sessionsError;

      if (!sessionsData || sessionsData.length === 0) {
        setContests([]);
        setPreviousContests([]);
        setLoading(false);
        return;
      }

      const contestsWithCounts = await Promise.all(
        sessionsData.map(async (session) => {
          const { count } = await supabase
            .from('test_attempts')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);

          const now = new Date();
          const startTime = new Date(session.start_time);
          const endTime = new Date(session.end_time);

          return {
            ...session,
            startTime,
            endTime,
            participants: count || 0,
            status: now >= startTime && now <= endTime ? 'LIVE' : 
                    now < startTime ? 'UPCOMING' : 'ENDED'
          };
        })
      );

      const active = contestsWithCounts.filter(c => c.status !== 'ENDED');
      const ended = contestsWithCounts.filter(c => c.status === 'ENDED').reverse();

      setContests(active);
      setPreviousContests(ended);
      
    } catch (error) {
      console.error('Error fetching contests:', error);
      setContests([]);
      setPreviousContests([]);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (targetTime) => {
    const diff = targetTime - currentTime;
    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleEnterArena = (contest) => {
    setSelectedContest(contest);
    setShowConfirmDialog(true);
  };

  const confirmEnterArena = async () => {
    if (!selectedContest) return;
  
    try {
      const { data: existingAttempt } = await supabase
        .from('test_attempts')
        .select('id')
        .eq('session_id', selectedContest.id)
        .eq('user_id', currentUserId)
        .maybeSingle();
  
      if (existingAttempt) {
        console.log('✅ User already joined, resuming...');
        router.push(`/exam/${selectedContest.id}?type=contest`);
        setShowConfirmDialog(false);
        setSelectedContest(null);
        return;
      }
  
      const { error } = await supabase
        .from('test_attempts')
        .insert([{
          session_id: selectedContest.id,
          user_id: currentUserId,
          test_id: selectedContest.id,
          is_view_only: false
        }]);
  
      if (error) throw error;
  
      console.log('✅ Test attempt created successfully');
      
      // Recalculate streak after new attempt
      await calculateStreak();
      
      router.push(`/exam/${selectedContest.id}?type=contest`);
      
    } catch (error) {
      console.error('❌ Error entering contest:', error);
      alert(`Error joining contest: ${error.message}`);
    } finally {
      setShowConfirmDialog(false);
      setSelectedContest(null);
    }
  };

  const handleViewDashboard = async (contest) => {
    try {
      setCreatingViewMode(contest.id);

      const { data: existingAttempt } = await supabase
        .from('test_attempts')
        .select('id, is_view_only')
        .eq('session_id', contest.id)
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (existingAttempt) {
        if (existingAttempt.is_view_only) {
          router.push(`/results/${existingAttempt.id}/solution`);
        } else {
          router.push(`/results/${existingAttempt.id}`);
        }
        return;
      }

      console.log('🔄 Creating view-only attempt for contest:', contest.id);

      const { data: sessionData, error: sessionError } = await supabase
        .from('test_sessions')
        .insert({
          test_id: contest.id,
          user_id: currentUserId,
          started_at: new Date().toISOString(),
          is_completed: false
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      console.log('✅ Session created:', sessionData.id);

      const { data: attemptData, error: attemptError } = await supabase
        .from('test_attempts')
        .insert({
          session_id: contest.id,
          user_id: currentUserId,
          test_id: contest.id,
          is_view_only: true,
          is_completed: false
        })
        .select()
        .single();

      if (attemptError) throw attemptError;
      console.log('✅ View-only attempt created:', attemptData.id);

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('id, question_type, positive_marks, negative_marks')
        .eq('contest_id', contest.id);

      if (questionsError) throw questionsError;

      if (!questionsData || questionsData.length === 0) {
        console.warn('⚠️ No questions found for contest');
        router.push(`/results/${attemptData.id}/solution`);
        return;
      }

      console.log(`📝 Found ${questionsData.length} questions`);

      const dummyResponses = questionsData.map(question => ({
        session_id: sessionData.id,
        question_id: question.id,
        user_id: currentUserId,
        visit_number: 1,
        is_answered: false,
        is_marked_for_review: false,
        is_correct: false,
        time_spent_seconds: 0,
        marks_obtained: 0,
        selected_option_id: null,
        selected_option_label: null,
        numerical_answer: null
      }));

      const { error: responsesError } = await supabase
        .from('user_responses')
        .insert(dummyResponses);

      if (responsesError) throw responsesError;
      console.log('✅ Dummy responses created for all questions');

      router.push(`/results/${attemptData.id}/solution`);

    } catch (error) {
      console.error('💥 Error creating view-only mode:', error);
      alert(`❌ Error loading dashboard: ${error.message}`);
    } finally {
      setCreatingViewMode(null);
    }
  };
 
  const checkUserAttempt = async (contestId) => {
    try {
      const { data } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('session_id', contestId)
        .eq('user_id', currentUserId)
        .single();

      return data ? true : false;
    } catch {
      return false;
    }
  };

  const filteredPreviousContests = previousContests.filter(contest =>
    contest.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contest.contest_number?.toString().includes(searchQuery) ||
    contest.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderHeatmap = () => {
    if (!stats.activityHeatmap) return null;
    
    const dates = Object.keys(stats.activityHeatmap).sort().reverse().slice(0, 70);
    return (
      <div className="flex flex-wrap gap-1">
        {dates.map(date => {
          const count = stats.activityHeatmap[date];
          const color = count === 0 ? 'bg-slate-800' : 
                        count < 2 ? 'bg-amber-900/50' : 
                        count < 4 ? 'bg-amber-700' : 'bg-amber-500';
          return (
            <div key={date} className={`w-3 h-3 rounded-sm ${color}`} title={`${date}: ${count} questions`} />
          );
        })}
      </div>
    );
  };

  const weakTopics = stats.subjectAnalytics?.flatMap(s => s.topics?.filter(t => t.accuracy < 50)) || [];

  return (
    <div className="h-screen flex flex-col text-slate-100 overflow-hidden" style={{ backgroundColor: THEME_BG }}>
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <AlertCircle size={24} className="text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Enter Live Contest?</h3>
                <p className="text-xs text-slate-500 font-medium">You're about to start the test</p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-2xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Contest:</span>
                <span className="font-bold text-white">{selectedContest?.title}</span>
              </div>
              {selectedContest?.contest_number && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Number:</span>
                  <span className="font-bold text-white">#{selectedContest.contest_number}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Duration:</span>
                <span className="font-bold text-white">{selectedContest?.duration_minutes} minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Questions:</span>
                <span className="font-bold text-white">{selectedContest?.total_questions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Marks:</span>
                <span className="font-bold text-white">{selectedContest?.total_marks}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setSelectedContest(null);
                }}
                className="flex-1 px-6 py-3 rounded-2xl font-bold text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmEnterArena}
                className="flex-1 px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-lg hover:brightness-110 transition-all"
                style={{ backgroundColor: THEME_PRIMARY }}
              >
                Yes, Start Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <nav className="h-16 border-b border-white/5 glass-panel px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center rotate-3 shadow-lg" style={{ backgroundColor: THEME_PRIMARY }}>
             <Zap size={20} className="text-white fill-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-white uppercase italic">
            EDUNEXT
          </span>
        </div>

        <div className="flex items-center gap-8">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 font-bold px-3 py-1 rounded-full border" style={{ color: THEME_PRIMARY, borderColor: `${THEME_PRIMARY}33`, backgroundColor: `${THEME_PRIMARY}11` }}>
                <Flame size={16} fill="currentColor" /> {currentStreak}
              </div>
              <div className="flex items-center gap-1.5 font-bold px-3 py-1 rounded-full border" style={{ color: THEME_PRIMARY, borderColor: `${THEME_PRIMARY}33`, backgroundColor: `${THEME_PRIMARY}11` }}>
                <Trophy size={16} fill="currentColor" /> {stats.rating || 0}
              </div>
           </div>
           <button 
            onClick={() => router.push('/analytics')}
            className="flex items-center gap-2 text-xs font-bold hover:text-amber-400 transition-colors"
           >
             <BarChart3 size={16}/> INSIGHTS
           </button>
           <div className="w-9 h-9 rounded-full border-2 shadow-lg cursor-pointer" style={{ borderColor: `${THEME_PRIMARY}55`, background: `linear-gradient(45deg, ${THEME_PRIMARY}, #d97706)` }}></div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-6">
          
          {/* Left: Progression */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 blur-3xl rounded-full -mr-10 -mt-10 group-hover:bg-amber-500/10 transition-all" style={{ backgroundColor: `${THEME_PRIMARY}11` }}></div>
               <div className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: THEME_PRIMARY }}>
                 <Target size={12}/> Current Status
               </div>
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border shadow-inner" style={{ backgroundColor: `${THEME_PRIMARY}11`, borderColor: `${THEME_PRIMARY}33` }}>
                    🥇
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white leading-none">{stats.league || 'Bronze'} League</h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">Rank #{stats.globalRank || '--'} Worldwide</p>
                  </div>
               </div>
               <div className="h-3 bg-slate-900/50 rounded-full overflow-hidden mb-3 p-0.5 border border-white/5">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${stats.leagueProgress || 0}%`, backgroundColor: THEME_PRIMARY }} />
               </div>
               <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>PROMOTION AT 100%</span>
                  <span style={{ color: THEME_PRIMARY }}>{stats.leagueProgress || 0}%</span>
               </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl">
               <div className="flex justify-between items-center mb-4">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <TrendingUp size={12}/> Preparedness
                  </div>
                  <div className="text-xl font-black" style={{ color: THEME_PRIMARY }}>{stats.preparednessScore || 0}%</div>
               </div>
               <div className="flex gap-1 h-2 mb-2">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className={`flex-1 rounded-full ${i < (stats.preparednessScore || 0) / 10 ? 'bg-amber-500' : 'bg-slate-800'}`}></div>
                  ))}
               </div>
               <p className="text-[10px] text-slate-500 leading-tight">Your readiness for the upcoming JEE Main shift based on simulated accuracy and time-pressure metrics.</p>
            </div>

            <div className="glass-panel rounded-3xl p-6">
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <CalendarDays size={12}/> Activity Heatmap
               </div>
               {renderHeatmap()}
            </div>
          </div>

          {/* Center: Arena */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            <section>
              <div className="flex items-center justify-between mb-4 px-2">
                 <h2 className="text-lg font-black flex items-center gap-2 uppercase tracking-tighter">
                    <LayoutGrid size={18} style={{ color: THEME_PRIMARY }} /> 
                    <span style={{ color: THEME_PRIMARY }}>LIVE ARENA</span>
                 </h2>
                 <button className="text-[10px] font-bold hover:opacity-80 transition-colors uppercase tracking-widest" style={{ color: THEME_PRIMARY }}>Live Leaderboard</button>
              </div>
              
              {/* Active Contest Cards */}
              <div className="space-y-4">
                 {loading ? (
                   <div className="glass-panel p-5 rounded-3xl border border-white/5">
                     <div className="flex items-center gap-3">
                       <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                       <p className="text-slate-500 text-sm">Loading contests...</p>
                     </div>
                   </div>
                 ) : contests.length === 0 ? (
                   <div className="glass-panel p-8 rounded-3xl border border-white/5 text-center">
                     <LayoutGrid size={48} className="mx-auto mb-4 text-slate-700" />
                     <p className="text-slate-500 text-sm mb-2">No active contests at the moment</p>
                     <p className="text-slate-600 text-xs">Check back later for live competitions</p>
                   </div>
                 ) : (
                   contests.map(contest => {
                     const timeRemaining = contest.status === 'LIVE' 
                       ? getTimeRemaining(contest.endTime)
                       : getTimeRemaining(contest.startTime);

                     return (
                       <div key={contest.id} className="glass-panel p-5 rounded-3xl border border-white/5 hover:border-amber-500/30 transition-all group relative overflow-hidden">
                          {contest.status === 'LIVE' && (
                            <div className="absolute top-0 right-0 h-1 w-full animate-pulse shadow-lg" style={{ backgroundColor: "#ef4444" }}></div>
                          )}
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-2 flex-1">
                               <div className="flex items-center gap-2 flex-wrap">
                                  {contest.contest_number && (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                                      #{contest.contest_number}
                                    </span>
                                  )}
                                  <h3 className="font-bold text-lg transition-colors" style={{ color: THEME_PRIMARY }}>{contest.title || 'Unnamed Contest'}</h3>
                                  {contest.status === 'LIVE' ? (
                                    <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/20 flex items-center gap-1">
                                      <div className="w-1 h-1 bg-red-500 rounded-full animate-ping"></div> LIVE
                                    </span>
                                  ) : (
                                    <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/20">
                                      STARTS IN
                                    </span>
                                  )}
                               </div>
                               
                               {contest.description && (
                                 <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                                   {contest.description}
                                 </p>
                               )}
                               
                               <div className="flex items-center gap-4 text-[10px] font-bold flex-wrap">
                                  <span className="flex items-center gap-1 text-white"><Users size={12}/> {contest.participants?.toLocaleString() || 0} joined</span>
                                  <span className="flex items-center gap-1 text-white">
                                    <Clock size={12}/> 
                                    {contest.status === 'LIVE' ? `Ends in ${timeRemaining}` : timeRemaining}
                                  </span>
                                  {contest.total_questions && (
                                    <span className="text-white">{contest.total_questions} Questions</span>
                                  )}
                                  {contest.total_marks && (
                                    <span className="text-white">{contest.total_marks} Marks</span>
                                  )}
                                  {contest.duration_minutes && (
                                    <span className="text-white">{contest.duration_minutes} Min</span>
                                  )}
                               </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              <button 
                                onClick={() => contest.status === 'LIVE' && handleEnterArena(contest)}
                                className={`px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
                                  contest.status === 'LIVE' 
                                    ? 'text-white hover:brightness-110 active:scale-95 cursor-pointer' 
                                    : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                                }`}
                                style={{ backgroundColor: contest.status === 'LIVE' ? THEME_PRIMARY : undefined }}
                                disabled={contest.status !== 'LIVE'}
                              >
                                 {contest.status === 'LIVE' ? 'Enter Arena' : 'Not Started'}
                              </button>
                            </div>
                          </div>
                       </div>
                     );
                   })
                 )}
              </div>
            </section>

            {/* Previous Contests - Collapsible */}
            {!loading && (
              <section className="mt-8">
                <button 
                  onClick={() => setShowPreviousContests(!showPreviousContests)}
                  className="w-full flex items-center justify-between mb-4 px-2 group"
                  disabled={previousContests.length === 0}
                >
                   <h2 className={`text-lg font-black flex items-center gap-2 uppercase tracking-tighter transition-colors ${
                     previousContests.length === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 group-hover:text-slate-300'
                   }`}>
                      <CheckCircle size={18}/> PREVIOUS CONTESTS ({previousContests.length})
                   </h2>
                   {previousContests.length > 0 && (
                     showPreviousContests ? (
                       <ChevronUp size={20} className="text-slate-400 group-hover:text-amber-400 transition-colors" />
                     ) : (
                       <ChevronDown size={20} className="text-slate-400 group-hover:text-amber-400 transition-colors" />
                     )
                   )}
                </button>
                
                {showPreviousContests && previousContests.length > 0 && (
                  <>
                    {/* Search Bar */}
                    <div className="mb-4 relative">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search by name, number, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full glass-panel border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/30 transition-all"
                        style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
                      />
                    </div>

                    {/* Contest List */}
                    <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
                       {filteredPreviousContests.length === 0 ? (
                         <div className="glass-panel p-6 rounded-2xl border border-white/5 text-center">
                           <p className="text-slate-500 text-sm">No contests match your search</p>
                         </div>
                       ) : (
                         filteredPreviousContests.map(contest => {

                           return (
                             <div key={contest.id} className="glass-panel p-4 rounded-2xl border border-white/5 hover:border-slate-700 transition-all relative">
                                <div className="flex justify-between items-start gap-4">
                                  <div className="space-y-1 flex-1">
                                     {/* Contest Number and Title */}
                                     <div className="flex items-center gap-2">
                                       {contest.contest_number && (
                                         <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-800 text-slate-500">
                                           #{contest.contest_number}
                                         </span>
                                       )}
                                       <h3 className="font-bold text-sm text-slate-300">{contest.title || 'Unnamed Contest'}</h3>
                                     </div>
                                     
                                     {/* Description */}
                                     {contest.description && (
                                       <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-1">
                                         {contest.description}
                                       </p>
                                     )}
                                     
                                     {/* Contest Stats */}
                                     <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 flex-wrap">
                                        <span className="flex items-center gap-1"><Users size={10}/> {contest.participants?.toLocaleString() || 0}</span>
                                        <span>Ended {new Date(contest.end_time).toLocaleDateString()}</span>
                                        {contest.total_questions && <span>{contest.total_questions} Qs</span>}
                                        {contest.total_marks && <span>{contest.total_marks} Marks</span>}
                                     </div>
                                  </div>
                                  
                                  {/* View Analysis & Solutions Buttons */}
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={async () => {
                                        // Check if user has attempted
                                        const { data: attemptData } = await supabase
                                          .from('test_attempts')
                                          .select('id')
                                          .eq('session_id', contest.id)
                                          .eq('user_id', currentUserId)
                                          .maybeSingle();
                                        
                                        if (attemptData) {
                                          router.push(`/results/${attemptData.id}`);
                                        } else {
                                          alert('You have not attempted this contest yet!');
                                        }
                                      }}
                                      className="px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all hover:brightness-110 hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 shadow-lg"
                                      style={{ backgroundColor: THEME_PRIMARY, color: '#0E172A' }}
                                    >
                                      <Brain size={12}/> Analysis
                                    </button>
                                    
                                    <button 
                                      onClick={async () => {
                                        // Check if user has attempted
                                        const { data: attemptData } = await supabase
                                          .from('test_attempts')
                                          .select('id')
                                          .eq('session_id', contest.id)
                                          .eq('user_id', currentUserId)
                                          .maybeSingle();
                                        
                                        if (attemptData) {
                                          router.push(`/results/${attemptData.id}/solution`);
                                        } else {
                                          alert('You have not attempted this contest yet!');
                                        }
                                      }}
                                      className="px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all hover:brightness-110 hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 bg-slate-700 text-white shadow-lg hover:bg-slate-600"
                                    >
                                      <FileText size={12}/> Solutions
                                    </button>
                                  </div>
                                </div>
                             </div>
                           );
                         })
                       )}
                    </div>
                  </>
                )}
              </section>
            )}

            {/* Hyper-Personalized Training */}
            <section className="relative group mt-8">
               <div className="absolute inset-0 blur-[60px] rounded-full opacity-0 group-hover:opacity-10 transition-all" style={{ backgroundColor: THEME_PRIMARY }}></div>
               <div className="glass-panel rounded-[40px] p-8 border border-white/10 relative overflow-hidden bg-gradient-to-br from-amber-950/20 to-slate-900/40">
                  <Brain className="absolute -right-10 -bottom-10 w-64 h-64 opacity-5 rotate-12" style={{ color: THEME_PRIMARY }} />
                  <div className="relative z-10">
                     <h2 className="text-3xl font-black mb-2 text-white">Hyper-Personalized Training</h2>
                     <p className="text-slate-400 text-sm mb-6 max-w-md font-medium leading-relaxed">
                       AI-powered analysis identifies your weak areas. Start targeted practice to improve faster.
                     </p>
                     
                     {stats.recommendedStudy && stats.recommendedStudy.length > 0 && (
                       <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {stats.recommendedStudy.slice(0, 2).map((item, idx) => (
                             <a key={idx} href={item.link} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all">
                                <div className="p-2 rounded-xl bg-slate-900"><BookOpen size={16} style={{ color: THEME_PRIMARY }}/></div>
                                <div>
                                   <div className="text-[10px] font-black uppercase text-slate-500">{item.type}</div>
                                   <div className="text-xs font-bold text-white truncate w-32">{item.title}</div>
                                </div>
                             </a>
                          ))}
                       </div>
                     )}

                     <div className="flex gap-4">
                       <button 
                         onClick={() => router.push('/dashboard/ai-prep/practice')}
                         className="px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 bg-white text-slate-950"
                       >
                         Start Fix Drill <ChevronRight size={16}/>
                       </button>
                     </div>
                  </div>
               </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
             <div className="glass-panel rounded-3xl p-6 border border-white/10">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Star size={14} style={{ color: THEME_PRIMARY }}/> Global Leaders
                </div>
                <div className="space-y-4">
                   {stats.topPerformers && stats.topPerformers.length > 0 ? (
                     stats.topPerformers.map((user, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-all group">
                           <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-slate-500 w-4">{user.rank}.</span>
                              <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-[10px] font-bold">
                                 {user.name?.charAt(0) || '?'}
                              </div>
                              <span className="text-xs font-bold text-slate-200">{user.name}</span>
                           </div>
                           <div className="text-[10px] font-black group-hover:text-amber-400 transition-colors" style={{ color: THEME_PRIMARY }}>{user.rating}</div>
                        </div>
                     ))
                   ) : (
                     <p className="text-xs text-slate-600 text-center py-4">No leaderboard data yet</p>
                   )}
                </div>
                <button className="w-full mt-4 py-2 rounded-xl bg-slate-900 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                  Full Rankings
                </button>
             </div>

             <div className="glass-panel rounded-3xl p-6">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                   <BarChart3 size={14}/> Subject Proficiency
                </div>
                <div className="space-y-6">
                   {stats.subjectAnalytics && stats.subjectAnalytics.length > 0 ? (
                     stats.subjectAnalytics.map(sub => (
                       <div key={sub.subject} className="space-y-2">
                          <div className="flex justify-between items-end">
                             <span className="text-xs font-bold text-slate-200">{sub.subject}</span>
                             <span className="text-xs font-black" style={{ color: THEME_PRIMARY }}>{sub.proficiency}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-900 rounded-full p-0.5 overflow-hidden">
                             <div className="h-full rounded-full transition-all duration-500" style={{ width: `${sub.proficiency}%`, backgroundColor: THEME_PRIMARY }}></div>
                          </div>
                       </div>
                     ))
                   ) : (
                     <p className="text-xs text-slate-600 text-center py-4">Start practicing to see your progress</p>
                   )}
                </div>
             </div>

             <div className="glass-panel rounded-3xl p-6 border-l-2 border-l-red-500/50">
                <div className="text-[10px] font-black text-red-400/70 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Brain size={14}/> High Risk Topics
                </div>
                <div className="space-y-3">
                   {weakTopics.length > 0 ? (
                     weakTopics.slice(0, 4).map((topic, idx) => (
                       <div key={idx} className="flex items-center justify-between p-1 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer">
                          <span className="text-xs text-slate-300 font-medium">{topic.topic}</span>
                          <div className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">{topic.accuracy}%</div>
                       </div>
                     ))
                   ) : (
                     <p className="text-xs text-slate-600 text-center py-4">No weak topics identified yet</p>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .glass-panel {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px);
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}