'use client';

import { useState, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, User } from 'lucide-react';

// Question Types
const QuestionType = {
  MCQ: 'MCQ',
  NUMERICAL: 'NUMERICAL'
};

export default function ExamView({ questions, examType, onSubmit, onExit }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState({});
  const [marked, setMarked] = useState([]);
  const [visited, setVisited] = useState(questions.length > 0 ? [questions[0]?.id] : []);
  const [timeLeft, setTimeLeft] = useState(180 * 60); // 3 hours in seconds
  const [timeSpent, setTimeSpent] = useState({});

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(p => Math.max(0, p - 1));
      
      if (questions.length > 0) {
        const currentQId = questions[currentIdx]?.id;
        if (currentQId) {
          setTimeSpent(prev => ({
            ...prev,
            [currentQId]: (prev[currentQId] || 0) + 1
          }));
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentIdx, questions]);

  // Auto submit when time runs out
  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit(true);
    }
  }, [timeLeft]);

  if (questions.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#e9ecef]">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-700 mb-4">No questions available</p>
          <button 
            onClick={onExit}
            className="bg-[#1a237e] text-white px-6 py-2 rounded font-bold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  const handleNext = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx < questions.length) {
      const nextId = questions[nextIdx].id;
      if (!visited.includes(nextId)) {
        setVisited(v => [...v, nextId]);
      }
      setCurrentIdx(nextIdx);
    }
  };

  const handlePrev = () => {
    setCurrentIdx(i => Math.max(0, i - 1));
  };

  const getBtnStatus = (id) => {
    const isAns = responses[id] !== undefined;
    const isMarked = marked.includes(id);
    if (isMarked && isAns) return 'nta-ans-marked';
    if (isMarked) return 'nta-marked';
    if (isAns) return 'nta-answered';
    if (visited.includes(id)) return 'nta-not-answered';
    return 'nta-not-visited';
  };

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const getStatusCounts = () => {
    const answered = Object.keys(responses).filter(id => !marked.includes(id)).length;
    const notAnswered = visited.filter(id => responses[id] === undefined && !marked.includes(id)).length;
    const notVisited = questions.filter(q => !visited.includes(q.id)).length;
    const markedOnly = marked.filter(id => responses[id] === undefined).length;
    const answeredMarked = marked.filter(id => responses[id] !== undefined).length;
    
    return { answered, notAnswered, notVisited, markedOnly, answeredMarked };
  };

  const handleSubmit = (autoSubmit = false) => {
    const confirmMsg = autoSubmit 
      ? "Time's up! Test will be submitted automatically." 
      : "Are you sure you want to submit the test?";
      
    if (autoSubmit || window.confirm(confirmMsg)) {
      // TODO: Save to Supabase
      onSubmit({
        id: `test_${Date.now()}`,
        examType,
        title: 'Mock Test',
        startTime: Date.now(),
        durationMinutes: 180,
        questions,
        responses,
        markedForReview: marked,
        visited,
        hintsUsed: {},
        isSubmitted: true,
        timeTakenPerQuestion: timeSpent
      });
    }
  };

  const counts = getStatusCounts();

  return (
    <div className="h-screen flex flex-col bg-[#e9ecef] text-slate-900 font-sans select-none overflow-hidden">
      <style>{`
        .nta-btn-circle { 
          width: 32px; 
          height: 32px; 
          font-size: 11px; 
          font-weight: 700; 
          border: 1px solid #dee2e6; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          position: relative; 
          cursor: pointer; 
          transition: all 0.2s;
        }
        .nta-btn-circle:hover {
          transform: scale(1.1);
        }
        .nta-not-visited { background: #fff; color: #444; border-radius: 4px; }
        .nta-not-answered { background: #dc3545; color: #fff; border-radius: 50% 50% 0 0; }
        .nta-answered { background: #28a745; color: #fff; border-radius: 0 0 50% 50%; }
        .nta-marked { background: #6f42c1; color: #fff; border-radius: 50%; }
        .nta-ans-marked { background: #6f42c1; color: #fff; border-radius: 50%; }
        .nta-ans-marked::after { 
          content: ''; 
          position: absolute; 
          bottom: 0; 
          right: 0; 
          width: 8px; 
          height: 8px; 
          background: #28a745; 
          border-radius: 50%; 
          border: 1px solid white; 
        }
        .nta-nav-btn { 
          background: #fff; 
          border: 1px solid #1a237e; 
          color: #1a237e; 
          font-weight: 600; 
          font-size: 13px; 
          padding: 6px 16px; 
          transition: all 0.2s;
        }
        .nta-nav-btn:hover { background: #f8f9fa; }
        .nta-nav-btn-primary { background: #1a237e; color: #fff; }
        .nta-nav-btn-primary:hover { background: #0d1642; }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: #f1f1f1; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #888; border-radius: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-slate-300 px-4 py-2 flex justify-between items-center shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a237e] text-white px-3 py-1 text-sm font-bold rounded">NTA</div>
          <span className="font-bold text-[#1a237e]">{examType?.replace('_', ' ') || 'MOCK'} TEST 2024</span>
        </div>
        <div className="flex items-center gap-4">
           <div className={`px-4 py-1.5 rounded flex items-center gap-2 font-mono font-bold ${
             timeLeft < 300 ? 'bg-red-600 animate-pulse' : 'bg-[#1a237e]'
           } text-white`}>
              <Clock size={16}/> {formatTime(timeLeft)}
           </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Section - Question Content */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Subject Tabs */}
          <div className="flex bg-[#f1f3f5] border-b border-slate-200">
            {['Physics', 'Chemistry', 'Mathematics'].map(sub => (
              <button 
                key={sub}
                className={`px-6 py-2 text-sm font-bold border-r border-slate-300 transition-colors ${
                  currentQ.subject === sub 
                    ? 'bg-white text-[#1a237e]' 
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Question Meta */}
          <div className="px-6 py-3 border-b flex justify-between items-center bg-[#f8f9fa]">
            <div className="font-bold text-[#1a237e]">Question No. {currentIdx + 1}</div>
            <div className="flex gap-4 text-[11px] font-bold">
               <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                 Marks: +{currentQ.positiveMarks || 4}
               </span>
               <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded">
                 Negative: {currentQ.negativeMarks || -1}
               </span>
            </div>
          </div>

          {/* Actual Question Text Area */}
          <div className="flex-1 overflow-y-auto p-10 scrollbar-thin">
            <div className="max-w-4xl mx-auto">
              <div className="text-lg leading-relaxed mb-10 text-slate-800 font-medium whitespace-pre-wrap">
                {currentQ.text}
              </div>

              <div className="space-y-4">
                {currentQ.type === QuestionType.MCQ && currentQ.options ? (
                  currentQ.options.map((opt, i) => (
                    <label 
                      key={i} 
                      className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                        responses[currentQ.id] === i.toString() 
                          ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400' 
                          : 'hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name={`q-${currentQ.id}`} 
                        className="mt-1"
                        checked={responses[currentQ.id] === i.toString()} 
                        onChange={() => setResponses({...responses, [currentQ.id]: i.toString()})}
                      />
                      <div className="flex gap-3">
                        <span className="font-bold text-slate-400">{String.fromCharCode(65 + i)})</span>
                        <span className="text-slate-700">{opt}</span>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-slate-500">Your Answer:</span>
                    <input 
                      type="text"
                      className="w-full max-w-xs border-2 border-slate-300 p-3 rounded-lg outline-none focus:border-blue-500 font-mono text-lg"
                      value={responses[currentQ.id] || ''}
                      placeholder="Type your numeric answer here..."
                      onChange={(e) => setResponses({...responses, [currentQ.id]: e.target.value})}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="bg-[#f1f3f5] border-t border-slate-300 p-4 flex justify-between items-center shrink-0">
             <div className="flex gap-2">
                <button 
                  onClick={() => { 
                    if (!marked.includes(currentQ.id)) {
                      setMarked([...marked, currentQ.id]); 
                    }
                    handleNext(); 
                  }}
                  className="nta-nav-btn rounded shadow-sm"
                >
                  Mark for Review & Next
                </button>
                <button 
                  onClick={() => { 
                    setResponses(prev => { 
                      const n = {...prev}; 
                      delete n[currentQ.id]; 
                      return n; 
                    });
                    setMarked(prev => prev.filter(id => id !== currentQ.id));
                  }}
                  className="nta-nav-btn rounded shadow-sm"
                >
                  Clear Response
                </button>
             </div>
             <div className="flex gap-2">
                <button 
                  onClick={handlePrev} 
                  disabled={currentIdx === 0}
                  className={`nta-nav-btn rounded flex items-center gap-1 ${
                    currentIdx === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <ChevronLeft size={14}/> Previous
                </button>
                <button 
                  onClick={handleNext}
                  className="nta-nav-btn nta-nav-btn-primary rounded shadow-sm px-10 flex items-center gap-1"
                >
                  Save & Next <ChevronRight size={14}/>
                </button>
             </div>
          </div>
        </div>

        {/* Right Section - Status Panel */}
        <div className="w-80 border-l border-slate-300 flex flex-col bg-[#f8f9fa] shrink-0">
          <div className="p-4 flex items-center gap-4 bg-white border-b shrink-0">
             <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center text-slate-400">
                <User size={24}/>
             </div>
             <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Candidate Name</div>
                <div className="font-bold text-[#1a237e] text-sm">TEST_USER</div>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
             {/* Status Legend */}
             <div className="grid grid-cols-2 gap-y-3 gap-x-1 mb-6">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                  <div className="nta-btn-circle nta-answered">{counts.answered}</div> 
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                  <div className="nta-btn-circle nta-not-answered">{counts.notAnswered}</div> 
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                  <div className="nta-btn-circle nta-not-visited">{counts.notVisited}</div> 
                  <span>Not Visited</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                  <div className="nta-btn-circle nta-marked">{counts.markedOnly}</div> 
                  <span>Marked for Review</span>
                </div>
                <div className="col-span-2 flex items-center gap-2 text-[10px] font-bold text-slate-600">
                  <div className="nta-btn-circle nta-ans-marked">{counts.answeredMarked}</div> 
                  <span>Answered & Marked for Review</span>
                </div>
             </div>

             <div className="bg-[#1a237e] text-white p-1 text-center font-bold text-xs uppercase mb-3">
               Question Palette
             </div>
             
             {/* Question Grid */}
             <div className="grid grid-cols-4 gap-2 bg-white border p-3">
                {questions.map((q, i) => (
                  <div 
                    key={q.id}
                    onClick={() => { 
                      setCurrentIdx(i); 
                      if(!visited.includes(q.id)) {
                        setVisited([...visited, q.id]);
                      }
                    }}
                    className={`nta-btn-circle ${getBtnStatus(q.id)} ${
                      currentIdx === i ? 'ring-2 ring-orange-500 ring-offset-1' : ''
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
             </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 grid grid-cols-2 gap-2 border-t bg-white shrink-0">
             <button className="bg-slate-100 py-1.5 text-[10px] font-bold rounded border border-slate-200 hover:bg-slate-200 transition-colors">
               Question Paper
             </button>
             <button className="bg-slate-100 py-1.5 text-[10px] font-bold rounded border border-slate-200 hover:bg-slate-200 transition-colors">
               Instructions
             </button>
             <button 
               onClick={() => handleSubmit(false)}
               className="col-span-2 bg-[#28a745] hover:bg-[#218838] text-white py-2 font-bold text-sm rounded shadow-lg transition-colors mt-2"
             >
                SUBMIT TEST
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}