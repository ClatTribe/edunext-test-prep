'use client'
import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { ArrowRight, Trophy, Play, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const Hero: React.FC = () => {
  const accentColor = '#F59E0B';
  const primaryBg = '#050818';
  const secondaryBg = '#0F172B';
  const borderColor = 'rgba(245, 158, 11, 0.15)';

  const [activeUsers, setActiveUsers] = useState(1240);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate live user count fluctuation
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      const user = session.user;
      console.log("User detected:", user);
      console.log("User metadata:", user.user_metadata);
      
      try {
        const { data, error } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            instance_id: user.app_metadata.provider === 'google' ? user.id : null,
            username: user.user_metadata.full_name?.replace(/\s+/g, '_').toLowerCase() || user.email?.split('@')[0],
            full_name: user.user_metadata.full_name || user.user_metadata.name || '',
            aud: user.aud || 'authenticated',
            phone_number: user.phone || null,
            role: user.role || 'user',
            email: user.email,
            encrypted_password: null, // OAuth users don't have passwords
            password_hash: null,
            email_confirmed_at: user.email_confirmed_at || new Date().toISOString(),
            exam_id: null, // Set this later when user selects exam
            created_at: user.created_at || new Date().toISOString(),
            invited_at: null,
            confirmation_token: null,
            updated_at: new Date().toISOString(),
            confirmation_sent_at: null,
            last_login: new Date().toISOString(),
            is_active: true,
            recovery_token: null,
            recovery_sent_at: null,
            email_change_token_new: null,
            email_change: null,
            email_change_sent_at: null,
            last_sign_in_at: user.last_sign_in_at || new Date().toISOString(),
            raw_app_meta_data: user.app_metadata || {},
            raw_user_meta_data: user.user_metadata || {},
            is_super_admin: false,
            phone: user.phone || null,
            phone_confirmed_at: user.phone_confirmed_at || null,
            phone_change: null,
            phone_change_token: null,
            phone_change_sent_at: null,
            confirmed_at: user.confirmed_at || new Date().toISOString(),
            email_change_token_current: null,
            email_change_confirm_status: 0,
            banned_until: null,
            reauthentication_token: null,
            reauthentication_sent_at: null,
            is_sso_user: user.app_metadata.provider === 'google',
            deleted_at: null,
            is_anonymous: false,
          }, {
            onConflict: 'id'
          });

        if (error) {
          console.error('Error syncing profile:', error);
        } else {
          console.log("Profile synced successfully!", data);
        }
      } catch (err) {
        console.error('Catch error:', err);
      }
    }
  });

  return () => subscription.unsubscribe();
}, []);


  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard/ai-prep`,
      },
    });
    if (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <section id="waitlist" className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden" style={{ backgroundColor: primaryBg }}>
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-slow" style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)' }}></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
        {/* Modern Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Content */}
          <div className="flex flex-col items-start text-left">
            
            {/* Live Indicator */}
            <div className="mb-8 animate-slide-up" style={{animationDelay: '0.1s'}}>
               <div 
                 className="inline-flex items-center space-x-2 rounded-full px-3 py-1.5"
                 style={{ 
                   backgroundColor: 'rgba(255, 255, 255, 0.05)',
                   border: '1px solid rgba(255, 255, 255, 0.1)',
                   backdropFilter: 'blur(16px)',
                   WebkitBackdropFilter: 'blur(16px)'
                 }}
               >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-medium text-green-400">{activeUsers.toLocaleString()} aspirants competing now</span>
              </div>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-white mb-6 leading-tight max-w-2xl animate-slide-up" style={{animationDelay: '0.2s'}}>
              The Science of <br />
              <span className="text-transparent bg-clip-text animate-shine bg-[length:200%_auto]" style={{ backgroundImage: `linear-gradient(to right, ${accentColor}, #FDE68A, ${accentColor})` }}>Toppers.</span>
            </h1>

            <p className="text-lg lg:text-xl text-gray-400 mb-10 max-w-lg leading-relaxed animate-slide-up" style={{animationDelay: '0.3s'}}>
              EduNext brings the Codeforces adrenaline to JEE Prep.
              Real-time ranks, Elo ratings, and AI that predicts your future.
            </p>

            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 animate-slide-up mb-12" style={{animationDelay: '0.4s'}}>
              <Button size="lg" className="group h-14 px-8 text-lg w-full sm:w-auto" onClick={() => window.location.hash = 'contests'}>
                Start Competing
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <button 
                onClick={() => window.location.hash = 'analytics'} 
                className="flex items-center text-gray-300 transition-colors group w-full sm:w-auto justify-center sm:justify-start"
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
              >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-3 transition-all"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = accentColor;
                      e.currentTarget.style.color = primaryBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.color = '';
                    }}
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                  <span className="font-medium">Free JEE Main Starter Kit</span>
              </button>
            </div>

            {/* Credentials Bar */}
            <div className="grid grid-cols-4 gap-4 w-full border-t pt-8 animate-slide-up" style={{animationDelay: '0.5s', borderColor: 'rgba(255, 255, 255, 0.1)'}}>
               <div>
                  <h4 className="text-2xl font-bold text-white">AIR 1</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Founders' Legacy</p>
               </div>
               <div>
                  <h4 className="text-2xl font-bold text-white">50k+</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Questions Solved</p>
               </div>
               <div>
                  <h4 className="text-2xl font-bold text-white">99.8%</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Accuracy</p>
               </div>
               <div>
                  <h4 className="text-2xl font-bold text-white">24/7</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">AI Mentorship</p>
               </div>
            </div>
          </div>

          {/* Right Column: Login Card & Image */}
          <div className="relative animate-slide-up" style={{animationDelay: '0.6s'}}>
             <div className="absolute -inset-1 rounded-2xl blur opacity-20 animate-pulse-slow" style={{ background: `linear-gradient(to top right, ${accentColor}, #9333EA)` }}></div>
             
             <div className="relative rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ backgroundColor: secondaryBg, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {/* Image Area */}
                <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                   <div className="absolute inset-0 z-10" style={{ background: `linear-gradient(to top, ${secondaryBg}, rgba(15, 23, 43, 0.2), transparent)` }}></div>
                   <img 
                     src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1000" 
                     alt="Student solving physics problem" 
                     className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                   />
                   <div className="absolute bottom-4 left-6 z-20">
                      <div className="flex items-center space-x-2 mb-1">
                         <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                         <span className="text-white text-xs font-bold uppercase tracking-wider">Live Contest</span>
                      </div>
                      <h3 className="text-white font-bold text-lg">Weekly Championship #1</h3>
                   </div>
                </div>

                {/* Login Area */}
                <div className="p-8 pt-6 relative z-20" style={{ backgroundColor: secondaryBg }}>
                   <h3 className="text-xl font-bold text-white mb-2">Join the Elite League</h3>
                   <p className="text-gray-400 text-sm mb-6">Track your progress and compete with the best.</p>
                   
                   <button 
                     onClick={handleGoogleLogin}
                     disabled={loading}
                     className="w-full bg-white text-gray-900 font-bold py-3.5 px-4 rounded-lg flex items-center justify-center space-x-3 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                     onMouseEnter={(e) => {
                       if (!loading) {
                         e.currentTarget.style.backgroundColor = '#f3f4f6';
                         e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(255, 255, 255, 0.1)';
                       }
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.backgroundColor = 'white';
                       e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                     }}
                   >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
                   </button>
                   
                   <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
                      <Users className="w-3 h-3" />
                      <span>50,000+ registered aspirants</span>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};