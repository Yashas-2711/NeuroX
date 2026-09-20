# Step 16 — AI Opportunity Matching

The first incremental Step 16 improvement centralizes University and Industry opportunity scoring in `backend/src/services/opportunity-matching.service.ts`.

Step 16 finalization adds durable `OpportunityMatch` records. Each record is unique per problem/entity/type, stores a 0–100 score, component breakdown, weights, explanations, matched capabilities, missing capabilities, source version, freshness timestamps, and `CURRENT`/`STALE`/`FAILED` status.

The persisted result panel is available on University validated-problem details and Industry opportunity details. It provides Generate, Refresh, minimum-score filters, score/newest sorting, server-backed pagination, stale labels, loading/error/empty states, and persistent match-detail links.

## Scoring

- Semantic similarity: 40%
- Domain/category alignment: 25%
- Skills/research/technology alignment: 20%
- Resources/facilities alignment: 10%
- Location relevance: 5%

The result includes each component, the weighted overall score, matching reasons, missing capabilities, and the scoring weights. Scores are explainable compatibility signals, not guaranteed recommendations.

## Existing endpoints

- `GET /api/university/matches`
- `GET /api/university/problems/:id/match`
- `GET /api/industry/opportunities`
- `GET /api/industry/opportunities/:id`
- `POST /api/problems/:problemId/opportunities/generate`
- `GET /api/problems/:problemId/opportunities`
- `GET /api/problems/:problemId/opportunities/:matchId`
- `POST /api/problems/:problemId/opportunities/refresh`

Only validated problems are eligible. Problem-level APIs support entity-type, minimum-score, sort, and pagination filters. Admin generation refreshes all active University and Industry profiles; University and Industry users generate and retrieve only their own entity matches. The existing local MiniLM embedding service remains the source of semantic similarity. Missing profiles, embeddings, or unavailable AI produce explicit errors; fake scores are not generated.

Scores are normalized as percentages for persistence. The weighted formula is `semantic × .40 + domain × .25 + skills × .20 + resources × .10 + location × .05`, with each component in the range 0–1 before conversion to 0–100. Missing capabilities contribute zero to their component and are listed explicitly.

Run the isolated runtime verification with MongoDB and FastAPI available:

```powershell
cd backend
npm run test:step16
```

## Scope

This step does not add new AI models, external APIs, project workflows, or collaboration states. Existing University and Industry routes remain unchanged. Match freshness is evaluated from the problem, DNA, and profile update timestamps; refresh creates a current record rather than overwriting another entity's match.
