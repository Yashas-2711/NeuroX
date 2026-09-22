# NeuroX — Societal Innovation Collaboration Platform

**SIH Problem Statement:** 26043

NeuroX is a local-AI-powered platform for collecting societal challenges, validating them, matching them with universities and industries, and managing innovation projects and impact evidence.

## Current status

Steps 1–20 are implemented and Step 22 final testing, security, and documentation checks passed. Step 21 is the live SIH demo and end-to-end integration milestone.

Implemented capabilities include authentication/RBAC, Citizen and Student submission, local BERT-Tiny classification, MiniLM embeddings, Admin validation, Problem DNA, Challenge Passport, notifications, University and Industry matching, projects, teams, milestones, solutions, Impact Twin, Dead Problem Revival, communication, and role-scoped analytics.

AI inference remains local. No OpenAI, Gemini, Claude, Groq, OpenRouter, or hosted inference APIs are used.

## Architecture

```text
frontend/  Next.js + React + TypeScript + Tailwind + shadcn/ui
backend/   Node.js + Express + TypeScript + MongoDB/Mongoose
ai/        Python + FastAPI + local BERT-Tiny + MiniLM
```

```text
Challenge → Local AI → Admin validation → Matching → Collaboration
          → Project → Team → Milestones → Solutions → Impact evidence
```

## Main routes

- Citizen: `/citizen`, `/citizen/problems`, `/citizen/problems/new`
- Student: `/student`, `/student/teams`
- University: `/university`, `/university/profile`, `/university/problems`, `/university/projects`
- Industry: `/industry`, `/industry/profile`, `/industry/opportunities`, `/industry/collaborations`
- Admin: `/admin`, `/admin/analytics`, `/admin/revival`
- Shared: `/login`, `/register`, `/notifications`

Backend groups include `/api/auth`, `/api/problems`, `/api/admin/problems`, `/api/university`, `/api/university/projects`, `/api/industry`, `/api/student/teams`, `/api/notifications`, `/api/analytics`, `/api/revival`, and `/api/projects/:id/messages`.

## Quick start

Prerequisites: Node.js 22+, Python 3.13+, and MongoDB configured in `backend/.env`. Keep real secrets in ignored `.env` files only.

```powershell
cd "P:\NeuroX — Societal Innovation Collaboration Platform\ai"
& ".\.venv\Scripts\Activate.ps1"
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

```powershell
cd "P:\NeuroX — Societal Innovation Collaboration Platform\backend"
npm.cmd run dev
```

```powershell
cd "P:\NeuroX — Societal Innovation Collaboration Platform\frontend"
npm.cmd run dev
```

Open `http://localhost:3000`. See [docs/SIH_DEMO_GUIDE.md](docs/SIH_DEMO_GUIDE.md) for the live sequence.

## Verification

```powershell
cd backend
npm.cmd run type-check
npm.cmd run build
npm.cmd run test:step14
npm.cmd run test:step15
npm.cmd run test:step16
npm.cmd run test:step17
npm.cmd run test:step18
npm.cmd run test:step19
npm.cmd run test:step20

cd ..\frontend
npm.cmd run lint
npm.cmd run type-check
npm.cmd run build

cd ..\ai
& ".\.venv\Scripts\python.exe" -m unittest discover -s tests -v
```

Runtime scripts use isolated timestamped databases and print `STEP*_RUNTIME_PASS` when successful.

## Documentation

See [Architecture](docs/ARCHITECTURE.md), [API documentation](docs/API_DOCUMENTATION.md), [Security](docs/SECURITY.md), [Testing](docs/TESTING.md), and [SIH demo guide](docs/SIH_DEMO_GUIDE.md).

Step 21 is limited to demo integration. No later roadmap step is included.
