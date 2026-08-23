import { Lead, UserConfig } from '../types';

export interface AiLeadAnalysis {
  intentScore: number; // 0 - 100
  intentLabel: '🔥 High Intent (Ready to Swap)' | '⚡ Medium Intent' | '💬 General Dev Discussion';
  extractedLinks: {
    optInLink?: string;
    groupLink?: string;
  };
  summary: string;
  suggestedAction: string;
}

// Generate Personalized AI Reply using Gemini API (or Smart Prompt Generator)
export async function generateAiPersonalizedReply(
  lead: Lead, 
  config: UserConfig, 
  apiKey?: string
): Promise<string> {
  const userAppLink = config.myAppLink || 'https://play.google.com/apps/testing/com.yourapp';
  const userGroupLink = config.myGroupLink || 'https://groups.google.com/g/your-testers-group';

  // If Gemini API Key is provided, use live Gemini AI model
  const key = apiKey || config.geminiApiKey || process.env.VITE_GEMINI_API_KEY;

  if (key) {
    try {
      const prompt = `You are a helpful Android app developer reaching out to another developer on Reddit/Twitter to participate in a 14-day closed testing opt-in swap on Google Play.

Post Title: "${lead.title}"
Post Content: "${lead.content.substring(0, 500)}"
Author: "${lead.author}"
Platform: "${lead.platform}"

My App Join Link: "${userAppLink}"
My Google Group Link: "${userGroupLink}"

Task: Write a concise, friendly, high-converting reply (under 80 words). Mention their specific app context from their post, offer to test their app for the full 14 days, and provide my opt-in links. Keep the tone warm, authentic, and professional. Do not sound like a spam bot.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          return text.trim();
        }
      }
    } catch (err) {
      console.warn('Gemini API call error, falling back to smart prompt engine:', err);
    }
  }

  // Fallback Smart Rule-Based AI Personalizer Engine
  const titleLower = lead.title.toLowerCase();
  let appTopic = 'your app';
  if (titleLower.includes('tracker')) appTopic = 'your tracker app';
  else if (titleLower.includes('game')) appTopic = 'your game';
  else if (titleLower.includes('tool') || titleLower.includes('utility')) appTopic = 'your utility tool';
  else if (titleLower.includes('finance') || titleLower.includes('calculator')) appTopic = 'your finance app';

  return `Hi u/${lead.author}! I saw your post about ${appTopic} and closed testing. I would love to test your app for the full 14 days!

Here are my testing links:
📲 Opt-In Link: ${userAppLink}
👥 Google Group: ${userGroupLink}

Drop your links below or DM me, and I'll opt in right away and send you a screenshot! Let's swap test! 🚀`;
}

// Analyze Lead Intent & Extract Info
export function analyzeLeadIntent(lead: Lead): AiLeadAnalysis {
  const text = (lead.title + ' ' + lead.content).toLowerCase();

  // Extract play store links
  const playLinkMatch = /(https:\/\/play\.google\.com\/apps\/testing\/[^\s"<]+)/i.exec(lead.content);
  const groupLinkMatch = /(https:\/\/groups\.google\.com\/g\/[^\s"<]+)/i.exec(lead.content);

  let score = 50;
  if (text.includes('test 4 test') || text.includes('test for test') || text.includes('swap')) score += 25;
  if (text.includes('12 testers') || text.includes('20 testers') || text.includes('need testers')) score += 20;
  if (playLinkMatch || groupLinkMatch) score += 15;
  if (score > 98) score = 98;

  let intentLabel: AiLeadAnalysis['intentLabel'] = '💬 General Dev Discussion';
  if (score >= 80) intentLabel = '🔥 High Intent (Ready to Swap)';
  else if (score >= 60) intentLabel = '⚡ Medium Intent';

  return {
    intentScore: score,
    intentLabel,
    extractedLinks: {
      optInLink: playLinkMatch ? playLinkMatch[1] : undefined,
      groupLink: groupLinkMatch ? groupLinkMatch[1] : undefined
    },
    summary: lead.title,
    suggestedAction: score >= 80 ? 'Click Reply & Swap immediately' : 'Check post details'
  };
}
