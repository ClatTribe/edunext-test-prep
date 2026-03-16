import React, { useState } from 'react';
import { Button } from './Button';
import { CheckCircle2 } from 'lucide-react';

export const SocialProof: React.FC = () => {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(email) {
        setJoined(true);
    }
  };

  return (
    <section id="waitlist" className="py-24 bg-gradient-to-b from-brand-dark to-[#0F1426]">
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
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" size="lg" className="whitespace-nowrap">
              Secure My Spot
            </Button>
          </form>
        ) : (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 max-w-md mx-auto flex items-center justify-center space-x-3">
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