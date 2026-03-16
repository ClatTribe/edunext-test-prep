"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; // 1. Added for dynamic ID
import { Trophy, Medal, Crown, Loader2 } from "lucide-react"; 
import { supabase } from "@/lib/supabase"; 

export default function LeaderboardPage({ user }) { // Removed testId from props
  const searchParams = useSearchParams();
  const testId = searchParams.get("testId"); // 2. Grabs ID from URL query string

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 3. This now triggers correctly when testId is in the URL
    if (testId) {
      fetchLeaderboardData();
    } else {
      setLoading(false);
      setError("No Test ID found. Use URL: .../liveleaderboard?testId=YOUR_ID");
    }
  }, [testId]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      
      const { data: allAttempts, error: supabaseError } = await supabase
        .from('test_sessions')
        .select('*')
        .eq('test_id', testId);

      if (supabaseError) throw supabaseError;

      if (!allAttempts || allAttempts.length === 0) {
        setLeaderboardData([]);
        return;
      }

      const latestAttemptsMap = {};
      allAttempts.forEach(attempt => {
        const userId = attempt.user_id;
        if (!latestAttemptsMap[userId] || 
            new Date(attempt.created_at) > new Date(latestAttemptsMap[userId].created_at)) {
          latestAttemptsMap[userId] = attempt;
        }
      });
      
      const uniqueAttempts = Object.values(latestAttemptsMap);
      const userIds = [...new Set(uniqueAttempts.map(a => a.user_id))];

      let userMap = {};
      try {
        const response = await fetch('/api/get-display-names', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userIds })
        });
        if (response.ok) {
          const data = await response.json();
          userMap = data.userMap || {};
        }
      } catch (e) {
        console.error("Names fetch failed", e);
      }

      const sortedAttempts = uniqueAttempts.sort((a, b) => {
        if (b.obtained_marks !== a.obtained_marks) return b.obtained_marks - a.obtained_marks;
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        return (a.time_spent_minutes || 0) - (b.time_spent_minutes || 0);
      });

      let currentRank = 1;
      const rankedData = sortedAttempts.map((attempt, index) => {
        if (index > 0) {
          const prev = sortedAttempts[index - 1];
          if (prev.obtained_marks !== attempt.obtained_marks || prev.accuracy !== attempt.accuracy) {
            currentRank = index + 1;
          }
        }

        return {
          id: attempt.id,
          rank: currentRank,
          name: userMap[attempt.user_id] || 'Anonymous User',
          score: attempt.obtained_marks || 0,
          accuracy: attempt.accuracy || 0,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${attempt.user_id}`,
          isCurrentUser: attempt.user_id === user?.id
        };
      });

      setLeaderboardData(rankedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-400 animate-pulse">Calculating Rankings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-red-400 p-4 text-center">
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl">
           <p className="font-bold">Error</p>
           <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  if (leaderboardData.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-slate-400">
        No participants yet. Be the first!
      </div>
    );
  }

  const topThree = leaderboardData.slice(0, 3);
  const theRest = leaderboardData.slice(3);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-center mb-12 tracking-tight uppercase">
          Leaderboard
        </h1>

        <div className="flex justify-center items-end gap-2 md:gap-4 mb-16 mt-8">
          <PodiumCard player={topThree[1]} rank={2} height="h-32 md:h-40" color="bg-slate-400" />
          <PodiumCard player={topThree[0]} rank={1} height="h-44 md:h-52" color="bg-yellow-400" isWinner />
          <PodiumCard player={topThree[2]} rank={3} height="h-24 md:h-32" color="bg-orange-400" />
        </div>

        <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 backdrop-blur-sm shadow-xl overflow-hidden">
          {theRest.length > 0 ? (
            theRest.map((player) => (
              <div 
                key={player.id} 
                className={`flex items-center justify-between p-4 border-b border-slate-700/50 last:border-0 hover:bg-slate-700/20 transition ${player.isCurrentUser ? 'bg-blue-500/10' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-slate-500 font-mono w-6 text-center">{player.rank}</span>
                  <img src={player.avatar} className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600" alt="avatar" />
                  <div>
                    <p className={`font-bold ${player.isCurrentUser ? 'text-blue-400' : 'text-slate-200'}`}>
                      {player.name} {player.isCurrentUser && " (You)"}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{player.accuracy}% Accuracy</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-blue-400">{player.score} PTS</span>
              </div>
            ))
          ) : (
            topThree.length > 0 && <p className="p-8 text-center text-slate-500 text-sm italic">End of top performers</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PodiumCard({ player, rank, height, color, isWinner }) {
  if (!player) return <div className="w-20 md:w-28 opacity-0" />;
  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative mb-4">
        {isWinner && <Crown className="absolute -top-7 left-1/2 -translate-x-1/2 text-yellow-400 w-8 h-8 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />}
        <img src={player.avatar} className={`rounded-full border-4 shadow-2xl ${isWinner ? 'border-yellow-400 w-20 h-20 md:w-24 md:h-24' : 'border-slate-500 w-16 h-16 md:w-20 md:h-20'}`} alt="avatar" />
        <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${color} text-black text-[10px] font-black px-3 py-0.5 rounded-full shadow-lg`}>
          #{rank}
        </div>
      </div>
      <div className={`${color} ${height} w-20 md:w-28 rounded-t-2xl flex flex-col items-center pt-3 md:pt-4 shadow-2xl border-x border-t border-white/10`}>
        <p className="text-black font-black text-[10px] md:text-xs truncate w-full px-2 text-center leading-none">{player.name}</p>
        <p className="text-black/80 font-mono font-bold text-xs md:text-sm mt-1">{player.score}</p>
      </div>
    </div>
  );
}