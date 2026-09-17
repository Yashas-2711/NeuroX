# University Portal and AI Opportunity Matching

University users can maintain a capability profile and discover validated societal problems through `/university`.

## Workflow

```text
Validated Problem + University Profile
  → local MiniLM semantic similarity
  → transparent weighted compatibility score
  → AI Opportunity Match
```

The score uses these implementation weights:

- Semantic similarity: 40%
- Domain/category overlap: 25%
- Skills/research overlap: 20%
- Resource overlap: 10%
- Location relevance: 5%

The result is an explainable AI-assisted compatibility score, not a guarantee of successful collaboration. Missing profile capabilities are reported separately. Unknown Problem DNA fields remain `null` or empty rather than being invented.

## API endpoints

- `GET/PATCH /api/university/profile`
- `GET /api/university/problems`
- `GET /api/university/problems/:id`
- `GET /api/university/matches`
- `GET /api/university/problems/:id/match`
- `POST /api/university/problems/:id/interest`

All endpoints require the existing JWT and `UNIVERSITY` role. Only `VALIDATED` problems are discoverable, and duplicate interest records are prevented by a unique database index.

Matching uses the existing local AI service and 384-dimensional MiniLM embeddings. No external AI API is used. Teams, projects, university workflow progression, and Step 11 functionality are intentionally deferred.
