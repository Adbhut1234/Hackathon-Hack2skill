# JanAwaz — People's Voice for Constituency Development

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
- **Appwrite** (Cloud or self-hosted) for Database, Storage (photo attachments), and Real-time WebSocket subscriptions

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Add your Google Gemini API key and Appwrite endpoints (see instructions below).
3. Start the dev server:
   ```bash
   npm run dev
   ```

## Setting up Appwrite Backend

The app has a built-in fallback. If Appwrite variables are not configured in `.env`, it will automatically boot in **Local Mode** using LocalStorage so the app doesn't crash. 

To enable the live database, real-time sync, and file storage:
1. Create a project in the [Appwrite Console](https://cloud.appwrite.io).
2. Create a Database named `ConstituencyDB`.
3. Create a Collection named `Complaints` with the following attributes:
   - `lat` (Double, Required)
   - `lng` (Double, Required)
   - `category` (String, Size 50, Required)
   - `translation` (String, Size 1000, Required)
   - `originalText` (String, Size 1000, Required)
   - `language` (String, Size 50, Required)
   - `priority` (String, Size 20, Required)
   - `priorityReason` (String, Size 500, Required)
   - `date` (String, Size 100, Required)
   - `status` (String, Size 50, Required)
   - `source` (String, Size 50, Required)
   - `photo` (String, Size 2000, Optional)
4. Set the Collection permissions to **Any** (Create, Read) so that clients can make requests without authentication.
5. Create a Storage Bucket named `complaint-photos` and set its update permissions to **Any** (Create, Read).
6. Fill in the credentials in your `.env` file and restart Vite. You will see "Appwrite Live" appear in the navigation bar!

## What's Next

- Voice and photo submission (buttons are scaffolded in the UI)
- Integration with WhatsApp / SMS for low-connectivity access
- Overlaying real demographic and infrastructure-gap datasets (enrollment numbers, travel-distance to nearest school, etc.) so rankings weigh citizen demand against objective need
- Persistent backend/database instead of in-memory session state
- Clustering near-duplicate submissions across languages into a single "theme" rather than one-to-one category tagging
