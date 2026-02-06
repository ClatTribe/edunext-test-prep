'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChevronUp, Info, Home, ArrowLeft, ArrowRight } from 'lucide-react';
import 'katex/dist/katex.min.css';

// MathRenderer component with LaTeX support
const MathRenderer = ({ children }) => {
  const contentRef = useRef(null);
  
  useEffect(() => {
    if (contentRef.current && typeof window !== 'undefined') {
      // Load KaTeX if not already loaded
      if (!window.katex) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
        script.onload = () => renderMath();
        document.head.appendChild(script);
      } else {
        renderMath();
      }
    }
  }, [children]);

  const renderMath = () => {
    if (!contentRef.current || !window.katex) return;

    const blockMathElements = contentRef.current.querySelectorAll('.block-math-placeholder');
    const inlineMathElements = contentRef.current.querySelectorAll('.inline-math-placeholder');
    
    blockMathElements.forEach(element => {
      const formula = element.getAttribute('data-formula');
      if (formula) {
        try {
          window.katex.render(decodeURIComponent(formula), element, { 
            displayMode: true, 
            throwOnError: false 
          });
        } catch (e) {
          console.error('KaTeX render error:', e);
        }
      }
    });
    
    inlineMathElements.forEach(element => {
      const formula = element.getAttribute('data-formula');
      if (formula) {
        try {
          window.katex.render(decodeURIComponent(formula), element, { 
            displayMode: false, 
            throwOnError: false 
          });
        } catch (e) {
          console.error('KaTeX render error:', e);
        }
      }
    });
  };
  
  return <div ref={contentRef} className="math-content">{children}</div>;
};

// Process LaTeX in HTML content
const processLatexInHTML = (html) => {
  if (!html) return html;
  
  let processed = html.replace(/\$\$([^\$]+)\$\$/g, (match, formula) => {
    return `<span class="block-math-placeholder" data-formula="${encodeURIComponent(formula)}"></span>`;
  });
  
  processed = processed.replace(/\$([^\$]+)\$/g, (match, formula) => {
    return `<span class="inline-math-placeholder" data-formula="${encodeURIComponent(formula)}"></span>`;
  });
  
  processed = processed.replace(/\\\[([^\]]+)\\\]/g, (match, formula) => {
    return `<span class="block-math-placeholder" data-formula="${encodeURIComponent(formula)}"></span>`;
  });
  
  processed = processed.replace(/\\\(([^\)]+)\\\)/g, (match, formula) => {
    return `<span class="inline-math-placeholder" data-formula="${encodeURIComponent(formula)}"></span>`;
  });
  
  return processed;
};

