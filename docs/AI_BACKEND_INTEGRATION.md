# NeuroX AI ↔ Backend Integration

## Flow

```text
Citizen submission
  → Node/Express problem service
  → local FastAPI AI service
  → BERT-Tiny classification + MiniLM embedding
  → validated AI result
  → MongoDB Problem document
```

The backend sends only the problem title and description to the local AI service. The problem is created first with status `SUBMITTED`, so a temporary AI outage cannot lose the citizen submission.

## Configuration

Set these variables in the local, ignored `backend/.env` file:

```text
AI_SERVICE_URL=http://localhost:8000
AI_REQUEST_TIMEOUT_MS=30000
```

The safe template is in `backend/.env.example`. The backend uses Axios and validates the `/analysis` response before storing it.

## Stored AI fields

When analysis succeeds, the Problem stores:

- `aiClassification`
- `aiConfidence`
- `embedding` (384 numeric values)
- `aiAnalysisStatus=COMPLETED`
- `aiAnalyzedAt`

When the AI service is unavailable, the Problem remains `SUBMITTED`, `aiAnalysisStatus` is `FAILED`, and no fabricated AI values are stored. The API still returns a successful problem-creation response.

## Local development

Start the AI service first:

```powershell
Set-Location ai
& .\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Then start the backend in a second PowerShell window:

```powershell
Set-Location backend
npm run dev
```

Submit a Citizen problem through the existing application or `POST /api/problems`. The AI service remains independent from the Node backend and uses local model inference only.

## Security and scope

- No external AI inference API is used.
- Authentication and Citizen RBAC remain enforced by the existing backend middleware.
- AI errors, secrets, tokens, and private user data are not returned or logged.
- Step 9 workflows such as admin validation, matching, and dashboards are intentionally not included.
