'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Target, Zap, BookOpen, Brain, ChevronRight, PlayCircle, FileText, LayoutGrid, Star, Search, ChevronDown, ChevronUp, Eye } from 'lucide-react';

export default function PracticeConfig({ stats, onBack, onStart, currentUserId }) {
  const router = useRouter();
  const THEME_PRIMARY = "#F59E0B";
  
  // Basic Configuration
  const [testName, setTestName] = useState('');
  const [testNumber, setTestNumber] = useState(1);
  const [numQuestions, setNumQuestions] = useState(30);
  const [duration, setDuration] = useState(60);
  const [questionType, setQuestionType] = useState('mixed');
  const [difficulty, setDifficulty] = useState('mixed');
  
  // Filter Options
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [sources, setSources] = useState([]);
  const [tags, setTags] = useState([]);
  
  // Selected Filters
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedSources, setSelectedSources] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  
  // Search States
  const [subjectSearch, setSubjectSearch] = useState('');
  const [chapterSearch, setChapterSearch] = useState('');
  const [topicSearch, setTopicSearch] = useState('');
  const [sourceSearch, setSourceSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  
  // Progress Stats
  const [studyStreak, setStudyStreak] = useState(0);
  const [questionsSolved, setQuestionsSolved] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [testsTaken, setTestsTaken] = useState(0);
  const [timeSpent, setTimeSpent] = useState('0h');
  const [overallStats, setOverallStats] = useState({ correct: 0, incorrect: 0, unattempted: 0 });
  const [subjectStats, setSubjectStats] = useState([]);
  const [difficultyStats, setDifficultyStats] = useState({
    easy: { solved: 0, correct: 0, incorrect: 0, unattempted: 0 },
    medium: { solved: 0, correct: 0, incorrect: 0, unattempted: 0 },
    hard: { solved: 0, correct: 0, incorrect: 0, unattempted: 0 }
  });
  const [recentTests, setRecentTests] = useState([]);
  
  // UI States
  const [subjectWiseOpen, setSubjectWiseOpen] = useState(false);
  const [difficultyWiseOpen, setDifficultyWiseOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [maxQuestions, setMaxQuestions] = useState(0);

  const isContestEnded = (endTime) => {
    if (!endTime) return true;
    const contestEnd = new Date(endTime);
    const now = new Date();
    return now > contestEnd;
  };

  const getVisibilityFilter = async () => {
    const { data: contests } = await supabase
      .from('contests')
      .select('id, end_time');
    
    const endedContestIds = contests
      ?.filter(c => isContestEnded(c.end_time))
      .map(c => c.id) || [];
    
    return { endedContestIds };
  };

  useEffect(() => {
    fetchSubjects();
    fetchSources();
    fetchTags();
    fetchUserProgress();
    fetchQuestionCount();
    fetchNextTestNumber();
  }, []);

  useEffect(() => {
    if (selectedSubjects.length > 0 && !selectedSubjects.includes('all')) {
      fetchChapters();
    } else {
      setChapters([]);
      setSelectedChapters([]);
    }
  }, [selectedSubjects]);

  useEffect(() => {
    if (selectedChapters.length > 0 && !selectedChapters.includes('all')) {
      fetchTopics();
    } else {
      setTopics([]);
      setSelectedTopics([]);
    }
  }, [selectedChapters]);

  const fetchNextTestNumber = async () => {
    try {
      const { data, error } = await supabase
        .from('practice_tests')
        .select('test_number')
        .order('test_number', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error fetching test number:', error);
        setTestNumber(1);
      } else {
        const nextNumber = data && data.length > 0 ? (data[0].test_number || 0) + 1 : 1;
        setTestNumber(nextNumber);
      }
    } catch (err) {
      console.error('Test number fetch error:', err);
      setTestNumber(1);
    }
  };

  const fetchQuestionCount = async () => {
    try {
      const { endedContestIds } = await getVisibilityFilter();
      
      const { data: practiceQuestions, error: practiceError } = await supabase
        .from('questions')
        .select('id')
        .in('visibility', ['practice', 'contest+practice']);
      
      if (practiceError) throw practiceError;
      
      const { data: afterContestQuestions, error: afterError } = await supabase
        .from('questions')
        .select('id, contest_id')
        .eq('visibility', 'practice_after_contest');
      
      if (afterError) throw afterError;
      
      const validAfterContestQuestions = afterContestQuestions?.filter(
        q => q.contest_id && endedContestIds.includes(q.contest_id)
      ) || [];
      
      const allQuestionIds = new Set([
        ...(practiceQuestions?.map(q => q.id) || []),
        ...validAfterContestQuestions.map(q => q.id)
      ]);
      
      setMaxQuestions(allQuestionIds.size);
      
    } catch (err) {
      console.error('Question count error:', err);
      setMaxQuestions(0);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { endedContestIds } = await getVisibilityFilter();
      
      const { data: practiceData } = await supabase
        .from('questions')
        .select('subject')
        .in('visibility', ['practice', 'contest+practice'])
        .not('subject', 'is', null);
      
      const { data: afterContestData } = await supabase
        .from('questions')
        .select('subject, contest_id')
        .eq('visibility', 'practice_after_contest')
        .not('subject', 'is', null);
      
      const validAfterContestSubjects = afterContestData?.filter(
        q => q.contest_id && endedContestIds.includes(q.contest_id)
      ).map(q => q.subject) || [];
      
      const allSubjects = [
        ...(practiceData?.map(q => q.subject) || []),
        ...validAfterContestSubjects
      ];
      
      const uniqueSubjects = [...new Set(allSubjects)];
      setSubjects(uniqueSubjects);
      
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchChapters = async () => {
    try {
      const { endedContestIds } = await getVisibilityFilter();
      
      const { data: practiceData } = await supabase
        .from('questions')
        .select('chapter')
        .in('visibility', ['practice', 'contest+practice'])
        .in('subject', selectedSubjects)
        .not('chapter', 'is', null);
      
      const { data: afterContestData } = await supabase
        .from('questions')
        .select('chapter, contest_id')
        .eq('visibility', 'practice_after_contest')
        .in('subject', selectedSubjects)
        .not('chapter', 'is', null);
      
      const validAfterContestChapters = afterContestData?.filter(
        q => q.contest_id && endedContestIds.includes(q.contest_id)
      ).map(q => q.chapter) || [];
      
      const allChapters = [
        ...(practiceData?.map(q => q.chapter) || []),
        ...validAfterContestChapters
      ];
      
      const uniqueChapters = [...new Set(allChapters)];
      setChapters(uniqueChapters);
      
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const fetchTopics = async () => {
    try {
      const { endedContestIds } = await getVisibilityFilter();
      
      const { data: practiceData } = await supabase
        .from('questions')
        .select('topic')
        .in('visibility', ['practice', 'contest+practice'])
        .in('chapter', selectedChapters)
        .not('topic', 'is', null);
      
      const { data: afterContestData } = await supabase
        .from('questions')
        .select('topic, contest_id')
        .eq('visibility', 'practice_after_contest')
        .in('chapter', selectedChapters)
        .not('topic', 'is', null);
      
      const validAfterContestTopics = afterContestData?.filter(
        q => q.contest_id && endedContestIds.includes(q.contest_id)
      ).map(q => q.topic) || [];
      
      const allTopics = [
        ...(practiceData?.map(q => q.topic) || []),
        ...validAfterContestTopics
      ];
      
      const uniqueTopics = [...new Set(allTopics)];
      setTopics(uniqueTopics);
      
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchSources = async () => {
    try {
      const { endedContestIds } = await getVisibilityFilter();
      
      const { data: practiceData } = await supabase
        .from('questions')
        .select('source')
        .in('visibility', ['practice', 'contest+practice']);
      
      const { data: afterContestData } = await supabase
        .from('questions')
        .select('source, contest_id')
        .eq('visibility', 'practice_after_contest');
      
      const validAfterContestData = afterContestData?.filter(
        q => q.contest_id && endedContestIds.includes(q.contest_id)
      ) || [];
      
      const allData = [
        ...(practiceData || []),
        ...validAfterContestData
      ];
      
      if (!allData || allData.length === 0) {
        setSources([]);
        return;
      }
      
      const allSources = [];
      allData.forEach(q => {
        if (q.source) {
          if (Array.isArray(q.source)) {
            allSources.push(...q.source);
          } else {
            allSources.push(q.source);
          }
        }
      });
      
      const uniqueSources = [...new Set(allSources)].filter(Boolean);
      setSources(uniqueSources);
      
    } catch (error) {
      console.error('Error fetching sources:', error);
      setSources([]);
    }
  };

  const fetchTags = async () => {
    try {
      const { endedContestIds } = await getVisibilityFilter();
      
      const { data: practiceData } = await supabase
        .from('questions')
        .select('tags')
        .in('visibility', ['practice', 'contest+practice'])
        .not('tags', 'is', null);
      
      const { data: afterContestData } = await supabase
        .from('questions')
        .select('tags, contest_id')
        .eq('visibility', 'practice_after_contest')
        .not('tags', 'is', null);
      
      const validAfterContestData = afterContestData?.filter(
        q => q.contest_id && endedContestIds.includes(q.contest_id)
      ) || [];
      
      const allData = [
        ...(practiceData || []),
        ...validAfterContestData
      ];
      
      if (!allData || allData.length === 0) {
        setTags([]);
        return;
      }
      
      const allTags = [];
      allData.forEach(q => {
        if (q.tags && Array.isArray(q.tags)) {
          allTags.push(...q.tags);
        }
      });
      
      const uniqueTags = [...new Set(allTags)].filter(Boolean);
      setTags(uniqueTags);
      
    } catch (error) {
      console.error('Error fetching tags:', error);
      setTags([]);
    }
  };

  // UPDATED: Fetch user progress - only practice tests
  const fetchUserProgress = async () => {
    try {
      if (!currentUserId) {
        console.log('⚠️ No currentUserId provided');
        return;
      }
      
      console.log('🔄 Fetching user progress for userId:', currentUserId);

      // Get only practice test attempts
      const { data: practiceTests } = await supabase
        .from('practice_tests')
        .select('id, test_number, test_name, created_at')
        .order('created_at', { ascending: false });

      if (!practiceTests || practiceTests.length === 0) {
        setRecentTests([]);
        return;
      }

      const practiceTestIds = practiceTests.map(t => t.id);

      // Get attempts for practice tests only
      const { data: attempts } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('user_id', currentUserId)
        .in('test_id', practiceTestIds)
        .order('created_at', { ascending: false });

      if (!attempts || attempts.length === 0) {
        setRecentTests([]);
        return;
      }

      // Get all session IDs from these attempts
      const sessionIds = [...new Set(attempts.map(a => a.session_id).filter(Boolean))];

      // Get user responses for these sessions
      const { data: allResponses } = await supabase
        .from('user_responses')
        .select('*')
        .in('session_id', sessionIds);

      if (!allResponses) {
        setRecentTests([]);
        return;
      }

      // Get question IDs from responses
      const questionIds = [...new Set(allResponses.map(r => r.question_id))];

      // Fetch questions with details
      const { data: questions } = await supabase
        .from('questions')
        .select('id, subject, difficulty, question_type, numerical_answer')
        .in('id', questionIds);

      // Fetch options for MCQ validation
      const { data: options } = await supabase
        .from('question_options')
        .select('question_id, option_label, is_correct')
        .in('question_id', questionIds);

      // Create maps for quick lookup
      const questionsMap = {};
      questions?.forEach(q => {
        questionsMap[q.id] = q;
      });

      const correctOptionsMap = {};
      options?.forEach(opt => {
        if (opt.is_correct) {
          if (!correctOptionsMap[opt.question_id]) {
            correctOptionsMap[opt.question_id] = [];
          }
          correctOptionsMap[opt.question_id].push(opt.option_label);
        }
      });

      // Calculate stats
      let totalCorrect = 0;
      let totalIncorrect = 0;
      let totalUnattempted = 0;
      let totalQuestionsSolved = 0;

      const subjectStatsMap = {};
      const difficultyStatsMap = {
        easy: { solved: 0, correct: 0, incorrect: 0, unattempted: 0 },
        medium: { solved: 0, correct: 0, incorrect: 0, unattempted: 0 },
        hard: { solved: 0, correct: 0, incorrect: 0, unattempted: 0 }
      };

      // Process each response
      allResponses.forEach(response => {
        const question = questionsMap[response.question_id];
        if (!question) return;

        const subject = question.subject || 'Unknown';
        const difficulty = (question.difficulty || 'medium').toLowerCase();

        // Initialize subject stats
        if (!subjectStatsMap[subject]) {
          subjectStatsMap[subject] = {
            subject,
            solved: 0,
            correct: 0,
            incorrect: 0,
            unattempted: 0,
            accuracy: 0
          };
        }

        // Check if answered
        if (response.is_answered) {
          let isCorrect = false;

          if (question.question_type === 'numerical') {
            const userAns = response.numerical_answer;
            const correctAns = question.numerical_answer;
            if (userAns && correctAns) {
              const userNum = parseFloat(userAns);
              const correctNum = parseFloat(correctAns);
              if (!isNaN(userNum) && !isNaN(correctNum)) {
                isCorrect = Math.abs(userNum - correctNum) < 0.01;
              }
            }
          } else {
            const userAns = response.selected_option_label;
            const correctOptions = correctOptionsMap[question.id] || [];
            isCorrect = correctOptions.includes(userAns);
          }

          if (isCorrect) {
            totalCorrect++;
            subjectStatsMap[subject].correct++;
            if (difficultyStatsMap[difficulty]) {
              difficultyStatsMap[difficulty].correct++;
            }
          } else {
            totalIncorrect++;
            subjectStatsMap[subject].incorrect++;
            if (difficultyStatsMap[difficulty]) {
              difficultyStatsMap[difficulty].incorrect++;
            }
          }

          totalQuestionsSolved++;
          subjectStatsMap[subject].solved++;
          if (difficultyStatsMap[difficulty]) {
            difficultyStatsMap[difficulty].solved++;
          }
        } else {
          totalUnattempted++;
          subjectStatsMap[subject].unattempted++;
          if (difficultyStatsMap[difficulty]) {
            difficultyStatsMap[difficulty].unattempted++;
          }
        }
      });

      // Calculate accuracy for subjects
      const subjectStatsArray = Object.values(subjectStatsMap).map(stat => ({
        ...stat,
        accuracy: stat.solved > 0 ? Math.round((stat.correct / stat.solved) * 100) : 0
      }));

      // Set states
      setTestsTaken(attempts.length);
      setQuestionsSolved(totalQuestionsSolved);
      setAccuracy(totalQuestionsSolved > 0 ? Math.round((totalCorrect / totalQuestionsSolved) * 100) : 0);
      setOverallStats({ 
        correct: totalCorrect, 
        incorrect: totalIncorrect, 
        unattempted: totalUnattempted 
      });
      setSubjectStats(subjectStatsArray);
      setDifficultyStats(difficultyStatsMap);

      // Build recent tests array with test info
      const recentTestsArray = attempts.map(attempt => {
        const test = practiceTests.find(t => t.id === attempt.test_id);
        const testResponses = allResponses.filter(r => r.session_id === attempt.session_id);
        
        let testCorrect = 0;
        let testIncorrect = 0;
        let testUnattempted = 0;

        testResponses.forEach(response => {
          const question = questionsMap[response.question_id];
          if (!question) return;

          if (response.is_answered) {
            let isCorrect = false;
            if (question.question_type === 'numerical') {
              const userAns = response.numerical_answer;
              const correctAns = question.numerical_answer;
              if (userAns && correctAns) {
                const userNum = parseFloat(userAns);
                const correctNum = parseFloat(correctAns);
                if (!isNaN(userNum) && !isNaN(correctNum)) {
                  isCorrect = Math.abs(userNum - correctNum) < 0.01;
                }
              }
            } else {
              const userAns = response.selected_option_label;
              const correctOptions = correctOptionsMap[question.id] || [];
              isCorrect = correctOptions.includes(userAns);
            }

            if (isCorrect) testCorrect++;
            else testIncorrect++;
          } else {
            testUnattempted++;
          }
        });

        return {
          id: attempt.id,
          test_id: attempt.test_id,
          test_number: test?.test_number,
          test_name: test?.test_name,
          created_at: attempt.created_at,
          total_questions: testResponses.length,
          correct_answers: testCorrect,
          incorrect_answers: testIncorrect,
          unattempted: testUnattempted
        };
      });

      setRecentTests(recentTestsArray);
      calculateStudyStreak(attempts);

    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const calculateStudyStreak = (attempts) => {
    if (!attempts || attempts.length === 0) return;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sortedDates = attempts
      .map(a => new Date(a.created_at))
      .sort((a, b) => b - a);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const testDate = new Date(sortedDates[i]);
      testDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today - testDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    setStudyStreak(streak);
  };
 

  const handleSubjectToggle = (subject) => {
    if (subject === 'all') {
      if (selectedSubjects.includes('all')) {
        setSelectedSubjects([]);
      } else {
        setSelectedSubjects(['all']);
      }
    } else {
      const filtered = selectedSubjects.filter(s => s !== 'all');
      if (filtered.includes(subject)) {
        const updated = filtered.filter(s => s !== subject);
        setSelectedSubjects(updated);
      } else {
        setSelectedSubjects([...filtered, subject]);
      }
    }
  };

  const handleChapterToggle = (chapter) => {
    if (chapter === 'all') {
      if (selectedChapters.includes('all')) {
        setSelectedChapters([]);
      } else {
        setSelectedChapters(['all']);
      }
    } else {
      const filtered = selectedChapters.filter(c => c !== 'all');
      if (filtered.includes(chapter)) {
        const updated = filtered.filter(c => c !== chapter);
        setSelectedChapters(updated);
      } else {
        setSelectedChapters([...filtered, chapter]);
      }
    }
  };

  const handleTopicToggle = (topic) => {
    if (topic === 'all') {
      if (selectedTopics.includes('all')) {
        setSelectedTopics([]);
      } else {
        setSelectedTopics(['all']);
      }
    } else {
      const filtered = selectedTopics.filter(t => t !== 'all');
      if (filtered.includes(topic)) {
        const updated = filtered.filter(t => t !== topic);
        setSelectedTopics(updated);
      } else {
        setSelectedTopics([...filtered, topic]);
      }
    }
  };

  const handleSourceToggle = (source) => {
    if (source === 'all') {
      if (selectedSources.includes('all')) {
        setSelectedSources([]);
      } else {
        setSelectedSources(['all']);
      }
    } else {
      const filtered = selectedSources.filter(s => s !== 'all');
      if (filtered.includes(source)) {
        const updated = filtered.filter(s => s !== source);
        setSelectedSources(updated);
      } else {
        setSelectedSources([...filtered, source]);
      }
    }
  };

  const handleTagToggle = (tag) => {
    if (tag === 'all') {
      if (selectedTags.includes('all')) {
        setSelectedTags([]);
      } else {
        setSelectedTags(['all']);
      }
    } else {
      const filtered = selectedTags.filter(t => t !== 'all');
      if (filtered.includes(tag)) {
        const updated = filtered.filter(t => t !== tag);
        setSelectedTags(updated);
      } else {
        setSelectedTags([...filtered, tag]);
      }
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  const filteredChapters = chapters.filter(c => 
    c.toLowerCase().includes(chapterSearch.toLowerCase())
  );

  const filteredTopics = topics.filter(t => 
    t.toLowerCase().includes(topicSearch.toLowerCase())
  );

  const filteredSources = sources.filter(s => 
    s.toLowerCase().includes(sourceSearch.toLowerCase())
  );

  const filteredTags = tags.filter(t => 
    t.toLowerCase().includes(tagSearch.toLowerCase())
  );

  // NEW: Handle View Dashboard navigation
  const handleViewDashboard = async (testAttemptId) => {
    try {
      // Navigate directly to test analysis (practice tests are always attempted)
      router.push(`/results/${testAttemptId}`);
    } catch (error) {
      console.error('Error navigating to dashboard:', error);
      alert('Error opening dashboard: ' + error.message);
    }
  };

  const generateTest = async () => {
    setLoading(true);
    
    try {
      const { endedContestIds } = await getVisibilityFilter();
      
      let practiceQuery = supabase
        .from('questions')
        .select('*')
        .in('visibility', ['practice', 'contest+practice']);
      
      if (!selectedSubjects.includes('all') && selectedSubjects.length > 0) {
        practiceQuery = practiceQuery.in('subject', selectedSubjects);
      }
      if (!selectedChapters.includes('all') && selectedChapters.length > 0) {
        practiceQuery = practiceQuery.in('chapter', selectedChapters);
      }
      if (!selectedTopics.includes('all') && selectedTopics.length > 0) {
        practiceQuery = practiceQuery.in('topic', selectedTopics);
      }
      if (!selectedSources.includes('all') && selectedSources.length > 0) {
        practiceQuery = practiceQuery.in('source', selectedSources);
      }
      if (!selectedTags.includes('all') && selectedTags.length > 0) {
        practiceQuery = practiceQuery.in('tags', selectedTags);
      }
      if (questionType !== 'mixed') {
        practiceQuery = practiceQuery.eq('question_type', questionType);
      }
      if (difficulty !== 'mixed') {
        practiceQuery = practiceQuery.eq('difficulty', difficulty);
      }
      
      const { data: practiceQuestions, error: practiceError } = await practiceQuery;
      if (practiceError) throw practiceError;
      
      let afterContestQuery = supabase
        .from('questions')
        .select('*')
        .eq('visibility', 'practice_after_contest');
      
      if (!selectedSubjects.includes('all') && selectedSubjects.length > 0) {
        afterContestQuery = afterContestQuery.in('subject', selectedSubjects);
      }
      if (!selectedChapters.includes('all') && selectedChapters.length > 0) {
        afterContestQuery = afterContestQuery.in('chapter', selectedChapters);
      }
      if (!selectedTopics.includes('all') && selectedTopics.length > 0) {
        afterContestQuery = afterContestQuery.in('topic', selectedTopics);
      }
      if (!selectedSources.includes('all') && selectedSources.length > 0) {
        afterContestQuery = afterContestQuery.in('source', selectedSources);
      }
      if (!selectedTags.includes('all') && selectedTags.length > 0) {
        afterContestQuery = afterContestQuery.in('tags', selectedTags);
      }
      if (questionType !== 'mixed') {
        afterContestQuery = afterContestQuery.eq('question_type', questionType);
      }
      if (difficulty !== 'mixed') {
        afterContestQuery = afterContestQuery.eq('difficulty', difficulty);
      }
      
      const { data: afterContestQuestions, error: afterError } = await afterContestQuery;
      if (afterError) throw afterError;
      
      const validAfterContestQuestions = afterContestQuestions?.filter(
        q => q.contest_id && endedContestIds.includes(q.contest_id)
      ) || [];
      
      const allQuestions = [
        ...(practiceQuestions || []),
        ...validAfterContestQuestions
      ];
      
      if (!allQuestions || allQuestions.length === 0) {
        alert('No questions found with selected criteria!');
        setLoading(false);
        return;
      }
      
      const shuffled = allQuestions.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.min(numQuestions, allQuestions.length));
      
      const filtersUsed = {
        subjects: selectedSubjects.includes('all') ? ['All'] : selectedSubjects,
        chapters: selectedChapters.includes('all') ? ['All'] : selectedChapters,
        topics: selectedTopics.includes('all') ? ['All'] : selectedTopics,
        sources: selectedSources.includes('all') ? ['All'] : selectedSources,
        tags: selectedTags.includes('all') ? ['All'] : selectedTags,
        question_type: questionType,
        difficulty: difficulty
      };
      
      const testData = {
        test_number: testNumber,
        test_name: testName || `Practice Test ${testNumber}`,
        num_questions: selected.length,
        duration_minutes: duration === 0 ? null : duration,
        question_ids: selected.map(q => q.id),
        filters: filtersUsed,
        created_at: new Date().toISOString()
      };
      
      const { data: testConfig, error: configError } = await supabase
        .from('practice_tests')
        .insert(testData)
        .select()
        .single();
      
      if (configError) {
        console.error('Error:', configError);
        alert('Error creating test: ' + configError.message);
        throw configError;
      }
      
      console.log('✅ Test created successfully! Navigating to exam...');
      router.push(`/exam/${testConfig.id}`);
      
    } catch (error) {
      console.error('Fatal error:', error);
      alert('Error generating test: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        .custom-checkbox {
          appearance: none;
          width: 16px;
          height: 16px;
          border: 2px solid #64748b;
          border-radius: 4px;
          background-color: #1e293b;
          cursor: pointer;
          position: relative;
          flex-shrink: 0;
        }
        
        .custom-checkbox:checked {
          background-color: ${THEME_PRIMARY};
          border-color: ${THEME_PRIMARY};
        }
        
        .custom-checkbox:checked::after {
          content: "✓";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        
        .custom-checkbox:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #64748b;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .glass-border {
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          transition: all 0.3s ease;
        }

        .glass-border:hover {
          border-color: rgba(255, 255, 255, 0.25);
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.15);
        }

        .yellow-border {
          border: 1.5px solid ${THEME_PRIMARY};
          transition: all 0.3s ease;
        }

        .yellow-border:hover {
          box-shadow: 0 0 20px ${THEME_PRIMARY}80;
          border-color: ${THEME_PRIMARY};
        }

        .yellow-border-thin {
          border: 1px solid rgba(245, 158, 11, 0.3);
          transition: all 0.3s ease;
        }

        .yellow-border-thin:hover {
          border-color: rgba(245, 158, 11, 0.5);
          box-shadow: 0 0 15px ${THEME_PRIMARY}40;
        }
      `}</style>

      <div className="min-h-screen bg-[#0E172A] text-slate-100 p-8 overflow-hidden fixed inset-0">
        <div className="max-w-7xl mx-auto h-full overflow-y-auto custom-scrollbar">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 font-bold text-xs tracking-widest uppercase transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> 
            BACK TO COMMAND CENTER
          </button>

          <div className="space-y-6">
            <div>
              <h1 className="text-5xl font-black mb-3 tracking-tighter">
                Custom <span style={{ color: THEME_PRIMARY }}>Drill</span>
              </h1>
              <p className="text-slate-400 font-medium max-w-lg">
                Build your perfect practice test - {maxQuestions || 'Loading...'} questions available
              </p>
            </div>

            {/* Test Number & Name - Line 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block tracking-widest mb-2">
                  Test Number
                </label>
                <input
                  type="text"
                  value={testNumber}
                  readOnly
                  disabled
                  className="w-full bg-slate-900/50 glass-border rounded-xl px-3 py-2 text-center text-lg font-bold cursor-not-allowed opacity-60"
                />
                <p className="text-[9px] text-slate-600 text-center mt-2">Auto-assigned</p>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block tracking-widest mb-2">
                  Test Name (Optional)
                </label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder={`Practice Test ${testNumber}`}
                  className="w-full bg-slate-900/50 glass-border rounded-xl px-3 py-2 text-sm focus:outline-none transition-all"
                />
                <p className="text-[9px] text-slate-600 invisible mt-2">Placeholder</p>
              </div>
            </div>

            {/* Questions, Duration, Type, Difficulty - Line 2 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block tracking-widest flex items-center gap-1 mb-2">
                  <LayoutGrid size={10}/> Questions
                </label>
                <input
                  type="number"
                  value={numQuestions}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    const limited = Math.min(val, maxQuestions || 1000);
                    setNumQuestions(limited);
                  }}
                  onBlur={(e) => {
                    const val = parseInt(e.target.value);
                    if (!val || val === 0) {
                      setNumQuestions(Math.min(1, maxQuestions || 1));
                    } else if (val > maxQuestions) {
                      setNumQuestions(maxQuestions || 1);
                      alert(`Maximum ${maxQuestions} questions available!`);
                    }
                  }}
                  className="w-full bg-slate-900/50 glass-border rounded-lg px-3 py-2 text-center text-lg font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block tracking-widest mb-2">
                  Duration (min)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      setDuration(60);
                    }
                  }}
                  className="w-full bg-slate-900/50 glass-border rounded-lg px-3 py-2 text-center text-lg font-bold focus:outline-none"
                />
                <p className="text-[9px] text-slate-600 text-center mt-2">0 = No Timer</p>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block tracking-widest mb-2">
                  Type
                </label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className="w-full bg-slate-900/50 glass-border rounded-lg px-3 py-2 text-xs font-bold focus:outline-none"
                >
                  <option value="mixed">Mixed</option>
                  <option value="mcq">MCQ</option>
                  <option value="multiple_correct">Multiple</option>
                  <option value="numerical">Numerical</option>
                </select>
                <p className="text-[9px] text-slate-600 invisible text-center mt-2">Placeholder</p>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block tracking-widest flex items-center gap-1 mb-2">
                  <Star size={10}/> Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-900/50 glass-border rounded-lg px-3 py-2 text-xs font-bold focus:outline-none"
                >
                  <option value="mixed">Mixed</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="very_hard">Very Hard</option>
                </select>
                <p className="text-[9px] text-slate-600 invisible text-center mt-2">Placeholder</p>
              </div>
            </div>

            {/* Subject, Chapter, Topic - Line 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-900/50 glass-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setSubjectsOpen(!subjectsOpen)}
                  className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} style={{ color: THEME_PRIMARY }} />
                    <span className="text-xs font-black uppercase tracking-widest">Step 1: Subject</span>
                  </div>
                  {subjectsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {subjectsOpen && (
                  <div className="p-3 pt-0 space-y-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2 text-slate-600" size={14} />
                      <input
                        type="text"
                        placeholder="Search subjects..."
                        value={subjectSearch}
                        onChange={(e) => setSubjectSearch(e.target.value)}
                        className="w-full bg-slate-900 glass-border rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                      <label className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes('all')}
                          onChange={() => handleSubjectToggle('all')}
                          className="custom-checkbox"
                        />
                        <span className="text-xs font-bold" style={{ color: THEME_PRIMARY }}>All Subjects</span>
                      </label>
                      {filteredSubjects.map(subject => (
                        <label key={subject} className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedSubjects.includes(subject)}
                            onChange={() => handleSubjectToggle(subject)}
                            disabled={selectedSubjects.includes('all')}
                            className="custom-checkbox"
                          />
                          <span className="text-xs">{subject}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-900/50 glass-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setChaptersOpen(!chaptersOpen)}
                  className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={14} style={{ color: THEME_PRIMARY }} />
                    <span className="text-xs font-black uppercase tracking-widest">Step 2: Chapter</span>
                  </div>
                  {chaptersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {chaptersOpen && (
                  <div className="p-3 pt-0 space-y-2">
                    {chapters.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-slate-600">
                        <ChevronRight size={24} className="mb-1" />
                        <p className="text-[9px] text-center">Select a subject first</p>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <Search className="absolute left-2 top-2 text-slate-600" size={14} />
                          <input
                            type="text"
                            placeholder="Search chapters..."
                            value={chapterSearch}
                            onChange={(e) => setChapterSearch(e.target.value)}
                            className="w-full bg-slate-900 glass-border rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                          <label className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedChapters.includes('all')}
                              onChange={() => handleChapterToggle('all')}
                              className="custom-checkbox"
                            />
                            <span className="text-xs font-bold" style={{ color: THEME_PRIMARY }}>All Chapters</span>
                          </label>
                          {filteredChapters.map(chapter => (
                            <label key={chapter} className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={selectedChapters.includes(chapter)}
                                onChange={() => handleChapterToggle(chapter)}
                                disabled={selectedChapters.includes('all')}
                                className="custom-checkbox"
                              />
                              <span className="text-xs">{chapter}</span>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-slate-900/50 glass-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setTopicsOpen(!topicsOpen)}
                  className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Target size={14} style={{ color: THEME_PRIMARY }} />
                    <span className="text-xs font-black uppercase tracking-widest">Step 3: Topic</span>
                  </div>
                  {topicsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {topicsOpen && (
                  <div className="p-3 pt-0 space-y-2">
                    {topics.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-slate-600">
                        <ChevronRight size={24} className="mb-1" />
                        <p className="text-[9px] text-center">Select a chapter first</p>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <Search className="absolute left-2 top-2 text-slate-600" size={14} />
                          <input
                            type="text"
                            placeholder="Search topics..."
                            value={topicSearch}
                            onChange={(e) => setTopicSearch(e.target.value)}
                            className="w-full bg-slate-900 glass-border rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                          <label className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedTopics.includes('all')}
                              onChange={() => handleTopicToggle('all')}
                              className="custom-checkbox"
                            />
                            <span className="text-xs font-bold" style={{ color: THEME_PRIMARY }}>All Topics</span>
                          </label>
                          {filteredTopics.map(topic => (
                            <label key={topic} className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={selectedTopics.includes(topic)}
                                onChange={() => handleTopicToggle(topic)}
                                disabled={selectedTopics.includes('all')}
                                className="custom-checkbox"
                              />
                              <span className="text-xs">{topic}</span>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sources & Tags - Line 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-900/50 glass-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setSourcesOpen(!sourcesOpen)}
                  className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={14} style={{ color: THEME_PRIMARY }} />
                    <span className="text-xs font-black uppercase tracking-widest">Sources</span>
                  </div>
                  {sourcesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {sourcesOpen && (
                  <div className="p-3 pt-0 space-y-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2 text-slate-600" size={14} />
                      <input
                        type="text"
                        placeholder="Search sources..."
                        value={sourceSearch}
                        onChange={(e) => setSourceSearch(e.target.value)}
                        className="w-full bg-slate-900 glass-border rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                      <label className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedSources.includes('all')}
                          onChange={() => handleSourceToggle('all')}
                          className="custom-checkbox"
                        />
                        <span className="text-xs font-bold" style={{ color: THEME_PRIMARY }}>All Sources</span>
                      </label>
                      {filteredSources.map(source => (
                        <label key={source} className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedSources.includes(source)}
                            onChange={() => handleSourceToggle(source)}
                            disabled={selectedSources.includes('all')}
                            className="custom-checkbox"
                          />
                          <span className="text-xs">{source}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-900/50 glass-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setTagsOpen(!tagsOpen)}
                  className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Star size={14} style={{ color: THEME_PRIMARY }} />
                    <span className="text-xs font-black uppercase tracking-widest">Tags</span>
                  </div>
                  {tagsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {tagsOpen && (
                  <div className="p-3 pt-0 space-y-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2 text-slate-600" size={14} />
                      <input
                        type="text"
                        placeholder="Search tags..."
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        className="w-full bg-slate-900 glass-border rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                      <label className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes('all')}
                          onChange={() => handleTagToggle('all')}
                          className="custom-checkbox"
                        />
                        <span className="text-xs font-bold" style={{ color: THEME_PRIMARY }}>All Tags</span>
                      </label>
                      {filteredTags.map(tag => (
                        <label key={tag} className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag)}
                            onChange={() => handleTagToggle(tag)}
                            disabled={selectedTags.includes('all')}
                            className="custom-checkbox"
                          />
                          <span className="text-xs">{tag}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Launch Button */}
            <button 
              onClick={generateTest}
              disabled={loading}
              className={`w-full py-4 rounded-[20px] font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 text-slate-900 ${
                loading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:brightness-110 hover:scale-[1.01] active:scale-95 cursor-pointer'
              }`}
              style={{ backgroundColor: THEME_PRIMARY }}
            >
              {loading ? 'Generating...' : 'Launch Simulation'} <Zap size={16} fill="currentColor"/>
            </button>

            {/* Progress Dashboard */}
            <div className="space-y-4 pt-4">
              {/* Progress Stats - Row 1 */}
              <div className="bg-slate-900/50 p-5 rounded-[24px] glass-border">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${THEME_PRIMARY}11` }}>
                    <Target size={16} style={{ color: THEME_PRIMARY }}/>
                  </div>
                  <h3 className="font-bold text-sm">Progress Dashboard</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/5 p-3 rounded-xl yellow-border-thin">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8px] bg-green-600 text-white px-1.5 py-0.5 rounded-full font-black uppercase">Active</span>
                    </div>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Study Streak</p>
                    <p className="text-2xl font-black">{studyStreak}</p>
                    <p className="text-[8px] text-slate-600">Days in a row</p>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl yellow-border-thin">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mb-1">Solved</p>
                    <p className="text-2xl font-black">{questionsSolved}</p>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl yellow-border-thin">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mb-1">Accuracy</p>
                    <p className="text-2xl font-black">{accuracy}%</p>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl yellow-border-thin">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mb-1">Tests</p>
                    <p className="text-2xl font-black">{testsTaken}</p>
                  </div>
                </div>

                {/* Overall Performance */}
                <div className="space-y-3">
                  <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Overall Performance</h4>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-green-500">Correct</span>
                        <span className="text-xs font-black">{overallStats.correct}</span>
                      </div>
                      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all" style={{ width: `${accuracy}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-red-500">Incorrect</span>
                        <span className="text-xs font-black">{overallStats.incorrect}</span>
                      </div>
                      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 transition-all" style={{ width: `${(overallStats.incorrect / (questionsSolved + overallStats.unattempted) * 100) || 0}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-400">Unattempted</span>
                        <span className="text-xs font-black">{overallStats.unattempted}</span>
                      </div>
                      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-500 transition-all" style={{ width: `${(overallStats.unattempted / (questionsSolved + overallStats.unattempted) * 100) || 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject-wise & Difficulty Analysis - Row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Subject-wise Analysis */}
                <div className="bg-slate-900/50 p-5 rounded-[24px] glass-border">
                  <button
                    onClick={() => setSubjectWiseOpen(!subjectWiseOpen)}
                    className="w-full flex items-center justify-between mb-4"
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-500/10 p-1.5 rounded-lg">
                        <BookOpen size={16} className="text-blue-400"/>
                      </div>
                      <h3 className="font-bold text-sm">Subject Analysis</h3>
                    </div>
                    {subjectWiseOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {subjectWiseOpen && (
                    <div className="space-y-2">
                      {subjectStats.length === 0 ? (
                        <p className="text-slate-500 text-center py-4 text-xs">No data available yet</p>
                      ) : (
                        subjectStats.map(stat => (
                          <div key={stat.subject} className="bg-white/5 p-3 rounded-xl yellow-border-thin">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold">{stat.subject}</span>
                              <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-black">{stat.accuracy}%</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-[10px]">
                              <div>
                                <p className="text-slate-500 font-black uppercase">Solved</p>
                                <p className="font-bold">{stat.solved}</p>
                              </div>
                              <div>
                                <p className="text-green-400 font-black uppercase">Correct</p>
                                <p className="font-bold">{stat.correct}</p>
                              </div>
                              <div>
                                <p className="text-red-400 font-black uppercase">Wrong</p>
                                <p className="font-bold">{stat.incorrect}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 font-black uppercase">Skip</p>
                                <p className="font-bold">{stat.unattempted}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Difficulty Analysis */}
                <div className="bg-slate-900/50 p-5 rounded-[24px] glass-border">
                  <button
                    onClick={() => setDifficultyWiseOpen(!difficultyWiseOpen)}
                    className="w-full flex items-center justify-between mb-4"
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-purple-500/10 p-1.5 rounded-lg">
                        <Target size={16} className="text-purple-400"/>
                      </div>
                      <h3 className="font-bold text-sm">Difficulty Analysis</h3>
                    </div>
                    {difficultyWiseOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {difficultyWiseOpen && (
                    <div className="space-y-3">
                      <div className="bg-white/5 p-3 rounded-xl yellow-border-thin">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold">Easy</span>
                          <span className="text-[8px] bg-green-600 text-white px-1.5 py-0.5 rounded font-black">
                            {difficultyStats.easy.solved > 0 ? Math.round((difficultyStats.easy.correct / difficultyStats.easy.solved) * 100) : 0}%
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-[10px]">
                          <div>
                            <p className="text-slate-500 font-black uppercase">Solved</p>
                            <p className="font-bold text-sm">{difficultyStats.easy.solved}</p>
                          </div>
                          <div>
                            <p className="text-green-400 font-black uppercase">Correct</p>
                            <p className="font-bold text-sm">{difficultyStats.easy.correct}</p>
                          </div>
                          <div>
                            <p className="text-red-400 font-black uppercase">Wrong</p>
                            <p className="font-bold text-sm">{difficultyStats.easy.incorrect}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 font-black uppercase">Skip</p>
                            <p className="font-bold text-sm">{difficultyStats.easy.unattempted}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 p-3 rounded-xl yellow-border-thin">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold">Medium</span>
                          <span className="text-[8px] text-white px-1.5 py-0.5 rounded font-black" style={{ backgroundColor: THEME_PRIMARY }}>
                            {difficultyStats.medium.solved > 0 ? Math.round((difficultyStats.medium.correct / difficultyStats.medium.solved) * 100) : 0}%
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-[10px]">
                          <div>
                            <p className="text-slate-500 font-black uppercase">Solved</p>
                            <p className="font-bold text-sm">{difficultyStats.medium.solved}</p>
                          </div>
                          <div>
                            <p className="text-green-400 font-black uppercase">Correct</p>
                            <p className="font-bold text-sm">{difficultyStats.medium.correct}</p>
                          </div>
                          <div>
                            <p className="text-red-400 font-black uppercase">Wrong</p>
                            <p className="font-bold text-sm">{difficultyStats.medium.incorrect}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 font-black uppercase">Skip</p>
                            <p className="font-bold text-sm">{difficultyStats.medium.unattempted}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 p-3 rounded-xl yellow-border-thin">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold">Hard</span>
                          <span className="text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black">
                            {difficultyStats.hard.solved > 0 ? Math.round((difficultyStats.hard.correct / difficultyStats.hard.solved) * 100) : 0}%
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-[10px]">
                          <div>
                            <p className="text-slate-500 font-black uppercase">Solved</p>
                            <p className="font-bold text-sm">{difficultyStats.hard.solved}</p>
                          </div>
                          <div>
                            <p className="text-green-400 font-black uppercase">Correct</p>
                            <p className="font-bold text-sm">{difficultyStats.hard.correct}</p>
                          </div>
                          <div>
                            <p className="text-red-400 font-black uppercase">Wrong</p>
                            <p className="font-bold text-sm">{difficultyStats.hard.incorrect}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 font-black uppercase">Skip</p>
                            <p className="font-bold text-sm">{difficultyStats.hard.unattempted}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity - Row 3 - ALL TESTS with View Dashboard button */}
              <div className="bg-slate-900/50 p-5 rounded-[24px] glass-border">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-amber-500/10 p-1.5 rounded-lg">
                    <PlayCircle size={16} className="text-amber-400"/>
                  </div>
                  <h3 className="font-bold text-sm">Recent Activity</h3>
                </div>
                
                {recentTests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed rounded-xl glass-border">
                    <p className="text-xs font-bold text-slate-500">No tests taken yet</p>
                    <p className="text-[9px] text-slate-600 mt-0.5">Start practicing!</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {recentTests.map((test, index) => {
                      const totalQuestions = test.total_questions || 0;
                      const correctAnswers = test.correct_answers || 0;
                      const testAccuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
                      const testDate = new Date(test.created_at);
                      const formattedDate = testDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      
                      return (
                        <div key={test.id} className="bg-white/5 p-3 rounded-xl yellow-border-thin">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-[10px]" style={{ color: THEME_PRIMARY }}>#{test.test_number || index + 1}</span>
                              <span className="font-bold text-xs">{test.test_name || 'Practice Test'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[8px] px-1.5 py-0.5 rounded font-black ${testAccuracy >= 70 ? 'bg-green-600' : testAccuracy >= 40 ? 'bg-amber-600' : 'bg-red-600'} text-white`}>
                                {testAccuracy}%
                              </span>
                              <span className="text-[9px] text-slate-500">{correctAnswers}/{totalQuestions}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 text-[9px]">
                            <span className="text-slate-500">{formattedDate}</span>
                            
                            <button
                              onClick={() => handleViewDashboard(test.id)}
                              className="px-3 py-1 rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all hover:brightness-110 flex items-center gap-1"
                              style={{ backgroundColor: THEME_PRIMARY, color: 'white' }}
                            >
                              <Eye size={12}/> View Dashboard
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
  );
}












