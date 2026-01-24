"use client";

import React, { useEffect, useState } from 'react';
import { ArrowLeft, BrainCircuit, Target, Award, Clock, Zap, TrendingUp, PieChart as PieIcon, Info } from 'lucide-react';

// Types - adjust according to your types file
interface Question {
  id: string;
  topic: string;
  correctAnswer: string;
}

interface TestSession {
  examType: string;
  questions: Question[];
  responses: { [key: string]: string };
}

interface ResultAnalysisProps {
  session: TestSession;
  onHome: () => void;
  aiAnalysisService: (score: number, maxScore: number, stats: any) => Promise<string>;
}

const ResultAnalysis: React.FC<ResultAnalysisProps> = ({ session, onHome, aiAnalysisService }) => {
  const [aiTip, setAiTip] = useState("Analyzing your performance...");

  const stats = {
    total: session.questions.length,
    attempted: Object.keys(session.responses).length,
    correct: Object.keys(session.responses).filter(id => {
      const q = session.questions.find(qu => qu.id === id);
      return q?.correctAnswer === session.responses[id];
    }).length,
  };

  const score = stats.correct * 4 - (stats.attempted - stats.correct) * 1;
  const accuracy = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const tip = await aiAnalysisService(score, stats.total * 4, { Correct: stats.correct });
        setAiTip(tip);
      } catch (error) {
        setAiTip("Performance analysis completed. Keep practicing to improve!");
      }
    };
    fetchAnalysis();
  }, [score, stats.total, stats.correct, aiAnalysisService]);

  // Group by topic - data from Supabase
  const topicBreakdown = session.questions.reduce((acc: any, q) => {
    if (!acc[q.topic]) acc[q.topic] = { total: 0, correct: 0 };
    acc[q.topic].total++;
    if (session.responses[q.id] === q.correctAnswer) acc[q.topic].correct++;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
           <button onClick={onHome} className="flex items-center gap-2 text-slate-400 hover:text-white font-black text-xs tracking-widest uppercase transition-colors">
              <ArrowLeft size={16}/> BACK TO ARENA
           </button>
           <div className="flex gap-3">
             <button className="px-6 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
               Review Questions
             </button>
             <button className="px-6 py-2 bg-indigo-600 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">
               Download Report
             </button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
           {/* Primary Score View */}
           <div className="lg:col-span-1 glass-panel p-8 rounded-[40px] text-center flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent"></div>
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4 relative z-10">Aggregate Score</div>
              <div className="text-7xl font-black text-white group-hover:scale-110 transition-transform mb-2 relative z-10">{score}</div>
              <div className="text-xs text-slate-400 font-bold relative z-10">OUT OF {stats.total * 4}</div>
           </div>
           
           {/* AI Performance Card */}
           <div className="lg:col-span-3 glass-panel p-8 rounded-[40px] border border-white/5 relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Award size={120} className="text-indigo-500"/>
              </div>
              <div className="flex items-center gap-2 text-indigo-400 font-black uppercase text-[10px] tracking-[0.2em] mb-4 relative z-10">
                 <BrainCircuit size={16}/> AI Performance Analysis
              </div>
              <p className="text-xl font-medium text-slate-200 mb-8 max-w-2xl leading-relaxed relative z-10">
                {aiTip}
              </p>
              <div className="flex gap-8 relative z-10">
                 <div className="space-y-1">
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1">
                       <Zap size={10} className="text-yellow-400" fill="currentColor"/> Accuracy
                    </div>
                    <div className="text-2xl font-black text-white">{accuracy}%</div>
                 </div>
                 <div className="space-y-1">
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1">
                       <Clock size={10} className="text-indigo-400"/> Avg Time
                    </div>
                    <div className="text-2xl font-black text-white">45s</div>
                 </div>
                 <div className="space-y-1">
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1">
                       <TrendingUp size={10} className="text-emerald-400"/> Rating Impact
                    </div>
                    <div className="text-2xl font-black text-emerald-400">+12 ELO</div>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <section>
              <h2 className="text-xl font-black mb-6 flex items-center gap-2 px-2 uppercase tracking-wider">
                <Target className="text-red-500" /> Topic-Level Breakdown
              </h2>
              <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
                 <div className="grid grid-cols-1 divide-y divide-white/5">
                    {Object.keys(topicBreakdown).map(topic => {
                       const t = topicBreakdown[topic];
                       const acc = Math.round((t.correct / t.total) * 100);
                       return (
                          <div key={topic} className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
                             <div className="space-y-1">
                                <div className="font-bold text-slate-200">{topic}</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase">{t.correct} of {t.total} Correct</div>
                             </div>
                             <div className="flex items-center gap-6">
                                <div className="w-32 h-2 bg-slate-900 rounded-full overflow-hidden">
                                   <div 
                                      className={`h-full rounded-full ${acc > 80 ? 'bg-emerald-500' : acc > 50 ? 'bg-indigo-500' : 'bg-red-500'}`}
                                      style={{ width: `${acc}%` }}
                                   />
                                </div>
                                <span className={`text-sm font-black min-w-[3ch] ${acc > 80 ? 'text-emerald-400' : acc > 50 ? 'text-indigo-400' : 'text-red-400'}`}>
                                  {acc}%
                                </span>
                             </div>
                          </div>
                       );
                    })}
                 </div>
              </div>
           </section>

           <section>
              <h2 className="text-xl font-black mb-6 flex items-center gap-2 px-2 uppercase tracking-wider">
                <PieIcon className="text-indigo-500" /> Subject Comparison
              </h2>
              <div className="glass-panel rounded-3xl p-8 border border-white/5 h-[340px] flex items-center justify-center">
                 <div className="text-center space-y-4">
                    <Info size={48} className="mx-auto text-slate-800" />
                    <p className="text-slate-500 font-medium max-w-xs">Detailed radar chart visualization of your {session.examType.replace('_',' ')} strength profile will appear here.</p>
                 </div>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default ResultAnalysis;