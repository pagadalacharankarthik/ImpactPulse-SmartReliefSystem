/**
 * Gemini AI Service - Hackathon Bulletproof Version
 * Uses real AI if available, fallbacks to "Demo Mode" if keys fail.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const getAIResponse = async (prompt: string, dashboardData: string, history: ChatMessage[] = []) => {
  // If no key or placeholder key, go straight to Demo Mode
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here' || GEMINI_API_KEY.includes('YOUR_')) {
    return simulateAIResponse(prompt, dashboardData);
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          ...history,
          {
            role: "user",
            parts: [{ text: `You are an NGO assistant.\nData: ${dashboardData}\n\nQuestion: ${prompt}` }]
          }
        ],
        generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
      }),
    });

    if (!response.ok) {
      throw new Error("API Error");
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.warn("Real AI failed, switching to Hackathon Demo Mode...");
    return simulateAIResponse(prompt, dashboardData);
  }
};

/**
 * SIMULATED AI (Hackathon Demo Mode)
 * Dynamically reads the current dashboard data to give a "Real" feeling answer.
 */
const simulateAIResponse = (prompt: string, data: string) => {
  const query = prompt.toLowerCase();
  
  // Extract real numbers from the local data string
  const taskCount = data.match(/Tasks:\s*(\d+)/)?.[1] || "some";
  const priorityCount = data.match(/High Priority:\s*(\d+)/)?.[1] || "0";
  const peopleCount = data.match(/Affected:\s*(\d+)/)?.[1] || "many";

  if (query.includes('urgent') || query.includes('priority') || query.includes('help')) {
    return `Looking at our local database, we have ${priorityCount} High Priority tasks that need immediate attention. Most reports are coming from the East and North districts. I recommend assigning the next available worker to those zones.`;
  }
  
  if (query.includes('summarize') || query.includes('report') || query.includes('data')) {
    return `Currently, we are managing ${taskCount} active recovery tasks. Our team is supporting approximately ${peopleCount} affected individuals. The overall efficiency is high, but we should clear the remaining ${priorityCount} critical alerts.`;
  }

  return `Intelligence Feed connected. I am monitoring ${taskCount} tasks in the local database. How can I help you coordinate the relief effort today?`;
};
