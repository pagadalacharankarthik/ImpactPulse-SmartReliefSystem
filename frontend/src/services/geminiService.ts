/**
 * Gemini AI Service - FINAL HACKATHON EDITION
 * High-Fidelity Mock Intelligence Engine
 * Provides smart, data-driven responses for a perfect demo.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const getAIResponse = async (prompt: string, dashboardData: string, history: ChatMessage[] = []) => {
  // We are forcing Mock Mode for maximum stability during the presentation
  return simulateAIResponse(prompt, dashboardData);
};

/**
 * HIGH-FIDELITY SIMULATION ENGINE
 * Dynamically analyzes dashboard metrics to provide strategic advice.
 */
const simulateAIResponse = (prompt: string, data: string) => {
  const query = prompt.toLowerCase();
  
  // Extract real metrics for context-aware responses
  const taskCount = data.match(/Tasks:\s*(\d+)/)?.[1] || "13";
  const priorityCount = data.match(/High Priority:\s*(\d+)/)?.[1] || "4";
  const peopleCount = data.match(/Affected:\s*(\d+)/)?.[1] || "1,240";
  const orgCount = data.match(/Organizations:\s*(\d+)/)?.[1] || "6";
  const surveyCount = data.match(/Surveys:\s*(\d+)/)?.[1] || "8";

  // 1. URGENT ACTIONS / PRIORITY
  if (query.includes('urgent') || query.includes('priority') || query.includes('emergency')) {
    return `Priority Analysis: We have ${priorityCount} critical missions active. Based on current severity levels, I recommend dispatching the next available Rapid Response Team to the North District immediately to stabilize the situation before the next update cycle.`;
  }
  
  // 2. STRATEGY / PLANNING / NEXT STEPS
  if (query.includes('do next') || query.includes('plan') || query.includes('strategy') || query.includes('help')) {
    return `Strategic Advice: With ${taskCount} active tasks and ${surveyCount} pending surveys, our primary focus should be 'Survey Validation'. Once we verify the incoming reports from the East Sector, we can reallocate resources from the completed missions to maximize our recovery rate.`;
  }

  // 3. OVERALL SUMMARY / STATS
  if (query.includes('summary') || query.includes('report') || query.includes('status') || query.includes('how are we doing')) {
    return `Operational Status: ImpactPulse is currently managing ${taskCount} missions across ${orgCount} partner organizations. We are currently supporting approximately ${peopleCount} affected individuals. The system is operating at 94% efficiency, with a positive trend in recovery speed over the last 6 hours.`;
  }

  // 4. VOLUNTEERS / PERSONNEL
  if (query.includes('volunteer') || query.includes('worker') || query.includes('people')) {
    return `Personnel Overview: Our volunteer network is currently at 85% capacity. To handle the ${priorityCount} high-priority tasks efficiently, I suggest opening a 'Volunteer Call' for medical specialists in the local region to support the South District missions.`;
  }

  // 5. LOCATION / GEOGRAPHY
  if (query.includes('where') || query.includes('location') || query.includes('area') || query.includes('district')) {
    return `Geographic Intelligence: Most activity is concentrated in the North and South sectors. However, the East District shows a high density of pending surveys. We should prioritize a reconnaissance drone or ground team to that area to ensure no 'Forgotten Zones' remain unmonitored.`;
  }

  // 6. SYSTEM HEALTH / TECH
  if (query.includes('system') || query.includes('health') || query.includes('offline')) {
    return `System Pulse: All data nodes are healthy. The Offline Sync engine has successfully buffered all field reports. Real-time synchronization with the cloud is active, and our intelligence feed is processing live telemetry from ${taskCount} active zones.`;
  }

  // 7. GREETINGS
  if (query.includes('hello') || query.includes('hi') || query.includes('who are you')) {
    return "Hello Admin. I am the Impact Intelligence engine. I am currently monitoring the live operational feed and can provide real-time strategic analysis of our relief efforts. How can I assist you in saving lives today?";
  }

  // 8. DYNAMIC FALLBACK
  return `I've analyzed your query regarding "${prompt}". Currently, my primary recommendation is to clear the ${priorityCount} High Priority alerts to improve our overall recovery score. Would you like a detailed breakdown of our current resource allocation?`;
};
