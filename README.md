# NeuroX — Societal Innovation Collaboration Platform

**Problem Statement ID:** 26043

NeuroX is a local-AI-powered platform for collecting societal problems, validating them, matching them with universities, and managing university-led innovation projects.

## Current implementation status

Steps 1–11 are implemented:

- Project setup, frontend, backend, MongoDB models, and security foundation
- JWT authentication and role-based access control
- Citizen and Student problem submission
- Local BERT-Tiny classification and MiniLM embeddings
- Node/Express ↔ FastAPI AI integration
- Admin validation portal
- University profiles, validated problem discovery, and AI Opportunity Matching
- University interest and project creation
- University teams, Student members, milestones, status transitions, and progress calculation
- Student multi-team workspace and read-only problem/project progress tracking

Step 12, Industry Collaboration, is not implemented.

## Roles

- **Citizen:** Submit problems and track the progress of owned submissions.
- **Student:** Submit problems, view owned problem progress, and participate in multiple university project teams.
- **University:** Maintain an institution profile, discover validated problems, express interest, create projects, manage teams, and manage milestones for owned projects.
- **Industry:** Role foundation exists; Industry Collaboration is deferred.
- **Admin:** Review, validate, or reject submitted problems.

## Architecture

```text
frontend/  Next.js + React + TypeScript + Tailwind CSS
backend/   Node.js + Express + TypeScript + MongoDB/Mongoose
ai/        Python + FastAPI + local BERT-Tiny + MiniLM
docs/      Workflow and architecture documentation
```

```text
Citizen/Student problem
        ↓
Local BERT-Tiny + MiniLM analysis
        ↓
Admin validation
        ↓
University Opportunity Match
        ↓
University interest
        ↓
Project → Team → Milestones → Progress
```

AI inference remains local. The platform does not use OpenAI, Gemini, Claude, Groq, OpenRouter, or another hosted inference API.

## Important routes

Frontend:

- `/login`, `/register`
- `/citizen`, `/citizen/problems`, `/citizen/problems/new`
- `/student`, `/student/teams`
- `/university`, `/university/profile`, `/university/problems`, `/university/projects`
- `/admin`, `/admin/problems/[id]`

Backend API groups:

- `/api/auth`
- `/api/problems`
- `/api/admin/problems`
- `/api/university`
- `/api/university/projects`
- `/api/student/teams`

AI service:

- `GET /health`
- `POST /classify`
- `POST /embed`
- `POST /similar`
- `POST /analysis`

## Quick start

Prerequisites:

- Node.js 22+
- Python 3.13+
- MongoDB connection configured in `backend/.env`

Install JavaScript dependencies:

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

Start the backend in one terminal:

```powershell
cd "P:\NeuroX — Societal Innovation Collaboration Platform\backend"
npm run dev
```

Start the frontend in a second terminal:

```powershell
cd "P:\NeuroX — Societal Innovation Collaboration Platform\frontend"
npm run dev
```

Start the local AI service in a third terminal:

```powershell
cd "P:\NeuroX — Societal Innovation Collaboration Platform\ai"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
& ".\.venv\Scripts\Activate.ps1"
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Open the web application at `http://localhost:3000`.

The backend runs on `http://localhost:5000` and the AI service runs on `http://127.0.0.1:8000`.

## Step 11 test flow

1. Register a Student and a University user.
2. Complete the University profile.
3. Validate a submitted problem from `/admin`.
4. Express interest as the University.
5. Open the created project.
6. Create a project team and add the Student.
7. Open `/student/teams` and verify the team appears.
8. Add and complete milestones from the University project workspace.
9. Verify project progress updates.
10. Open the original problem as its submitter and verify lifecycle/project progress.
11. Verify Students cannot edit projects, teams, or milestones.
12. Verify another user cannot view the problem owner's private progress.

## Verification commands

Backend:

```powershell
cd backend
npm run type-check
npm run build
```

Frontend:

```powershell
cd frontend
npm run lint
npm run type-check
npm run build
```

AI tests:

```powershell
cd ai
& ".\.venv\Scripts\python.exe" -m unittest discover -s tests -v
```

Git safety check:

```powershell
git diff --check
git status --short
```

## Security

- Secrets belong only in ignored `.env` files.
- Passwords are stored as bcrypt hashes.
- JWTs and password hashes are excluded from API responses.
- Protected endpoints use the existing JWT and RBAC middleware.
- Ownership checks are enforced on private problems and university projects.
- Student team data is read-only from the Student workspace.
- No external AI inference APIs or hardcoded credentials are used.

## Documentation

Useful workflow documentation is available in `docs/`, including:

- `docs/AI_ENGINE.md`
- `docs/AI_BACKEND_INTEGRATION.md`
- `docs/ADMIN_VALIDATION.md`
- `docs/UNIVERSITY_MATCHING.md`
- `docs/TEAM_PROJECT_MANAGEMENT.md`

## License and attribution

Developed for **Problem Statement ID 26043** — NeuroX Societal Innovation Collaboration Platform.
