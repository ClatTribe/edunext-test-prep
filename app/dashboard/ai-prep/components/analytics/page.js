"use client";

import React, { useState } from 'react';
import { ArrowLeft, Target, Activity, Clock, Zap, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AnalyticsView = ({ stats, onBack }) => {
  const THEME_PRIMARY = "#F59E0B";
  const [selectedSubject, setSelectedSubject] = useState(stats?.subjectAnalytics?.[0]?.subject || 'Physics');

  const currentSubject = stats?.subjectAnalytics?.find(s => s.subject === selectedSubject) || stats?.subjectAnalytics?.[0];

  // Default stats if not provided
  const defaultStats = {
    rating: stats?.rating || 0,
    subjectAnalytics: stats?.subjectAnalytics || []
  };

  return (
    <div className="min-h-screen bg-[#0E172A] text-slate-100 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-white font-black text-xs tracking-widest uppercase transition-colors mb-4">
              <ArrowLeft size={16}/> BACK TO ARENA
            </button>
            <h1 className="text-4xl font-black tracking-tight">Performance <span style={{ color: THEME_PRIMARY }}>Insights</span></h1>
          </div>
          
          {defaultStats.subjectAnalytics.length > 0 && (
            <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-white/5">
              {defaultStats.subjectAnalytics.map(s => (
                <button
                  key={s.subject}
                  onClick={() => setSelectedSubject(s.subject)}
                  className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${selectedSubject === s.subject ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {s.subject}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Chart Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-panel p-8 rounded-[40px] border border-white/10 relative overflow-hidden">
               <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                     <div className="p-2 rounded-xl bg-amber-500/10"><Activity size={20} className="text-amber-500"/></div>
                     <div>
                        <h3 className="font-bold">Accuracy Trend</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Last 10 Practice Sessions</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-2xl font-black text-emerald-400">+5.4%</div>
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
               <div className="glass-panel p-6 rounded-3xl border border-white/10">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Clock size={14}/> Time Distribution</h4>
                  <div className="space-y-4">
                     {currentSubject?.topics?.slice(0, 3).map(t => (
                        <div key={t.topic} className="space-y-1">
                           <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-400">{t.topic}</span>
                              <span className="text-white">{t.avgTime}s/q</span>
                           </div>
                           <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500" style={{ width: `${(t.avgTime / 120) * 100}%` }}></div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="glass-panel p-6 rounded-3xl border border-white/10">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Target size={14}/> Topic Difficulty Grid</h4>
                  <div className="flex flex-wrap gap-2">
                     {currentSubject?.topics?.map(t => (
                        <div 
                          key={t.topic} 
                          className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-tight ${t.accuracy > 70 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : t.accuracy > 40 ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                        >
                           {t.topic} • {t.accuracy}%
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="lg:col-span-4 space-y-6">
             <div className="glass-panel p-8 rounded-[40px] border border-white/10 bg-gradient-to-br from-amber-500/5 to-transparent">
                <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4">Current Rating</div>
                <div className="flex items-end gap-3 mb-6">
                   <div className="text-6xl font-black leading-none">{defaultStats.rating}</div>
                   <div className="text-emerald-400 font-bold mb-1 flex items-center"><TrendingUp size={16}/> +240</div>
                </div>
                <div className="space-y-4 pt-6 border-t border-white/5">
                   <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500">Global Percentile</span>
                      <span className="text-white">99.2%</span>
                   </div>
                   <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500">Questions Solved</span>
                      <span className="text-white">2,410</span>
                   </div>
                   <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500">Avg Session Time</span>
                      <span className="text-white">42 mins</span>
                   </div>
                </div>
             </div>

             <div className="glass-panel p-6 rounded-3xl border border-white/10">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Zap size={14} className="text-amber-500"/> Growth Strategy</h4>
                <div className="space-y-4">
                   <div className="flex gap-4 group cursor-pointer">
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-amber-500/20 transition-all">1</div>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed group-hover:text-slate-200">Increase practice frequency for <span className="text-amber-500">Rotational Dynamics</span> to improve accuracy above 50%.</p>
                   </div>
                   <div className="flex gap-4 group cursor-pointer">
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-amber-500/20 transition-all">2</div>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed group-hover:text-slate-200">Reduce average response time in <span className="text-amber-500">Calculus</span> to stay under the 1-minute benchmark.</p>
                   </div>
                   <div className="flex gap-4 group cursor-pointer">
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-amber-500/20 transition-all">3</div>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed group-hover:text-slate-200">Utilize "Numerical Drill" mode for <span className="text-amber-500">Stoichiometry</span> problems.</p>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;