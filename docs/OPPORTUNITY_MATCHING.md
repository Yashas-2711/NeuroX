# Step 16 — AI Opportunity Matching

The first incremental Step 16 improvement centralizes University and Industry opportunity scoring in `backend/src/services/opportunity-matching.service.ts`.

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

Only validated problems are eligible. The existing local MiniLM embedding service remains the source of semantic similarity. Missing profiles, embeddings, or unavailable AI produce explicit errors; fake scores are not generated.

## Scope

This increment does not add new AI models, external APIs, project workflows, or collaboration states. Existing University and Industry routes remain unchanged.
