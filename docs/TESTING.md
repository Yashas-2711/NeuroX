# NeuroX Testing Guide

## Backend

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
```

Runtime scripts require MongoDB and, for AI-dependent flows, the local FastAPI service. Successful scripts print their corresponding `STEP*_RUNTIME_PASS` marker.

## Frontend

```powershell
cd frontend
npm.cmd run lint
npm.cmd run type-check
npm.cmd run build
```

## AI

```powershell
cd ai
& ".\.venv\Scripts\python.exe" -c "import torch, transformers, sentence_transformers, fastapi; print('AI_IMPORTS_OK')"
& ".\.venv\Scripts\python.exe" -m unittest discover -s tests -v
```

Start the service with `python -m uvicorn main:app --host 127.0.0.1 --port 8000` and verify `GET /health` before AI-backed runtime scripts.

## Step 22 verification record

Backend type-check/build, frontend lint/type-check/build, and `git diff --check` completed successfully during this review. The local AI suite passed all 5 tests. Backend and frontend production dependency audits both reported 0 vulnerabilities. Step 16–20 runtime markers were previously recorded, with Step 20 reporting `adminProblems=2 citizenProblems=1`.
