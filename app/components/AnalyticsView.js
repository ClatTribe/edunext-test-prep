"use client";

import React, { useState } from 'react';
import { ArrowLeft, Target, TrendingUp, Clock, Activity, Zap } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

/**
 * AnalyticsView Component
 * @param {Object} props
 * @param {Object} props.stats - User statistics data
 * @param {Function} props.onBack - Function to handle back button click
 */
const AnalyticsView = ({ stats, onBack }) => {
  const THEME_PRIMARY = "#F59E0B";

  // State for subject selection
  const [selectedSubject, setSelectedSubject] = useState(
    stats?.subjectAnalytics?.[0]?.subject || ""
  );

  // Safeguard: Finding the currently selected subject data
  const currentSubject = stats?.subjectAnalytics?.find(
    (s) => s.subject === selectedSubject
  ) || stats?.subjectAnalytics?.[0];

  // Loading or Error state handling
  if (!stats || !stats.subjectAnalytics) {
    return (
      <div className="min-h-screen bg-[#0E172A] flex items-center justify-center text-white">
        <p>No analytics data available.</p>
      </div>
    );
  }

  // --- PLACE THIS LOGIC BEFORE RENDER ---
const getDynamicInsights = () => {
  if (!currentSubject || !currentSubject.topics || currentSubject.topics.length === 0) return [];

  // Identify the weakest topic (Lowest Accuracy)
  const weakTopic = [...currentSubject.topics].sort((a, b) => a.accuracy - b.accuracy)[0];
  // Identify the slowest topic (Highest Time per Question)
  const slowTopic = [...currentSubject.topics].sort((a, b) => b.avgTime - a.avgTime)[0];

  return [
    { 
      id: 1, 
      text: weakTopic?.accuracy < 60 
        ? `Focus on ${weakTopic.topic}. Your accuracy is currently ${weakTopic.accuracy}%. Aim for a 75% benchmark.` 
        : `Great consistency! You are performing well in ${currentSubject.subject}. Keep maintaining this lead.` 
    },
    { 
      id: 2, 
      text: slowTopic?.avgTime > 60 
        ? `Improve speed in ${slowTopic.topic} (${slowTopic.avgTime}s/q). Try to bring it under the 45s benchmark.` 
        : "Your response time is optimal. Continue focusing on conceptual precision." 
    },
    { 
      id: 3, 
      text: "Use 'Drill Mode' to target high-frequency questions in your lower accuracy segments." 
    }
  ];
};

const insights = getDynamicInsights();

  return (
    <div className="min-h-screen bg-[#0E172A] text-slate-100 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <button 
              onClick={onBack} 
              className="flex items-center gap-2 text-slate-500 hover:text-white font-black text-xs tracking-widest uppercase transition-colors mb-4"
            >
              <ArrowLeft size={16}/> BACK TO ARENA
            </button>
            <h1 className="text-4xl font-black tracking-tight">
              Performance <span style={{ color: THEME_PRIMARY }}>Insights</span>
            </h1>
          </div>
          
          {/* Subject Switcher */}
          <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-white/5 overflow-x-auto max-w-full">
            {stats.subjectAnalytics.map((s) => (
              <button
                key={s.subject}
                onClick={() => setSelectedSubject(s.subject)}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-all ${
                  selectedSubject === s.subject 
                    ? 'bg-amber-500 text-slate-950 shadow-lg' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {s.subject}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Charts and Details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Main Area Chart Card */}
            <div className="bg-slate-900/40 p-8 rounded-[40px] border border-white/10 relative overflow-hidden backdrop-blur-sm">
               <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                     <div className="p-2 rounded-xl bg-amber-500/10">
                        <Activity size={20} className="text-amber-500"/>
                     </div>
                     <div>
                        <h3 className="font-bold">Accuracy Trend</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Last 10 Practice Sessions</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className={`text-2xl font-black ${stats.improvement >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stats.improvement > 0 ? `+${stats.improvement}%` : `${stats.improvement}%`}
                    </div>
                     <div className="text-[10px] text-slate-500 font-bold">VS LAST WEEK</div>
                  </div>
               </div>
               
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentSubject?.accuracyTrend || []}>
                        <defs>
                           <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={THEME_PRIMARY} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={THEME_PRIMARY} stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="date" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                        <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                          itemStyle={{ color: THEME_PRIMARY, fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="value" stroke={THEME_PRIMARY} strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Time Distribution Section */}
               <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Clock size={14}/> Time Distribution
                  </h4>
                  <div className="space-y-4">
                     {currentSubject?.topics?.slice(0, 3).map((t) => (
                        <div key={t.topic} className="space-y-1">
                           <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-400">{t.topic}</span>
                              <span className="text-white">{t.avgTime}s/q</span>
                           </div>
                           <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-amber-500" 
                                style={{ width: `${Math.min((t.avgTime / 120) * 100, 100)}%` }}
                              ></div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Topic Difficulty Grid */}
               <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Target size={14}/> Topic Difficulty Grid
                  </h4>
                  <div className="flex flex-wrap gap-2">
                     {currentSubject?.topics?.map((t) => (
                        <div 
                          key={t.topic} 
                          className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-tight ${
                            t.accuracy > 70 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                            t.accuracy > 40 ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 
                            'bg-red-500/10 border-red-500/20 text-red-400'
                          }`}
                        >
                           {t.topic} • {t.accuracy}%
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: Sidebar Stats */}
          <div className="lg:col-span-4 space-y-6">
             {/* Rating Card */}
             <div className="bg-slate-900/40 p-8 rounded-[40px] border border-white/10 bg-gradient-to-br from-amber-500/5 to-transparent backdrop-blur-sm">
  <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4">Current Rating</div>
  <div className="flex items-end gap-3 mb-6">
    <div className="text-6xl font-black leading-none">{stats.rating}</div>
    <div className="text-emerald-400 font-bold mb-1 flex items-center">
      <TrendingUp size={16} className="mr-1"/> {stats.ratingChange}
    </div>
  </div>
  
  <div className="space-y-4 pt-6 border-t border-white/5">
    <div className="flex justify-between text-xs font-bold">
      <span className="text-slate-500">Global Percentile</span>
      <span className="text-white">{stats.globalPercentile}%</span>
    </div>
    <div className="flex justify-between text-xs font-bold">
      <span className="text-slate-500">Questions Solved</span>
      <span className="text-white">{stats.totalSolved}</span>
    </div>
    <div className="flex justify-between text-xs font-bold">
      <span className="text-slate-500">Avg Session Time</span>
      <span className="text-white">{stats.avgSessionTime}</span>
    </div>
  </div>
</div>

             {/* Growth Strategy Card */}
             <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
    <Zap size={14} className="text-amber-500"/> Growth Strategy
  </h4>
  <div className="space-y-4">
    {insights.length > 0 ? insights.map((item) => (
      <div key={item.id} className="flex gap-4 group cursor-pointer">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-amber-500/20 transition-all font-bold text-xs">
          {item.id}
        </div>
        <p className="text-xs text-slate-400 font-medium leading-relaxed group-hover:text-slate-200">
          {item.text}
        </p>
      </div>
    )) : (
      <p className="text-xs text-slate-500">Practice more to see insights.</p>
    )}
  </div>
</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;