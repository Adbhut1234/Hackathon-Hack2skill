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
 * Deep Clustering: Analyze a list of raw complaints, enriched with Demographic/Infra-Gap data, 
 * and group them into specific actionable themes.
 */
export async function generateThemes(complaints) {
  if (!complaints || complaints.length === 0) return [];
  
  const complaintList = complaints
    .slice(0, 50) // limit to avoid massive context for hackathon demo
    .map(c => `ID:${c.id} | Zone:${c.infraZone} (InfraGap:${c.infraGapScore}/100) | Priority:${c.priority} | Text:${c.translation}`)
    .join('\n');

  const prompt = `You are an AI planning assistant for an Indian MP's office.
Analyze the following list of citizen submissions. Each submission includes the Zone it originated from and that Zone's "InfraGap" score (0-100, where 100 means severe lack of existing infrastructure/schools/hospitals).

Your task is to cluster these submissions into 3 to 5 highly specific, actionable development themes (e.g., "Sector 4 Severe Waterlogging", "South-East Outskirts Clinic Construction").
CRITICAL INSTRUCTION: You MUST heavily weigh the "InfraGap" score when determining the final Confidence Score for a theme. A theme with few complaints but a massive InfraGap score (e.g., 92/100) should rank higher than a theme with many complaints in a well-served area (e.g., 30/100).

Submissions:
${complaintList}

Respond with ONLY a raw JSON array of objects (no markdown fences) where each object has:
{
  "id": "unique-theme-id",
  "name": "Specific Theme Name",
  "category": "One of the broad categories (e.g. Water & Drainage, Electricity)",
  "confidenceScore": "A number from 0 to 100 heavily weighting the InfraGap score of the affected zones alongside submission volume/urgency",
  "complaintIds": ["array of complaint IDs that belong to this theme"],
  "reasoning": "Short synthesis (max 40 words) explaining the priority, explicitly calling out how the demographic/infrastructure gap data justifies the rank."
}`;

  return callGemini(prompt);
}
