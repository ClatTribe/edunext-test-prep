"use client";

import React, { useState } from 'react';
import { ArrowLeft, FileText, AlertCircle, Wand2, Calculator, Book, ScanLine } from 'lucide-react';

// Types - adjust according to your types file
interface Question {
  id: string;
  topic: string;
  correctAnswer: string;
  // add other properties as needed
}

interface UploadViewProps {
  onBack: () => void;
  onQuestionsGenerated: (questions: Question[]) => void;
  parseContentService: (content: string) => Promise<Question[]>;
}

const UploadView: React.FC<UploadViewProps> = ({ onBack, onQuestionsGenerated, parseContentService }) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Call your service to parse content and generate questions
      const questions = await parseContentService(inputText);
      
      if (questions.length === 0) {
        setError("AI could not identify problems. Please ensure input is clear.");
      } else {
        onQuestionsGenerated(questions);
      }
    } catch (err) {
      setError("Failed to process content. Please try again.");
      console.error('Error generating questions:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden text-slate-200">
        
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-600/20 blur-[100px] rounded-full z-0"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full z-0"></div>

      <div className="relative z-10 flex flex-col h-full max-w-6xl mx-auto px-6 py-8">
        <button onClick={onBack} className="w-fit flex items-center text-slate-400 hover:text-white font-medium mb-8 transition-colors group">
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            
            {/* Left Col: Info */}
            <div>
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6 border border-indigo-500/30">
                    <ScanLine size={24} className="text-indigo-400" />
                </div>
                <h1 className="text-4xl font-black mb-4 leading-tight text-white">Generate Custom <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Challenge Sets.</span></h1>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                    Paste raw text from textbooks, PDF dumps, or your own notes. Edunext AI will parse logic, identify constraints, and generate a standardized problem set.
                </p>

                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-white/5">
                        <div className="bg-slate-800 p-2 rounded-lg"><Calculator className="text-emerald-400" size={20}/></div>
                        <div>
                            <div className="font-bold text-slate-200">Numerical Parsing</div>
                            <div className="text-xs text-slate-500">Detects variables and integer constraints</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-white/5">
                        <div className="bg-slate-800 p-2 rounded-lg"><Book className="text-yellow-400" size={20}/></div>
                        <div>
                            <div className="font-bold text-slate-200">Conceptual MCQs</div>
                            <div className="text-xs text-slate-500">Extracts theory and generates options</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Col: Input */}
            <div className="w-full">
                <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-1">
                    <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative">
                        <div className="absolute top-4 right-4 z-10">
                             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                <FileText size={10}/> RAW INPUT
                             </div>
                        </div>
                        <textarea
                            className="w-full h-96 p-6 text-slate-300 placeholder:text-slate-600 focus:outline-none resize-none bg-slate-950 text-sm leading-relaxed font-mono"
                            placeholder={`// Paste problem text here...`}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                    </div>
                    
                    <div className="p-4">
                        <button
                            onClick={handleGenerate}
                            disabled={isProcessing || !inputText.trim()}
                            className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-3 ${isProcessing || !inputText.trim() ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02]'}`}
                        >
                            {isProcessing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Compiling...</span>
                            </>
                            ) : (
                            <>
                                <Wand2 size={18} /> Compile & Launch
                            </>
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-6 mx-2 p-4 bg-red-900/20 text-red-400 rounded-xl flex items-center gap-3 border border-red-900/50 text-sm">
                        <AlertCircle size={16} className="shrink-0" />
                        {error}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default UploadView;