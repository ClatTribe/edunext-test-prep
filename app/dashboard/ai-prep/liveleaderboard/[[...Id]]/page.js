"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Loader2, AlertCircle, ArrowLeft, Crown, Zap, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    const fetchValidLeaderboard = async () => {
      try {
        setLoading(true);
        // ... (Aapka pichla logic same rahega data fetch karne ka)
        const { data: allAttempts } = await supabase.from('test_attempts').select('test_id, user_id, obtained_marks').order('created_at', { ascending: false });
        if (!allAttempts?.length) throw new Error("No data found");

        let finalExamId = null;
        for (const attempt of allAttempts) {
          const { data: sec } = await supabase.from('contest_sections').select('contest_id').eq('contest_id', attempt.test_id).limit(1);
          if (sec?.length > 0) {
            const { data: con } = await supabase.from('contests').select('exam_id').eq('id', sec[0].contest_id).single();
            if (con?.exam_id) { finalExamId = con.exam_id; break; }
          }
        }

        const { data: contests } = await supabase.from('contests').select('id').eq('exam_id', finalExamId);
        const cIds = contests.map(c => c.id);

        const { data: finalAttempts } = await supabase.from('test_attempts').select(`obtained_marks, user_id`).in('test_id', cIds).order('obtained_marks', { ascending: false });

        const userIds = [...new Set(finalAttempts.map(a => a.user_id))].filter(Boolean);
        let usersMap = {};
        const { data: usersData } = await supabase.from('users').select('id, username').in('id', userIds);
        usersData?.forEach(u => { usersMap[u.id] = u.username; });

        setLeaderboardData(finalAttempts.map(att => ({ ...att, username: usersMap[att.user_id] || "Warrior" })));
      } catch (err) { setStatus(err.message); } finally { setLoading(false); }
    };
    fetchValidLeaderboard();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center">
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 text-amber-500 font-mono tracking-[0.5em] text-[10px] uppercase">Syncing Universe...</p>
    </div>
  );

  const topThree = leaderboardData.slice(0, 3);
  const others = leaderboardData.slice(3);

  return (
    <div className="min-h-screen bg-[#050810] text-white p-4 md:p-8 font-sans overflow-x-hidden">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation */}
        <div className="flex justify-between items-center mb-12">
          <button onClick={() => router.back()} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/10 transition-all">
            <ArrowLeft size={20} className="text-slate-400" />
          </button>
          <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold tracking-widest uppercase">
            Live Season 1
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none mb-4">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">Elite</span>
          </h1>
          <p className="text-slate-500 font-medium tracking-[0.2em] uppercase text-xs">Top performers across the globe</p>
        </div>

        {/* Podium (Top 3 Players) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
          {/* Silver - Rank 2 */}
          {topThree[1] && (
            <div className="order-2 md:order-1 bg-[#0f172a]/40 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-md text-center transform hover:-translate-y-2 transition-all">
              <div className="w-16 h-16 bg-slate-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Medal rank={2} color="#94a3b8" />
              </div>
              <h3 className="font-bold text-lg truncate uppercase">{topThree[1].username}</h3>
              <div className="text-2xl font-black text-slate-400 mt-2">{topThree[1].obtained_marks}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Points</div>
            </div>
          )}

          {/* Gold - Rank 1 */}
          {topThree[0] && (
            <div className="order-1 md:order-2 bg-gradient-to-b from-amber-500/20 to-transparent border-2 border-amber-500/30 p-10 rounded-[3rem] backdrop-blur-xl text-center relative transform hover:-translate-y-4 transition-all overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.15)]">
              <div className="absolute top-0 right-0 p-4 opacity-20"><Flame size={40} className="text-amber-500" /></div>
              <div className="w-24 h-24 bg-amber-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                <Crown size={48} className="text-white fill-white" />
              </div>
              <h3 className="font-black text-2xl uppercase tracking-tighter">{topThree[0].username}</h3>
              <div className="text-5xl font-black text-amber-500 mt-3">{topThree[0].obtained_marks}</div>
              <div className="text-xs text-amber-500/60 uppercase tracking-[0.3em] font-black mt-2">Champion</div>
            </div>
          )}

          {/* Bronze - Rank 3 */}
          {topThree[2] && (
            <div className="order-3 bg-[#0f172a]/40 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-md text-center transform hover:-translate-y-2 transition-all">
              <div className="w-16 h-16 bg-orange-800/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Medal rank={3} color="#c2410c" />
              </div>
              <h3 className="font-bold text-lg truncate uppercase">{topThree[2].username}</h3>
              <div className="text-2xl font-black text-orange-500 mt-2">{topThree[2].obtained_marks}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Points</div>
            </div>
          )}
        </div>

        {/* Others List */}
        <div className="space-y-3">
          {others.map((player, i) => (
            <div key={i} className="group flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] hover:border-white/10 transition-all">
              <div className="flex items-center gap-6">
                <span className="text-slate-600 font-black text-lg w-8">#{i + 4}</span>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-200 group-hover:text-white transition-colors uppercase tracking-tight">{player.username}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Active Competitor</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xl font-black font-mono text-slate-300 group-hover:text-amber-500 transition-colors">{player.obtained_marks}</span>
                </div>
                <div className="p-2 bg-white/5 rounded-xl"><Zap size={14} className="text-slate-600 group-hover:text-amber-500 transition-colors" /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple Icon Component for Medal
const Medal = ({ rank, color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><circle cx="12" cy="8" r="7" />
  </svg>
); 