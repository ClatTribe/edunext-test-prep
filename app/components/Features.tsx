import React from 'react';
import { Bot, BookOpen, BarChart3, Brain, Zap, Target } from 'lucide-react';

export const Features: React.FC = () => {
  const accentColor = '#F59E0B';
  const primaryBg = '#050818';
  const secondaryBg = '#0F172B';
  const borderColor = 'rgba(245, 158, 11, 0.15)';

  const features = [
    {
      icon: Bot,
      color: "#60A5FA",
      bg: "rgba(59, 130, 246, 0.1)",
      title: "AI Doubt Slayer",
      desc: "Instant, context-aware doubt resolution. It doesn't just solve; it teaches you the method step-by-step."
    },
    {
      icon: BookOpen,
      color: "#C084FC",
      bg: "rgba(168, 85, 247, 0.1)",
      title: "Curated Problem Sets",
      desc: "Problems selected by AIR 1 rankers. No filler, only high-yield concepts that appear in JEE Advanced."
    },
    {
      icon: BarChart3,
      color: "#4ADE80",
      bg: "rgba(34, 197, 94, 0.1)",
      title: "Weakness Mapping",
      desc: "Our bot identifies specific sub-topics dragging your rank down (e.g. 'Rotational Inertia')."
    },
    {
        icon: Brain,
        color: "#FB7185",
        bg: "rgba(244, 63, 94, 0.1)",
        title: "Cognitive Load Balancing",
        desc: "Study plans that adapt to your mental fatigue and retention rates."
    },
    {
        icon: Zap,
        color: "#FBBF24",
        bg: "rgba(245, 158, 11, 0.1)",
        title: "Speed Drills",
        desc: "Gamified sprints to improve your question-solving speed by 40%."
    },
    {
        icon: Target,
        color: "#22D3EE",
        bg: "rgba(6, 182, 212, 0.1)",
        title: "Exam Simulation",
        desc: "UI that exactly matches the NTA JEE interface to remove exam-day anxiety."
    }
  ];

  return (
    <section id="features" className="py-24" style={{ backgroundColor: primaryBg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Engineered for <span style={{ color: accentColor }}>Dominance</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Beyond video lectures. We provide the tactical tools required to crack the toughest exams in the world.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="p-8 rounded-2xl group transition-all duration-300"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)';
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: f.bg }}
                >
                  <f.icon className="w-7 h-7" style={{ color: f.color }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};