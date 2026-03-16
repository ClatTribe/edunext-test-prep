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