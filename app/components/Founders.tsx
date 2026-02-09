import React from 'react';
import { Award, Star, TrendingUp } from 'lucide-react';

export const Founders: React.FC = () => {
  const accentColor = '#F59E0B';
  const primaryBg = '#050818';
  const secondaryBg = '#0F172B';
  const borderColor = 'rgba(245, 158, 11, 0.15)';

  return (
    <section id="founders" className="py-24 border-t relative overflow-hidden" style={{ backgroundColor: primaryBg, borderColor: 'rgba(255, 255, 255, 0.05)' }}>
        {/* Background texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          <div className="order-2 md:order-1 relative">
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[80px] pointer-events-none" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}></div>
             <div 
               className="relative rounded-2xl p-8 transition-colors"
               style={{ 
                 backgroundColor: 'rgba(255, 255, 255, 0.03)',
                 backdropFilter: 'blur(16px)',
                 WebkitBackdropFilter: 'blur(16px)',
                 border: '1px solid rgba(255, 255, 255, 0.1)'
               }}
               onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
               onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
             >
                <div className="flex items-center space-x-5 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gray-800 overflow-hidden shadow-xl" style={{ border: `2px solid ${accentColor}` }}>
                     {/* Placeholder for Founder Image */}
                     <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200" alt="Founder" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white">Pratham Mittal</h4>
                    <p className="text-sm font-bold uppercase tracking-wider" style={{ color: accentColor }}>Chief Mentor</p>
                  </div>
                </div>
                <blockquote className="text-gray-300 italic mb-6 text-lg font-light leading-relaxed">
                  "We cracked the code for IPM using data and rigorous testing. We are applying the exact same 'Science of Toppers' to JEE. It's not magic, it's metrics."
                </blockquote>
                <div className="flex space-x-1">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5" style={{ color: accentColor, fill: accentColor }} />)}
                </div>
             </div>
          </div>

          <div className="order-1 md:order-2">
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">From IPM AIR 1 to <br/><span style={{ color: accentColor }}>JEE Domination</span></h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              The team behind IPMCareer has already proven their pedagogy works at the highest level. Now, EduNext brings that same intensity, precision, and personalized mentorship to the JEE landscape.
            </p>
            
            <ul className="space-y-6">
              <li className="flex items-start space-x-4 text-gray-300 group">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-500 group-hover:bg-green-500/20 transition-colors"><Award className="w-5 h-5" /></div>
                <div>
                    <h5 className="font-bold text-white">Proven Track Record</h5>
                    <p className="text-sm text-gray-500">History of producing single-digit ranks in competitive exams.</p>
                </div>
              </li>
              <li className="flex items-start space-x-4 text-gray-300 group">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-500 group-hover:bg-green-500/20 transition-colors"><TrendingUp className="w-5 h-5" /></div>
                <div>
                    <h5 className="font-bold text-white">Data-Driven Pedagogy</h5>
                    <p className="text-sm text-gray-500">We replace "spray and pray" with targeted, algorithmic practice.</p>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};