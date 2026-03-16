import React, { useState, useEffect } from 'react';
import { Menu, X, Zap } from 'lucide-react';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-brand-dark/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent pt-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-accent to-yellow-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-gray-100 transition-colors">
              Edu<span className="text-brand-accent">Next</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button 
                onClick={() => scrollToSection('jee-predictor')}
                className="text-xs font-bold uppercase tracking-wide text-brand-accent bg-brand-accent/10 px-3 py-1 rounded-full hover:bg-brand-accent/20 transition-colors border border-brand-accent/20 cursor-pointer"
            >
                JEE 2026 Predictor
            </button>
            <button onClick={() => scrollToSection('contests')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Contests</button>
            <button onClick={() => scrollToSection('founders')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Pedigree</button>
            <div className="h-4 w-px bg-white/10"></div>
            <Button size="sm" onClick={() => scrollToSection('waitlist')} className="shadow-lg shadow-brand-accent/20">Login</Button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-300 hover:text-white p-2">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-dark/95 backdrop-blur-xl border-b border-white/10 absolute w-full">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <button onClick={() => scrollToSection('jee-predictor')} className="block w-full text-left px-3 py-3 text-base font-bold text-brand-accent bg-brand-accent/5 rounded-lg">JEE 2026 Predictor</button>
            <button onClick={() => scrollToSection('contests')} className="block w-full text-left px-3 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg">Contests</button>
            <button onClick={() => scrollToSection('founders')} className="block w-full text-left px-3 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg">Founders</button>
            <div className="pt-4">
              <Button className="w-full" onClick={() => scrollToSection('waitlist')}>Login</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};