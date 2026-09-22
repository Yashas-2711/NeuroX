# NeuroX SIH Demo Guide

This guide describes a safe live demonstration for SIH Problem Statement 26043. It uses existing records and does not reset or delete database data.

## Start services

Terminal 1 — AI:

```powershell
cd "P:\NeuroX — Societal Innovation Collaboration Platform\ai"
& ".\.venv\Scripts\Activate.ps1"
python -m uvicorn main:app --host 127.0.0.1 --port 8000
Invoke-RestMethod http://127.0.0.1:8000/health
```

Terminal 2 — backend:

```powershell
cd "P:\NeuroX — Societal Innovation Collaboration Platform\backend"
npm.cmd run dev
```

Terminal 3 — frontend:

```powershell
cd "P:\NeuroX — Societal Innovation Collaboration Platform\frontend"
npm.cmd run dev
```

Open `http://localhost:3000`. For a local demo, you may set `API_RATE_LIMIT_MAX=300` in `backend/.env` to avoid the global development limiter interrupting rapid navigation.

## Accounts and safety

Use `/register` for Citizen, Student, University, and Industry accounts. Admin is not publicly registerable; use the authorized local Admin account. Never put credentials in documentation or show real private data during the demo.

Complete University and Industry profiles before showing matching. Label demonstration text clearly; do not present it as verified community data.

## Recommended demo sequence

1. **Citizen:** At `/citizen/problems/new`, submit:
   - Title: `Seasonal shortage of safe drinking water`
   - Description: `Several rural villages report difficulty accessing safe drinking water during summer. Community measurements and local evidence can be added for validation.`
   - Category: `Water Resources`; Priority: `HIGH`.
2. **Admin:** Open `/admin`, inspect AI analysis, validate the problem, then show Problem Progress and Challenge Passport.
3. **University:** Complete `/university/profile`, open `/university/problems`, inspect Problem DNA and the local AI match, express interest, and open the project.
4. **University project:** Create a team, add a Student, create a milestone, update it, and show progress and communication.
5. **Student:** Open `/student/teams` and show the read-only team/project view.
6. **Industry:** Complete `/industry/profile`, open `/industry/opportunities`, inspect the local AI Opportunity Match, and express interest.
7. **University:** Open `/university/collaborations`, accept the request, and show the collaboration in the project workspace.
8. **Problem owner:** Show progress, Challenge Passport, and Impact Twin. Distinguish estimates from observed evidence.
9. **Analytics:** Show `/admin/analytics`, then the relevant University, Industry, or Citizen analytics page.
10. **Revival:** If an eligible inactive challenge exists, show `/admin/revival`. Do not artificially age or change production records.

## Expected behavior

- AI uses the local FastAPI service through `AI_SERVICE_URL`.
- AI failure leaves the problem submitted with an explicit pending/failed state.
- Only Admin validates/rejects problems.
- Only owning Universities manage projects, teams, milestones, and solution review.
- Industry collaboration requires University acceptance.
- Student and problem-submitter views are read-only where defined.
- Analytics are calculated from persisted data and may be empty in a new database.

## Verification

```powershell
cd "P:\NeuroX — Societal Innovation Collaboration Platform\backend"
npm.cmd run type-check
npm.cmd run build
npm.cmd run test:step14
npm.cmd run test:step15
npm.cmd run test:step16
npm.cmd run test:step17
npm.cmd run test:step18
npm.cmd run test:step19
npm.cmd run test:step20
```

Successful runtime scripts print their `STEP*_RUNTIME_PASS` marker. MongoDB and the AI service must be available for applicable tests.

## Troubleshooting

- `401`: log in again; the token is missing or expired.
- `403`: use the correct role or verify ownership.
- AI `503`: start FastAPI and verify `/health`; do not use fake AI data.
- MongoDB error: verify `MONGODB_URI`, network access, and database permissions.
- Frontend API error: verify `NEXT_PUBLIC_API_URL` and backend port 5000.
- npm PowerShell error: use `npm.cmd`.
- Broken AI venv: repair it with a valid installed Python interpreter; never commit `.venv`.

## Checklist

- [ ] AI health endpoint works.
- [ ] Backend and frontend are running.
- [ ] Citizen submission works.
- [ ] Admin validation works.
- [ ] University profile/matching/project flow works.
- [ ] Team and milestone progress works.
- [ ] Industry interest and University acceptance work.
- [ ] Passport, Impact Twin, notifications, revival, and analytics open.
- [ ] Unauthorized actions remain blocked.
- [ ] No secrets or private data are displayed.