export default function TestSolution({ attemptId, onNavigateToAnalysis }) {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeSection, setActiveSection] = useState('all');
  const [showAllQuestions, setShowAllQuestions] = useState(true);

  useEffect(() => {
    if (attemptId) {
      fetchSolutionData();
    }
  }, [attemptId]);

  const fetchSolutionData = async () => {
    try {
      setLoading(true);
  
      // Get test attempt
      const { data: attemptData, error: attemptError } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('id', attemptId)
        .single();
  
      if (attemptError) throw attemptError;
  
      const sessionId = attemptData.session_id;
      const testId = attemptData.test_id;
  
      // ✅ Determine if this is a contest or practice test
      let isContest = false;
      const { data: contestCheck } = await supabase
        .from('contests')
        .select('id')
        .eq('id', testId)
        .maybeSingle();
      
      if (contestCheck) {
        isContest = true;
      }
  
      // Fetch user responses
      const { data: responses, error: respError } = await supabase
        .from('user_responses')
        .select('*')
        .eq('session_id', sessionId);
  
      if (respError) throw respError;
  
      // Get latest response for each question
      const latestResponses = {};
      responses?.forEach(r => {
        const qId = r.question_id;
        if (!latestResponses[qId] || r.visit_number > latestResponses[qId].visit_number) {
          latestResponses[qId] = r;
        }
      });
  
      const finalResponses = Object.values(latestResponses);
      const questionIds = finalResponses.map(r => r.question_id);
  
      if (questionIds.length === 0) {
        setQuestions([]);
        setSections([]);
        setLoading(false);
        return;
      }
  
      // Fetch questions
      const { data: questionsData, error: qError } = await supabase
        .from('questions')
        .select('*')
        .in('id', questionIds);
  
      if (qError) throw qError;
  
      // Fetch options
      const { data: optionsData } = await supabase
        .from('question_options')
        .select('*')
        .in('question_id', questionsData.map(q => q.id))
        .order('option_order', { ascending: true });
  
      // Fetch solutions
      const { data: solutionsData } = await supabase
        .from('question_solutions')
        .select('*')
        .in('question_id', questionsData.map(q => q.id));
  
      // ✅ EXACT SAME LOGIC AS EXAMINTERFACE
      const sectionsExist = questionsData.some(q => q.contest_section_id);
  
      let finalSections = [];
      let sortedQuestions = questionsData;
      let sectionsMap = {};
  
      if (sectionsExist && isContest) {
        // ✅ Contest mode: Fetch from contest_sections
        const sectionIds = [...new Set(questionsData.map(q => q.contest_section_id).filter(Boolean))];
        
        const { data: sectionsData } = await supabase
          .from('contest_sections')
          .select('*')
          .in('id', sectionIds)
          .order('section_order', { ascending: true });
  
        sectionsData?.forEach(section => {
          sectionsMap[section.id] = {
            ...section,
            questions: []
          };
        });
  
        const sectionsArray = Object.values(sectionsMap).sort((a, b) => 
          (a.section_order || 0) - (b.section_order || 0)
        );
  
        sortedQuestions = [];
        sectionsArray.forEach(section => {
          const sectionQuestions = questionsData.filter(q => q.contest_section_id === section.id);
          sortedQuestions.push(...sectionQuestions);
        });
  
        finalSections = sectionsArray;
  
      } else {
        // ✅ Practice mode: Create subject-based sections
        const subjectMap = {};
        
        questionsData.forEach((q) => {
          const subject = q.subject || 'Other';
          
          if (!subjectMap[subject]) {
            subjectMap[subject] = {
              id: subject,
              section_name: subject,
              section_order: Object.keys(subjectMap).length,
              questions: []
            };
          }
          
          subjectMap[subject].questions.push(q);
        });
        
        const subjectSections = Object.values(subjectMap).sort((a, b) => 
          a.section_order - b.section_order
        );
        
        sortedQuestions = [];
        subjectSections.forEach(section => {
          sortedQuestions.push(...section.questions);
        });
        
        finalSections = subjectSections;
      }
  
      // ✅ Enrich questions with data
      const enrichedQuestions = sortedQuestions.map(q => {
        const userResponse = latestResponses[q.id];
        const questionOptions = (optionsData || []).filter(opt => opt.question_id === q.id);
        const questionSolution = (solutionsData || []).find(sol => sol.question_id === q.id);
  
        return {
          ...q,
          options: questionOptions,
          solution: questionSolution || null,
          userResponse: userResponse || null,
          isCorrect: userResponse?.is_correct || false,
          isAttempted: userResponse?.is_answered || false,
          isMarked: userResponse?.is_marked_for_review || false,
          timeSpent: userResponse?.time_spent_seconds || 0,
          selectedOptionId: userResponse?.selected_option_id,
          selectedOptionLabel: userResponse?.selected_option_label,
          numericalAnswer: userResponse?.numerical_answer || '',
          marksObtained: userResponse?.marks_obtained || 0
        };
      });
  
      console.log('=== TEST SOLUTION DEBUG ===');
      console.log('Is Contest:', isContest);
      console.log('Sections Exist:', sectionsExist);
      console.log('Sections Created:', finalSections);
      console.log('Sample Question:', enrichedQuestions[0]);
      console.log('===========================');
  
      setSections(finalSections);
      setQuestions(enrichedQuestions);
      
      if (finalSections.length > 0) {
        setActiveSection('all');
      }
  
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to load solutions: ' + error.message);
      setLoading(false);
    }
  };

  // ✅ NEW CODE:
