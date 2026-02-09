import React, { useState, useEffect } from 'react';
import { Target, ChevronRight, BarChart2 } from 'lucide-react';

export const RankPredictor: React.FC = () => {
  const accentColor = '#F59E0B';
  const primaryBg = '#050818';
  const secondaryBg = '#0F172B';
  const borderColor = 'rgba(245, 158, 11, 0.15)';

  const [score, setScore] = useState(180);
  const [displayRank, setDisplayRank] = useState(5000);
  
  // Rank calculation logic
  const predictRank = (s: number) => {
    if (s > 300) return 1;
    const maxRank = 300000;
    const factor = Math.pow((300 - s) / 300, 3); 
    return Math.floor(1 + factor * maxRank);
  };

  const targetRank = predictRank(score);
  const percentile = (100 - (targetRank / 12000)).toFixed(2);

  // Smooth animation for rank number
  useEffect(() => {
    const diff = targetRank - displayRank;
    if (Math.abs(diff) < 1) {
        setDisplayRank(targetRank);
        return;
    }
    const timeout = setTimeout(() => {
        setDisplayRank(prev => prev + Math.ceil(diff * 0.1)); // Chase the target value
    }, 20);
    return () => clearTimeout(timeout);
  }, [score, targetRank, displayRank]);

  return (
    <section id="analytics" className="py-24 relative overflow-hidden" style={{ backgroundColor: primaryBg }}>
       {/* Background */}
       <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[128px] pointer-events-none" style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)' }}></div>
       <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Don't Guess. <span style={{ color: accentColor }}>Know.</span></h2>
          <p className="text-gray-400 text-lg">
            EduNext's proprietary algorithm analyzes your speed, accuracy, and topic-strength matrix to predict your actual JEE Advanced rank.
          </p>
        </div>

        <div className="glass-panel max-w-5xl mx-auto rounded-3xl p-8 md:p-12 border shadow-2xl relative z-10" style={{ backgroundColor: secondaryBg, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-10">
              <div>
                <div className="flex justify-between items-end mb-4">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Simulate Mock Score</label>
                    <div className="text-4xl font-bold text-white font-mono bg-white/5 px-4 py-2 rounded-lg border border-white/10">{score}<span className="text-lg text-gray-500">/300</span></div>
                </div>
                
                <input 
                  type="range" 
                  min="0" 
                  max="300" 
                  value={score} 
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2"
                  style={{ accentColor: accentColor }}
                />
                <div className="flex justify-between mt-2 text-xs text-gray-600 font-mono">
                    <span>0 (Beginner)</span>
                    <span>300 (Topper)</span>
                </div>
              </div>

              <div className="p-5 rounded-xl border-l-4" style={{ background: `linear-gradient(to right, ${borderColor}, transparent)`, borderLeftColor: accentColor }}>
                <div className="flex items-start">
                  <Target className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
                  <p className="ml-3 text-sm text-gray-300 leading-relaxed">
                    <strong>Smart Insight:</strong> Improve your accuracy in <em>Calculus</em> by 15% to potentially jump <span className="text-white font-bold border-b border-white/20">~{(targetRank - predictRank(score + 15)).toLocaleString()}</span> ranks.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center text-center space-y-8 bg-white/5 p-8 rounded-2xl border border-white/5">
              <div>
                <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                    <BarChart2 className="w-4 h-4" /> Predicted AIR
                </div>
                <div className="text-6xl md:text-7xl font-black text-white tracking-tight tabular-nums">
                  {displayRank < 1000000 ? displayRank.toLocaleString() : '> 1M'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full border-t border-white/10 pt-6">
                <div className="text-center p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Percentile</div>
                  <div className="text-xl font-bold font-mono" style={{ color: accentColor }}>{Number(percentile) > 0 ? percentile : '0.00'}%ile</div>
                </div>
                <div className="text-center p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Probable College</div>
                  <div className="text-xl font-bold text-white">
                    {targetRank < 500 ? 'IIT Bombay' : targetRank < 5000 ? 'Top 7 IITs' : targetRank < 15000 ? 'Top NITs' : 'Tier 2'}
                  </div>
                </div>
              </div>
              
              <button 
                className="text-sm flex items-center transition-colors group"
                style={{ color: accentColor }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = accentColor}
              >
                Unlock Detailed Report <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};