# Planna System - Complete Installation Guide

## Project Structure

```
C:\Users\davem\Downloads\Planna
├── backend/
│   ├── db/
│   │   ├── schema.sql
│   │   ├── init_db.js
│   │   └── planna.db (created after init)
│   ├── package.json
│   ├── server.js
│   ├── ai_trigger.py
│   └── Dockerfile
├── ai/
│   ├── .venv/ (created after setup)
│   ├── requirements.txt
│   ├── app.py
│   ├── predictor.py
│   └── Dockerfile
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── context/
│   │   │   └── AppContext.js
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── Calendar.js
│   │   │   └── BookingWizard.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   ├── Dockerfile
│   └── .gitignore
├── docker-compose.yml
├── .dockerignore
├── .gitignore
├── README.md
└── DEPLOYMENT.md
```

## Option A: Docker Compose (Recommended - Simplest)

### Port Configuration
- **Frontend**: 5000 (exposed), 3000 (internal)
- **Backend**: 3001 (exposed and internal)
- **AI Service**: 8000 (exposed and internal)

*(Frontend and backend use different ports to avoid conflicts)*

### Prerequisites
- Docker Desktop installed and running
- Windows PowerShell or Command Prompt

### Installation Steps

#### Step 1: Navigate to Project Root
```powershell
cd C:\Users\davem\Downloads\Planna
```

#### Step 2: Build and Start All Services
```powershell
docker-compose up -d
```

**Output:**
```
Creating planna-backend ... done
Creating planna-ai ... done
Creating planna-frontend ... done
```

#### Step 3: Verify Services Are Running
```powershell
docker ps
```

**You should see 3 containers:**
- `planna-backend` (port 3000)
- `planna-ai` (port 8000)
- `planna-frontend` (port 5000)

#### Step 4: Access the Application
- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:3001
- **AI Service**: http://localhost:8000

#### Step 5: Test the System
```powershell
# Create a test booking
Invoke-RestMethod -Method Post -Uri 'http://localhost:3001/api/bookings' `
  -ContentType 'application/json' `
  -Body (@{event_date='2026-03-25'; type='Wedding'; client_id=99; guests=100; price=150} | ConvertTo-Json)

# View bookings
Invoke-RestMethod -Uri 'http://localhost:3001/api/bookings'

# View analytics/predictions
Invoke-RestMethod -Uri 'http://localhost:3001/api/analytics'
```

#### Step 6: Stop All Services
```powershell
docker-compose down
```

---

## Option B: Local Development Setup

### Prerequisites
- Node.js 18+ installed
- Python 3.10+ installed
- npm installed
- curl or Invoke-RestMethod available

### Installation Steps

#### Step 1: Initialize Database

```powershell
cd C:\Users\davem\Downloads\Planna\backend
node db\init_db.js
```

**Output:**
```
Initialized database at C:\Users\davem\Downloads\Planna\backend\db\planna.db
```

**Files created:**
- `C:\Users\davem\Downloads\Planna\backend\db\planna.db` (SQLite database)

#### Step 2: Install and Start Backend Server

##### Terminal 1: Backend
```powershell
cd C:\Users\davem\Downloads\Planna\backend

# Install dependencies
npm install

# Verify installation
npm list express sqlite3 socket.io

# Start server
npm start
```

**Output:**
```
Planna backend listening on 3001
```

**Backend running at:**
- API: http://localhost:3001
- WebSocket: ws://localhost:3001 (Socket.IO)

#### Step 3: Install and Start AI Service

##### Terminal 2: AI Service
```powershell
cd C:\Users\davem\Downloads\Planna\ai

# Create virtual environment
py -m venv .venv

# Activate virtual environment
.venv\Scripts\Activate

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Verify installation
pip list

# Start AI service
.venv\Scripts\python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

**Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

**AI Service running at:**
- API: http://localhost:8000
- Docs: http://localhost:8000/docs (Swagger UI)

#### Step 4: Install and Start Frontend

##### Terminal 3: Frontend
```powershell
cd C:\Users\davem\Downloads\Planna\frontend

# Install dependencies
npm install

# Verify installation
npm list react recharts socket.io-client

# Start development server
npm start
```

**Output:**
```
Compiled successfully!

You can now view planna-frontend in the browser.
  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

**Frontend running at:**
- http://localhost:3000 (proxied to backend)

### Step 5: Test Full System (All Services Running)