const getCurrentSectionQuestions = useMemo(() => {
    if (showAllQuestions || sections.length === 0) {
      return questions;
    }
  
    if (activeSection === 'all') {
      return questions;
    }
  
    const currentSection = sections.find(s => s.id === activeSection);
    if (!currentSection) return [];
  
    // ✅ Handle both contest sections (UUID) and custom test sections (subject name)
    return questions.filter(q => {
      // Check if it's a contest section (UUID format)
      if (typeof activeSection === 'string' && activeSection.includes('-')) {
        return q.contest_section_id === activeSection;
      } else {
        // Custom test: Match by subject
        return q.subject === activeSection;
      }
    });
  }, [sections, activeSection, questions, showAllQuestions]);

  const currentQuestion = questions[currentQuestionIndex];

  const getQuestionStatus = (question) => {
    const isAnswered = question.isAttempted;
    const isMarked = question.isMarked;
    const isCorrect = question.isCorrect;

    if (isAnswered && isMarked && isCorrect) return 'correct-marked';
    if (isAnswered && isMarked && !isCorrect) return 'incorrect-marked';
    if (isAnswered && isCorrect) return 'correct';
    if (isAnswered && !isCorrect) return 'incorrect';
    if (isMarked) return 'marked';
    if (question.userResponse) return 'not-answered';
    return 'not-attempted';
  };

const handleQuestionClick = (globalIndex) => {
    setCurrentQuestionIndex(globalIndex);
    
    // ✅ Update active section based on clicked question (contest or custom)
    const clickedQuestion = questions[globalIndex];
    if (clickedQuestion && !showAllQuestions) {
      // Get section ID (either contest_section_id or subject)
      const sectionId = clickedQuestion.contest_section_id || clickedQuestion.subject;
      
      if (sectionId) {
        const questionSection = sections.find(s => s.id === sectionId);
        if (questionSection && activeSection !== sectionId) {
          setActiveSection(sectionId);
        }
      }
    }
  };

 
