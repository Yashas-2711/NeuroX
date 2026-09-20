# Industry Collaboration

Step 12 adds local-AI-assisted Industry participation in university-led projects.

## Workflow

```text
Validated problem
  → university project
  → Industry opportunity match
  → Industry interest
  → PENDING collaboration request
  → University accepts or rejects
  → accepted Industry project view
```

Industry matching uses the existing local MiniLM embedding service and transparent weights:

- Semantic similarity: 40%
- Domain match: 25%
- Skills and technologies: 20%
- Resources and facilities: 10%
- Location: 5%

No external AI API is used. Missing profile capabilities produce missing-capability explanations; fabricated scores are not created when the profile or problem embedding is unavailable.

## API

Industry-only endpoints:

- `GET /api/industry/profile`
- `PATCH /api/industry/profile`
- `GET /api/industry/opportunities`
- `GET /api/industry/opportunities/:id`
- `POST /api/industry/projects/:id/interest`
- `GET /api/industry/collaborations`
- `GET /api/industry/projects/:id`

University owner endpoints:

- `GET /api/university/collaborations`
- `PATCH /api/university/collaborations/:id/accept`
- `PATCH /api/university/collaborations/:id/reject`

Collaboration status is controlled by the backend: `PENDING → ACCEPTED` or `PENDING → REJECTED`. A unique project/Industry index prevents duplicate requests.

## Frontend routes

- `/industry`
- `/industry/profile`
- `/industry/opportunities`
- `/industry/opportunities/[id]`
- `/industry/collaborations`
- `/industry/projects/[id]`
- `/university/collaborations`

Industry project views are read-only. University project owners retain control of project status, teams, and milestones.

Solution management, prototypes, implementation, notifications, and impact analytics are deferred to later steps.
