# Solution Management

Step 13 adds a controlled solution workflow to university projects.

## Workflow

Authorized university project team members submit a solution as `SUBMITTED`. The university project owner may review it as `APPROVED` or `REJECTED`. Approved solutions advance in order through `PROTOTYPE`, `TESTING`, `IMPLEMENTATION`, and `COMPLETED`.

## Access

- University project owners can review and advance solutions.
- University team members and Student team members can submit solutions for their project.
- Accepted Industry collaborators and the original problem submitter receive safe read-only solution visibility.
- Citizens, unrelated users, and unauthorized universities cannot access project solutions.

## API

- `GET/POST /api/projects/:projectId/solutions`
- `GET/PATCH /api/solutions/:id`
- `PATCH /api/solutions/:id/review`
- `PATCH /api/solutions/:id/status`

Solution data is validated by the backend and all ownership and lifecycle rules are enforced server-side. No external AI service is used.
