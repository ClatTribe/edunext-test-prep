'use client';

import MathRenderer from '@/app/components/MathRenderer';
import { useState, useEffect, useRef, memo, useMemo,useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChevronUp, Info } from 'lucide-react';

const TimerDisplay = memo(({ initialTime, onTimeUp }) => {
  const [seconds, setSeconds] = useState(initialTime);
  const timerRef = useRef(null);

  useEffect(() => {
    setSeconds(initialTime);
  }, [initialTime]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          onTimeUp(); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onTimeUp]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return <span>{formatTime(seconds)}</span>;
});

export default function ExamInterface() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const testId = params?.testId;
  const testType = searchParams.get('type');

  const [testConfig, setTestConfig] = useState(null);
  const [sections, setSections] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const [sessionId, setSessionId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [visited, setVisited] = useState({});
  
  const [seconds, setSeconds] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [language, setLanguage] = useState('English');
  const [numericalInput, setNumericalInput] = useState('');
  
  const timerRef = useRef(null);
  const isMountedRef = useRef(true);

  const [questions, setQuestions] = useState([]);
  
  
  const activeSection = useMemo(() => {
    if (sections.length === 0 || !questions[currentQuestionIndex]) return 0;
    
    const currentQuestion = questions[currentQuestionIndex];
    
    const sectionIndex = sections.findIndex(s => {
      // ✅ Contest mode: Match by contest_section_id (UUID)
      if (s.id && typeof s.id === 'string' && s.id.includes('-')) {
        return s.id === currentQuestion.contest_section_id;
      }
      // ✅ Practice mode: Match by subject name
      else {
        return s.id === currentQuestion.subject;
      }
    });
    
    return sectionIndex !== -1 ? sectionIndex : 0;
  }, [sections, questions, currentQuestionIndex]);

  const [currentUserId, setCurrentUserId] = useState(null);

useEffect(() => {
  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log("Current User ID Found:", user.id)
      setCurrentUserId(user.id);
    }
  };
  fetchUser();
}, []);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (testId && !isInitialized) {
      initializeTest();
    }
    
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testId]);

  // useEffect(() => {
  //   if (!totalTime || seconds <= 0 || !isInitialized) return;
    
  //   if (timerRef.current) clearInterval(timerRef.current);
    
  //   timerRef.current = setInterval(() => {
  //     setSeconds((prev) => {
  //       if (prev <= 1) {
  //         clearInterval(timerRef.current);
  //         if (isMountedRef.current) {
  //           handleSubmitTest();
  //           return 0;
  //         }
  //       }
  //       return prev - 1;
  //     });
  //   }, 1000);

  //   return () => {
  //     if (timerRef.current) clearInterval(timerRef.current);
  //   };
  // }, [totalTime, isInitialized]);

  useEffect(() => {
    if (!isMountedRef.current || !isInitialized) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion?.question_type === 'numerical') {
      setNumericalInput(answers[currentQuestion.id] || '');
    }
  }, [currentQuestionIndex, isInitialized]);

  const initializeTest = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
    // router.push('/');
    return;
   }
  setCurrentUserId(user.id);
    try {
      setLoading(true);

      let config;
      let questionsData;
      let isContest = false;

      if (testType === 'contest') {
        isContest = true;
      } else if (testType === 'practice') {
        isContest = false;
      } else {
        const { data: contestData } = await supabase
          .from('contests')
          .select('*')
          .eq('id', testId)
          .maybeSingle();

        if (contestData) {
          isContest = true;
        }
      }

      if (isContest) {
        const { data, error } = await supabase
          .from('contests')
          .select('*')
          .eq('id', testId)
          .single();

        if (error) throw error;
        config = data;

        const { data: qData, error: qError } = await supabase
          .from('questions')
          .select('*')
          .eq('contest_id', testId);

        if (qError) throw qError;
        questionsData = qData;

      } else {
        const { data, error } = await supabase
          .from('practice_tests')
          .select('*')
          .eq('id', testId)
          .single();

        if (error) throw error;
        config = data;

        const { data: qData, error: qError } = await supabase
          .from('questions')
          .select('*')
          .in('id', config.question_ids || []);

        if (qError) throw qError;
        questionsData = qData;
      }

      if (!isMountedRef.current) return;
      setTestConfig(config);

      if (config.duration_minutes && isMountedRef.current) {
        const timeInSeconds = config.duration_minutes * 60;
        setTotalTime(timeInSeconds);
        setSeconds(timeInSeconds);
      }

      const sectionsExist = questionsData.some(q => q.contest_section_id);

      let sortedQuestions = questionsData;

      if (sectionsExist && isContest) {
        const sectionMap = {};
        
        for (const q of questionsData) {
          const sectionId = q.contest_section_id;
          
          if (sectionId && !sectionMap[sectionId]) {
            const { data: sectionData } = await supabase
              .from('contest_sections')
              .select('*')
              .eq('id', sectionId)
              .single();
            
            if (sectionData) {
              sectionMap[sectionId] = {
                ...sectionData,
                questions: []
              };
            }
          }
          
          if (sectionId && sectionMap[sectionId]) {
            sectionMap[sectionId].questions.push(q);
          }
        }

        const sectionsArray = Object.values(sectionMap).sort((a, b) => {
          return (a.section_order || 0) - (b.section_order || 0);
        });

        sortedQuestions = [];
        sectionsArray.forEach(section => {
          sortedQuestions.push(...section.questions);
        });

        if (isMountedRef.current) {
          setSections(sectionsArray);
          setQuestions(sortedQuestions);
        }
      } else {
        if (isMountedRef.current) {
          const subjectMap = {};
          
          questionsData.forEach((q, index) => {
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
          
          setSections(subjectSections);
          setQuestions(sortedQuestions);
        }
      }

      if (sortedQuestions.length > 0 && isMountedRef.current) {
        setVisited({ [sortedQuestions[0].id]: true });
      }

      const { data: session, error: sessionError } = await supabase
        .from('test_sessions')
        .insert({
          test_id: testId,
          start_time: new Date().toISOString()
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      setSessionId(session.id);

      if (sortedQuestions.length > 0 && isMountedRef.current) {
        await createNewVisitEntry(sortedQuestions[0].id,user.id);
      }

      if (isMountedRef.current) {
        setLoading(false);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Error initializing test:', error);
      if (isMountedRef.current) {
        alert('Error loading test: ' + error.message);
        router.push('/practice');
      }
    }
  };

  const createNewVisitEntry = async (questionId,currentUserId) => {
    if (!sessionId || !isMountedRef.current) return;

    try {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      const elapsedSeconds = totalTime - seconds;
      const entryMinutes = parseFloat((elapsedSeconds / 60).toFixed(2));

      const { data: existingResponses } = await supabase
        .from('user_responses')
        .select('*')
        .eq('session_id', sessionId)
        .eq('question_id', questionId)
        .order('visit_number', { ascending: false });

      const totalVisits = existingResponses?.length || 0;
      const newVisitNumber = totalVisits + 1;
      
      if (totalVisits > 0 && !existingResponses[0].exit_timestamp) {
        return;
      }

      let visitPurpose = 'first_attempt';
      if (totalVisits > 0) {
        visitPurpose = markedForReview[questionId] ? 'review' : 'quick_check';
      }

      if (!isMountedRef.current) return;

      await supabase
        .from('user_responses')
        .insert({
          session_id: sessionId,
          question_id: questionId,
          visit_number: newVisitNumber,
          total_visits: newVisitNumber,
          entry_timestamp: new Date().toISOString(),
          entry_test_time_minutes: entryMinutes,
          first_visit_at: totalVisits === 0 ? new Date().toISOString() : existingResponses[0].first_visit_at,
          visit_purpose: visitPurpose,
          section_id: question.contest_section_id,
          subject_name: question.subject,
          difficulty: question.difficulty,
          question_type: question.question_type,
          positive_marks: question.positive_marks,
          negative_marks: question.negative_marks,
          user_id: currentUserId
        });
    } catch (error) {
      console.error('Error creating visit entry:', error);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentSectionQuestions = useMemo(() => {
    if (sections.length === 0) {
      return questions;
    }
    
    if (!sections[activeSection]) return [];
    
    const currentSection = sections[activeSection];
    
    // ✅ Contest mode: Match by contest_section_id (UUID string)
    if (currentSection.id && typeof currentSection.id === 'string' && currentSection.id.includes('-')) {
      return questions.filter(q => q.contest_section_id === currentSection.id);
    }
    
    // ✅ Practice mode: Match by subject
    return questions.filter(q => q.subject === currentSection.id);
  }, [sections, activeSection, questions]);

  const currentQuestion = questions[currentQuestionIndex];

  const getQuestionStatus = (question) => {
    const questionId = question.id;
    const isAnswered = answers[questionId] !== undefined && answers[questionId] !== '';
    const isMarked = markedForReview[questionId];
    const isVisited = visited[questionId];

    if (isAnswered && isMarked) return 'answered-marked';
    if (isAnswered) return 'answered';
    if (isMarked) return 'marked';
    if (isVisited && !isAnswered) return 'not-answered';
    return 'not-visited';
  };

  const handleAnswerSelect = async (optionLabel) => {
    if (!currentQuestion || !sessionId) return;

    const previousAnswer = answers[currentQuestion.id];
    const answerChanged = previousAnswer && previousAnswer !== optionLabel;

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionLabel
    }));

    try {
      const { data: options } = await supabase
        .from('question_options')
        .select('*')
        .eq('question_id', currentQuestion.id);

      const selectedOption = options?.find(o => o.option_label === optionLabel);
      const correctOptions = options?.filter(o => o.is_correct);
      const isCorrect = selectedOption && correctOptions?.some(o => o.id === selectedOption.id);

      const elapsedSeconds = totalTime - seconds;
      const elapsedMinutes = parseFloat((elapsedSeconds / 60).toFixed(2));

      const { data: existingResponses } = await supabase
        .from('user_responses')
        .select('*')
        .eq('session_id', sessionId)
        .eq('question_id', currentQuestion.id)
        .order('visit_number', { ascending: false });

      const latestResponse = existingResponses?.[0];
      const currentVisitNumber = latestResponse ? latestResponse.visit_number : 1;
      const totalVisits = existingResponses?.length || 0;

      const posMarks = currentQuestion.positive_marks;
      const negMarks = currentQuestion.negative_marks;

      const responseData = {
        session_id: sessionId,
        question_id: currentQuestion.id,
        visit_number: currentVisitNumber,
        total_visits: totalVisits,
        
        selected_option_id: selectedOption?.id,
        selected_option_label: optionLabel,
        
        final_selected_option_id: selectedOption?.id,
        final_selected_option_label: optionLabel,
        
        is_attempted: true,
        is_answered: true,
        is_correct: isCorrect,
        is_marked_for_review: markedForReview[currentQuestion.id] || false,
        
        answer_change_count: answerChanged ? (latestResponse?.answer_change_count || 0) + 1 : (latestResponse?.answer_change_count || 0),
        answer_changed_in_this_visit: answerChanged,
        
        entry_test_time_minutes: elapsedMinutes,
        
        section_id: currentQuestion.contest_section_id,
        subject_name: currentQuestion.subject,
        
        positive_marks: posMarks,
        negative_marks: negMarks,
        marks_obtained: isCorrect ? posMarks : -negMarks,
        
        last_action_type: answerChanged ? 'change_answer' : 'select_option',
        last_action_timestamp: new Date().toISOString(),
        last_action_old_value: previousAnswer || null,
        last_action_new_value: optionLabel,
        
        difficulty: currentQuestion.difficulty,
        question_type: currentQuestion.question_type,
        
        updated_at: new Date().toISOString()
      };

      if (latestResponse) {
        await supabase
          .from('user_responses')
          .update(responseData)
          .eq('id', latestResponse.id);
      } else {
        responseData.user_id = currentUserId;
        responseData.entry_timestamp = new Date().toISOString();
        responseData.first_visit_at = new Date().toISOString();
        await supabase
          .from('user_responses')
          .insert(responseData);
      }

    } catch (error) {
      console.error('Error saving response:', error);
    }
  };

  const handleNumericalSave = async () => {
    if (!currentQuestion || currentQuestion.question_type !== 'numerical' || !sessionId) return;

    const previousAnswer = answers[currentQuestion.id];
    const answerChanged = previousAnswer && previousAnswer !== numericalInput;

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: numericalInput
    }));

    try {
      const elapsedSeconds = totalTime - seconds;
      const elapsedMinutes = parseFloat((elapsedSeconds / 60).toFixed(2));

      const { data: options } = await supabase
        .from('question_options')
        .select('*')
        .eq('question_id', currentQuestion.id)
        .eq('is_correct', true)
        .maybeSingle();

      const correctAnswer = options?.option_text;
      const isCorrect = numericalInput && correctAnswer && 
                  Math.abs(parseFloat(numericalInput) - parseFloat(correctAnswer)) < 0.01;

      const { data: existingResponses } = await supabase
        .from('user_responses')
        .select('*')
        .eq('session_id', sessionId)
        .eq('question_id', currentQuestion.id)
        .order('visit_number', { ascending: false });

      const latestResponse = existingResponses?.[0];
      const currentVisitNumber = latestResponse ? latestResponse.visit_number : 1;
      const totalVisits = existingResponses?.length || 0;

      const posMarks = currentQuestion.positive_marks;
      const negMarks = currentQuestion.negative_marks;

      const responseData = {
        session_id: sessionId,
        question_id: currentQuestion.id,
        visit_number: currentVisitNumber,
        total_visits: totalVisits,
        numerical_answer: numericalInput,
        final_numerical_answer: numericalInput,
        is_attempted: true,
        is_answered: !!numericalInput,
        is_correct: isCorrect,
        is_marked_for_review: markedForReview[currentQuestion.id] || false,
        answer_change_count: answerChanged ? (latestResponse?.answer_change_count || 0) + 1 : (latestResponse?.answer_change_count || 0),
        answer_changed_in_this_visit: answerChanged,
        entry_test_time_minutes: elapsedMinutes,
        section_id: currentQuestion.contest_section_id,
        subject_name: currentQuestion.subject,
        
        positive_marks: posMarks,
        negative_marks: negMarks,
        marks_obtained: isCorrect ? posMarks : (numericalInput && numericalInput.trim() !== '' ? -negMarks : 0),
        
        last_action_type: 'save_numerical',
        last_action_timestamp: new Date().toISOString(),
        last_action_old_value: previousAnswer || null,
        last_action_new_value: numericalInput,
        difficulty: currentQuestion.difficulty,
        question_type: currentQuestion.question_type,
        updated_at: new Date().toISOString()
      };

      if (latestResponse) {
        await supabase
          .from('user_responses')
          .update(responseData)
          .eq('id', latestResponse.id);
      } else {
        responseData.user_id = currentUserId;
        responseData.entry_timestamp = new Date().toISOString();
        responseData.first_visit_at = new Date().toISOString();
        await supabase
          .from('user_responses')
          .insert(responseData);
      }
    } catch (error) {
      console.error('Error saving numerical answer:', error);
    }
  };

  const handleSaveAndNext = async () => {
    if (currentQuestion && currentQuestion.question_type === 'numerical') {
      await handleNumericalSave();
    }
  
    try {
      const { data: existingResponses } = await supabase
        .from('user_responses')
        .select('*')
        .eq('session_id', sessionId)
        .eq('question_id', currentQuestion.id)
        .order('visit_number', { ascending: false });
  
      const latestResponse = existingResponses?.[0];
      
      if (latestResponse && !latestResponse.exit_timestamp) {
        const now = new Date().toISOString();
        const elapsedSeconds = totalTime - seconds;
        const exitMinutes = parseFloat((elapsedSeconds / 60).toFixed(2));
        
        const entryTime = new Date(latestResponse.entry_timestamp).getTime();
        const exitTime = new Date(now).getTime();
        const timeSpentSeconds = Math.floor((exitTime - entryTime) / 1000);
  
        await supabase
          .from('user_responses')
          .update({
            exit_timestamp: now,
            exit_test_time_minutes: exitMinutes,
            time_spent_seconds: timeSpentSeconds,
            last_visit_at: now,
            updated_at: now
          })
          .eq('id', latestResponse.id);
      }
    } catch (error) {
      console.error('Error updating exit timestamp:', error);
    }
  
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setVisited(prev => ({ ...prev, [questions[nextIndex].id]: true }));
      await createNewVisitEntry(questions[nextIndex].id,currentUserId);
    }
  };

  const handleClearResponse = async () => {
    if (!currentQuestion || !sessionId) return;

    const previousAnswer = answers[currentQuestion.id];
    
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion.id];
      return newAnswers;
    });
    
    if (currentQuestion.question_type === 'numerical') {
      setNumericalInput('');
    }

    try {
      const elapsedSeconds = totalTime - seconds;
      const elapsedMinutes = parseFloat((elapsedSeconds / 60).toFixed(2));

      const { data: existingResponses } = await supabase
        .from('user_responses')
        .select('*')
        .eq('session_id', sessionId)
        .eq('question_id', currentQuestion.id)
        .order('visit_number', { ascending: false });

      const latestResponse = existingResponses?.[0];

      if (latestResponse) {
        await supabase
          .from('user_responses')
          .update({
            selected_option_id: null,
            selected_option_label: null,
            numerical_answer: null,
            final_selected_option_id: null,
            final_selected_option_label: null,
            final_numerical_answer: null,
            is_answered: false,
            is_attempted: false,
            is_correct: null,
            marks_obtained: 0,
            last_action_type: 'clear_response',
            last_action_timestamp: new Date().toISOString(),
            last_action_old_value: previousAnswer || null,
            last_action_new_value: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', latestResponse.id);
      }
    } catch (error) {
      console.error('Error clearing response:', error);
    }
  };

  const handleMarkForReview = async () => {
    if (!currentQuestion || !sessionId) return;

    if (currentQuestion.question_type === 'numerical' && numericalInput) {
      await handleNumericalSave();
    }

    const newMarkedState = !markedForReview[currentQuestion.id];
    
    setMarkedForReview(prev => ({
      ...prev,
      [currentQuestion.id]: newMarkedState
    }));

    try {
      const elapsedSeconds = totalTime - seconds;
      const elapsedMinutes = parseFloat((elapsedSeconds / 60).toFixed(2));

      const { data: existingResponses } = await supabase
        .from('user_responses')
        .select('*')
        .eq('session_id', sessionId)
        .eq('question_id', currentQuestion.id)
        .order('visit_number', { ascending: false });

      const latestResponse = existingResponses?.[0];
      const isAnswered = answers[currentQuestion.id] !== undefined && answers[currentQuestion.id] !== '';

      const updateData = {
        is_marked_for_review: newMarkedState,
        is_answered_and_marked: isAnswered && newMarkedState,
        last_action_type: newMarkedState ? 'mark_review' : 'unmark_review',
        last_action_timestamp: new Date().toISOString(),
        last_action_old_value: markedForReview[currentQuestion.id] ? 'marked' : 'unmarked',
        last_action_new_value: newMarkedState ? 'marked' : 'unmarked',
        updated_at: new Date().toISOString()
      };

      if (latestResponse) {
        await supabase
          .from('user_responses')
          .update(updateData)
          .eq('id', latestResponse.id);
      } else {
        await supabase
          .from('user_responses')
          .insert({
            user_id: currentUserId,
            session_id: sessionId,
            question_id: currentQuestion.id,
            visit_number: 1,
            total_visits: 1,
            entry_timestamp: new Date().toISOString(),
            first_visit_at: new Date().toISOString(),
            entry_test_time_minutes: elapsedMinutes,
            section_id: currentQuestion.contest_section_id,
            subject_name: currentQuestion.subject,
            difficulty: currentQuestion.difficulty,
            question_type: currentQuestion.question_type,
            positive_marks: currentQuestion.positive_marks,
            negative_marks: currentQuestion.negative_marks,
            ...updateData
          });
      }
    } catch (error) {
      console.error('Error marking for review:', error);
    }

    handleSaveAndNext();
  };

  const handleQuestionClick = async (globalIndex) => {
    if (currentQuestion && currentQuestion.question_type === 'numerical') {
      await handleNumericalSave();
    }
    
    try {
      const { data: existingResponses } = await supabase
        .from('user_responses')
        .select('*')
        .eq('session_id', sessionId)
        .eq('question_id', currentQuestion.id)
        .order('visit_number', { ascending: false });
  
      const latestResponse = existingResponses?.[0];
      
      if (latestResponse && !latestResponse.exit_timestamp) {
        const now = new Date().toISOString();
        const elapsedSeconds = totalTime - seconds;
        const exitMinutes = parseFloat((elapsedSeconds / 60).toFixed(2));
        
        const entryTime = new Date(latestResponse.entry_timestamp).getTime();
        const exitTime = new Date(now).getTime();
        const timeSpentSeconds = Math.floor((exitTime - entryTime) / 1000);
  
        await supabase
          .from('user_responses')
          .update({
            exit_timestamp: now,
            exit_test_time_minutes: exitMinutes,
            time_spent_seconds: timeSpentSeconds,
            last_visit_at: now,
            updated_at: now
          })
          .eq('id', latestResponse.id);
      }
    } catch (error) {
      console.error('Error updating exit timestamp:', error);
    }
    
    setCurrentQuestionIndex(globalIndex);
    setVisited(prev => ({ ...prev, [questions[globalIndex].id]: true }));
    
    await createNewVisitEntry(questions[globalIndex].id,currentUserId);
  };

  const handleSectionChange = async (sectionIndex) => {
    console.log('🎯 handleSectionChange called with index:', sectionIndex);
    console.log('🎯 Selected section:', sections[sectionIndex]);
    
    // ✅ Check if currentQuestion exists
    if (currentQuestion && currentQuestion.question_type === 'numerical') {
      await handleNumericalSave();
    }
    
    // ✅ Only update exit timestamp if sessionId and currentQuestion exist
    if (sessionId && currentQuestion) {
      try {
        const { data: existingResponses } = await supabase
          .from('user_responses')
          .select('*')
          .eq('session_id', sessionId)
          .eq('question_id', currentQuestion.id)
          .order('visit_number', { ascending: false });
    
        const latestResponse = existingResponses?.[0];
        
        if (latestResponse && !latestResponse.exit_timestamp) {
          const now = new Date().toISOString();
          const elapsedSeconds = totalTime - seconds;
          const exitMinutes = parseFloat((elapsedSeconds / 60).toFixed(2));
          
          const entryTime = new Date(latestResponse.entry_timestamp).getTime();
          const exitTime = new Date(now).getTime();
          const timeSpentSeconds = Math.floor((exitTime - entryTime) / 1000);
    
          await supabase
            .from('user_responses')
            .update({
              exit_timestamp: now,
              exit_test_time_minutes: exitMinutes,
              time_spent_seconds: timeSpentSeconds,
              last_visit_at: now,
              updated_at: now
            })
            .eq('id', latestResponse.id);
        }
      } catch (error) {
        console.error('Error updating exit timestamp:', error);
      }
    }
    
    const selectedSection = sections[sectionIndex];
    if (!selectedSection) {
      console.error('Selected section not found!');
      return;
    }
    
    console.log('🎯 Finding first question of section:', selectedSection);
    
    let firstQuestionOfSection;
    
    // ✅ FIX: Check for both contest mode (UUID) and practice mode (subject)
    if (selectedSection.id && typeof selectedSection.id === 'string' && selectedSection.id.includes('-')) {
      // Contest mode: Match by contest_section_id
      firstQuestionOfSection = questions.find(q => q.contest_section_id === selectedSection.id);
    } else {
      // Practice mode: Match by subject
      firstQuestionOfSection = questions.find(q => q.subject === selectedSection.id);
    }
    
    console.log('🎯 First question found:', firstQuestionOfSection);
    
    if (firstQuestionOfSection) {
      const newIndex = questions.findIndex(q => q.id === firstQuestionOfSection.id);
      
      console.log('🎯 New question index:', newIndex);
      
      if (newIndex !== -1) {
        setCurrentQuestionIndex(newIndex);
        setVisited(prev => ({ ...prev, [questions[newIndex].id]: true }));
        
        if (sessionId) {
          await createNewVisitEntry(questions[newIndex].id);
        }
      }
    } else {
      console.error('First question of section not found!');
    }
  };


  const handleSubmitTest = useCallback(async () => {
    const confirmSubmit = window.confirm('Are you sure you want to submit the test?');
    if (!confirmSubmit) return;

    setSubmitting(true);
    try {
      console.log('📤 Starting test submission...');
      console.log('📤 Session ID:', sessionId);
      console.log('📤 Test ID:', testId);

      if (!sessionId || !testId) {
        throw new Error('Session ID or Test ID is missing.');
      }

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select(`
          id,
          positive_marks,
          negative_marks,
          question_type,
          numerical_answer
        `)
        .in('id', questions.map(q => q.id));

      if (questionsError) throw questionsError;

      console.log('📋 Questions fetched:', questionsData.length);

      const { data: allOptions, error: optionsError } = await supabase
        .from('question_options')
        .select('question_id, option_label, is_correct')
        .in('question_id', questions.map(q => q.id));

      if (optionsError) throw optionsError;

      const correctAnswersMap = {};
      
      allOptions.forEach(opt => {
        if (opt.is_correct) {
          if (!correctAnswersMap[opt.question_id]) {
            correctAnswersMap[opt.question_id] = [];
          }
          correctAnswersMap[opt.question_id].push(opt.option_label);
        }
      });

      console.log('✅ MCQ correct answers mapped');

      const { data: allResponses, error: fetchError } = await supabase
        .from('user_responses')
        .select('*')
        .eq('session_id', sessionId);

      if (fetchError) throw fetchError;

      console.log('📦 User responses fetched:', allResponses?.length || 0);

      const latestResponsesMap = {};
      allResponses?.forEach(response => {
        const qId = response.question_id;
        if (!latestResponsesMap[qId] || response.visit_number > latestResponsesMap[qId].visit_number) {
          latestResponsesMap[qId] = response;
        }
      });

      let correct = 0;
      let incorrect = 0;
      let answered = 0;
      let totalMarks = 0;
      let obtainedMarks = 0;

      questionsData.forEach(q => {
        totalMarks += q.positive_marks || 0;
      });

      for (const questionData of questionsData) {
        const qId = questionData.id;
        const userResponse = latestResponsesMap[qId];
        
        const posMarks = questionData.positive_marks || 0;
        const negMarks = questionData.negative_marks || 0;

        if (userResponse && userResponse.is_answered) {
          answered++;

          let isCorrect = false;

          if (questionData.question_type === 'numerical') {
            const userAns = userResponse.numerical_answer;
            const correctAns = questionData.numerical_answer;
            
            console.log(`🔢 Numerical Q${qId}:`, {
              userAnswer: userAns,
              correctAnswer: correctAns,
              userType: typeof userAns,
              correctType: typeof correctAns
            });
            
            if (correctAns && userAns) {
              const correctNum = parseFloat(correctAns);
              const userNum = parseFloat(userAns);
              
              if (!isNaN(correctNum) && !isNaN(userNum)) {
                isCorrect = Math.abs(correctNum - userNum) < 0.01;
                console.log(`✅ Comparison: |${correctNum} - ${userNum}| = ${Math.abs(correctNum - userNum)} < 0.01? ${isCorrect}`);
              }
            }
          } else {
            const correctOptions = correctAnswersMap[qId] || [];
            const selectedLabel = userResponse.selected_option_label;
            isCorrect = correctOptions.includes(selectedLabel);
            
            console.log(`📝 MCQ Q${qId}:`, {
              selected: selectedLabel,
              correct: correctOptions,
              isCorrect
            });
          }

          if (isCorrect) {
            correct++;
            obtainedMarks += posMarks;
          } else {
            incorrect++;
            obtainedMarks -= negMarks;
          }

          console.log(`📊 Q${qId} Result:`, {
            isCorrect,
            posMarks,
            negMarks,
            marksChange: isCorrect ? `+${posMarks}` : `-${negMarks}`,
            obtainedMarks
          });

          await supabase
            .from('user_responses')
            .update({
              is_correct: isCorrect,
              marks_obtained: isCorrect ? posMarks : -negMarks
            })
            .eq('id', userResponse.id);
        }
      }

      const unattempted = questionsData.length - answered;
      const totalTimeSpent = totalTime > 0 ? (totalTime - seconds) / 60 : 0;
      const markedCount = Object.values(markedForReview).filter(Boolean).length;
      const calculatedAccuracy = answered > 0 ? (correct / answered * 100) : 0;

      console.log('📊 FINAL STATISTICS:', {
        totalQuestions: questionsData.length,
        correct,
        incorrect,
        unattempted,
        answered,
        markedCount,
        totalMarks,
        obtainedMarks,
        accuracy: calculatedAccuracy.toFixed(2),
        timeSpent: Math.floor(totalTimeSpent)
      });

      const { error: sessionUpdateError } = await supabase
        .from('test_sessions')
        .update({
          end_time: new Date().toISOString(),
          total_time_seconds: Math.floor(totalTimeSpent * 60),
          is_submitted: true
        })
        .eq('id', sessionId);

      if (sessionUpdateError) throw sessionUpdateError;
      console.log('✅ Session updated');

      const now = new Date().toISOString();
      for (const response of Object.values(latestResponsesMap)) {
        if (!response.exit_timestamp) {
          await supabase
            .from('user_responses')
            .update({
              exit_timestamp: now,
              last_visit_at: now
            })
            .eq('id', response.id);
        }
      }
      console.log('✅ Response timestamps updated');

      const attemptPayload = {
        user_id: currentUserId,
        session_id: sessionId,
        test_id: testId,
        test_number: testConfig?.test_number || null,
        test_name: testConfig?.test_name || testConfig?.title || 'Unnamed Test',
        total_questions: questionsData.length,
        correct_answers: correct,
        incorrect_answers: incorrect,
        unattempted: unattempted,
        marked_for_review: markedCount,
        total_marks: totalMarks,
        obtained_marks: obtainedMarks,
        accuracy: calculatedAccuracy,
        time_spent_minutes: Math.floor(totalTimeSpent),
        submitted_at: new Date().toISOString()
      };

      if (!currentUserId) {
        throw new Error('User not authenticated. Please log in and try again.');
      }
      
      console.log('📤 Inserting test attempt with user_id:', currentUserId);
      console.log('📤 Full payload:', attemptPayload);

      console.log('📤 Inserting test attempt:', attemptPayload);

      const { data: attemptData, error: attemptInsertError } = await supabase
        .from('test_attempts')
        .insert(attemptPayload)
        .select()
        .single();

      if (attemptInsertError) {
        console.error('❌ Insert error:', attemptInsertError);
        throw new Error(`Failed to save test results: ${attemptInsertError.message}`);
      }

      if (!attemptData || !attemptData.id) {
        throw new Error('Test submission failed: No data returned.');
      }

      console.log('✅ Test attempt created successfully!');
      console.log('✅ Attempt ID:', attemptData.id);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🚀 Redirecting to results page...');
      router.replace(`/results/${attemptData.id}`);
      
    } catch (error) {
      console.error('💥 SUBMISSION ERROR:', error);
      alert(
        '❌ Error submitting test:\n\n' + 
        error.message + 
        '\n\nYour answers have been saved. Please contact support if this persists.'
      );
    } finally {
      setSubmitting(false);
    }
  });

  // ✅ FIXED: isLastQuestionOfLastSection properly uses getCurrentSectionQuestions
  const isLastQuestionOfLastSection = () => {
    if (sections.length === 0) {
      return currentQuestionIndex === questions.length - 1;
    }
    
    const isLastSection = activeSection === sections.length - 1;
    if (!isLastSection) return false;
    
    const sectionQuestions = getCurrentSectionQuestions;
    const currentQuestionInSection = sectionQuestions.findIndex(q => q.id === currentQuestion?.id);
    const isLastQuestionInSection = currentQuestionInSection === sectionQuestions.length - 1;
    
    return isLastQuestionInSection;
  };

  if (loading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B86C5] mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading test...</div>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).filter(qId => {
    const hasAnswer = answers[qId] !== '' && answers[qId] !== undefined;
    const isMarked = markedForReview[qId];
    return hasAnswer && !isMarked;
  }).length;

  const notAnsweredCount = Object.keys(visited).filter(qId => {
    const hasAnswer = answers[qId] && answers[qId] !== '';
    const isMarked = markedForReview[qId];
    return !hasAnswer && !isMarked;
  }).length;

  const notVisitedCount = questions.length - Object.keys(visited).length;

  const markedOnlyCount = Object.keys(markedForReview).filter(qId => {
    const isMarked = markedForReview[qId];
    const hasAnswer = answers[qId] && answers[qId] !== '';
    return isMarked && !hasAnswer;
  }).length;

  const answeredMarkedCount = Object.keys(answers).filter(qId => {
    const hasAnswer = answers[qId] && answers[qId] !== '';
    const isMarked = markedForReview[qId];
    return hasAnswer && isMarked;
  }).length;

  

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="bg-white border-b border-gray-300 flex items-center px-3 py-0.5 flex-shrink-0">
          <div className="bg-[#5B86C5] text-white px-3 py-1 text-xs font-medium" style={{ borderRadius: '4px 4px 0 0' }}>
            Question Paper(Section Wise)
          </div>
        </div>

        <div className="bg-white border-b border-gray-300 flex items-center justify-between px-3 py-1 flex-shrink-0">
          <div className="flex items-center overflow-x-auto" style={{ gap: '0px' }}>
            <span className="text-xs font-medium text-gray-700 mr-2">Section</span>
            
            {sections.length > 0 ? (
              sections.map((section, index) => (
                <button
                key={section.id}
  onClick={() => {
    console.log('🔘 Section clicked! Index:', index);
    console.log('🔘 Section data:', section);
    handleSectionChange(index);
  }}
  className="flex items-center gap-1 px-3 py-1 text-xs font-semibold transition-all whitespace-nowrap"
  style={{ 
    fontSize: '10px',
    backgroundColor: activeSection === index ? '#5B86C5' : '#EAF1FB',
    color: activeSection === index ? '#FFFFFF' : '#2F6FB2',
    border: activeSection === index ? 'none' : '1px solid #5B86C5',
    borderRadius: '0px'
  }}
>
  {section.section_name.toUpperCase()}
  <Info size={12} className="opacity-70" />
</button>
              ))
            ) : (
              currentQuestion && (
                <div
                  className="flex items-center gap-1 px-3 py-1 text-xs font-semibold"
                  style={{ 
                    fontSize: '10px',
                    backgroundColor: '#5B86C5',
                    color: '#FFFFFF',
                    borderRadius: '0px'
                  }}
                >
                  {currentQuestion.subject?.toUpperCase() || 'SUBJECT'}
                </div>
              )
            )}
          </div>

          <div className="text-xs font-bold flex-shrink-0 ml-4" style={{ color: '#333333' }}>
             Time Left: <TimerDisplay initialTime={totalTime} onTimeUp={handleSubmitTest} /> 
          </div>
        </div>

        <div className="flex items-center justify-end px-5 py-1 text-white flex-shrink-0" style={{ backgroundColor: '#5B86C5' }}>
          <div className="flex items-center gap-2">
            <span className="text-xs">View in:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2 py-0.5 rounded text-xs border-none outline-none cursor-pointer bg-white text-black"
            >
              <option value="English">English</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-white">
          {currentQuestion ? (
            <MathRenderer>
            <div>
              <div className="mb-4">
                <span className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>

              <div 
                className="text-base mb-6 leading-relaxed"
                style={{ fontSize: '14px', color: '#000000', lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{ __html: currentQuestion.question_text || '' }}
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

              {(currentQuestion.question_type === 'mcq' || currentQuestion.question_type === 'multiple_correct') && (
                <QuestionOptions
                  question={currentQuestion}
                  selectedAnswer={answers[currentQuestion.id]}
                  onSelect={handleAnswerSelect}
                />
              )}

              {currentQuestion.question_type === 'numerical' && (
                <NumericalInput
                  value={numericalInput}
                  onChange={setNumericalInput}
                />
              )}
            </div>
            </MathRenderer>
          ) : (
            <div className="text-center text-gray-500 py-12">No questions available</div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 flex-shrink-0">
          <div className="flex gap-2">
            <button
              onClick={handleMarkForReview}
              className="px-3 py-2 bg-white rounded hover:bg-blue-50 font-medium text-xs"
              style={{ border: '2px solid #5B86C5', color: '#5B86C5' }}
            >
              Mark for Review & Next
            </button>
            <button
              onClick={handleClearResponse}
              className="px-3 py-2 bg-white rounded hover:bg-gray-50 font-medium text-xs"
              style={{ border: '2px solid #757575', color: '#757575' }}
            >
              Clear Response
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveAndNext}
              disabled={isLastQuestionOfLastSection()}
              className="px-3 py-2 text-white rounded font-medium disabled:opacity-50 text-xs"
              style={{ backgroundColor: '#2F5FA7' }}
            >
              Save & Next
            </button>
            <button
              onClick={handleSubmitTest}
              disabled={submitting}
              className="px-3 py-2 text-white rounded font-medium disabled:opacity-50 text-xs"
              style={{ backgroundColor: '#2F5FA7' }}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto border-l h-screen" style={{ width: '300px', backgroundColor: '#EAF6FA', borderLeftColor: '#D0D0D0' }}>
        <div style={{ padding: '12px', fontFamily: '"Segoe UI", Arial, Helvetica, sans-serif' }}>
          
          <div className="p-3 bg-white rounded-lg shadow-sm" style={{ border: '1px solid #E0E0E0', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#666666', marginBottom: '4px' }}>
              Your photograph appears here
            </div>
            <div style={{ fontSize: '11px', color: '#1E88E5', cursor: 'pointer' }}>
              Profile
            </div>
          </div>

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
                  {answeredCount}
                </div>
                <span style={{ fontSize: '11px', color: '#333333', fontWeight: '500' }}>Answered</span>
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
                  {notAnsweredCount}
                </div>
                <span style={{ fontSize: '11px', color: '#333333', fontWeight: '500' }}>Not Answered</span>
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
                  {notVisitedCount}
                </div>
                <span style={{ fontSize: '11px', color: '#333333', fontWeight: '500' }}>Not Visited</span>
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
                {answeredMarkedCount}
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
                Answered & Marked for Review
                <div style={{ fontSize: '9px', color: '#666666', fontWeight: '400' }}>
                  (will be considered for evaluation)
                </div>
              </div>
            </div>
          </div>

          {sections.length > 0 ? (
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
              {sections[activeSection]?.section_name || 'Section'}
            </div>
          ) : (
            currentQuestion && (
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
                {currentQuestion.subject || 'Subject'}
              </div>
            )
          )}

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

          {console.log('🔍 Active Section:', activeSection)}
{console.log('🔍 Sections:', sections)}
{console.log('🔍 Current Section Questions:', getCurrentSectionQuestions)}
{console.log('🔍 Total Questions:', questions.length)}
{console.log('🔍 Section[0] details:', sections[0])}
{console.log('🔍 First Question details:', questions[0])}


          {/* ✅ MAIN FIX: Use getCurrentSectionQuestions instead of questions */}
          <div className="grid grid-cols-4" style={{ gap: '8px 8px', marginBottom: '16px' }}>
            {getCurrentSectionQuestions.map((question, sectionIndex) => {
              const globalIndex = questions.findIndex(q => q.id === question.id);
              const status = getQuestionStatus(question);
              const isAnsweredMarked = status === 'answered-marked';
              const isCurrentQuestion = currentQuestionIndex === globalIndex;

              let bgColor = '#F2F2F2';
              let textColor = '#4A4A4A';
              let useShield = false;
              
              if (status === 'answered') {
                bgColor = '#3CB44B';
                textColor = '#FFFFFF';
                useShield = true;
              } else if (status === 'not-answered') {
                bgColor = '#E4572E';
                textColor = '#FFFFFF';
                useShield = true;
              } else if (status === 'marked' || status === 'answered-marked') {
                bgColor = '#5A2CA0';
                textColor = '#FFFFFF';
                useShield = true;
              } else if (status === 'not-visited') {
                bgColor = '#F2F2F2';
                textColor = '#4A4A4A';
                useShield = false;
              }

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
                    borderRadius: '6px',
                    backgroundColor: bgColor,
                    color: textColor,
                    border: '1px solid #BDBDBD',
                    clipPath: useShield ? 'polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)' : 'none'
                  }}
                >
                  {sectionIndex + 1}
                  {isAnsweredMarked && (
                    <div 
                      className="absolute flex items-center justify-center rounded-full"
                      style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#00C853',
                        bottom: '4px',
                        right: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: 'white'
                      }}
                    >
                      ✓
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


// ✅ FIXED: QuestionOptions component with key prop to prevent blink
const QuestionOptions = memo(function QuestionOptions({ question, selectedAnswer, onSelect }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevQuestionIdRef = useRef(null);

  useEffect(() => {
    if (prevQuestionIdRef.current === question.id) {
      return;
    }
    
    prevQuestionIdRef.current = question.id;
    setLoading(true);
    
    const fetchOptions = async () => {
      try {
        const { data } = await supabase
          .from('question_options')
          .select('*')
          .eq('question_id', question.id)
          .order('option_order');
        
        if (data) {
          setOptions(data);
        }
      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setLoading(false);
      }
    };

    if (question?.id) {
      fetchOptions();
    }
  }, [question.id]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
        Loading options...
      </div>
    );
  }

  if (!options.length) {
    return <div className="text-red-500 text-sm py-2">No options available</div>;
  }

  return (
    <MathRenderer>
      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option.id}
            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedAnswer === option.option_label
                ? 'border-[#5B86C5] bg-[#EAF1FB]'
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              checked={selectedAnswer === option.option_label}
              onChange={() => onSelect(option.option_label)}
              className="mt-1 mr-3 w-4 h-4 cursor-pointer"
            />
            <div className="flex-1">
              <span className="font-bold mr-2" style={{ fontSize: '16px' }}>
                {option.option_label}.
              </span>
              
              <span 
                style={{ fontSize: '16px', color: '#000000' }}
                dangerouslySetInnerHTML={{ __html: option.option_text }}
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
          </label>
        ))}
      </div>
    </MathRenderer>
  );
});

const NumericalInput = memo(function NumericalInput({ value, onChange }) {
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium mb-2 text-gray-700">
Enter your numerical answer:
</label>
<input
type="text"
value={value}
onChange={(e) => onChange(e.target.value)}
placeholder="Type your answer"
className="px-4 py-2 border-2 border-gray-300 rounded focus:outline-none"
style={{ fontSize: '14px', width: '250px' }}
onFocus={(e) => e.target.style.borderColor = '#5B86C5'}
onBlur={(e) => e.target.style.borderColor = '#D0D0D0'}
/>
</div>
);
});

