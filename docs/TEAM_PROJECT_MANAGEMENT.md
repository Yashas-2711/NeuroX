# Team and Project Management

Step 11 connects an authenticated University to a validated Problem through an existing UniversityInterest, then provides a project workspace.

## Workflow

```text
Validated Problem → University Interest → Project → Team → Milestones → Calculated Progress
```

Projects are created with status `PROPOSED`. The owner can move them through controlled transitions to `ACTIVE`, `ON_HOLD`, `COMPLETED`, or `CANCELLED`. A project cannot be created for an unvalidated problem, without university interest, or when an active project already exists for the same university/problem.

## API endpoints

- `POST /api/university/projects`
- `GET /api/university/projects`
- `GET/PATCH /api/university/projects/:id`
- `PATCH /api/university/projects/:id/status`
- `POST/GET /api/university/projects/:id/team`
- `POST /api/university/projects/:id/team/members`
- `DELETE /api/university/projects/:id/team/members/:userId`
- `GET/POST /api/university/projects/:id/milestones`
- `PATCH/DELETE /api/university/projects/:id/milestones/:milestoneId`

All endpoints use the existing JWT and University RBAC middleware. The authenticated University owns the project and its team. The team creator becomes `LEADER`; duplicate members are rejected and the leader cannot be removed.

## Progress

Progress is calculated from milestone records:

```text
completed milestones / total milestones × 100
```

With no milestones, progress is `0`. Overdue milestones are derived from due dates and incomplete status. No progress value is trusted from the client.

Industry collaboration, solutions, notifications, analytics, and later workflow steps are intentionally deferred.
