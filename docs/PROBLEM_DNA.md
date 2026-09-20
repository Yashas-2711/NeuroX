# Problem DNA

Step 15 adds a persisted, explainable identity for validated NeuroX problems.

## Data and provenance

Problem DNA references the source `Problem` and stores category, geographic context, severity/urgency, summary, confidence, requirements, and generation status. The current local implementation only derives facts available in the submission and the local BERT-Tiny classification. Unknown fields such as affected population, root causes, and sustainability relevance remain `null` or empty; no population statistics or causes are invented.

## API

All endpoints require the existing JWT authentication:

- `POST /api/problems/:problemId/dna/generate` — Admin or University users generate DNA for a validated problem.
- `GET /api/problems/:problemId/dna` — authorized submitter, Admin, University, or validated Industry viewer retrieves DNA.
- `GET /api/problems/:problemId/dna/status` — returns generation state.

Generation is idempotent after completion. AI failures persist `FAILED` state without changing the original Problem or its existing AI analysis.

## Local AI workflow

The backend calls the existing local FastAPI service at `AI_SERVICE_URL` using `POST /dna`. The service combines the title and description, runs local BERT-Tiny classification, and returns a schema-validated structured response. No external AI API is used.

## Frontend

Problem DNA is shown on citizen problem details and university validated-problem details. University users can trigger generation for validated problems; other viewers see the persisted result or an honest unavailable state.

## Testing

Run backend type-check/build, frontend lint/type-check/build, AI tests, and the MongoDB-backed API tests. Runtime DNA verification requires the local FastAPI service and MongoDB to be available.

## Limitations

This step does not add generative causal analysis, population estimates, maps, vector search, or new AI models. Those values require reliable source data or a later approved workflow.
