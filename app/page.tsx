// 'use client'
// import { supabase } from '@/lib/supabase';
// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Mail, Lock, BookOpen, GraduationCap, Wallet, BrainCircuit } from 'lucide-react';

// const FancyLoginPage = () => {
//   const [loading, setLoading] = useState(false);
//   useEffect(() => {
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
//       if (event === 'SIGNED_IN' && session) {
//         const user = session.user;
//         console.log("User detected, syncing to profiles table...");
//         // Sync full name from Google to your custom 'profiles' table
//         const { error } = await supabase
//           .from('users')
//           .upsert({
//             id: user.id,
//             full_name: user.user_metadata.full_name,
//             // avatar_url: user.user_metadata.avatar_url,
//             updated_at: new Date(),
//           });

//         if (error) console.error('Error syncing profile:', error.message);
//         else console.log("Profile synced successfully!");
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, []);
//   const handleGoogleLogin = async () => {
//     setLoading(true);
//     const { error } = await supabase.auth.signInWithOAuth({
//       provider: 'google',
//       options: {
//         redirectTo: `${window.location.origin}/dashboard/ai-prep`,
//       },
//     });
//     if (error) {
//       alert(error.message);
//       setLoading(false);
//     }
//   };
//   return (
//     <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col lg:flex-row font-sans overflow-hidden relative">
      
//       {/* Fancy Background Glows */}
//       <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full" />
//       <div className="absolute bottom-[-10%] right-[10%] w-[30%] h-[30%] bg-blue-600/10 blur-[120px] rounded-full" />

//       {/* Left Section: Content */}
//       <motion.div 
//         initial={{ opacity: 0, x: -20 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ duration: 0.8 }}
//         className="flex-1 flex flex-col justify-center px-8 lg:px-24 py-12 z-10"
//       >
//         <div className="flex items-center gap-3 mb-12">
//           <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-lg shadow-orange-500/20">
//             <GraduationCap className="text-white w-6 h-6" />
//           </div>
//           <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
//             EDUNEXT
//           </span>
//         </div>

//         <div className="space-y-8">
//           <h1 className="text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight">
//             Your <span className="text-orange-500">Gateway</span> <br /> 
//             to Dream <br /> 
//             <span className="text-orange-500">IIT</span> Colleges
//           </h1>
//           <p className="text-slate-400 text-lg max-w-md leading-relaxed border-l-2 border-orange-500/30 pl-6">
//             Discover active contest, connect with mocks, and customize your experience to fuel your dreams.
//           </p>
//         </div>

//         <div className="mt-16 space-y-6">
//           <FeatureItem icon={<GraduationCap />} title="Active Contesting" color="text-orange-400" delay={0.2} />
//           <FeatureItem icon={<BrainCircuit />} title="Customize Mocks" color="text-blue-400" delay={0.3} />
//           <FeatureItem icon={<BookOpen />} title="Personalize Learning" color="text-emerald-400" delay={0.4} />
//         </div>
//       </motion.div>

//       {/* Right Section: Glassmorphic Form */}
//       <div className="flex-1 flex items-center justify-center p-6 relative">
//         <motion.div 
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.5 }}
//           className="w-full max-w-md backdrop-blur-xl bg-white/[0.02] rounded-3xl p-10 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
//         >
//           <div className="text-center mb-10">
//             <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h2>
//             <p className="text-slate-500">Sign in to continue your journey</p>
//           </div>

//           <button onClick={handleGoogleLogin}
//           className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-3.5 rounded-xl hover:bg-amber-700 transition-all duration-300 group">
//             <svg className="w-5 h-5" viewBox="0 0 24 24">
//               <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//               <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//               <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//               <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//             </svg>
//             <span className="font-medium">Continue with Google</span>
//           </button>

//           <p className="mt-8 text-center text-slate-400 text-sm">
//             By continuing, you agree to our <a href="#" className="text-orange-500 font-bold hover:underline ml-1">Terms of Service</a> and <a href="#" className="text-orange-500 font-bold hover:underline ml-1">Privacy Policy</a>
//           </p>
//         </motion.div>

//         {/* Floating background element for "fancy" feel */}
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-orange-500/5 rounded-full blur-[100px] -z-10" />
//       </div>
//     </div>
//   );
// };

// const FeatureItem = ({ icon, title, color, delay }) => (
//   <motion.div 
//     initial={{ opacity: 0, x: -20 }}
//     animate={{ opacity: 1, x: 0 }}
//     transition={{ delay, duration: 0.5 }}
//     className="flex items-center gap-5 group cursor-default"
//   >
//     <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:border-orange-500/50 transition-all duration-300 ${color}`}>
//       {React.cloneElement(icon, { size: 24 })}
//     </div>
//     <div>
//       <h4 className="font-bold text-lg group-hover:text-orange-500 transition-colors">{title}</h4>
//     </div>
//   </motion.div>
// );

// export default FancyLoginPage;

"use client";
import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ContestSection } from './components/ContestSection';
import { JeePercentilePredictor } from './components/JeePercentilePredictor';
import { Features } from './components/Features';
import { Founders } from './components/Founders';
import { SocialProof } from './components/SocialProof';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="bg-brand-dark min-h-screen text-white font-sans selection:bg-brand-accent selection:text-brand-dark">
      <Navbar />
      <main>
        <Hero />
        <JeePercentilePredictor />
        <ContestSection />
        <Features />
        <Founders />
        <SocialProof />
      </main>
      <Footer />
    </div>
  );
};

export default App;