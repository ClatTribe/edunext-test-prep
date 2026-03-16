'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if user came from reset password email
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Invalid or expired reset link. Please request a new one.');
        router.push('/');
      }
    };
    checkSession();
  }, [router]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Please fill all fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Update password in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Also update password_hash in custom users table
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await supabase
          .from('users')
          .update({ password_hash: hashedPassword })
          .eq('id', user.id);
      }

      setSuccess(true);
      
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#060818',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '450px',
        padding: '0 1.5rem'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.75rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em'
          }}>
            EduNext
          </h1>
          <p style={{ 
            color: '#9CA3AF', 
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            Reset your password
          </p>
        </div>

        {/* Reset Password Card */}
        <div style={{
          background: 'rgba(17, 24, 39, 0.6)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1.5rem',
          padding: '2rem',
          border: '1px solid rgba(55, 65, 81, 0.6)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              boxShadow: '0 8px 16px -4px rgba(245, 158, 11, 0.4)'
            }}>
              🔒
            </div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: 'white', 
              margin: 0,
              letterSpacing: '-0.01em'
            }}>
              Reset Password
            </h2>
          </div>

          {success ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem 0'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h3 style={{ color: '#10B981', fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                Password Reset Successful!
              </h3>
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {error && (
                <div style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.75rem',
                  color: '#EF4444',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {error}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#D1D5DB', marginBottom: '0.5rem' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(31, 41, 55, 0.6)',
                    border: '1px solid rgba(75, 85, 99, 0.6)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#F59E0B';
                    e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(75, 85, 99, 0.6)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#D1D5DB', marginBottom: '0.5rem' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(31, 41, 55, 0.6)',
                    border: '1px solid rgba(75, 85, 99, 0.6)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#F59E0B';
                    e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(75, 85, 99, 0.6)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: loading ? '#6B7280' : 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '1rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '1rem',
                  boxShadow: '0 10px 20px -5px rgba(245, 158, 11, 0.4)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 20px 30px -8px rgba(245, 158, 11, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 20px -5px rgba(245, 158, 11, 0.4)';
                }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/')}
                disabled={loading}
                style={{
                  width: '100%',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#9CA3AF',
                  background: 'none',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => !loading && (e.target.style.color = 'white')}
                onMouseLeave={(e) => e.target.style.color = '#9CA3AF'}
              >
                ← Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}