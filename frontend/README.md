# Planna Frontend

React + Tailwind CSS + Recharts UI for Planna event management system.

## Components

- **Dashboard**: Analytics with AI predictions and KPI cards
- **Smart Calendar**: Interactive month view with busy-ness indicators
- **Booking Wizard**: Multi-step form with real-time conflict checking

## Quick Start

From `frontend/`:

```bash
npm install
npm start
```

Runs on http://localhost:3000 (configured to proxy backend on :3000 as well).

## Features

- Real-time conflict detection when booking dates
- Predicted vs actual income charts
- Confidence score display for AI predictions
- Responsive Tailwind design
- Socket.IO ready (for real-time updates)
