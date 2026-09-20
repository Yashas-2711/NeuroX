# Collaboration & Communication

Step 19 completes the persisted project communication workflow while preserving the existing UniversityInterest and Industry Collaboration lifecycle.

## Communication API

```text
GET  /api/projects/:projectId/messages?page=1&limit=50
POST /api/projects/:projectId/messages
```

Messages are stored in `ProjectMessage`. Access is limited to the university owner, team leader/members, and users belonging to an accepted industry collaboration. Authors are returned with safe name/role fields only. New messages notify the other project participants through the existing deduplicated Notification service.

## Existing collaboration APIs

```text
GET   /api/university/collaborations
PATCH /api/university/collaborations/:id/accept
PATCH /api/university/collaborations/:id/reject
POST  /api/industry/projects/:id/interest
GET   /api/industry/collaborations
```

The existing backend prevents duplicate industry requests, restricts acceptance/rejection to the owning University, and emits notifications for request and decision events.

## Frontend

Communication views are available at:

```text
/university/projects/:id/communication
/industry/projects/:id/communication
```

They provide persisted chronological messages, safe author information, validation, loading, empty, and error states.

## Verification

```powershell
cd backend
npm run type-check
npm run build

cd ../frontend
npm run lint
npm run type-check
npm run build
```

Step 20 is not included.
