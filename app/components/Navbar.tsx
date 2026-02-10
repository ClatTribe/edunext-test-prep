import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
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

  const navLinkStyle = "relative text-[13px] font-semibold tracking-wide text-gray-400 hover:text-white transition-colors duration-300 group";

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#050818]/80 backdrop-blur-md border-b border-white/10 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="flex justify-between items-center">
          
          {/* Logo Section */}
          <div 
            className="flex items-center cursor-pointer group" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <a href="/" className="flex items-center">
              <img
                src="/whitelogo.svg"
                alt="EduNext Logo"
                className="h-10 md:h-11 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80"
              />
            </a>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <div className="flex items-center gap-8">
              <button 
                  onClick={() => scrollToSection('jee-predictor')}
                  className="relative overflow-hidden px-4 py-1.5 rounded-full border border-amber-500/40 text-amber-500 text-[11px] font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-[#050818] transition-all duration-300"
              >
                  JEE 2026 Predictor
              </button>

              <button onClick={() => scrollToSection('contests')} className={navLinkStyle}>
                CONTESTS
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-amber-500 transition-all duration-300 group-hover:w-full"></span>
              </button>

              <button onClick={() => scrollToSection('founders')} className={navLinkStyle}>
                PEDIGREE
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-amber-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
            </div>

            <div className="h-5 w-[1px] bg-white/20"></div>
            
            <Button 
              size="sm" 
              onClick={() => scrollToSection('waitlist')}
              className="bg-white text-[#050818] hover:bg-amber-500 hover:text-white font-bold px-7 rounded-full transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Login
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Full-Width Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 top-[73px] w-full bg-[#050818] transition-all duration-500 ease-in-out z-40 md:hidden ${
          mobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
        }`}
      >
        <div className="flex flex-col p-8 space-y-6">
          <button 
            onClick={() => scrollToSection('jee-predictor')} 
            className="flex items-center justify-between w-full p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-500 font-bold tracking-widest"
          >
            JEE 2026 PREDICTOR
            <ChevronRight size={20} />
          </button>
          
          <div className="space-y-4 pt-4">
            <button onClick={() => scrollToSection('contests')} className="block w-full text-left text-2xl font-medium text-gray-300 hover:text-white">Contests</button>
            <button onClick={() => scrollToSection('founders')} className="block w-full text-left text-2xl font-medium text-gray-300 hover:text-white">Pedigree</button>
          </div>

          <div className="pt-10">
            <Button className="w-full py-7 text-xl rounded-2xl" onClick={() => scrollToSection('waitlist')}>
              Login to Account
            </Button>
          </div>
        </div>
        
        {/* Subtle Decorative Element for Mobile Menu */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/10 rounded-full"></div>
      </div>
    </nav>
  );
};