import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const solveDoubt = async (question: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an elite JEE Physics/Maths mentor. Provide a concise, step-by-step hint to solve this problem, focusing on the core concept. Do not give the full final numerical answer immediately, guide the student. Keep it under 100 words. Tone: Professional, Encouraging, Sharp. Question: ${question}`,
    });
    return response.text || "Could not generate a response.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Our AI servers are currently experiencing heavy traffic from aspirants. Please try again in a moment.";
  }
};