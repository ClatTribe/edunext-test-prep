"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Trophy, ArrowLeft, Crown, Zap } from 'lucide-react';

export default function LeaderboardPage() {
  const router = useRouter();
  const { id } = useParams();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contestTitle, setContestTitle] = useState("Arena");

  useEffect(() => {
    const fetchContestLeaderboard = async () => {
      try {
        setLoading(true);
        if (!id) return;

        // 1. Contest details fetch (Title ke liye)
        const { data: contestInfo } = await supabase
          .from('contests')
          .select('title')
          .eq('id', id)
          .single();
        
        if (contestInfo) setContestTitle(contestInfo.title);

        // 2. Fetch Attempts with PUBLIC.USERS JOIN
        // Note: Hum 'users' (public) table se join kar rahe hain kyunki auth join 400 error deta hai
        const { data: finalAttempts, error: attemptError } = await supabase
          .from('test_attempts')
          .select(`
            *,
            users (
              username,
              full_name
            )
          `)
          .or(`test_id.eq.${id},session_id.eq.${id}`)
          .order('obtained_marks', { ascending: false });

        if (attemptError) throw attemptError;

        if (finalAttempts && finalAttempts.length > 0) {
          const uniqueUsers = {};

          finalAttempts.forEach((att) => {
            if (!att.user_id) return;

            const userId = att.user_id;
            
            // Username logic: Agar public.users table mein data hai toh wo, warna Warrior name
            const displayName = att.users?.username || att.users?.full_name || `Warrior_${userId.substring(0, 4)}`;

            const existingAttempt = uniqueUsers[userId];

            // Best Attempt logic: Ek user ka sirf highest score dikhana hai
            if (!existingAttempt || Number(existingAttempt.obtained_marks) < Number(att.obtained_marks)) {
              uniqueUsers[userId] = {
                ...att,
                obtained_marks: Number(att.obtained_marks),
                username: displayName 
              };
            }
          });

          // 3. Final Sorting
          const sortedList = Object.values(uniqueUsers).sort((a, b) => b.obtained_marks - a.obtained_marks);
          setLeaderboardData(sortedList);
        } else {
          setLeaderboardData([]);
        }
      } catch (err) {
        console.error("Leaderboard Error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContestLeaderboard();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center">
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 text-amber-500 font-mono tracking-[0.3em] text-[10px] uppercase animate-pulse">Syncing Leaderboard...</p>
    </div>
  );

  const topThree = leaderboardData.slice(0, 3);
  const others = leaderboardData.slice(3);

  return (
    <div className="min-h-screen bg-[#050810] text-white p-4 md:p-8 font-sans overflow-x-hidden">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex justify-between items-center mb-12">
          <button onClick={() => router.back()} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/10 transition-all">
            <ArrowLeft size={20} className="text-slate-400" />
          </button>
          <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold tracking-widest uppercase">
            {contestTitle}
          </div>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none mb-4">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">Elite</span>
          </h1>
          <p className="text-slate-500 font-medium tracking-[0.2em] uppercase text-xs">Live Standings</p>
        </div>

        {leaderboardData.length === 0 ? (
           <div className="text-center p-20 rounded-[3rem] border border-white/5 bg-white/5">
              <Trophy size={48} className="mx-auto mb-4 text-slate-700" />
              <p className="text-slate-500 uppercase font-black text-sm tracking-widest">No Warriors have qualified yet</p>
           </div>
        ) : (
          <>
            {/* Podium Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
              {/* Rank 2 */}
              {topThree[1] && (
                <div className="order-2 md:order-1 bg-[#0f172a]/40 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-md text-center transform hover:-translate-y-2 transition-all">
                  <div className="w-16 h-16 bg-slate-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Trophy size={32} />
                  </div>
                  <h3 className="font-bold text-lg truncate uppercase">{topThree[1].username}</h3>
                  <div className="text-2xl font-black text-slate-400 mt-2">{topThree[1].obtained_marks}</div>
                </div>
              )}

              {/* Rank 1 */}
              {topThree[0] && (
                <div className="order-1 md:order-2 bg-gradient-to-b from-amber-500/20 to-transparent border-2 border-amber-500/30 p-10 rounded-[3rem] backdrop-blur-xl text-center relative transform hover:-translate-y-4 transition-all shadow-[0_0_50px_rgba(245,158,11,0.15)]">
                  <div className="w-24 h-24 bg-amber-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                    <Crown size={48} className="text-white fill-white" />
                  </div>
                  <h3 className="font-black text-2xl uppercase tracking-tighter">{topThree[0].username}</h3>
                  <div className="text-5xl font-black text-amber-500 mt-3">{topThree[0].obtained_marks}</div>
                </div>
              )}

              {/* Rank 3 */}
              {topThree[2] && (
                <div className="order-3 bg-[#0f172a]/40 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-md text-center transform hover:-translate-y-2 transition-all">
                  <div className="w-16 h-16 bg-orange-800/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-500">
                    <Trophy size={32} />
                  </div>
                  <h3 className="font-bold text-lg truncate uppercase">{topThree[2].username}</h3>
                  <div className="text-2xl font-black text-orange-500 mt-2">{topThree[2].obtained_marks}</div>
                </div>
              )}
            </div>

            {/* Others List */}
            <div className="space-y-3">
              {others.map((player, i) => (
                <div key={player.id || i} className="group flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all">
                  <div className="flex items-center gap-6">
                    <span className="text-slate-600 font-black text-lg w-8">#{i + 4}</span>
                    <span className="font-bold text-slate-200 uppercase tracking-tight">{player.username}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-black font-mono text-slate-300 group-hover:text-amber-500 transition-colors">{player.obtained_marks}</span>
                    <div className="p-2 bg-white/5 rounded-xl"><Zap size={14} className="text-slate-600 group-hover:text-amber-500" /></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}