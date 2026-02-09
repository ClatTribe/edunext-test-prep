import React from 'react';
import { Zap, Twitter, Instagram, Linkedin, Send } from 'lucide-react';

export const Footer: React.FC = () => {
  const accentColor = '#F59E0B';
  const primaryBg = '#050818';
  const secondaryBg = '#0F172B';
  const borderColor = 'rgba(245, 158, 11, 0.15)';

  return (
    <footer className="border-t pt-20 pb-10" style={{ backgroundColor: primaryBg, borderColor: 'rgba(255, 255, 255, 0.05)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `linear-gradient(to bottom right, ${accentColor}, #D97706)` }}
              >
                <Zap className="h-5 w-5 text-white fill-white" />
              </div>
              <span className="font-bold text-2xl text-white">Edu<span style={{ color: accentColor }}>Next</span></span>
            </div>
            <p className="text-gray-500 max-w-sm mb-8 text-sm leading-relaxed">
              The elite competitive platform for serious JEE aspirants. Stop preparing blindly. Start competing with the best minds in the country.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 transition-all"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = accentColor;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#9ca3af';
                }}
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 transition-all"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = accentColor;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#9ca3af';
                }}
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 transition-all"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = accentColor;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#9ca3af';
                }}
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <ul className="space-y-3 text-gray-500 text-sm">
              <li>
                <a 
                  href="#" 
                  className="transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.color = accentColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                >
                  Contests
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.color = accentColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                >
                  Rank Predictor
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.color = accentColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                >
                  Pricing
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.color = accentColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                >
                  Login
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-3 text-gray-500 text-sm">
              <li>
                <a 
                  href="#" 
                  className="transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.color = accentColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                >
                  About Us
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.color = accentColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                >
                  Success Stories
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.color = accentColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.color = accentColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center text-gray-600 text-xs" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
          <div className="mb-4 md:mb-0">&copy; {new Date().getFullYear()} EduNext Education. All rights reserved.</div>
          <div className="flex space-x-6">
             <a href="#" className="hover:text-gray-400">Privacy</a>
             <a href="#" className="hover:text-gray-400">Terms</a>
             <a href="#" className="hover:text-gray-400">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};