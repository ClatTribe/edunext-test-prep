import React, { useState } from 'react';
import { Button } from './Button';
import { CheckCircle2 } from 'lucide-react';

export const SocialProof: React.FC = () => {
  const accentColor = '#F59E0B';
  const primaryBg = '#050818';
  const secondaryBg = '#0F172B';
  const borderColor = 'rgba(245, 158, 11, 0.15)';

  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(email) {
        setJoined(true);
    }
  };

  return (
    <section id="waitlist" className="py-24" style={{ background: `linear-gradient(to bottom, ${primaryBg}, #0F1426)` }}>
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">Join the Elite 1%</h2>
        <p className="text-gray-400 text-lg mb-10">
          We are currently limiting access to ensure server stability during live contests. 
          Join <span className="text-white font-bold">5,000+ serious aspirants</span> on the waitlist.
        </p>

        {!joined ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 rounded-lg px-4 py-3 text-white focus:outline-none transition-colors"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = accentColor}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" size="lg" className="whitespace-nowrap">
              Secure My Spot
            </Button>
          </form>
        ) : (
          <div className="rounded-lg p-6 max-w-md mx-auto flex items-center justify-center space-x-3" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <span className="text-green-500 font-medium">You're on the list! Watch your inbox.</span>
          </div>
        )}

        <p className="text-gray-600 text-xs mt-6">
          By joining, you agree to receive contest updates. No spam.
        </p>
      </div>
    </section>
  );
};