```powershell
# Terminal 4: Test Commands

# Create a booking
Write-Host "Creating booking..."
$booking = @{
  event_date = '2026-03-25'
  type = 'Wedding'
  client_id = 99
  guests = 100
  price = 150
}
Invoke-RestMethod -Method Post `
  -Uri 'http://localhost:3000/api/bookings' `
  -ContentType 'application/json' `
  -Body ($booking | ConvertTo-Json)

# Wait for AI processing
Start-Sleep -Seconds 2

# Fetch all bookings
Write-Host "`nFetching bookings..."
Invoke-RestMethod -Uri 'http://localhost:3000/api/bookings' | ConvertTo-Json

# Fetch AI predictions
Write-Host "`nFetching analytics..."
Invoke-RestMethod -Uri 'http://localhost:3000/api/analytics' | ConvertTo-Json
```

### Step 6: View Logs and Debug

```powershell
# Backend logs (Terminal 1 - already running)
# Shows all API calls and Socket.IO connections

# AI Service logs (Terminal 2 - already running)
# Shows prediction computations and DB access

# Frontend logs (Terminal 3 console)
# Shows React render cycles and Socket.IO events

# Check database content
cd C:\Users\davem\Downloads\Planna\backend\db
sqlite3 planna.db "SELECT * FROM Events LIMIT 5;"
```

---

## Dependency Installation Breakdown

### Backend Dependencies (Node.js)

**Location:** `C:\Users\davem\Downloads\Planna\backend`

```powershell
cd C:\Users\davem\Downloads\Planna\backend

# Install all backend packages
npm install

# Installed packages:
# - express@^4.18.2          (REST API framework)
# - sqlite3@^5.1.6           (Database driver)
# - socket.io@^4.7.0         (Real-time WebSocket)
```

**package.json location:** `C:\Users\davem\Downloads\Planna\backend\package.json`

### AI Service Dependencies (Python)

**Location:** `C:\Users\davem\Downloads\Planna\ai`

```powershell
cd C:\Users\davem\Downloads\Planna\ai

# Create and activate virtual environment
py -m venv .venv
.venv\Scripts\Activate

# Install all AI packages
pip install -r requirements.txt

# Installed packages:
# - fastapi              (API framework)
# - uvicorn              (ASGI server)
# - scikit-learn         (Machine learning)
# - pandas               (Data processing)
# - requests             (HTTP client)
```

**requirements.txt location:** `C:\Users\davem\Downloads\Planna\ai\requirements.txt`
**Virtual environment location:** `C:\Users\davem\Downloads\Planna\ai\.venv`

### Frontend Dependencies (Node.js React)

**Location:** `C:\Users\davem\Downloads\Planna\frontend`

```powershell
cd C:\Users\davem\Downloads\Planna\frontend

# Install all frontend packages
npm install

# Installed packages:
# - react@^18.2.0        (UI library)
# - react-dom@^18.2.0    (React DOM)
# - recharts@^2.10.0     (Charts library)
# - axios@^1.6.0         (HTTP client)
# - socket.io-client@^4.7.0  (WebSocket client)
```

**package.json location:** `C:\Users\davem\Downloads\Planna\frontend\package.json`

---

## Database Files

**Database Location:** `C:\Users\davem\Downloads\Planna\backend\db\planna.db`

### Database Schema

**Tables created:**
```
Users
├── id (INTEGER PRIMARY KEY)
├── email (TEXT UNIQUE)
├── password_hash (TEXT)
├── name (TEXT)
└── role (TEXT)

Events
├── id (INTEGER PRIMARY KEY)
├── event_date (DATE)
├── type (TEXT)
├── client_id (INTEGER FK)
├── guests (INTEGER)
├── price (REAL)
├── status (TEXT)
├── event_total (REAL)
└── created_at (DATETIME)

Financials
├── id (INTEGER PRIMARY KEY)
├── event_id (INTEGER FK UNIQUE)
├── amount (REAL)
└── recorded_at (DATETIME)

Analytics
├── id (INTEGER PRIMARY KEY)
├── metric_date (DATE)
├── predicted_income (REAL)
├── confidence_score (REAL)
└── updated_at (DATETIME)

Indexes
├── idx_events_date
└── idx_events_client
```

**Schema file:** `C:\Users\davem\Downloads\Planna\backend\db\schema.sql`

---

## Environment Variables (Optional)

Create `.env` in project root: `C:\Users\davem\Downloads\Planna\.env`

```plaintext
NODE_ENV=development
PORT=3000
DATABASE_URL=./db/planna.db
AI_SERVICE_URL=http://localhost:8000
REACT_APP_API_URL=http://localhost:3000
```

---

## Common Commands Reference

### Backend
```powershell
# Development
cd C:\Users\davem\Downloads\Planna\backend
npm start

