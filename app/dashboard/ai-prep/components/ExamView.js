'use client';

import React, { useState, useEffect, useRef, memo } from 'react';
import { Clock, ChevronLeft, ChevronRight, User } from 'lucide-react';

const QuestionType = {
  MCQ: 'MCQ',
  NUMERICAL: 'NUMERICAL'
};

/**
 * FIXED: Isolated Timer Component
 * This component handles its own state. 
 * Now, the main ExamView won't re-render every second.
 */
const IndependentTimer = ({ initialTime, onTimeUp, formatTime }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onTimeUp]);

  return (
    <div className={`px-4 py-1.5 rounded flex items-center gap-2 font-mono font-bold ${
      timeLeft < 300 ? 'bg-red-600 animate-pulse' : 'bg-[#1a237e]'
    } text-white`}>
      <Clock size={16}/> {formatTime(timeLeft)}
    </div>
  );
};

export default function ExamView({ questions, examType, onSubmit, onExit }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState({});
  const [marked, setMarked] = useState([]);
  const [visited, setVisited] = useState(questions.length > 0 ? [questions[0]?.id] : []);
  
  // Ref to track time spent per question without triggering re-renders
  const timeSpentRef = useRef({});
  const currentQIdRef = useRef(questions[0]?.id);

  // Update current ID ref whenever index changes
  useEffect(() => {
    currentQIdRef.current = questions[currentIdx]?.id;
  }, [currentIdx, questions]);

  // Background interval ONLY for tracking question-wise time
  useEffect(() => {
    const tracker = setInterval(() => {
      if (currentQIdRef.current) {
        timeSpentRef.current[currentQIdRef.current] = (timeSpentRef.current[currentQIdRef.current] || 0) + 1;
      }
    }, 1000);
    return () => clearInterval(tracker);
  }, []);

  if (questions.length === 0) return null;

  const currentQ = questions[currentIdx];

  const handleNext = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx < questions.length) {
      const nextId = questions[nextIdx].id;
      if (!visited.includes(nextId)) setVisited(prev => [...prev, nextId]);
      setCurrentIdx(nextIdx);
    }
  };

  const handlePrev = () => setCurrentIdx(i => Math.max(0, i - 1));

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const getBtnStatus = (id) => {
    const isAns = responses[id] !== undefined && responses[id] !== '';
    const isMarked = marked.includes(id);
    if (isMarked && isAns) return 'nta-ans-marked';
    if (isMarked) return 'nta-marked';
    if (isAns) return 'nta-answered';
    if (visited.includes(id)) return 'nta-not-answered';
    return 'nta-not-visited';
  };

  const handleSubmit = (autoSubmit = false) => {
    const confirmMsg = autoSubmit ? "Time's up! Submitting..." : "Submit Test?";
    if (autoSubmit || window.confirm(confirmMsg)) {
      onSubmit({
        responses,
        timeTakenPerQuestion: timeSpentRef.current,
        isSubmitted: true,
        visited,
        markedForReview: marked
      });
    }
  };

  // Status counts for the sidebar
  const answeredCount = Object.keys(responses).filter(id => responses[id] !== '' && !marked.includes(id)).length;
  const markedCount = marked.filter(id => !responses[id]).length;
  const ansMarkedCount = marked.filter(id => responses[id]).length;
  const notVisitedCount = questions.filter(q => !visited.includes(q.id)).length;
  const notAnsweredCount = questions.length - (answeredCount + markedCount + ansMarkedCount + notVisitedCount);

  return (
    <div className="h-screen flex flex-col bg-[#e9ecef] text-slate-900 font-sans select-none overflow-hidden">
      <style>{`
        .nta-btn-circle { width: 32px; height: 32px; font-size: 11px; font-weight: 700; border: 1px solid #dee2e6; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; }
        .nta-not-visited { background: #fff; color: #444; border-radius: 4px; }
        .nta-not-answered { background: #dc3545; color: #fff; border-radius: 50% 50% 0 0; }
        .nta-answered { background: #28a745; color: #fff; border-radius: 0 0 50% 50%; }
        .nta-marked { background: #6f42c1; color: #fff; border-radius: 50%; }
        .nta-ans-marked { background: #6f42c1; color: #fff; border-radius: 50%; }
        .nta-ans-marked::after { content: ''; position: absolute; bottom: 0; right: 0; width: 8px; height: 8px; background: #28a745; border-radius: 50%; border: 1px solid white; }
        .nta-nav-btn { background: #fff; border: 1px solid #1a237e; color: #1a237e; font-weight: 600; font-size: 13px; padding: 6px 16px; transition: all 0.2s; }
        .nta-nav-btn-primary { background: #1a237e; color: #fff; }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #888; border-radius: 3px; }
      `}</style>

      {/* Header with isolated timer */}
      <header className="bg-white border-b border-slate-300 px-4 py-2 flex justify-between items-center shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a237e] text-white px-3 py-1 text-sm font-bold rounded">NTA</div>
          <span className="font-bold text-[#1a237e] uppercase">{examType || 'MOCK'} TEST 2024</span>
        </div>
        <IndependentTimer initialTime={180 * 60} onTimeUp={() => handleSubmit(true)} formatTime={formatTime} />
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="flex bg-[#f1f3f5] border-b border-slate-200">
            {['Physics', 'Chemistry', 'Mathematics'].map(sub => (
              <button key={sub} className={`px-6 py-2 text-sm font-bold border-r border-slate-300 ${currentQ.subject === sub ? 'bg-white text-[#1a237e]' : 'text-slate-600'}`}>{sub}</button>
            ))}
          </div>

          <div className="px-6 py-3 border-b flex justify-between items-center bg-[#f8f9fa]">
            <div className="font-bold text-[#1a237e]">Question No. {currentIdx + 1}</div>
          </div>

          <div className="flex-1 overflow-y-auto p-10 scrollbar-thin">
            <div className="max-w-4xl mx-auto">
              <div className="text-lg leading-relaxed mb-10 text-slate-800 font-medium whitespace-pre-wrap">
                {currentQ.text}
              </div>

              <div className="space-y-4">
                {currentQ.type === QuestionType.MCQ ? (
                  currentQ.options?.map((opt, i) => (
                    <label key={i} className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all ${responses[currentQ.id] === i.toString() ? 'bg-blue-50 border-blue-400 ring-1' : 'border-slate-200'}`}>
                      <input type="radio" checked={responses[currentQ.id] === i.toString()} onChange={() => setResponses({...responses, [currentQ.id]: i.toString()})} className="mt-1" />
                      <div className="flex gap-3">
                        <span className="font-bold text-slate-400">{String.fromCharCode(65 + i)})</span>
                        <span className="text-slate-700">{opt}</span>
                      </div>
                    </label>
                  ))
                ) : (
                  <input type="text" className="w-full max-w-xs border-2 border-slate-300 p-3 rounded-lg font-mono text-lg" value={responses[currentQ.id] || ''} onChange={(e) => setResponses({...responses, [currentQ.id]: e.target.value})} placeholder="Numeric answer..." />
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#f1f3f5] border-t border-slate-300 p-4 flex justify-between items-center shrink-0">
             <div className="flex gap-2">
                <button onClick={() => { if (!marked.includes(currentQ.id)) setMarked([...marked, currentQ.id]); handleNext(); }} className="nta-nav-btn rounded">Mark for Review & Next</button>
                <button onClick={() => { setResponses(prev => { const n = {...prev}; delete n[currentQ.id]; return n; }); setMarked(prev => prev.filter(id => id !== currentQ.id)); }} className="nta-nav-btn rounded">Clear Response</button>
             </div>
             <div className="flex gap-2">
                <button onClick={handlePrev} disabled={currentIdx === 0} className="nta-nav-btn rounded flex items-center gap-1"><ChevronLeft size={14}/> Previous</button>
                <button onClick={handleNext} className="nta-nav-btn nta-nav-btn-primary rounded px-10 flex items-center gap-1">Save & Next <ChevronRight size={14}/></button>
             </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-slate-300 flex flex-col bg-[#f8f9fa] shrink-0">
          <div className="p-4 flex items-center gap-4 bg-white border-b shrink-0">
             <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center text-slate-400"><User size={24}/></div>
             <div className="font-bold text-[#1a237e] text-sm">TEST_USER</div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
             <div className="grid grid-cols-2 gap-y-3 mb-6">
                <div className="flex items-center gap-2 text-[10px] font-bold"><div className="nta-btn-circle nta-answered">{answeredCount}</div><span>Answered</span></div>
                <div className="flex items-center gap-2 text-[10px] font-bold"><div className="nta-btn-circle nta-not-answered">{notAnsweredCount}</div><span>Not Answered</span></div>
                <div className="flex items-center gap-2 text-[10px] font-bold"><div className="nta-btn-circle nta-not-visited">{notVisitedCount}</div><span>Not Visited</span></div>
                <div className="flex items-center gap-2 text-[10px] font-bold"><div className="nta-btn-circle nta-marked">{markedCount}</div><span>Marked</span></div>
                <div className="col-span-2 flex items-center gap-2 text-[10px] font-bold"><div className="nta-btn-circle nta-ans-marked">{ansMarkedCount}</div><span>Ans & Marked</span></div>
             </div>

             <div className="bg-[#1a237e] text-white p-1 text-center font-bold text-xs uppercase mb-3">Question Palette</div>
             <div className="grid grid-cols-4 gap-2 bg-white border p-3">
                {questions.map((q, i) => (
                  <div key={q.id} onClick={() => { setCurrentIdx(i); if(!visited.includes(q.id)) setVisited([...visited, q.id]); }} className={`nta-btn-circle ${getBtnStatus(q.id)} ${currentIdx === i ? 'ring-2 ring-orange-500' : ''}`}>{i + 1}</div>
                ))}
             </div>
          </div>

          <div className="p-4 border-t bg-white shrink-0">
             <button onClick={() => handleSubmit(false)} className="w-full bg-[#28a745] text-white py-2 font-bold text-sm rounded shadow-lg">SUBMIT TEST</button>
          </div>
        </div>
      </div>
    </div>
  );
}