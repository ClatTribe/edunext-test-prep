'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase'; // Adjust this path to where your supabase.js file is

export default function LoginPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Query your 'adminlogin' table
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('username', formData.username)
        .eq('password_hash', formData.password)
        .single();

      if (error || !data) {
        throw new Error('Invalid username or password');
      }

      // Success!
      console.log('Access Granted:', data);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('adminUser', data.username);
      router.push('/admin/adminpanel'); // Redirect to your admin dashboard
      
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
   
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0e1a] px-6">
      <div 
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)' }}
        className="w-full max-w-[420px] bg-[#111827] p-10 rounded-3xl text-center border border-gray-800/50"
      >
        
        {/* Header Section */}
        <header className="mb-8">
          <h1 className="text-5xl font-bold text-[#ff8c00] tracking-tight mb-2">
            EduNext
          </h1>
          <p className="text-gray-400 text-sm">
            Admin Portal Access
          </p>
        </header>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3 text-xs bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg">
              {errorMsg}
            </div>
          )}

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full rounded-xl bg-[#161b22] border border-gray-700 p-4 text-white placeholder-gray-500 outline-none focus:border-[#ff8c00] transition-all disabled:opacity-50"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full rounded-xl bg-[#161b22] border border-gray-700 p-4 text-white placeholder-gray-500 outline-none focus:border-[#ff8c00] transition-all disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#ff8c00] to-[#f57c00] py-4 text-lg font-bold text-white shadow-lg shadow-orange-900/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>

        <footer className="mt-8">
            <p className="text-gray-600 text-xs uppercase tracking-widest font-semibold">
                Secured by EduNext
            </p>
        </footer>
      </div>
    </main>
  );
}