# Install dependencies
npm install

# Run tests (if added)
npm test
```

### AI Service
```powershell
# Development
cd C:\Users\davem\Downloads\Planna\ai
.venv\Scripts\Activate
uvicorn app:app --reload --port 8000

# Production
uvicorn app:app --host 0.0.0.0 --port 8000
```

### Frontend
```powershell
# Development
cd C:\Users\davem\Downloads\Planna\frontend
npm start

# Build for production
npm run build

# Production serve
serve -s build -l 3000
```

### Database Management
```powershell
# Backup database
Copy-Item C:\Users\davem\Downloads\Planna\backend\db\planna.db `
  -Destination "C:\Users\davem\Downloads\Planna\backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').db"

# Query database
cd C:\Users\davem\Downloads\Planna\backend\db
sqlite3 planna.db

# View all tables
sqlite3 planna.db ".tables"

# View bookings
sqlite3 planna.db "SELECT * FROM Events;"

# View analytics
sqlite3 planna.db "SELECT * FROM Analytics;"
```

---

## Troubleshooting

### Port Already in Use
```powershell
# Find process using port 3000
Get-NetTCPConnection -LocalPort 3000 | Get-Process

# Kill process
Get-Process -Name node | Stop-Process -Force

# Or use different port
$env:PORT=3001
npm start
```

### Python Not Found
```powershell
# Verify Python installation
py --version

# Or use full path
C:\Users\davem\AppData\Local\Programs\Python\Python314\python.exe -m venv .venv
```

### npm Permission Denied
```powershell
# Run PowerShell as Administrator
# Then retry npm install
npm install
```

### Socket.IO Connection Issues
- Ensure backend is running on port 3000
- Check frontend proxy in `package.json`: `"proxy": "http://localhost:3000"`
- Clear browser cache and reload

### AI Service Not Responding
- Verify FastAPI is running: http://localhost:8000/docs
- Check AI service logs in Terminal 2
- Ensure port 8000 is not blocked

---

## Full System Test Command Chain

```powershell
# Run all these in separate terminals

# Terminal 1: Backend
cd C:\Users\davem\Downloads\Planna\backend
npm install
npm start

# Terminal 2: AI Service
cd C:\Users\davem\Downloads\Planna\ai
.venv\Scripts\Activate
pip install -r requirements.txt
uvicorn app:app --port 8000 --reload

# Terminal 3: Frontend
cd C:\Users\davem\Downloads\Planna\frontend
npm install
npm start

# Terminal 4: Test
cd C:\Users\davem\Downloads\Planna

# Wait 30 seconds for all services to start
Start-Sleep -Seconds 30

# Create test booking
Invoke-RestMethod -Method Post -Uri 'http://localhost:3001/api/bookings' `
  -ContentType 'application/json' `
  -Body (@{event_date='2026-04-01'; type='Wedding'; client_id=123; guests=150; price=200} | ConvertTo-Json)

# Verify booking was created
Invoke-RestMethod -Uri 'http://localhost:3001/api/bookings'

# Verify AI prediction was generated
Invoke-RestMethod -Uri 'http://localhost:3001/api/analytics'

# Open frontend
Start-Process http://localhost:3000
```

---

## Production Deployment

### Using Docker Compose

**Location:** `C:\Users\davem\Downloads\Planna\docker-compose.yml`

```powershell
cd C:\Users\davem\Downloads\Planna

# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Docker Files:**
- Backend: `C:\Users\davem\Downloads\Planna\backend\Dockerfile`
- AI: `C:\Users\davem\Downloads\Planna\ai\Dockerfile`
- Frontend: `C:\Users\davem\Downloads\Planna\frontend\Dockerfile`

**Deployment Guide:** `C:\Users\davem\Downloads\Planna\DEPLOYMENT.md`

---

## Support Files

**Documentation:**
- `C:\Users\davem\Downloads\Planna\README.md` - Overview
- `C:\Users\davem\Downloads\Planna\DEPLOYMENT.md` - Production deployment
- `C:\Users\davem\Downloads\Planna\.gitignore` - Git ignore rules
- `C:\Users\davem\Downloads\Planna\.dockerignore` - Docker ignore rules

**All Complete!** 🎉
