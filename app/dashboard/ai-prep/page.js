"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AnalyticsView from '../../components/AnalyticsView';
// Yahan apne Dashboard component ka sahi path check kar lein
import Dashboard from './components/Dashboard'; 

export default function AIPrepPage() {
  // 1. SARE HOOKS SABSE UPAR (TOP LEVEL)
  const router = useRouter();
  const [showAnalytics, setShowAnalytics] = useState(false);

  // 2. MOCK DATA (Taaki Analytics khali na dikhe)
  const statsData = {
    rating: 2150,
    subjectAnalytics: [
      {
        subject: "Physics",
        accuracyTrend: [{ date: '1/2', value: 65 }, { date: '2/2', value: 78 }],
        topics: [{ topic: "Rotational Dynamics", avgTime: 45, accuracy: 48 }]
      },
      {
        subject: "Chemisty",
        accuracyTrend: [{ date: '1/2', value: 43 }, { date: '2/3', value: 67 }],
        topics: [{ topic: "Rotational Dynamics", avgTime: 45, accuracy: 38 }]
      },
      {
        subject: "Maths",
        accuracyTrend: [{ date: '1/2', value: 65 }, { date: '1/2', value: 36 }],
        topics: [{ topic: "Rotational Dynamics", avgTime: 45, accuracy: 48 }]
      }
    ]
  };

  // 3. CONDITIONAL RENDERING (Hooks ke baad)
  if (showAnalytics) {
    return (
      <AnalyticsView 
        stats={statsData} 
        onBack={() => setShowAnalytics(false)} 
      />
    );
  }

  // DEFAULT DASHBOARD VIEW
  return (
    <div className="relative">
      {/* Dashboard component ko render kar rahe hain */}
      <Dashboard onOpenAnalytics={() => setShowAnalytics(true)}/> 
    </div>
  );
}