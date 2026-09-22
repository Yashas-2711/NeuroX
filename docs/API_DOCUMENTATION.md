# NeuroX API Overview

Backend base URL: `http://localhost:5000/api`.

Protected routes use:

```text
Authorization: Bearer <access-token>
```

## Main route groups

| Group | Purpose | Access |
|---|---|---|
| `/auth` | Register, login, current user | Public/authenticated |
| `/problems` | Submit and track owned problems, DNA, passport, impact, matching | Role/ownership scoped |
| `/admin/problems` | Review and validate/reject problems | Admin |
| `/university` | University profile, discovery, matching | University |
| `/university/projects` | Projects, teams, milestones, solutions | Owning University |
| `/industry` | Industry profile, opportunities, collaborations | Industry |
| `/student` | Student team workspace | Student |
| `/notifications` | User-owned notifications | Authenticated recipient |
| `/analytics` | Role-scoped dashboard metrics | Authenticated |
| `/revival` | Inactivity and revival reviews | Authorized stakeholders |
| `/projects/:id/messages` | Project communication | Project participants |

Responses use `{ success, data, message }`. Invalid input normally returns 400, missing authentication 401, insufficient role or ownership 403, missing records 404, and unexpected errors 500 with a generic message.

## Validation and privacy

Request bodies, query parameters, and IDs are validated server-side. Password hashes, JWTs, and private authentication data are not returned. Clients must not rely on UI role checks; backend middleware and ownership checks are authoritative.
