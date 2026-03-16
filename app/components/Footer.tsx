import React from 'react';
import { Instagram, Youtube, MessageCircle, Send, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const primaryBg = '#050818';
  const phoneNumber = "918299470392";

  const footerLinkStyle = "text-gray-500 hover:text-white transition-colors duration-300 text-sm flex items-center group";

  const socialLinks = [
    {
      icon: <MessageCircle size={20} />,
      link: `https://wa.me/${phoneNumber}`,
      label: "WhatsApp",
      hoverColor: "#25D366",
      title: "Chat with Us",
      sub: "Instant Guidance"
    },
    {
      icon: <Instagram size={20} />,
      link: "https://www.instagram.com/get_edunext?igsh=OHl4eWV2dWlyenEz",
      label: "Instagram",
      hoverColor: "#E1306C",
      title: "@get_edunext",
      sub: "Latest Updates"
    },
    {
      icon: <Youtube size={20} />,
      link: "https://youtube.com/shorts/Mq8BNMVtW0Y?feature=shared",
      label: "YouTube",
      hoverColor: "#FF0000",
      title: "EduNext Shorts",
      sub: "Watch Success Stories"
    }
  ];

  return (
    <footer className="relative border-t" style={{ backgroundColor: primaryBg, borderColor: 'rgba(255, 255, 255, 0.05)' }}>
      {/* Decorative top gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Brand & Social Column */}
          <div className="md:col-span-5">
            <div className="mb-6">
              <img
                src="/whitelogo.svg"
                alt="EduNext Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-gray-400 max-w-sm mb-8 text-sm leading-relaxed">
              The elite competitive platform for serious JEE aspirants. 
              Stop preparing blindly. Start competing with the best minds 
              in the country with data-driven insights.
            </p>
            
            {/* Social Contact Cards */}
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] transition-all duration-300 hover:border-white/10 hover:bg-white/[0.05] group"
                >
                  <div 
                    className="transition-colors duration-300 text-gray-400"
                    style={{ '--hover-color': social.hoverColor } as React.CSSProperties}
                  >
                    <span className="group-hover:text-[var(--hover-color)]">
                      {social.icon}
                    </span>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{social.label}</div>
                    <div className="text-xs text-white font-medium">{social.title}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
          
          {/* Platform Links */}
          <div className="md:col-span-2 md:col-start-7">
            <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-6">Platform</h4>
            <ul className="space-y-4">
              <li>
                <a href="#contests" className={footerLinkStyle}>
                  Contests <ArrowUpRight size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              </li>
              <li>
                <a href="#jee-predictor" className={footerLinkStyle}>
                  Rank Predictor <ArrowUpRight size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              </li>
              <li>
                <a href="#pricing" className={footerLinkStyle}>
                  Pricing <ArrowUpRight size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              </li>
              <li>
                <a href="#login" className={footerLinkStyle}>
                  Student Login <ArrowUpRight size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="md:col-span-2">
            <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#about" className={footerLinkStyle}>About Us</a></li>
              <li><a href="#success" className={footerLinkStyle}>Success Stories</a></li>
              <li><a href="#pedigree" className={footerLinkStyle}>Our Pedigree</a></li>
              <li><a href="#contact" className={footerLinkStyle}>Contact</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="md:col-span-2">
            <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#terms" className={footerLinkStyle}>Terms of Service</a></li>
              <li><a href="#privacy" className={footerLinkStyle}>Privacy Policy</a></li>
              <li><a href="#cookies" className={footerLinkStyle}>Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center border-white/5">
          <div className="text-gray-500 text-[10px] tracking-[0.2em] uppercase mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} EDUNEXT EDUCATION PVT LTD. ALL RIGHTS RESERVED.
          </div>
          
          <div className="flex items-center space-x-6 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
             <div className="flex items-center gap-2">
               <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
               <span className="opacity-70">Cloud Servers: Operational</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};