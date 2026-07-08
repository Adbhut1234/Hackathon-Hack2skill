# People's Priorities — AI for Constituency Development Planning

Built for the Hack2skill hackathon.

## The Problem

MPs receive development requests through public meetings, letters, social media, grievance portals, and direct representations — while local development plans contain dozens of competing proposed projects. There's no objective way to consolidate citizen feedback, spot recurring needs, and weigh competing proposals against real demand.

## What This Does

A multilingual platform where citizens submit development suggestions in plain language, and an AI dashboard for the MP's office that turns those raw submissions into a ranked, explainable priority list.

- **Citizen Portal** — Submit a development request or grievance in any language (Hindi, Hinglish, English, etc.). No forms to fill out — just describe the issue.
- **AI Intake** — Every submission is analyzed live by Gemini: language is detected, the text is translated to English, and it's auto-classified into a category (Water & Drainage, Roads, Electricity, Sanitation, etc.) with a priority level.
- **MP Dashboard** — A live map of where requests are coming from, a real-time feed of incoming submissions, and an **AI Priority Engine** that ranks categories by actual demand (submission volume + share of high-priority reports) — not a fixed list.
- **AI Synthesis** — Click into any ranked item and Gemini generates a short, specific explanation of why that category deserves priority, grounded in the actual submissions received.

## How the Ranking Works

Instead of a hardcoded priority list, the dashboard groups all live citizen submissions by category and scores each one:

```
confidence = (volume relative to the busiest category) × 70%
           + (share of submissions marked High priority) × 30%
           + base offset
```

This means the ranking updates automatically as new submissions come in — submit a few "Water & Drainage" complaints on the Citizen Portal and watch it move up the dashboard in real time.

## Tech Stack

- React + Vite + Tailwind CSS
- Leaflet / react-leaflet for the live constituency map
- Framer Motion for UI transitions
- **Google Gemini API** (`gemini-2.5-flash`) for language detection, translation, classification, and reasoning synthesis

## Running Locally

```bash
npm install
cp .env.example .env   # add your Gemini API key
npm run dev
```

Get a free Gemini API key at https://aistudio.google.com/apikey.

> Note: the API key is called directly from the browser for this hackathon prototype. In a production deployment this would move behind a backend proxy so the key is never exposed client-side.

## What's Next

- Voice and photo submission (buttons are scaffolded in the UI)
- Integration with WhatsApp / SMS for low-connectivity access
- Overlaying real demographic and infrastructure-gap datasets (enrollment numbers, travel-distance to nearest school, etc.) so rankings weigh citizen demand against objective need
- Persistent backend/database instead of in-memory session state
- Clustering near-duplicate submissions across languages into a single "theme" rather than one-to-one category tagging
