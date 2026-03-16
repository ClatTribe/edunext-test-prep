import React from 'react';
import { Bot, BookOpen, BarChart3, Brain, Zap, Target } from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      icon: Bot,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      title: "AI Doubt Slayer",
      desc: "Instant, context-aware doubt resolution. It doesn't just solve; it teaches you the method step-by-step."
    },
    {
      icon: BookOpen,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      title: "Curated Problem Sets",
      desc: "Problems selected by AIR 1 rankers. No filler, only high-yield concepts that appear in JEE Advanced."
    },
    {
      icon: BarChart3,
      color: "text-green-400",
      bg: "bg-green-500/10",
      title: "Weakness Mapping",
      desc: "Our bot identifies specific sub-topics dragging your rank down (e.g. 'Rotational Inertia')."
    },
    {
        icon: Brain,
        color: "text-rose-400",
        bg: "bg-rose-500/10",
        title: "Cognitive Load Balancing",
        desc: "Study plans that adapt to your mental fatigue and retention rates."
    },
    {
        icon: Zap,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        title: "Speed Drills",
        desc: "Gamified sprints to improve your question-solving speed by 40%."
    },
    {
        icon: Target,
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
        title: "Exam Simulation",
        desc: "UI that exactly matches the NTA JEE interface to remove exam-day anxiety."
    }
  ];

  return (
    <section id="features" className="py-24 bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Engineered for <span className="text-brand-accent">Dominance</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Beyond video lectures. We provide the tactical tools required to crack the toughest exams in the world.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="glass-card-hover p-8 rounded-2xl bg-white/[0.02] border border-white/5 group">
                <div className={`w-14 h-14 rounded-xl ${f.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className={`w-7 h-7 ${f.color}`} />
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