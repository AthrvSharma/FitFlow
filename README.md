# FitFlow

> AI-powered fitness platform for training, nutrition, recovery, and accountability.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)

## Overview

FitFlow combines:

- adaptive workout planning
- macro-aware nutrition coaching
- mood and recovery intelligence
- social accountability

The app ships as a **React + Vite frontend** with a **Node/Express + MongoDB backend**, including authentication, personalized plan generation, and AI integrations.

## Core Features

- Personalized onboarding that captures goals, body metrics, equipment, dietary preferences, and lifestyle context
- AI Coach chat endpoint for contextual fitness guidance using your recent activity
- 7-day AI meal plan generation with grocery list and macro/cost details
- Personalized plan engine with mood-aware adaptation
- Groq Vision-powered food recognition + macro estimation for meal logging workflows
- Full auth flow (`register`, `login`, `me`, `profile`) with JWT
- Demo-friendly local fallback data so UI remains useful even when APIs are unavailable

## Tech Stack

- Frontend: React 18, Vite, TypeScript, TailwindCSS, Framer Motion
- Backend: Express, Mongoose, JWT, bcrypt
- Data: MongoDB
- Integrations: OpenAI, Groq (chat + vision), xAI Grok, optional external workout/exercise APIs

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Set at least:

- `MONGODB_URI`
- `JWT_SECRET`
- `VITE_API_URL` (default is usually fine for local)
- `AI_PROVIDER=groq`
- `GROQ_API_KEY=<your key from console.groq.com>`
- `USE_OPENAI=true`

### 3. Run full project (frontend + backend)

```bash
npm run dev:full
```

Open:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Deployment Readiness

Current status: **ready for free-tier deployment** with this setup:

- App (frontend + backend together): Render Web Service (free)
- Database: MongoDB Atlas M0 (free)
- Optional split setup: Vercel (frontend) + Render (backend)

What is already handled:

- Dedicated API health endpoint: `GET /api/health`
- CORS allowlist with multiple origins and regex support
- Runtime startup script for backend: `npm run start:server`
- Optional single-service mode to serve frontend from Express (`SERVE_FRONTEND=true`)

## Environment Variables

### Required

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for signing auth tokens

### Core App

- `VITE_API_URL`: Backend API URL (default `http://localhost:4000/api`)
- `PORT`: Backend port (default `4000`)
- `CLIENT_ORIGIN`: Allowed frontend origin (default `http://localhost:5173`)
- `CLIENT_ORIGINS`: Comma-separated extra allowed origins
- `CLIENT_ORIGIN_REGEX`: Comma-separated regex patterns for allowed origins (useful for preview URLs)
- `SERVE_FRONTEND`: `true` to serve built frontend from backend service

### AI Provider Selection

- `USE_OPENAI`: AI usage override (`false` forces local heuristic fallback; `true` forces remote AI if keys exist)
- `AI_PROVIDER`: `openai` (default), `groq`, or `grok`

#### OpenAI

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (default `gpt-4o-mini`)
- `OPENAI_BASE_URL` (default `https://api.openai.com/v1`)

#### Groq (console.groq.com)

- `GROQ_API_KEY`
- `GROQ_MODEL` (default `llama-3.3-70b-versatile`)
- `GROQ_BASE_URL` (default `https://api.groq.com/openai/v1`)
- `GROQ_VISION_MODEL` (default `meta-llama/llama-4-scout-17b-16e-instruct`)
- `GROQ_VISION_MIN_FOOD_CONFIDENCE` (default `0.45`)
- `GROQ_VISION_MAX_TOKENS` (default `900`)
- `GROQ_VISION_TEMPERATURE` (default `0.1`)

#### Grok (xAI)

- `XAI_API_KEY`
- `XAI_MODEL` (default `grok-3-mini-latest`)
- `XAI_BASE_URL` (default `https://api.x.ai/v1`)

### Optional Integrations

- `WORKOUT_PLANNER_API_URL`, `WORKOUT_PLANNER_API_KEY`
- `EXERCISES_API_URL`, `EXERCISES_API_KEY`

Note: the meal scanner now uses your existing `GROQ_API_KEY` (no separate scanner key required).

## NPM Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start frontend (Vite) |
| `npm run dev:server` | Start backend API |
| `npm run dev:full` | Start frontend + backend together |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Type-check project (`tsc --noEmit`) |

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`

### AI and Personalization

- `POST /api/ai/coach`
- `POST /api/ai/meal-plan`
- `GET /api/personalization`
- `POST /api/personalization/generate`
- `POST /api/personalization/intake`
- `POST /api/personalization/nutrition/adjust`
- `GET /api/mood`
- `POST /api/mood`
- `POST /api/nutrition/recognize`

## Project Structure

```text
FitFlow/
├── src/                  # React frontend app
├── server/               # Express backend + business logic
├── dist/                 # Production build output
├── .env.example          # Environment template
├── package.json
└── README.md
```

## Troubleshooting

- `EADDRINUSE` on ports `4000` or `5173`:

```bash
lsof -ti:4000 -ti:5173 | xargs kill -9
```

- Backend fails with Mongo error:
  - Verify `MONGODB_URI`
  - Ensure your MongoDB network access/credentials are valid

- AI responses fallback to heuristic mode:
  - Check `AI_PROVIDER`
  - Ensure matching API key exists (`OPENAI_API_KEY`, `GROQ_API_KEY`, or `XAI_API_KEY`)
  - Confirm `USE_OPENAI` is not set to `false`

## Deployment Options

### Option 1 (Recommended Free): Single Render Service + Atlas Free DB

This gives one public URL for your whole app:

- Frontend served by Express
- Backend API on same Render service
- MongoDB hosted on Atlas free tier

#### 1. Create MongoDB Atlas free cluster

- Create an Atlas `M0` cluster (free).
- Create DB user and password.
- In Network Access, allow Render access (for quick start: `0.0.0.0/0`).
- Copy connection string as `MONGODB_URI`.

#### 2. Deploy on Render

- Push repo to GitHub.
- In Render, create a new Web Service from this repo.
- Render can use `render.yaml`, or set manually:
  - Build command: `npm install && npm run build:client`
  - Start command: `SERVE_FRONTEND=true npm run start:server`
  - Health check path: `/api/health`

#### 3. Set Render environment variables

- `MONGODB_URI=<atlas_connection_string>`
- `JWT_SECRET=<long_random_secret>`
- `SERVE_FRONTEND=true`
- `VITE_API_URL=/api`
- `AI_PROVIDER=groq`
- `USE_OPENAI=true`
- `GROQ_API_KEY=<your_groq_key>`
- `CLIENT_ORIGIN_REGEX=^https://.*\\.onrender\\.com$`

Optional:

- `GROQ_MODEL=llama-3.3-70b-versatile`
- `GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct`

#### 4. Verify production

- Open your Render URL.
- Check `https://<your-render-domain>/api/health` returns `{"status":"ok"}`.
- Test auth, AI coach, meal planner, and meal scanner.

Note: Render free web services can sleep on inactivity, so the first request may be slow.

### Option 2 (Free): Vercel Frontend + Render Backend + Atlas

Use this if you want separate frontend/backend deploys:

- Backend on Render Web Service (`npm run start:server`)
- Frontend on Vercel (`npm run build:client`, output `dist`)
- MongoDB on Atlas free tier

## Roadmap

- Persist more frontend sample entities fully on backend
- Add automated test coverage for API and critical UI flows
- Add production deployment guides (frontend + backend)
- Expand analytics and long-term trend insights
