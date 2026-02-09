import React, { useState, useEffect } from 'react';
import { Menu, X, Zap } from 'lucide-react';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  const accentColor = '#F59E0B';
  const primaryBg = '#050818';
  const borderColor = 'rgba(245, 158, 11, 0.15)';

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

  // Simplified link style: grey text, brightens on hover with subtle bg
  const navLinkStyle = "text-sm font-medium px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200";

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'border-b' : 'pt-4'}`}
      style={{ 
        backgroundColor: isScrolled ? 'rgba(5, 8, 24, 0.9)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(24px)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(24px)' : 'none',
        borderColor: 'rgba(255, 255, 255, 0.05)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
              style={{ background: `linear-gradient(to bottom right, ${accentColor}, #D97706)` }}
            >
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Edu<span style={{ color: accentColor }}>Next</span>
            </span>
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            <button 
                onClick={() => scrollToSection('jee-predictor')}
                className="text-xs font-bold uppercase tracking-wide px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-all mr-2"
            >
                JEE 2026 Predictor
            </button>

            <button onClick={() => scrollToSection('contests')} className={navLinkStyle}>
              Contests
            </button>

            <button onClick={() => scrollToSection('founders')} className={navLinkStyle}>
              Pedigree
            </button>

            <div className="h-4 w-px bg-white/10 mx-2"></div>
            
            <Button size="sm" onClick={() => scrollToSection('waitlist')}>
              Login
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="text-gray-400 hover:text-white p-2"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden border-b absolute w-full"
          style={{ 
            backgroundColor: 'rgba(5, 8, 24, 0.98)',
            backdropFilter: 'blur(24px)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="px-4 pt-2 pb-8 space-y-1">
            <button 
              onClick={() => scrollToSection('jee-predictor')} 
              className="block w-full text-left px-4 py-3 text-base font-bold rounded-lg text-amber-500 bg-amber-500/5 mb-2"
            >
              JEE 2026 Predictor
            </button>
            <button onClick={() => scrollToSection('contests')} className="block w-full text-left px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg">Contests</button>
            <button onClick={() => scrollToSection('founders')} className="block w-full text-left px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg">Pedigree</button>
            <div className="pt-4 px-4">
              <Button className="w-full py-4" onClick={() => scrollToSection('waitlist')}>Login</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};