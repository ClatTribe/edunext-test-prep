import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, TrendingUp, Award, Zap } from 'lucide-react';

const data = [
  { name: 'Jan', rating: 1200 },
  { name: 'Feb', rating: 1350 },
  { name: 'Mar', rating: 1320 },
  { name: 'Apr', rating: 1480 },
  { name: 'May', rating: 1450 },
  { name: 'Jun', rating: 1590 },
  { name: 'Jul', rating: 1750 },
];

const mockFeed = [
    { user: 'Aarav_JEE', action: 'solved', problem: 'Rotational Motion', pts: '+20', time: '2s ago' },
    { user: 'Sneha.M', action: 'ranked up', problem: 'Candidate Master', pts: '1650', time: '5s ago' },
    { user: 'Rahul_07', action: 'failed', problem: 'Integration', pts: '-5', time: '12s ago' },
    { user: 'VikramS', action: 'solved', problem: 'Electrostatics', pts: '+45', time: '15s ago' },
];

export const ContestSection: React.FC = () => {
    const [feed, setFeed] = useState(mockFeed);

    useEffect(() => {
        const interval = setInterval(() => {
            setFeed(current => {
                const last = current[current.length - 1];
                const rest = current.slice(0, current.length - 1);
                return [last, ...rest];
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

  return (
    <section id="contests" className="py-24 bg-brand-dark relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-5 pt-8">
            <h2 className="text-brand-accent font-mono text-sm tracking-wider uppercase mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2" /> Codeforces for JEE
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">Compete.<br/>Rate.<br/>Ascend.</h3>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Experience the adrenaline of live competitive testing. Your rating isn't just a number—it's your status. 
              Gain <span className="text-green-400 font-mono font-bold">+&Delta;</span> for speed and accuracy.
            </p>

            <div className="space-y-6">
              {[
                  { icon: Flame, title: "Live Leaderboard", desc: "See where you stand instantly. Pressure creates diamonds." },
                  { icon: TrendingUp, title: "Dynamic Elo Rating", desc: "Adaptive difficulty that grows with you." },
                  { icon: Award, title: "Badges & Leagues", desc: "From Newbie to Grandmaster. Where do you belong?" }
              ].map((item, idx) => (
                  <div key={idx} className="flex items-start group">
                    <div className="flex-shrink-0 p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-brand-accent/50 group-hover:bg-brand-accent/10 transition-colors">
                      <item.icon className="w-6 h-6 text-gray-300 group-hover:text-brand-accent transition-colors" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-white font-semibold text-lg">{item.title}</h4>
                      <p className="text-gray-500 text-sm mt-1 group-hover:text-gray-400 transition-colors">{item.desc}</p>
                    </div>
                  </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {/* Live Chart Card */}
            <div className="relative glass-panel rounded-2xl p-6 md:p-8 border-t border-white/10 shadow-2xl animate-float">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide font-bold">Your Rating</div>
                  <div className="text-4xl font-bold text-white font-mono mt-1">1750 <span className="text-green-400 text-lg font-bold">(+160 &Delta;)</span></div>
                </div>
                <div className="bg-gradient-to-r from-brand-accent to-yellow-600 text-black px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-500/20">
                  Grandmaster
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.05} vertical={false} />
                    <XAxis dataKey="name" stroke="#666" tick={{fill: '#666', fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" tick={{fill: '#666', fontSize: 12}} tickLine={false} axisLine={false} domain={['dataMin - 100', 'dataMax + 100']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#F59E0B' }}
                      cursor={{ stroke: '#F59E0B', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area type="monotone" dataKey="rating" stroke="#F59E0B" strokeWidth={4} fillOpacity={1} fill="url(#colorRating)" activeDot={{ r: 8, strokeWidth: 0, fill: '#fff' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Simulated Live Feed */}
            <div className="glass-panel rounded-xl p-4 border-l-4 border-l-brand-accent flex items-center justify-between">
                <div className="text-xs font-mono text-gray-400 uppercase mr-4">Live Activity</div>
                <div className="flex-1 overflow-hidden h-6 relative">
                    <div className="absolute w-full transition-all duration-500 transform translate-y-0">
                        {feed.map((item, i) => (
                            <div key={i} className={`flex items-center justify-between text-sm ${i === 0 ? 'opacity-100' : 'opacity-0 absolute top-6'}`}>
                                <span className="text-white font-medium">{item.user} <span className="text-gray-500 font-normal">{item.action}</span> <span className="text-brand-accent">{item.problem}</span></span>
                                <span className={`font-mono ${item.pts.includes('+') ? 'text-green-400' : 'text-red-400'}`}>{item.pts}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};