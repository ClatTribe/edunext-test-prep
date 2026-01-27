'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import AdminGuard from '../../components/AdminGuard';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('exams');
  
  const [exams, setExams] = useState([]);
  const [examFormData, setExamFormData] = useState({
    name: '', display_name: '', icon: '📚', is_active: true
  });
  const [editingExamId, setEditingExamId] = useState(null);

  const [contests, setContests] = useState([]);
  const [contestFormData, setContestFormData] = useState({
    exam_id: '', contest_number: '', title: '', description: '',
    start_time: '', end_time: '', duration_minutes: '',
    total_questions: 0, total_marks: 0, is_active: true
  });
  const [sections, setSections] = useState([
    { section_name: '', section_order: 1, time_limit_minutes: '' }
  ]);
  const [editingContestId, setEditingContestId] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterExam, setFilterExam] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [contestSections, setContestSections] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const [questionImagePreview, setQuestionImagePreview] = useState('');
  const [solutionImagePreview, setSolutionImagePreview] = useState('');
  const [solutionVideoName, setSolutionVideoName] = useState('');

  const [subjectSuggestions, setSubjectSuggestions] = useState([]);
  const [chapterSuggestions, setChapterSuggestions] = useState([]);
  const [topicSuggestions, setTopicSuggestions] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [newChapter, setNewChapter] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState({
    exam_id: '', subject: '', chapter: '', topic: '', contest_id: '',
    contest_section_id: '', question_number: '', question_text: '',
    question_image_url: '', question_type: 'mcq', difficulty: 'medium',
    positive_marks: 4, negative_marks: 1, partial_marks: 0,
    numerical_answer: '', numerical_tolerance: 0.01,
    source: '', tags: '', visibility: 'practice'
  });

  const [options, setOptions] = useState([
    { id: null, option_label: 'A', option_text: '', option_image_url: '', is_correct: false, option_order: 0, imagePreview: '' },
    { id: null, option_label: 'B', option_text: '', option_image_url: '', is_correct: false, option_order: 1, imagePreview: '' },
    { id: null, option_label: 'C', option_text: '', option_image_url: '', is_correct: false, option_order: 2, imagePreview: '' },
    { id: null, option_label: 'D', option_text: '', option_image_url: '', is_correct: false, option_order: 3, imagePreview: '' }
  ]);

  const [solution, setSolution] = useState({
    solution_text: '', solution_image_url: '', solution_video_url: ''
  });

  const handleLogout = () => {
    // Clear the session keys
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('adminUser');
    
    // Redirect back to login
    router.push('/admin');
  };
  
  useEffect(() => {
    if (activeTab === 'exams') {
      fetchExams();
    } else if (activeTab === 'contests') {
      fetchExams();
      fetchContests();
    } else if (activeTab === 'questions') {
      fetchExams();
      fetchContests();
      fetchQuestions();
      fetchSuggestions();
    }
  }, [activeTab]);
  
  useEffect(() => {
    let filtered = questions;
    if (searchQuery) {
      filtered = filtered.filter(q => 
        q.question_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.chapter?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterExam) filtered = filtered.filter(q => q.exam_id === filterExam);
    if (filterSubject) filtered = filtered.filter(q => q.subject === filterSubject);
    setFilteredQuestions(filtered);
  }, [searchQuery, filterExam, filterSubject, questions]);
  
  const uniqueSubjects = [...new Set(questions.map(q => q.subject).filter(Boolean))];

  const convertToIST = (utcDate) => {
    if (!utcDate) return '';
    const date = new Date(utcDate);
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + istOffset);
    return istDate.toISOString().slice(0, 16);
  };
  
  const convertToUTC = (istDate) => {
    if (!istDate) return '';
    const date = new Date(istDate);
    const istOffset = 5.5 * 60 * 60 * 1000;
    const utcDate = new Date(date.getTime() - istOffset);
    return utcDate.toISOString();
  };
  
  const fetchSuggestions = async () => {
    try {
      const { data } = await supabase
        .from('questions')
        .select('subject, chapter, topic');
      
      if (data) {
        setSubjectSuggestions([...new Set(data.map(q => q.subject).filter(Boolean))]);
        setChapterSuggestions([...new Set(data.map(q => q.chapter).filter(Boolean))]);
        setTopicSuggestions([...new Set(data.map(q => q.topic).filter(Boolean))]);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };
  
  const fetchExams = async () => {
    setError('');
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setExams(data || []);
    } catch (err) {
      setError(err.message);
    }
  };
  
  const handleExamSubmit = async (keepFormOpen = false) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (editingExamId) {
        const { error } = await supabase
          .from('exams')
          .update({
            name: examFormData.name,
            display_name: examFormData.display_name,
            icon: examFormData.icon,
            is_active: examFormData.is_active
          })
          .eq('id', editingExamId);
        if (error) throw error;
        setSuccess('Exam updated successfully!');
        setEditingExamId(null);
      } else {
        const { error } = await supabase
          .from('exams')
          .insert({
            name: examFormData.name,
            display_name: examFormData.display_name,
            icon: examFormData.icon,
            is_active: examFormData.is_active
          });
        if (error) throw error;
        setSuccess(keepFormOpen ? 'Exam added! Add another one.' : 'Exam added successfully!');
      }
      if (!keepFormOpen) {
        setExamFormData({ name: '', display_name: '', icon: '📚', is_active: true });
      } else {
        setExamFormData({ ...examFormData, name: '', display_name: '' });
      }
      await fetchExams();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleExamEdit = (exam) => {
    setExamFormData({
      name: exam.name,
      display_name: exam.display_name,
      icon: exam.icon || '📚',
      is_active: exam.is_active
    });
    setEditingExamId(exam.id);
    setError('');
    setSuccess('');
  };
  
  const handleExamDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.from('exams').delete().eq('id', id);
      if (error) throw error;
      setSuccess('Exam deleted successfully!');
      await fetchExams();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const cancelExamEdit = () => {
    setEditingExamId(null);
    setExamFormData({ name: '', display_name: '', icon: '📚', is_active: true });
    setError('');
    setSuccess('');
  };

  const fetchContests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*, exams(name, icon), contest_sections(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setContests(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleContestInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setContestFormData({
      ...contestFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSectionChange = (index, field, value) => {
    setSections(prevSections => 
      prevSections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    );
  };
  
  const addSection = () => {
    setSections(prevSections => [...prevSections, {
      section_name: '',
      section_order: prevSections.length + 1,
      time_limit_minutes: ''
    }]);
  };
  
  const removeSection = (index) => {
    setSections(prevSections => {
      const updated = prevSections.filter((_, i) => i !== index);
      return updated.map((s, i) => ({ ...s, section_order: i + 1 }));
    });
  };
  
  const handleContestSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (!contestFormData.exam_id || !contestFormData.title || !contestFormData.start_time || !contestFormData.end_time) {
        throw new Error('Please fill all required fields');
      }
      if (sections.length === 0 || !sections[0].section_name) {
        throw new Error('Please add at least one section');
      }
  
      const utcStartTime = convertToUTC(contestFormData.start_time);
      const utcEndTime = convertToUTC(contestFormData.end_time);
  
      if (editingContestId) {
        const { error: contestError } = await supabase
          .from('contests')
          .update({
            exam_id: contestFormData.exam_id,
            contest_number: parseInt(contestFormData.contest_number),
            title: contestFormData.title,
            description: contestFormData.description,
            start_time: utcStartTime,
            end_time: utcEndTime,
            duration_minutes: parseInt(contestFormData.duration_minutes),
            total_questions: contestFormData.total_questions,
            total_marks: contestFormData.total_marks,
            is_active: contestFormData.is_active
          })
          .eq('id', editingContestId);
        if (contestError) throw contestError;
  
        await supabase.from('contest_sections').delete().eq('contest_id', editingContestId);
        const sectionsToInsert = sections.map(s => ({
          contest_id: editingContestId,
          section_name: s.section_name,
          section_order: s.section_order,
          time_limit_minutes: s.time_limit_minutes ? parseInt(s.time_limit_minutes) : null
        }));
        const { error: sectionsError } = await supabase.from('contest_sections').insert(sectionsToInsert);
        if (sectionsError) throw sectionsError;
        setSuccess('Contest updated successfully!');
        setEditingContestId(null);
      } else {
        const { data: contestData, error: contestError } = await supabase
          .from('contests')
          .insert({
            exam_id: contestFormData.exam_id,
            contest_number: parseInt(contestFormData.contest_number),
            title: contestFormData.title,
            description: contestFormData.description,
            start_time: utcStartTime,
            end_time: utcEndTime,
            duration_minutes: parseInt(contestFormData.duration_minutes),
            total_questions: contestFormData.total_questions,
            total_marks: contestFormData.total_marks,
            is_active: contestFormData.is_active
          })
          .select()
          .single();
        if (contestError) throw contestError;
  
        const sectionsToInsert = sections.map(s => ({
          contest_id: contestData.id,
          section_name: s.section_name,
          section_order: s.section_order,
          time_limit_minutes: s.time_limit_minutes ? parseInt(s.time_limit_minutes) : null
        }));
        const { error: sectionsError } = await supabase.from('contest_sections').insert(sectionsToInsert);
        if (sectionsError) throw sectionsError;
        setSuccess('Contest created successfully!');
      }
      resetContestForm();
      fetchContests();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleContestEdit = async (contest) => {
    setContestFormData({
      exam_id: contest.exam_id,
      contest_number: contest.contest_number,
      title: contest.title,
      description: contest.description || '',
      start_time: convertToIST(contest.start_time),
      end_time: convertToIST(contest.end_time),
      duration_minutes: contest.duration_minutes,
      total_questions: contest.total_questions,
      total_marks: contest.total_marks,
      is_active: contest.is_active
    });
    if (contest.contest_sections && contest.contest_sections.length > 0) {
      setSections(contest.contest_sections.map(s => ({
        section_name: s.section_name,
        section_order: s.section_order,
        time_limit_minutes: s.time_limit_minutes || ''
      })));
    }
    setEditingContestId(contest.id);
    setError('');
    setSuccess('');
  };
  
  const handleContestDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this contest?')) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('contests').delete().eq('id', id);
      if (error) throw error;
      setSuccess('Contest deleted successfully!');
      fetchContests();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const resetContestForm = () => {
    setContestFormData({
      exam_id: '', contest_number: '', title: '', description: '',
      start_time: '', end_time: '', duration_minutes: '',
      total_questions: 0, total_marks: 0, is_active: true
    });
    setSections([{ section_name: '', section_order: 1, time_limit_minutes: '' }]);
    setEditingContestId(null);
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          exams(name, display_name, icon),
          contests(title, contest_number),
          contest_sections(section_name),
          question_options(*),
          question_solutions(*)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setQuestions(data || []);
      setFilteredQuestions(data || []);
      if (data && data.length > 0) {
        setSuccessMessage(`✅ ${data.length} questions loaded!`);
        setTimeout(() => setSuccessMessage(''), 2000);
      }
    } catch (err) {
      setError('Failed to load questions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchContestSections = async (contestId) => {
    if (!contestId) {
      setContestSections([]);
      return;
    }
    const { data } = await supabase
      .from('contest_sections')
      .select('*')
      .eq('contest_id', contestId)
      .order('section_order');
    if (data) setContestSections(data);
  };
  
  const toggleStep = (step) => {
    setCurrentStep(currentStep === step ? 0 : step);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'contest_id' && value) {
      fetchContestSections(value);
    }
  };
  
  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };
  
  const addOption = () => {
    const nextLabel = String.fromCharCode(65 + options.length);
    setOptions([...options, {
      id: null, // ✅ New option has no DB id
      option_label: nextLabel,
      option_text: '',
      option_image_url: '',
      is_correct: false,
      option_order: options.length,
      imagePreview: ''
    }]);
    console.log(`➕ Added option ${nextLabel}`);
  };
  
  const removeOption = (index) => {
    if (options.length <= 2) {
      alert('At least 2 options are required!');
      return;
    }
    
    const removedOption = options[index];
    
    // ✅ Remove option and reorder
    const updatedOptions = options
      .filter((_, i) => i !== index)
      .map((opt, i) => ({
        ...opt,
        option_order: i // ✅ Update order after removal
      }));
    
    setOptions(updatedOptions);
    
    console.log(`🗑️ Removed option ${removedOption.option_label} (DB ID: ${removedOption.id || 'new'})`);
    console.log(`📊 ${updatedOptions.length} options remaining`);
  };

  const handleQuestionSubmit = async (action = 'save') => {
    if (!formData.exam_id || !formData.subject || !formData.question_text) {
      setError('❌ Please fill required fields: Exam, Subject, Question Text');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
      
      const questionData = {
        ...formData,
        tags: tagsArray,
        contest_id: formData.contest_id || null,
        contest_section_id: formData.contest_section_id || null,
        question_number: formData.question_number ? parseInt(formData.question_number) : null,
        numerical_answer: formData.numerical_answer ? parseFloat(formData.numerical_answer) : null,
        numerical_tolerance: parseFloat(formData.numerical_tolerance)
      };
  
      let questionId;
      
      if (editingQuestionId) {
        // ✅ UPDATE EXISTING QUESTION
        console.log('Updating question:', editingQuestionId);
        
        const { error: qError } = await supabase
          .from('questions')
          .update(questionData)
          .eq('id', editingQuestionId);
        if (qError) throw qError;
        
        questionId = editingQuestionId;
        
        // ✅ CRITICAL: Delete old options and WAIT for completion
        console.log('🗑️ Deleting old options...');
        const { error: deleteError } = await supabase
          .from('question_options')
          .delete()
          .eq('question_id', editingQuestionId);
        
        if (deleteError) {
          console.error('❌ Delete failed:', deleteError);
          throw new Error('Failed to delete old options: ' + deleteError.message);
        }
        
        console.log('✅ Old options deleted successfully');
        
        // ✅ Wait a bit to ensure delete is propagated (important for Supabase)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Delete old solution ONLY if new solution provided
        if (solution.solution_text || solution.solution_image_url || solution.solution_video_url) {
          await supabase.from('question_solutions').delete().eq('question_id', editingQuestionId);
        }
        
        setSuccessMessage('✅ Question updated!');
      } else {
        // ✅ INSERT NEW QUESTION
        console.log('Creating new question');
        
        const { data: question, error: qError } = await supabase
          .from('questions')
          .insert(questionData)
          .select()
          .single();
        if (qError) throw qError;
        
        questionId = question.id;
        console.log('New question created with ID:', questionId);
        setSuccessMessage('✅ Question added!');
      }
  
      // ✅ INSERT OPTIONS (for MCQ/Multiple Correct)
      if (formData.question_type === 'mcq' || formData.question_type === 'multiple_correct') {
        const optionsData = options.map((opt, index) => ({
          question_id: questionId,
          option_label: String.fromCharCode(65 + index),
          option_text: opt.option_text || '',
          option_image_url: opt.option_image_url || null,
          is_correct: opt.is_correct || false,
          option_order: index
        }));
        
        console.log(`💾 Inserting ${optionsData.length} options for question ${questionId}`);
        
        const { error: optError } = await supabase
          .from('question_options')
          .insert(optionsData);
        
        if (optError) {
          console.error('❌ Options insert failed:', optError);
          throw new Error('Failed to insert options: ' + optError.message);
        }
        
        console.log(`✅ Inserted ${optionsData.length} options`);
      }
  
      // ✅ INSERT SOLUTION (if provided)
      if (solution.solution_text || solution.solution_image_url || solution.solution_video_url) {
        const { error: solError } = await supabase
          .from('question_solutions')
          .insert({ 
            question_id: questionId,
            solution_text: solution.solution_text || null,
            solution_image_url: solution.solution_image_url || null,
            solution_video_url: solution.solution_video_url || null
          });
        if (solError) {
          console.error('Solution insert error:', solError);
          throw solError;
        }
        console.log('✅ Solution inserted');
      }
  
      await fetchQuestions();
      await fetchSuggestions();
  
      if (action === 'save') {
        setTimeout(() => {
          resetQuestionForm();
        }, 2000);
      } else if (action === 'add_another') {
        setTimeout(() => {
          resetQuestionForm();
        }, 1500);
      }
    } catch (error) {
      setError('❌ Error: ' + error.message);
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };
  
const handleQuestionEdit = async (question) => {
  console.log('🔄 Editing question:', question.id);
  
  // ✅ CRITICAL: Set editing ID FIRST to prevent double-click issues
  if (editingQuestionId === question.id) {
    console.log('⚠️ Already editing this question, ignoring duplicate call');
    return;
  }
  
  // ✅ Clear everything immediately
  setEditingQuestionId(question.id); // Set THIS first to block duplicate calls
  setSuccessMessage('');
  setError('');
  setCurrentStep(1);
  
  // ✅ Load form data
  setFormData({
    exam_id: question.exam_id || '',
    subject: question.subject || '',
    chapter: question.chapter || '',
    topic: question.topic || '',
    contest_id: question.contest_id || '',
    contest_section_id: question.contest_section_id || '',
    question_number: question.question_number || '',
    question_text: question.question_text || '',
    question_image_url: question.question_image_url || '',
    question_type: question.question_type || 'mcq',
    difficulty: question.difficulty || 'medium',
    positive_marks: question.positive_marks || 4,
    negative_marks: question.negative_marks || 1,
    partial_marks: question.partial_marks || 0,
    numerical_answer: question.numerical_answer || '',
    numerical_tolerance: question.numerical_tolerance || 0.01,
    source: question.source || '',
    tags: Array.isArray(question.tags) ? question.tags.join(', ') : '',
    visibility: question.visibility || 'practice'
  });

  // ✅ CRITICAL FIX: Only load database options ONCE, freshly
  const dbOptions = question.question_options || [];
  console.log(`📥 Database has ${dbOptions.length} options`);
  
  if (dbOptions.length > 0) {
    const freshOptions = dbOptions
      .sort((a, b) => a.option_order - b.option_order)
      .slice(0, dbOptions.length) // ✅ Ensure we only take the actual options
      .map((opt, index) => ({
        id: null,
        option_label: String.fromCharCode(65 + index),
        option_text: opt.option_text || '',
        option_image_url: opt.option_image_url || '',
        is_correct: opt.is_correct || false,
        option_order: index,
        imagePreview: opt.option_image_url || ''
      }));
    
    setOptions(freshOptions);
    console.log(`✅ Set exactly ${freshOptions.length} options (A-${String.fromCharCode(64 + freshOptions.length)})`);
  } else {
    setOptions([
      { id: null, option_label: 'A', option_text: '', option_image_url: '', is_correct: false, option_order: 0, imagePreview: '' },
      { id: null, option_label: 'B', option_text: '', option_image_url: '', is_correct: false, option_order: 1, imagePreview: '' },
      { id: null, option_label: 'C', option_text: '', option_image_url: '', is_correct: false, option_order: 2, imagePreview: '' },
      { id: null, option_label: 'D', option_text: '', option_image_url: '', is_correct: false, option_order: 3, imagePreview: '' }
    ]);
    console.log('✅ Set default 4 options');
  }

  // ✅ Load solution
  if (question.question_solutions && question.question_solutions.length > 0) {
    const sol = question.question_solutions[0];
    setSolution({
      solution_text: sol.solution_text || '',
      solution_image_url: sol.solution_image_url || '',
      solution_video_url: sol.solution_video_url || ''
    });
    if (sol.solution_image_url) setSolutionImagePreview(sol.solution_image_url);
    if (sol.solution_video_url) setSolutionVideoName('Video uploaded');
  } else {
    setSolution({ solution_text: '', solution_image_url: '', solution_video_url: '' });
    setSolutionImagePreview('');
    setSolutionVideoName('');
  }

  if (question.question_image_url) setQuestionImagePreview(question.question_image_url);
  if (question.contest_id) await fetchContestSections(question.contest_id);

  window.scrollTo({ top: 0, behavior: 'smooth' });
  console.log('✅ Question loaded for editing');
};
  
  const handleQuestionDelete = async (id) => {
    if (!confirm('Delete this question?')) return;
    setLoading(true);
    try {
      await supabase.from('question_options').delete().eq('question_id', id);
      await supabase.from('question_solutions').delete().eq('question_id', id);
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
      setSuccessMessage('✅ Question deleted!');
      fetchQuestions();
    } catch (err) {
      setError('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const resetQuestionForm = () => {
    console.log('🔄 Resetting question form');
    
    setFormData({
      exam_id: '', subject: '', chapter: '', topic: '', contest_id: '',
      contest_section_id: '', question_number: '', question_text: '',
      question_image_url: '', question_type: 'mcq', difficulty: 'medium',
      positive_marks: 4, negative_marks: 1, partial_marks: 0,
      numerical_answer: '', numerical_tolerance: 0.01,
      source: '', tags: '', visibility: 'practice'
    });
    
    // ✅ Reset options with id: null
    setOptions([
      { id: null, option_label: 'A', option_text: '', option_image_url: '', is_correct: false, option_order: 0, imagePreview: '' },
      { id: null, option_label: 'B', option_text: '', option_image_url: '', is_correct: false, option_order: 1, imagePreview: '' },
      { id: null, option_label: 'C', option_text: '', option_image_url: '', is_correct: false, option_order: 2, imagePreview: '' },
      { id: null, option_label: 'D', option_text: '', option_image_url: '', is_correct: false, option_order: 3, imagePreview: '' }
    ]);
    
    setSolution({ solution_text: '', solution_image_url: '', solution_video_url: '' });
    setQuestionImagePreview('');
    setSolutionImagePreview('');
    setSolutionVideoName('');
    setEditingQuestionId(null);
    setSuccessMessage('');
    setError('');
    setCurrentStep(1);
  };
  

  const uploadToStorage = async (file, bucketName, folder = '') => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder ? folder + '/' : ''}${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, { cacheControl: '3600', upsert: false });
    
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(fileName);
    return publicUrl;
  };
  
  const handleQuestionImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file!');
      return;
    }
    setUploadingFiles(prev => ({ ...prev, questionImage: true }));
    try {
      const url = await uploadToStorage(file, 'question-images', 'questions');
      setFormData({ ...formData, question_image_url: url });
      setQuestionImagePreview(URL.createObjectURL(file));
      setSuccessMessage('✅ Question image uploaded!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      setError('❌ Upload failed: ' + error.message);
    } finally {
      setUploadingFiles(prev => ({ ...prev, questionImage: false }));
    }
  };
  
  const handleSolutionImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file!');
      return;
    }
    setUploadingFiles(prev => ({ ...prev, solutionImage: true }));
    try {
      const url = await uploadToStorage(file, 'question-images', 'solutions');
      setSolution({ ...solution, solution_image_url: url });
      setSolutionImagePreview(URL.createObjectURL(file));
      setSuccessMessage('✅ Solution image uploaded!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      setError('❌ Upload failed: ' + error.message);
    } finally {
      setUploadingFiles(prev => ({ ...prev, solutionImage: false }));
    }
  };
  
  const handleSolutionVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      alert('Please upload a video file!');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      alert('Video size should be less than 100MB');
      return;
    }
    setUploadingFiles(prev => ({ ...prev, solutionVideo: true }));
    try {
      const url = await uploadToStorage(file, 'solution-videos', 'videos');
      setSolution({ ...solution, solution_video_url: url });
      setSolutionVideoName(file.name);
      setSuccessMessage('✅ Solution video uploaded!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      setError('❌ Upload failed: ' + error.message);
    } finally {
      setUploadingFiles(prev => ({ ...prev, solutionVideo: false }));
    }
  };
  
  const handleOptionImageUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file!');
      return;
    }
    setUploadingFiles(prev => ({ ...prev, [`option_${index}`]: true }));
    try {
      const url = await uploadToStorage(file, 'question-images', 'options');
      const newOptions = [...options];
      newOptions[index].option_image_url = url;
      newOptions[index].imagePreview = URL.createObjectURL(file);
      setOptions(newOptions);
      setSuccessMessage('✅ Option image uploaded!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      setError('❌ Upload failed: ' + error.message);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [`option_${index}`]: false }));
    }
  };
  
  return (
    <AdminGuard>
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-[1800px] mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Side: Title and Subtext */}
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#5fa8c8] to-[#82c0d9] bg-clip-text text-transparent">
            ⚙️ Admin Panel
          </h1>
          <p className="text-gray-400">Manage exams, contests, and questions</p>
        </div>

        {/* Right Side: Logout Button */}
        <div className="flex items-center">
          <button 
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500/10 border border-red-500 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all font-semibold shadow-lg shadow-red-900/10"
          >
            Logout
          </button>
        </div>

      </div>
  
      {successMessage && (
        <div className="max-w-[1800px] mx-auto mb-4 bg-green-900/30 border border-green-700 rounded-lg p-4 text-green-300">
          {successMessage}
        </div>
      )}
  
      {error && (
        <div className="max-w-[1800px] mx-auto mb-4 bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300">
          {error}
        </div>
      )}
  
      {success && (
        <div className="max-w-[1800px] mx-auto mb-4 bg-green-900/30 border border-green-700 rounded-lg p-4 text-green-300">
          {success}
        </div>
      )}
  
      <div className="max-w-[1800px] mx-auto mb-6">
        <div className="flex gap-2 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'exams'
                ? 'bg-[#456b7f] text-white border-b-2 border-[#5fa8c8]'
                : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
            }`}
          >
            📚 Exams
          </button>
          <button
            onClick={() => setActiveTab('contests')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'contests'
                ? 'bg-[#456b7f] text-white border-b-2 border-[#5fa8c8]'
                : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
            }`}
          >
            🏆 Contests
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'questions'
                ? 'bg-[#456b7f] text-white border-b-2 border-[#5fa8c8]'
                : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
            }`}
          >
            ❓ Questions
          </button>
        </div>
      </div>
  
      <div className="max-w-[1800px] mx-auto">

      {activeTab === 'exams' && (
  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
    <div className="xl:col-span-2 bg-[#2a2a2a] rounded-lg p-6 border border-gray-700">
      <h2 className="text-white text-2xl font-bold mb-6">
        {editingExamId ? '✏️ Edit Exam' : '➕ Add New Exam'}
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-2 font-medium">Exam Name (Short Code) *</label>
          <input type="text" value={examFormData.name} onChange={(e) => setExamFormData({ ...examFormData, name: e.target.value })} placeholder="e.g., JEE, NEET, CAT" className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-gray-600 rounded text-white uppercase focus:outline-none focus:border-[#5fa8c8]" />
        </div>
        <div>
          <label className="block text-gray-300 mb-2 font-medium">Display Name *</label>
          <input type="text" value={examFormData.display_name} onChange={(e) => setExamFormData({ ...examFormData, display_name: e.target.value })} placeholder="e.g., Joint Entrance Examination" className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-gray-600 rounded text-white focus:outline-none focus:border-[#5fa8c8]" />
        </div>
        <div>
          <label className="block text-gray-300 mb-2 font-medium">Icon (Emoji)</label>
          <input type="text" value={examFormData.icon} onChange={(e) => setExamFormData({ ...examFormData, icon: e.target.value })} placeholder="📚" maxLength={2} className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-gray-600 rounded text-white text-2xl focus:outline-none focus:border-[#5fa8c8]" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="exam_is_active" checked={examFormData.is_active} onChange={(e) => setExamFormData({ ...examFormData, is_active: e.target.checked })} className="w-4 h-4" />
          <label htmlFor="exam_is_active" className="text-gray-300">Is Active</label>
        </div>
        <div className="flex gap-3 pt-4">
          <button onClick={() => handleExamSubmit(false)} disabled={loading} className="px-6 py-2.5 bg-[#5fa8c8] text-white font-medium rounded hover:bg-[#4a8aa8] disabled:bg-gray-600 transition">
            {loading ? 'Processing...' : editingExamId ? 'UPDATE EXAM' : 'ADD EXAM'}
          </button>
          {!editingExamId && (
            <button onClick={() => handleExamSubmit(true)} disabled={loading} className="px-6 py-2.5 bg-green-600 text-white font-medium rounded hover:bg-green-700 disabled:bg-gray-600 transition">Save & Add Another</button>
          )}
          {editingExamId && (
            <button onClick={cancelExamEdit} className="px-6 py-2.5 bg-gray-600 text-white font-medium rounded hover:bg-gray-700 transition">Cancel</button>
          )}
        </div>
      </div>
    </div>
    <div className="xl:col-span-1 bg-[#2a2a2a] rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-bold">All Exams</h2>
        <span className="bg-[#5fa8c8] text-white px-3 py-1 rounded-full text-sm font-semibold">{exams.length}</span>
      </div>
      {loading && exams.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5fa8c8] mx-auto mb-3"></div>
          Loading exams...
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-gray-400">No exams created yet.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4 hover:border-[#5fa8c8] transition">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{exam.icon}</span>
                    <h3 className="text-white font-semibold">{exam.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400">{exam.display_name}</p>
                  <div className="mt-2">
                    {exam.is_active ? (
                      <span className="text-xs px-2 py-1 rounded bg-green-900/40 text-green-300">✓ Active</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-400">Inactive</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700">
                <button onClick={() => handleExamEdit(exam)} className="flex-1 px-3 py-1.5 bg-[#5fa8c8] text-white text-xs rounded hover:bg-[#4a8aa8] transition">Edit</button>
                <button onClick={() => handleExamDelete(exam.id)} className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}

{activeTab === 'contests' && (
  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
    <div className="xl:col-span-2 bg-[#2a2a2a] rounded-lg p-6 border border-gray-700">
      <h2 className="text-white text-2xl font-bold mb-6">
        {editingContestId ? '✏️ Edit Contest' : '➕ Create New Contest'}
      </h2>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Select Exam *</label>
              <select name="exam_id" value={contestFormData.exam_id} onChange={handleContestInputChange} required className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-gray-600 rounded text-white focus:outline-none focus:border-[#5fa8c8]">
                <option value="">Choose an exam</option>
                {exams.map(e => (<option key={e.id} value={e.id}>{e.icon} {e.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Contest Number *</label>
              <input type="number" name="contest_number" value={contestFormData.contest_number} onChange={handleContestInputChange} placeholder="e.g., 1, 2, 3" min="1" required className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-gray-600 rounded text-white focus:outline-none focus:border-[#5fa8c8]" />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Contest Title *</label>
            <input type="text" name="title" value={contestFormData.title} onChange={handleContestInputChange} placeholder="e.g., JEE Advanced Mock Test 1" required className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-gray-600 rounded text-white focus:outline-none focus:border-[#5fa8c8]" />
          </div>
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Description</label>
            <textarea name="description" value={contestFormData.description} onChange={handleContestInputChange} rows={3} placeholder="Brief description..." className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-gray-600 rounded text-white focus:outline-none focus:border-[#5fa8c8]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Start Time (IST) *</label>
              <input type="datetime-local" name="start_time" value={contestFormData.start_time} onChange={handleContestInputChange} required className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-gray-600 rounded text-white focus:outline-none focus:border-[#5fa8c8]" />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-medium">End Time (IST) *</label>
              <input type="datetime-local" name="end_time" value={contestFormData.end_time} onChange={handleContestInputChange} required className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-gray-600 rounded text-white focus:outline-none focus:border-[#5fa8c8]" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Duration (minutes) *</label>
              <input type="number" name="duration_minutes" value={contestFormData.duration_minutes} onChange={handleContestInputChange} placeholder="180" min="1" required className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-gray-600 rounded text-white focus:outline-none focus:border-[#5fa8c8]" />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Total Questions</label>
              <input type="number" name="total_questions" value={contestFormData.total_questions} onChange={handleContestInputChange} placeholder="0" min="0" className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-gray-600 rounded text-white focus:outline-none focus:border-[#5fa8c8]" />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Total Marks</label>
              <input type="number" name="total_marks" value={contestFormData.total_marks} onChange={handleContestInputChange} placeholder="0" min="0" className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-gray-600 rounded text-white focus:outline-none focus:border-[#5fa8c8]" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="contest_is_active" name="is_active" checked={contestFormData.is_active} onChange={handleContestInputChange} className="w-4 h-4" />
            <label htmlFor="contest_is_active" className="text-gray-300">Is Active</label>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-700 pb-2">
            <h3 className="text-[#5fa8c8] font-semibold text-lg">📝 Test Sections</h3>
            <button onClick={addSection} className="px-4 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition">+ Add Section</button>
          </div>
          <div className="space-y-3">
            {sections.map((section, index) => (
              <div key={index} className="bg-[#1a1a1a] border border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-[#5fa8c8] text-white px-2 py-1 rounded text-xs font-bold">ORDER #{section.section_order}</span>
                  {sections.length > 1 && (
                    <button onClick={() => removeSection(index)} className="text-red-400 hover:text-red-300 text-sm">🗑️ Remove</button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-gray-400 mb-1.5 text-sm">Section Name *</label>
                    <input type="text" value={section.section_name} onChange={(e) => handleSectionChange(index, 'section_name', e.target.value)} placeholder="e.g., Physics" required className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-[#5fa8c8]" />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1.5 text-sm">Timer (minutes)</label>
                    <input type="number" value={section.time_limit_minutes} onChange={(e) => handleSectionChange(index, 'time_limit_minutes', e.target.value)} placeholder="60" min="1" className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-[#5fa8c8]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-4 border-t border-gray-700">
          <button onClick={handleContestSubmit} disabled={loading} className="px-6 py-2.5 bg-[#5fa8c8] text-white font-medium rounded hover:bg-[#4a8aa8] disabled:bg-gray-600 transition">
            {loading ? 'Processing...' : editingContestId ? 'UPDATE CONTEST' : 'CREATE CONTEST'}
          </button>
          {editingContestId && (
            <button onClick={resetContestForm} className="px-6 py-2.5 bg-gray-600 text-white font-medium rounded hover:bg-gray-700 transition">Cancel</button>
          )}
        </div>
      </div>
    </div>
    <div className="xl:col-span-1 bg-[#2a2a2a] rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-bold">All Contests</h2>
        <span className="bg-[#5fa8c8] text-white px-3 py-1 rounded-full text-sm font-semibold">{contests.length}</span>
      </div>
      {loading && contests.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5fa8c8] mx-auto mb-3"></div>
          Loading contests...
        </div>
      ) : contests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🏆</div>
          <p className="text-gray-400">No contests created yet.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
          {contests.map((contest) => (
            <div key={contest.id} className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4 hover:border-[#5fa8c8] transition">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-500 bg-gray-800 px-2 py-0.5 rounded">#{contest.contest_number}</span>
                    {contest.is_active ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-900/40 text-green-300">✓ Active</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-400">Inactive</span>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1">{contest.title}</h3>
                  <p className="text-xs text-gray-400 mb-2">{contest.exams?.icon} {contest.exams?.name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span>⏱️ {contest.duration_minutes} min</span>
                    {contest.total_questions > 0 && <span>📝 {contest.total_questions} Q</span>}
                  </div>
                  {contest.contest_sections && contest.contest_sections.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Sections:</p>
                      <div className="flex flex-wrap gap-1">
                        {contest.contest_sections.sort((a, b) => a.section_order - b.section_order).map((sec) => (
                          <span key={sec.id} className="text-xs bg-[#456b7f] text-white px-2 py-0.5 rounded">#{sec.section_order} {sec.section_name}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700">
                <button onClick={() => handleContestEdit(contest)} className="flex-1 px-3 py-1.5 bg-[#5fa8c8] text-white text-xs rounded hover:bg-[#4a8aa8] transition">Edit</button>
                <button onClick={() => handleContestDelete(contest.id)} className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}

{activeTab === 'questions' && (
  <div className="space-y-6">
    <div className="bg-[#2a2a2a] rounded-lg p-6 border border-gray-700">
      <h2 className="text-white text-2xl font-bold">
        {editingQuestionId ? '✏️ Edit Question' : '➕ Add New Question'}
      </h2>
      {editingQuestionId && (
        <div className="mt-2 flex items-center gap-2">
          <span className="bg-yellow-900/40 text-yellow-300 px-3 py-1 rounded text-sm">⚠️ Editing Mode</span>
          <button onClick={resetQuestionForm} className="text-sm text-gray-400 hover:text-white">Cancel & Add New Instead</button>
        </div>
      )}
    </div>

    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button onClick={() => toggleStep(1)} className="w-full bg-[#456b7f] px-6 py-3 flex items-center justify-between text-left">
        <span className="font-semibold text-white">📚 Step 1: Basic Information</span>
        <span className="text-white transform transition-transform" style={{transform: currentStep === 1 ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span>
      </button>
      {currentStep === 1 && (
        <div className="bg-[#2a2a2a] p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-gray-300">Exam *</label>
              <select name="exam_id" value={formData.exam_id} onChange={handleChange} required className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white">
                <option value="">Select Exam</option>
                {exams.map(e => (<option key={e.id} value={e.id}>{e.icon} {e.name}</option>))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm mb-2 text-gray-300">Subject *</label>
              <input type="text" name="subject" value={formData.subject} onChange={handleChange} list="subject-list" required placeholder="🔍 Type or select subject" className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white" />
              <datalist id="subject-list">
                {subjectSuggestions.map((sub, i) => (<option key={i} value={sub} />))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-300">Chapter</label>
              <input type="text" name="chapter" value={formData.chapter} onChange={handleChange} list="chapter-list" placeholder="🔍 Type or select chapter" className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white" />
              <datalist id="chapter-list">
                {chapterSuggestions.map((chap, i) => (<option key={i} value={chap} />))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-300">Topic</label>
              <input type="text" name="topic" value={formData.topic} onChange={handleChange} list="topic-list" placeholder="🔍 Type or select topic" className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white" />
              <datalist id="topic-list">
                {topicSuggestions.map((top, i) => (<option key={i} value={top} />))}
              </datalist>
            </div>
          </div>
        </div>
      )}
    </div>

    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button onClick={() => toggleStep(2)} className="w-full bg-[#456b7f] px-6 py-3 flex items-center justify-between text-left">
        <span className="font-semibold text-white">🏆 Step 2: Contest Integration (Optional)</span>
        <span className="text-white transform transition-transform" style={{transform: currentStep === 2 ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span>
      </button>
      {currentStep === 2 && (
        <div className="bg-[#2a2a2a] p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-2 text-gray-300">Contest</label>
              <select name="contest_id" value={formData.contest_id} onChange={handleChange} className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white">
                <option value="">None</option>
                {contests.map(c => (<option key={c.id} value={c.id}>{c.title}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-300">Section</label>
              <select name="contest_section_id" value={formData.contest_section_id} onChange={handleChange} disabled={!formData.contest_id} className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white disabled:opacity-50">
                <option value="">None</option>
                {contestSections.map(s => (<option key={s.id} value={s.id}>{s.section_name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-300">Question Number</label>
              <input type="number" name="question_number" value={formData.question_number} onChange={handleChange} placeholder="1" min="1" className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white" />
            </div>
          </div>
        </div>
      )}
    </div>

    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button onClick={() => toggleStep(3)} className="w-full bg-[#456b7f] px-6 py-3 flex items-center justify-between text-left">
        <span className="font-semibold text-white">❓ Step 3: Question Content</span>
        <span className="text-white transform transition-transform" style={{transform: currentStep === 3 ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span>
      </button>
      {currentStep === 3 && (
        <div className="bg-[#2a2a2a] p-6 space-y-4">
          <div>
            <label className="block text-sm mb-2 text-gray-300">Question text *</label>
            <textarea name="question_text" value={formData.question_text} onChange={handleChange} required rows={4} placeholder="Use $x^2$ for inline math" className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 font-mono text-sm text-white" />
          </div>
          <div>
            <label className="block text-sm mb-2 text-gray-300">Question image:</label>
            <input type="file" accept="image/*" onChange={handleQuestionImageUpload} disabled={uploadingFiles.questionImage} className="text-sm text-gray-300" />
            {uploadingFiles.questionImage && <p className="text-xs text-yellow-400 mt-1">⏳ Uploading...</p>}
            {questionImagePreview && (
              <div className="mt-2"><img src={questionImagePreview} alt="Question" className="max-w-xs h-auto rounded border border-gray-700" /></div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-gray-300">Question type *</label>
              <select name="question_type" value={formData.question_type} onChange={handleChange} className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white">
                <option value="mcq">MCQ</option>
                <option value="multiple_correct">Multiple Correct</option>
                <option value="numerical">Numerical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-300">Difficulty *</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>

    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button onClick={() => toggleStep(4)} className="w-full bg-[#456b7f] px-6 py-3 flex items-center justify-between text-left">
        <span className="font-semibold text-white">📊 Step 4: Marks</span>
        <span className="text-white transform transition-transform" style={{transform: currentStep === 4 ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span>
      </button>
      {currentStep === 4 && (
        <div className="bg-[#2a2a2a] p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-2 text-gray-300">Correct marks (+4 default)</label>
              <input type="number" name="positive_marks" value={formData.positive_marks} onChange={handleChange} step="0.01" min="0" placeholder="+4" className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white" />
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-300">Wrong marks (−1 default)</label>
              <input type="number" name="negative_marks" value={formData.negative_marks} onChange={handleChange} step="0.01" max="0" placeholder="−1" className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white" />
            </div>
            {formData.question_type === 'numerical' && (
              <div>
                <label className="block text-sm mb-2 text-gray-300">Numerical answer *</label>
                <input type="number" name="numerical_answer" value={formData.numerical_answer} onChange={handleChange} step="0.0001" className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>

    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button onClick={() => toggleStep(5)} className="w-full bg-[#456b7f] px-6 py-3 flex items-center justify-between text-left">
        <span className="font-semibold text-white">🏷️ Step 5: Source & Tags</span>
        <span className="text-white transform transition-transform" style={{transform: currentStep === 5 ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span>
      </button>
      {currentStep === 5 && (
        <div className="bg-[#2a2a2a] p-6 space-y-4">
          <div>
            <label className="block text-sm mb-2 text-gray-300">Source <span className="text-xs text-gray-500">(e.g., JEE 2023)</span></label>
            <input type="text" name="source" value={formData.source} onChange={handleChange} placeholder="Enter source" className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-sm mb-2 text-gray-300">Tags <span className="text-xs text-gray-500">(comma separated)</span></label>
            <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="tag1, tag2, tag3" className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-sm mb-2 text-gray-300">Visibility</label>
            <select name="visibility" value={formData.visibility} onChange={handleChange} className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 text-white">
              <option value="practice">Practice</option>
              <option value="contest_only">Contest Only</option>
              <option value="hidden">Hidden</option>
              <option value="contest+practice">Contest + Practice (live & previous)</option>
              <option value="practice_after_contest">Practice (after contest)</option>
            </select>
          </div>
        </div>
      )}
    </div>

    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button onClick={() => toggleStep(6)} className="w-full bg-[#456b7f] px-6 py-3 flex items-center justify-between text-left">
        <span className="font-semibold text-white">💡 Step 6: Solution (Optional)</span>
        <span className="text-white transform transition-transform" style={{transform: currentStep === 6 ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span>
      </button>
      {currentStep === 6 && (
        <div className="bg-[#2a2a2a] p-6 space-y-4">
          <div>
            <label className="block text-sm mb-2 text-gray-300">Solution text</label>
            <textarea value={solution.solution_text} onChange={(e) => setSolution({...solution, solution_text: e.target.value})} rows={6} placeholder="Explain the solution" className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-3 py-2 font-mono text-sm text-white" />
          </div>
          <div>
            <label className="block text-sm mb-2 text-gray-300">Solution image</label>
            <input type="file" accept="image/*" onChange={handleSolutionImageUpload} disabled={uploadingFiles.solutionImage} className="block w-full text-sm text-gray-300" />
            {uploadingFiles.solutionImage && (
              <div className="mt-2 flex items-center gap-2 text-yellow-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                <span className="text-xs">Uploading...</span>
              </div>
            )}
            {solutionImagePreview && (
              <div className="mt-3"><img src={solutionImagePreview} alt="Solution" className="max-w-md h-auto rounded border border-gray-700" /></div>
            )}
          </div>
          <div>
            <label className="block text-sm mb-2 text-gray-300">Solution video</label>
            <input type="file" accept="video/*" onChange={handleSolutionVideoUpload} disabled={uploadingFiles.solutionVideo} className="block w-full text-sm text-gray-300" />
            <p className="text-xs text-gray-500 mt-1">📹 Max size: 100MB</p>
            {uploadingFiles.solutionVideo && (
              <div className="mt-2 flex items-center gap-2 text-yellow-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                <span className="text-xs">Uploading video...</span>
              </div>
            )}
            {solutionVideoName && (
              <div className="mt-2 flex items-center gap-2 text-green-400 bg-green-900/20 px-3 py-2 rounded">
                <span className="text-xl">🎥</span>
                <div>
                  <p className="text-xs font-semibold">✅ Video uploaded!</p>
                  <p className="text-xs text-gray-400">{solutionVideoName}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>

    {(formData.question_type === 'mcq' || formData.question_type === 'multiple_correct') && (
      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-[#456b7f] px-6 py-3">
          <span className="font-semibold text-white">✓ QUESTION OPTIONS</span>
        </div>
        <div className="bg-[#2a2a2a] p-6 space-y-4">
        {options.map((opt, idx) => (
            <div key={opt.id || `new-${idx}`} className="border border-gray-600 rounded p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 font-medium">Option {opt.option_label}</span>
                {options.length > 2 && (
                  <button onClick={() => removeOption(idx)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                )}
              </div>
              <textarea value={opt.option_text} onChange={(e) => handleOptionChange(idx, 'option_text', e.target.value)} rows={2} placeholder="Option text" className="w-full bg-[#1a1a1a] border border-gray-600 rounded px-2 py-2 text-sm font-mono text-white" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={opt.is_correct} onChange={(e) => handleOptionChange(idx, 'is_correct', e.target.checked)} className="w-4 h-4" />
                  <label className="text-gray-300 text-sm">Correct Answer</label>
                </div>
                <input type="file" accept="image/*" onChange={(e) => handleOptionImageUpload(e, idx)} disabled={uploadingFiles[`option_${idx}`]} className="text-xs text-gray-400" />
              </div>
              {opt.imagePreview && (
                <img src={opt.imagePreview} alt="Option" className="w-32 h-32 object-cover rounded mt-1" />
              )}
            </div>
          ))}
          <button onClick={addOption} className="text-green-400 text-sm hover:text-green-300">+ Add another option</button>
        </div>
      </div>
    )}

    <div className="bg-[#2a2a2a] rounded-lg p-6 border border-gray-700">
      <div className="flex gap-4">
        <button onClick={() => handleQuestionSubmit('save')} disabled={loading} className="bg-[#5fa8c8] hover:bg-[#4a8aa8] px-6 py-2.5 rounded disabled:opacity-50 text-white font-medium">
          {loading ? 'SAVING...' : editingQuestionId ? 'UPDATE QUESTION' : 'SAVE QUESTION'}
        </button>
        <button onClick={() => handleQuestionSubmit('add_another')} disabled={loading} className="bg-green-600 hover:bg-green-700 px-6 py-2.5 rounded disabled:opacity-50 text-white font-medium">Save & Add Another</button>
        {editingQuestionId && (
          <button onClick={resetQuestionForm} className="bg-gray-600 hover:bg-gray-700 px-6 py-2.5 rounded text-white font-medium">Cancel Edit</button>
        )}
      </div>
    </div>

    <div className="bg-[#2a2a2a] rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-2xl font-bold">📋 All Questions</h2>
        <div className="flex items-center gap-3">
          <span className="bg-[#5fa8c8] text-white px-3 py-1 rounded-full text-sm font-semibold">{filteredQuestions.length} of {questions.length}</span>
          {editingQuestionId && (
            <button onClick={resetQuestionForm} className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">Cancel Edit</button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <input type="text" placeholder="🔍 Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-[#5fa8c8]" />
        <select value={filterExam} onChange={(e) => setFilterExam(e.target.value)} className="px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded text-white text-sm">
          <option value="">All Exams</option>
          {exams.map(e => (<option key={e.id} value={e.id}>{e.icon} {e.name}</option>))}
        </select>
        <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded text-white text-sm">
          <option value="">All Subjects</option>
          {uniqueSubjects.map(sub => (<option key={sub} value={sub}>{sub}</option>))}
        </select>
      </div>
      {loading && questions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5fa8c8] mx-auto mb-3"></div>
          Loading questions...
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">❓</div>
          <p className="text-gray-400">{questions.length === 0 ? 'No questions added yet.' : 'No questions match your filters.'}</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
          {filteredQuestions.map((question, index) => (
            <div key={question.id} className={`bg-[#1a1a1a] border rounded-lg p-5 transition ${editingQuestionId === question.id ? 'border-[#5fa8c8] ring-2 ring-[#5fa8c8]/30' : 'border-gray-700 hover:border-gray-600'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="bg-[#456b7f] text-white px-3 py-1 rounded font-bold text-sm">#{index + 1}</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">{question.exams?.icon} {question.exams?.name}</span>
                    <span className="text-xs bg-purple-900/40 text-purple-300 px-2 py-1 rounded">{question.subject}</span>
                    {question.chapter && (<span className="text-xs bg-blue-900/40 text-blue-300 px-2 py-1 rounded">{question.chapter}</span>)}
                    <span className={`text-xs px-2 py-1 rounded ${question.difficulty === 'easy' ? 'bg-green-900/40 text-green-300' : question.difficulty === 'medium' ? 'bg-yellow-900/40 text-yellow-300' : 'bg-orange-900/40 text-orange-300'}`}>{question.difficulty}</span>
                    <span className={`text-xs px-2 py-1 rounded ${question.question_type === 'mcq' ? 'bg-teal-900/40 text-teal-300' : question.question_type === 'numerical' ? 'bg-indigo-900/40 text-indigo-300' : 'bg-pink-900/40 text-pink-300'}`}>{question.question_type.toUpperCase()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleQuestionEdit(question)} className="px-4 py-1.5 bg-[#5fa8c8] text-white text-sm rounded hover:bg-[#4a8aa8] transition">✏️ Edit</button>
                  <button onClick={() => handleQuestionDelete(question.id)} className="px-4 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition">🗑️ Delete</button>
                </div>
              </div>
              <div className="mb-3">
                <p className="text-white text-sm leading-relaxed">{question.question_text.substring(0, 200)}{question.question_text.length > 200 && '...'}</p>
              </div>
              {question.question_image_url && (
                <div className="mb-3"><img src={question.question_image_url} alt="Question" className="w-32 h-32 object-cover rounded border border-gray-700" /></div>
              )}
              {question.question_options && question.question_options.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-2">Options:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {question.question_options.slice(0, 4).map((opt) => (
                      <div key={opt.id} className={`text-xs px-3 py-2 rounded ${opt.is_correct ? 'bg-green-900/40 border border-green-700 text-green-300' : 'bg-gray-800 border border-gray-700 text-gray-400'}`}>
                        <span className="font-bold">{opt.option_label})</span> {opt.option_text.substring(0, 40)}{opt.option_text.length > 40 && '...'}{opt.is_correct && <span className="ml-2">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {question.question_type === 'numerical' && question.numerical_answer && (
                <div className="mb-3">
                  <span className="text-xs bg-green-900/40 text-green-300 px-3 py-1 rounded">Answer: {question.numerical_answer}</span>
                </div>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-700">
                <span>+{question.positive_marks} / -{question.negative_marks} marks</span>
                {question.source && <span>📚 {question.source}</span>}
                {question.contests && (<span>🏆 {question.contests.title}</span>)}
                {question.contest_sections && (<span>📝 {question.contest_sections.section_name}</span>)}
                {question.question_solutions && question.question_solutions.length > 0 && (<span className="text-green-400">✓ Solution Added</span>)}
                <span className="ml-auto">{new Date(question.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}
</div>
</div>
</AdminGuard>
);
}

