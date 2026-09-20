# Dead Problem Revival

Step 18 identifies eligible validated challenges that may need renewed attention. It does not change the Problem lifecycle automatically and does not call external AI services.

## Detection

The default inactivity threshold is 90 days and can be configured with `REVIVAL_INACTIVITY_DAYS`. The detector uses persisted `updatedAt` values from the problem, linked projects, milestones, solutions, and collaborations. It also flags overdue incomplete milestones, projects with no linked solution activity, and validated challenges without a linked project. A challenge is eligible only in `VALIDATED`, `MATCHED`, or `IN_PROGRESS` state; rejected, archived, resolved, and submitted challenges are excluded.

## Review states

```text
FLAGGED → UNDER_REVIEW → REVIVAL_PROPOSED → REVIVAL_IN_PROGRESS → REVIVED
   └──────────────────────────────────────────────────────────────→ CLOSED
```

Transitions are enforced by the backend. Detection does not itself mark a challenge revived.

## APIs

```text
GET   /api/revival
GET   /api/revival/:problemId
POST  /api/revival/:problemId/review
PATCH /api/revival/:problemId/review
```

Admin users can review all eligible challenges. University users need a linked project they own; Industry users need an accepted collaboration. Problem owners can view their own review but cannot change it. All IDs and payloads are validated and notifications use the existing deduplicated in-app notification service.

## Recommendations

Recommendations are transparent actions derived from persisted Problem DNA, opportunity matches, indicators, and linked projects. The system does not claim predictive AI or invent capabilities. If evidence is unavailable, it reports that no additional data-based recommendation can be generated.

## Verification

```powershell
cd backend
npm run type-check
npm run build
npm run test:step18
```

The runtime test uses a timestamped isolated MongoDB database and checks detection, retrieval, review creation, valid transition, and invalid-transition rejection. It must print `STEP18_RUNTIME_PASS` before runtime verification is considered successful.
