import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronRight, LayoutDashboard, BarChart3, LogOut, User } from 'lucide-react';
import { Button } from './Button';
import { supabase } from '@/lib/supabase';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setDropdownOpen(false);
  };

  const user = session?.user;
  const avatarUrl = user?.user_metadata?.avatar_url;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const initials = fullName.charAt(0).toUpperCase();

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

            {session ? (
              /* Account Circle with Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-10 h-10 rounded-full border-2 border-amber-500/50 hover:border-amber-500 transition-all duration-300 overflow-hidden flex items-center justify-center bg-amber-500/10 hover:bg-amber-500/20"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-sm font-bold text-amber-500">{initials}</span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-white/10 bg-[#0F172A]/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info */}
                    <div className="px-5 py-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex items-center justify-center bg-amber-500/10 shrink-0">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-sm font-bold text-amber-500">{initials}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{fullName}</p>
                          <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <a
                        href="/dashboard/ai-prep"
                        className="flex items-center gap-3 px-5 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <LayoutDashboard size={16} className="text-amber-500" />
                        <span className="font-medium">Dashboard</span>
                      </a>
                      <a
                        href="/dashboard/ai-prep"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = '/dashboard/ai-prep?view=insights';
                        }}
                        className="flex items-center gap-3 px-5 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <BarChart3 size={16} className="text-amber-500" />
                        <span className="font-medium">Insights</span>
                      </a>
                      <a
                        href="/dashboard/ai-prep/practice"
                        className="flex items-center gap-3 px-5 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <User size={16} className="text-amber-500" />
                        <span className="font-medium">Practice</span>
                      </a>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-white/10 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-5 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all w-full"
                      >
                        <LogOut size={16} />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => scrollToSection('waitlist')}
                className="bg-white text-[#050818] hover:bg-amber-500 hover:text-white font-bold px-7 rounded-full transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-3">
            {session && (
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-9 h-9 rounded-full border-2 border-amber-500/50 overflow-hidden flex items-center justify-center bg-amber-500/10"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-xs font-bold text-amber-500">{initials}</span>
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown (shown when avatar clicked on mobile) */}
      {session && dropdownOpen && (
        <div className="md:hidden absolute right-4 top-[70px] w-64 rounded-2xl border border-white/10 bg-[#0F172A]/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden" ref={dropdownRef}>
          <div className="px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex items-center justify-center bg-amber-500/10 shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-sm font-bold text-amber-500">{initials}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <div className="py-2">
            <a href="/dashboard/ai-prep" className="flex items-center gap-3 px-5 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all">
              <LayoutDashboard size={16} className="text-amber-500" />
              <span className="font-medium">Dashboard</span>
            </a>
            <a href="/dashboard/ai-prep?view=insights" className="flex items-center gap-3 px-5 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all">
              <BarChart3 size={16} className="text-amber-500" />
              <span className="font-medium">Insights</span>
            </a>
            <a href="/dashboard/ai-prep/practice" className="flex items-center gap-3 px-5 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all">
              <User size={16} className="text-amber-500" />
              <span className="font-medium">Practice</span>
            </a>
          </div>
          <div className="border-t border-white/10 py-2">
            <button onClick={handleLogout} className="flex items-center gap-3 px-5 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all w-full">
              <LogOut size={16} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}

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

          {!session && (
            <div className="pt-10">
              <Button className="w-full py-7 text-xl rounded-2xl" onClick={() => scrollToSection('waitlist')}>
                Login to Account
              </Button>
            </div>
          )}

          {session && (
            <div className="pt-6 space-y-3 border-t border-white/10">
              <a href="/dashboard/ai-prep" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 text-white font-medium">
                <LayoutDashboard size={20} className="text-amber-500" /> Dashboard
              </a>
              <a href="/dashboard/ai-prep?view=insights" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 text-white font-medium">
                <BarChart3 size={20} className="text-amber-500" /> Insights
              </a>
              <button onClick={handleLogout} className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 text-red-400 font-medium w-full">
                <LogOut size={20} /> Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Subtle Decorative Element for Mobile Menu */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/10 rounded-full"></div>
      </div>
    </nav>
  );
};
