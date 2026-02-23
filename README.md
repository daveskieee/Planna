# Planna (scaffold)

This workspace contains a complete scaffold for the Planna system: backend (Node/Express), AI service (FastAPI), DB init, and a React frontend with Tailwind & Recharts. Real-time updates via Socket.IO and containerized with Docker.

## Quick Start: Docker Compose (Recommended)

From repo root:

```bash
docker-compose up -d
```

- Frontend: http://localhost:5000
- Backend: http://localhost:3000
- AI Service: http://localhost:8000

All data persists in `backend/db/planna.db`.

## Quick Start: Local Development

### 1. Initialize Database

```bash
node backend/db/init_db.js
```

### 2. Start Backend Server

```bash
cd backend
npm install
npm start
```

Backend runs on http://localhost:3000

### 3. Start AI Service

```bash
cd ai
py -m venv .venv
.venv\Scripts\Activate
pip install -r requirements.txt
.venv\Scripts\python -m uvicorn app:app --port 8000
```

AI service runs on http://localhost:8000

### 4. Start React Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on http://localhost:3000, proxied to backend

## Architecture

- **Backend**: Node.js/Express with SQLite — validates bookings, calculates event_total, triggers AI
- **AI**: FastAPI Python service — reads DB, runs predictive models, writes Analytics
- **Frontend**: React + Tailwind — dashboard, calendar, booking wizard
- **DB**: SQLite (planna.db) — Users, Events, Financials, Analytics tables
- **Real-time**: Socket.IO connects frontend to backend for instant analytics updates

## Features

✅ Event booking with real-time conflict detection
✅ AI-powered income prediction with confidence scores
✅ Interactive smart calendar with busy-ness visualization
✅ Analytics dashboard with predicted vs actual income
✅ Socket.IO real-time updates to charts
✅ Fully containerized with Docker Compose
✅ Production-ready HTTP-based AI integration