const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    setShowAllQuestions(false);
    
    // ✅ Find first question of this section (contest or custom)
    const firstQuestion = questions.find(q => {
      // Contest section (UUID)
      if (typeof sectionId === 'string' && sectionId.includes('-')) {
        return q.contest_section_id === sectionId;
      } else {
        // Custom test section (subject name)
        return q.subject === sectionId;
      }
    });
    
    if (firstQuestion) {
      const index = questions.findIndex(q => q.id === firstQuestion.id);
      if (index !== -1) {
        setCurrentQuestionIndex(index);
      }
    }
  };

  const handleShowAllQuestions = () => {
    setShowAllQuestions(true);
    setActiveSection('all');
    setCurrentQuestionIndex(0);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      
      // Update section if question belongs to different section
      const newQuestion = questions[newIndex];
      if (newQuestion && newQuestion.contest_section_id && !showAllQuestions) {
        setActiveSection(newQuestion.contest_section_id);
      }
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      
      // Update section if question belongs to different section
      const newQuestion = questions[newIndex];
      if (newQuestion && newQuestion.contest_section_id && !showAllQuestions) {
        setActiveSection(newQuestion.contest_section_id);
      }
    }
  };

  // Calculate legend counts
  const correctCount = questions.filter(q => q.isAttempted && q.isCorrect && !q.isMarked).length;
  const incorrectCount = questions.filter(q => q.isAttempted && !q.isCorrect && !q.isMarked).length;
  const notAttemptedCount = questions.filter(q => !q.isAttempted && !q.isMarked).length;
  const markedOnlyCount = questions.filter(q => q.isMarked && !q.isAttempted).length;
  const correctMarkedCount = questions.filter(q => q.isAttempted && q.isCorrect && q.isMarked).length;
  const incorrectMarkedCount = questions.filter(q => q.isAttempted && !q.isCorrect && q.isMarked).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B86C5] mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading solutions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden relative">

      {/* Left Side - Question Display */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <div className="bg-white border-b border-gray-300 flex items-center px-3 py-0.5 flex-shrink-0">
          <button
            onClick={() => router.back()}
            className="bg-[#5B86C5] text-white px-3 py-1 text-xs font-medium hover:bg-[#4a75b4] transition-colors flex items-center gap-2"
            style={{ borderRadius: '4px 4px 0 0' }}
          >
            <Home size={14} />
            Back
          </button>
          <div className="bg-[#5B86C5] text-white px-3 py-1 text-xs font-medium ml-2" style={{ borderRadius: '4px 4px 0 0' }}>
            Test Solutions
          </div>
        </div>

        {/* Section Tabs */}
        <div className="bg-white border-b border-gray-300 flex items-center justify-between px-3 py-1 flex-shrink-0">
          <div className="flex items-center overflow-x-auto" style={{ gap: '0px' }}>
            <span className="text-xs font-medium text-gray-700 mr-2">Section</span>
            
            {/* ALL QUESTIONS Button - First */}
            <button
              onClick={handleShowAllQuestions}
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold transition-all whitespace-nowrap"
              style={{ 
                fontSize: '10px',
                backgroundColor: showAllQuestions ? '#5B86C5' : '#EAF1FB',
                color: showAllQuestions ? '#FFFFFF' : '#2F6FB2',
                border: showAllQuestions ? 'none' : '1px solid #5B86C5',
                borderRadius: '0px'
              }}
            >
              ALL QUESTIONS
            </button>

            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className="flex items-center gap-1 px-3 py-1 text-xs font-semibold transition-all whitespace-nowrap"
                style={{ 
                  fontSize: '10px',
                  backgroundColor: (!showAllQuestions && activeSection === section.id) ? '#5B86C5' : '#EAF1FB',
                  color: (!showAllQuestions && activeSection === section.id) ? '#FFFFFF' : '#2F6FB2',
                  border: (!showAllQuestions && activeSection === section.id) ? 'none' : '1px solid #5B86C5',
                  borderRadius: '0px'
                }}
              >
                {section.section_name.toUpperCase()}
                <Info size={12} className="opacity-70" />
              </button>
            ))}
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-auto p-6 bg-white">
          {currentQuestion ? (
            <MathRenderer key={currentQuestion.id}>
              <div>
                {/* Question Properties and Score */}
                <div className="mb-2 text-xs text-gray-600 flex items-center justify-between flex-wrap">
                  <div className="flex items-center gap-2">
                    <span>{currentQuestion.subject || 'Subject'}</span>
                    <span>•</span>
                    <span>Ch: {currentQuestion.chapter || 'N/A'}</span>
                    <span>•</span>
                    <span>Topic: {currentQuestion.topic || 'N/A'}</span>
                    <span>•</span>
                    <span className={
                      currentQuestion.difficulty === 'easy' ? 'text-green-600' :
                      currentQuestion.difficulty === 'medium' ? 'text-yellow-600' :
                      'text-red-600'
                    }>
                      {currentQuestion.difficulty?.toUpperCase() || 'MEDIUM'}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-purple-700">
                    Score: {currentQuestion.marksObtained}/{currentQuestion.positive_marks || 4}
                  </div>
                </div>

                {/* Question Number */}
                <div className="mb-4">
                  <span className="text-lg font-bold text-gray-800">
                    Question {currentQuestionIndex + 1}
                  </span>
                </div>

                {/* Question Text with LaTeX */}
                <div 
                  className="text-base mb-6 leading-relaxed"
                  style={{ fontSize: '14px', color: '#000000', lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: processLatexInHTML(currentQuestion.question_text || '') }}
                />

                {currentQuestion.question_image_url && (
                  <div className="my-4">
                    <img 
                      src={currentQuestion.question_image_url} 
                      alt="Question"
                      className="rounded shadow-sm"
                      style={{ maxWidth: '400px', maxHeight: '300px', height: 'auto' }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}

                {/* Options Display - MCQ with LaTeX */}
                {currentQuestion.question_type !== 'numerical' && currentQuestion.options && currentQuestion.options.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {currentQuestion.options.map((option) => {
                      const isSelected = option.option_label === currentQuestion.selectedOptionLabel;
                      const isCorrect = option.is_correct;

                      let borderColor = '#D0D0D0';
                      let bgColor = '#FFFFFF';

                      if (isCorrect) {
                        borderColor = '#3CB44B';
                        bgColor = '#3CB44B11';
                      } else if (isSelected) {
                        borderColor = '#E4572E';
                        bgColor = '#E4572E11';
                      }

                      return (
                        <label
                          key={option.id}
                          className="flex items-start p-4 rounded-lg cursor-default transition-all"
                          style={{ 
                            border: `2px solid ${borderColor}`,
                            backgroundColor: bgColor
                          }}
                        >
                          <input
                            type="radio"
                            checked={isSelected}
                            readOnly
                            className="mt-1 mr-3 w-4 h-4"
                          />
                          <div className="flex-1">
                            <span className="font-bold mr-2" style={{ fontSize: '16px' }}>
                              {option.option_label}.
                            </span>
                            
                            <span 
                              style={{ fontSize: '16px', color: '#000000' }}
                              dangerouslySetInnerHTML={{ __html: processLatexInHTML(option.option_text || '') }}
                            />
                            
                            {option.option_image_url && (
                              <img 
                                src={option.option_image_url} 
                                alt={`Option ${option.option_label}`}
                                className="mt-2 rounded shadow-sm"
                                style={{ maxWidth: '300px', maxHeight: '200px', height: 'auto' }}
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            )}
                          </div>
                          
                          {isCorrect && (
                            <span className="ml-2 px-2 py-1 bg-[#3CB44B] text-white text-xs font-bold rounded">
                              ✓ Correct
                            </span>
                          )}
                          {isSelected && !isCorrect && (
                            <span className="ml-2 px-2 py-1 bg-[#E4572E] text-white text-xs font-bold rounded">
                              ✗ Your Answer
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Answer Boxes - Numerical */}
                {currentQuestion.question_type === 'numerical' && (
                  <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Answer:
                      </label>
                      <input
                        type="text"
                        value={currentQuestion.numericalAnswer || ''}
                        readOnly
                        placeholder="Not answered"
                        className="w-full px-4 py-3 border-2 rounded-lg text-base"
                        style={{
                          borderColor: currentQuestion.isCorrect ? '#3CB44B' : '#E4572E',
                          backgroundColor: currentQuestion.isCorrect ? '#3CB44B11' : '#E4572E11'
                        }}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Correct Answer:
                      </label>
                      <input
                        type="text"
                        value={currentQuestion.numerical_answer || 'N/A'}
                        readOnly
                        className="w-full px-4 py-3 border-2 border-[#3CB44B] rounded-lg text-base font-semibold text-[#3CB44B]"
                        style={{ backgroundColor: '#3CB44B11' }}
                      />
                    </div>
                  </div>
                )}

                {/* Solution - Plain text with LaTeX, no box/border */}
                <div className="mt-8">
                  <h3 className="text-base font-bold text-blue-700 mb-3">
                    💡 Solution
                  </h3>
                  
                  {currentQuestion.solution?.solution_text ? (
                    <div 
                      className="text-sm leading-relaxed mb-3"
                      style={{ color: '#000000', lineHeight: '1.6' }}
                      dangerouslySetInnerHTML={{ __html: processLatexInHTML(currentQuestion.solution.solution_text) }}
                    />
                  ) : (
                    <div className="text-sm text-gray-600">Solution not available for this question.</div>
                  )}

                  {currentQuestion.solution?.solution_image_url && (
                    <img 
                      src={currentQuestion.solution.solution_image_url} 
                      alt="Solution"
                      className="rounded shadow-sm mb-3 mt-3"
                      style={{ maxWidth: '400px', maxHeight: '300px' }}
                    />
                  )}

                  {currentQuestion.solution?.solution_video_url && (
                    <video 
                      controls 
                      className="rounded shadow-sm mt-3"
                      style={{ maxWidth: '500px' }}
                    >
                      <source src={currentQuestion.solution.solution_video_url} type="video/mp4" />
                    </video>
                  )}
                </div>
              </div>
            </MathRenderer>
          ) : (
            <div className="text-center text-gray-500 py-12">No question available</div>
          )}
        </div>

        {/* Bottom Navigation - View Complete Analysis button between Previous and Next */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 bg-white rounded hover:bg-gray-50 font-medium text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ border: '2px solid #757575', color: '#757575' }}
          >
            <ArrowLeft size={16} />
            Previous
          </button>

          <button
            onClick={() => router.push(`/results/${attemptId}`)}
            className="px-6 py-3 bg-[#5B86C5] text-white rounded-lg hover:bg-[#4a75b4] font-bold text-sm flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Complete Analysis
          </button>

          <button
            onClick={handleNext}
            disabled={currentQuestionIndex === questions.length - 1}
            className="px-4 py-2 bg-white rounded hover:bg-gray-50 font-medium text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ border: '2px solid #757575', color: '#757575' }}
          >
            Next
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Right Side - Question Palette */}
      <div className="overflow-y-auto border-l h-screen" style={{ width: '300px', backgroundColor: '#EAF6FA', borderLeftColor: '#D0D0D0' }}>
        <div style={{ padding: '12px', fontFamily: '"Segoe UI", Arial, Helvetica, sans-serif' }}>
          
          <div className="p-3 bg-white rounded-lg shadow-sm" style={{ border: '1px solid #E0E0E0', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#666666', marginBottom: '4px' }}>
              Test Solutions
            </div>
            <div 
              onClick={() => router.push(`/results/${attemptId}`)}
              style={{ fontSize: '11px', color: '#1E88E5', cursor: 'pointer' }}
            >
              View Analysis
            </div>
          </div>

          {/* Legend */}
          <div className="mb-4">
            <div className="flex" style={{ gap: '12px', marginBottom: '6px' }}>
              <div className="flex items-center" style={{ gap: '6px' }}>
                <div 
                  className="flex items-center justify-center text-white font-bold"
                  style={{ 
                    width: '26px', 
                    height: '26px',
                    backgroundColor: '#3CB44B',
                    fontSize: '12px',
                    fontWeight: '700',
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)',
                    borderRadius: '4px 4px 0 0'
                  }}
                >
                  {correctCount}
                </div>
                <span style={{ fontSize: '11px', color: '#333333', fontWeight: '500' }}>Correct</span>
              </div>

              <div className="flex items-center" style={{ gap: '6px' }}>
                <div 
                  className="flex items-center justify-center text-white font-bold"
                  style={{ 
                    width: '26px', 
                    height: '26px',
                    backgroundColor: '#E4572E',
                    fontSize: '12px',
                    fontWeight: '700',
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)',
                    borderRadius: '4px 4px 0 0'
                  }}
                >
                  {incorrectCount}
                </div>
                <span style={{ fontSize: '11px', color: '#333333', fontWeight: '500' }}>Incorrect</span>
              </div>
            </div>

            <div className="flex" style={{ gap: '12px', marginBottom: '6px' }}>
              <div className="flex items-center" style={{ gap: '6px' }}>
                <div 
                  className="flex items-center justify-center font-bold"
                  style={{ 
                    width: '26px', 
                    height: '26px',
                    backgroundColor: '#F2F2F2',
                    color: '#4A4A4A',
                    fontSize: '12px',
                    fontWeight: '700',
                    borderRadius: '4px',
                    border: '1px solid #BDBDBD'
                  }}
                >
                  {notAttemptedCount}
                </div>
                <span style={{ fontSize: '11px', color: '#333333', fontWeight: '500' }}>Not Attempted</span>
              </div>

              <div className="flex items-center" style={{ gap: '6px' }}>
                <div 
                  className="flex items-center justify-center text-white font-bold"
                  style={{ 
                    width: '26px', 
                    height: '26px',
                    backgroundColor: '#5A2CA0',
                    fontSize: '12px',
                    fontWeight: '700',
                    borderRadius: '50%'
                  }}
                >
                  {markedOnlyCount}
                </div>
                <span style={{ fontSize: '11px', color: '#333333', fontWeight: '500' }}>Marked for Review</span>
              </div>
            </div>

            <div className="flex" style={{ gap: '12px', marginBottom: '6px' }}>
              <div className="flex items-center" style={{ gap: '6px' }}>
                <div 
                  className="relative flex items-center justify-center text-white font-bold"
                  style={{ 
                    width: '26px', 
                    height: '26px',
                    backgroundColor: '#5A2CA0',
                    fontSize: '12px',
                    fontWeight: '700',
                    borderRadius: '50%'
                  }}
                >
                  {correctMarkedCount}
                  <div 
                    className="absolute flex items-center justify-center rounded-full"
                    style={{
                      width: '10px',
                      height: '10px',
                      backgroundColor: '#00C853',
                      bottom: '1px',
                      right: '1px',
                      fontSize: '7px',
                      fontWeight: 'bold',
                      color: 'white'
                    }}
                  >
                    ✓
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: '#333333', fontWeight: '500', lineHeight: '1.3' }}>
                  Correct & Marked
                </div>
              </div>

              <div className="flex items-center" style={{ gap: '6px' }}>
                <div 
                  className="relative flex items-center justify-center text-white font-bold"
                  style={{ 
                    width: '26px', 
                    height: '26px',
                    backgroundColor: '#5A2CA0',
                    fontSize: '12px',
                    fontWeight: '700',
                    borderRadius: '50%'
                  }}
                >
                  {incorrectMarkedCount}
                  <div 
                    className="absolute flex items-center justify-center rounded-full"
                    style={{
                      width: '10px',
                      height: '10px',
                      backgroundColor: '#DC2626',
                      bottom: '1px',
                      right: '1px',
                      fontSize: '7px',
                      fontWeight: 'bold',
                      color: 'white'
                    }}
                  >
                    ✗
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: '#333333', fontWeight: '500', lineHeight: '1.3' }}>
                  Incorrect & Marked</div>
              </div>
            </div>
          </div>
<div 
  className="text-white font-bold"
  style={{ 
    backgroundColor: '#5B86C5',
    fontSize: '15px',
    fontWeight: '700',
    padding: '10px 12px',
    marginBottom: '8px',
    height: '36px',
    display: 'flex',
    alignItems: 'center'
  }}
>
  {showAllQuestions 
    ? 'All Questions' 
    : (sections.find(s => s.id === activeSection)?.section_name || activeSection || 'Questions')}
</div>

          <div 
            style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: '#222222',
              marginBottom: '8px'
            }}
          >
            Choose a Question
          </div>

          {/* Question Palette Grid */}
          <div className="grid grid-cols-4" style={{ gap: '8px 8px', marginBottom: '16px' }}>
            {getCurrentSectionQuestions.map((question, sectionIndex) => {
              const globalIndex = questions.findIndex(q => q.id === question.id);
              const status = getQuestionStatus(question);
              const isCurrentQuestion = currentQuestionIndex === globalIndex;

              let bgColor = '#F2F2F2';
              let textColor = '#4A4A4A';
              let useShield = false;
              let showBadge = null;
              let shapeStyle = {};
              
              if (status === 'correct') {
                bgColor = '#3CB44B';
                textColor = '#FFFFFF';
                useShield = true;
              } else if (status === 'incorrect') {
                bgColor = '#E4572E';
                textColor = '#FFFFFF';
                useShield = true;
              } else if (status === 'correct-marked') {
                bgColor = '#5A2CA0';
                textColor = '#FFFFFF';
                useShield = false;
                showBadge = 'correct';
                shapeStyle = { borderRadius: '50%' };
              } else if (status === 'incorrect-marked') {
                bgColor = '#5A2CA0';
                textColor = '#FFFFFF';
                useShield = false;
                showBadge = 'incorrect';
                shapeStyle = { borderRadius: '50%' };
              } else if (status === 'marked') {
                bgColor = '#5A2CA0';
                textColor = '#FFFFFF';
                useShield = false;
                shapeStyle = { borderRadius: '50%' };
              } else if (status === 'not-attempted') {
                bgColor = '#F2F2F2';
                textColor = '#4A4A4A';
                useShield = false;
                shapeStyle = { borderRadius: '6px' };
              }

              const displayNumber = showAllQuestions ? globalIndex + 1 : sectionIndex + 1;

              return (
                <button
                  key={question.id}
                  onClick={() => handleQuestionClick(globalIndex)}
                  className={`relative flex items-center justify-center font-bold transition-all hover:opacity-90 ${
                    isCurrentQuestion ? 'ring-2 ring-offset-1 ring-blue-500' : ''
                  }`}
                  style={{
                    width: '52px',
                    height: '52px',
                    fontSize: '16px',
                    fontWeight: '700',
                    backgroundColor: bgColor,
                    color: textColor,
                    border: '1px solid #BDBDBD',
                    clipPath: useShield ? 'polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)' : 'none',
                    ...shapeStyle
                  }}
                >
                  {displayNumber}
                  {showBadge && (
                    <div 
                      className="absolute flex items-center justify-center rounded-full"
                      style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: showBadge === 'correct' ? '#00C853' : '#DC2626',
                        bottom: '4px',
                        right: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: 'white'
                      }}
                    >
                      {showBadge === 'correct' ? '✓' : '✗'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button 
              onClick={() => {
                const palette = document.querySelector('[style*="width: 300px"]');
                if (palette) palette.scrollTop = 0;
              }}
              className="flex items-center justify-center text-white rounded-full transition-all shadow-md hover:opacity-90"
              style={{ 
                width: '40px', 
                height: '40px',
                backgroundColor: '#5B86C5'
              }}
            >
              <ChevronUp size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}