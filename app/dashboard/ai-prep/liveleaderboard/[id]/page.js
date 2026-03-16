"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Trophy, ArrowLeft, Crown, Zap } from 'lucide-react';

export default function LeaderboardPage() {
  const router = useRouter();
  const { id } = useParams(); // URL se Test ID mil rahi hai
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contestTitle, setContestTitle] = useState("Arena");

  useEffect(() => {
    const fetchContestLeaderboard = async () => {
      try {
        setLoading(true);
        if (!id) return;

        // 1. Contest details fetch (Sirf is Test ki details)
        const { data: contestInfo } = await supabase
          .from('contests')
          .select('title')
          .eq('id', id)
          .single();
        
        if (contestInfo) setContestTitle(contestInfo.title);

        // 2. Fetch Attempts (Sirf is specific test/session ke liye)
        const { data: finalAttempts, error: attemptError } = await supabase
          .from('test_attempts')
          .select(`
            *,
            users (username, full_name)
          `)
          .or(`test_id.eq.${id},session_id.eq.${id}`)
          .order('created_at', { ascending: true }); // Taaki naya attempt baad mein aaye

        if (attemptError) throw attemptError;

        if (finalAttempts && finalAttempts.length > 0) {
          const uniqueUsers = {};

          finalAttempts.forEach((att) => {
            if (!att.user_id) return;
            const userId = att.user_id;
            
            // Marks conversion (Numeric/Float handling)
            const score = Number(att.obtained_marks);
            const displayName = att.users?.username || att.users?.full_name || `Warrior_${userId.substring(0, 4)}`;

            // FIX: Purana koi bhi comparison nahi! 
            // Jo bhi user is test mein aaya hai, uska data map mein daal do.
            // Agar ek user ke multiple attempts hain, toh latest wala save hoga.
            uniqueUsers[userId] = {
              ...att,
              obtained_marks: score,
              username: displayName 
            };
          });

          // 3. Sorting: Mathematical Sorting (High to Low)
          // Isse Positive upar rahenge aur -4, -5 sabse niche
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
  }, [id]); // Test ID change hote hi data refresh hoga

  if (loading) return <div className="min-h-screen bg-[#050810] flex items-center justify-center text-amber-500 font-mono">Syncing...</div>;

  const topThree = leaderboardData.slice(0, 3);
  const others = leaderboardData.slice(3);

  return (
    <div className="min-h-screen bg-[#050810] text-white p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => router.back()} className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10">
            <ArrowLeft size={20} className="text-slate-400" />
          </button>
          <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest">
            {contestTitle}
          </div>
        </div>

        {leaderboardData.length === 0 ? (
          <div className="text-center p-20 bg-white/5 rounded-[3rem] border border-white/5">
             <Trophy size={48} className="mx-auto mb-4 text-slate-700" />
             <p className="text-slate-500 uppercase font-black text-sm tracking-widest">No Warriors for this test</p>
          </div>
        ) : (
          <>
            {/* Podium (Top 3) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
              {/* Rank 2 */}
              {topThree[1] && (
                <div className="order-2 md:order-1 bg-[#0f172a]/40 border border-white/10 p-6 rounded-[2.5rem] text-center">
                  <h3 className="font-bold truncate uppercase">{topThree[1].username}</h3>
                  <div className="text-2xl font-black text-slate-400 mt-2">{topThree[1].obtained_marks}</div>
                </div>
              )}

              {/* Rank 1 */}
              {topThree[0] && (
                <div className="order-1 md:order-2 bg-gradient-to-b from-amber-500/20 to-transparent border-2 border-amber-500/30 p-10 rounded-[3rem] text-center relative shadow-[0_0_50px_rgba(245,158,11,0.15)]">
                  <div className="w-24 h-24 bg-amber-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                    <Crown size={48} className="text-white fill-white" />
                  </div>
                  <h3 className="font-black text-2xl uppercase">{topThree[0].username}</h3>
                  <div className="text-5xl font-black text-amber-500 mt-3">{topThree[0].obtained_marks}</div>
                </div>
              )}

              {/* Rank 3 */}
              {topThree[2] && (
                <div className="order-3 bg-[#0f172a]/40 border border-white/10 p-6 rounded-[2.5rem] text-center">
                  <h3 className="font-bold truncate uppercase">{topThree[2].username}</h3>
                  <div className="text-2xl font-black text-orange-500 mt-2">{topThree[2].obtained_marks}</div>
                </div>
              )}
            </div>

            {/* Others List */}
            <div className="space-y-3">
              {others.map((player, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all">
                  <div className="flex items-center gap-6">
                    <span className="text-slate-600 font-black text-lg w-8">#{i + 4}</span>
                    <span className="font-bold text-slate-200 uppercase tracking-tight">{player.username}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Yahan negative marks dikhenge (chahe wo -4 hon) */}
                    <span className={`text-xl font-black font-mono ${player.obtained_marks < 0 ? 'text-red-500' : 'text-slate-300'}`}>
                      {player.obtained_marks}
                    </span>
                    <div className="p-2 bg-white/5 rounded-xl"><Zap size={14} className="text-slate-600" /></div>
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