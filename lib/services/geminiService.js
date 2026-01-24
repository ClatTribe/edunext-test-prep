import { GoogleGenerativeAI } from '@google/genai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);

export const generateQuestions = async (topic, difficulty, count) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Generate ${count} multiple choice questions on "${topic}" 
    with ${difficulty} difficulty level. 
    Return in JSON format:
    [
      {
        "question": "Question text",
        "options": ["A", "B", "C", "D"],
        "correct": 0,
        "explanation": "Why this is correct"
      }
    ]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
};

export const analyzePerformance = async (results) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Analyze this exam performance and provide insights:
    ${JSON.stringify(results)}
    
    Provide:
    1. Strengths
    2. Weaknesses
    3. Recommendations`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing performance:', error);
    throw error;
  }
};