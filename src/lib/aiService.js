// Gemini-powered AI service for the constituency platform.
// Handles: language detection + translation, category/priority classification,
// and generating human-readable "why this matters" reasoning for the ranking table.

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing VITE_GEMINI_API_KEY. Add it to a .env file at the project root.');
  }

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned an empty response.');

  return JSON.parse(text);
}

/**
 * Analyze a raw citizen submission (any language / Hinglish / English).
 * Returns { language, translation, category, priority, priorityReason }.
 */
export async function analyzeComplaint(rawText) {
  const prompt = `You are the AI intake system for an Indian Member of Parliament's constituency development platform. A citizen submitted the following development request or grievance. It may be written in English, a regional Indian language, or Hinglish.

Submission:
"""${rawText}"""

Respond with ONLY a raw JSON object (no markdown fences, no commentary) with exactly these fields:
{
  "language": "name of the detected language, e.g. Hindi, English, Hinglish, Bengali, Urdu",
  "translation": "clear English translation/rewrite of the submission",
  "category": "pick exactly one: Water & Drainage, Road Infrastructure, Electricity, Sanitation, Public Transport, Healthcare, Education, General",
  "priority": "pick exactly one: High, Medium, Low",
  "priorityReason": "max 20 words explaining the priority level, referencing urgency/safety/scale"
}`;

  return callGemini(prompt);
}

/**
 * Given a category and the list of complaints in it, synthesize a short
 * "why this deserves priority" reasoning string for the AI Priority Engine table.
 */
export async function synthesizeProjectReasoning(category, complaints) {
  const complaintList = complaints
    .slice(0, 15)
    .map((c) => `- ${c.translation}`)
    .join('\n');

  const prompt = `You are an AI planning assistant for an Indian MP's office, helping rank development proposals against real citizen demand.

Category: "${category}"
Number of citizen submissions in this category: ${complaints.length}
Sample of submissions:
${complaintList}

Write a short synthesis (2-3 sentences, max 60 words) explaining why this category deserves priority investment right now, referencing the recurring pattern you see in the submissions. Be specific and concrete, not generic.

Respond with ONLY a raw JSON object (no markdown fences): {"reasoning": "..."}`;

  return callGemini(prompt);
}

/**
 * Deep Clustering: Analyze a list of raw complaints and group them into specific actionable themes.
 */
export async function generateThemes(complaints) {
  if (!complaints || complaints.length === 0) return [];
  
  const complaintList = complaints
    .slice(0, 50) // limit to avoid massive context for hackathon demo
    .map(c => `ID:${c.id} | Priority:${c.priority} | Text:${c.translation}`)
    .join('\n');

  const prompt = `You are an AI planning assistant for an Indian MP's office.
Analyze the following list of citizen submissions and cluster them into 3 to 5 highly specific, actionable development themes (e.g., "Sector 4 Severe Waterlogging", "Main Road Streetlight Outages", "Primary School Roof Repairs").

Do not just use generic categories. Find the actual recurring specific issues.

Submissions:
${complaintList}

Respond with ONLY a raw JSON array of objects (no markdown fences) where each object has:
{
  "id": "unique-theme-id",
  "name": "Specific Theme Name",
  "category": "One of the broad categories (e.g. Water & Drainage, Electricity)",
  "confidenceScore": "A number from 0 to 100 based on urgency and volume of the grouped submissions",
  "complaintIds": ["array of complaint IDs that belong to this theme"],
  "reasoning": "Short synthesis (max 30 words) of why this specific theme is a priority based on the matched submissions."
}`;

  return callGemini(prompt);
}
