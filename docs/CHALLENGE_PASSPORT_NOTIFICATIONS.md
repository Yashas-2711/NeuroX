# Challenge Passport and Notifications

Step 14 adds two in-app capabilities.

## Challenge Passport

`GET /api/problems/:problemId/passport` builds a chronological view from persisted problem, AI, validation, interest, project, collaboration, and solution timestamps. Access is restricted to the original submitter, an authorized university, an accepted industry collaborator, or an admin.

## Notifications

Authenticated users can use:

- `GET /api/notifications`
- `GET /api/notifications/unread-count`
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`

Notifications are in-app only, recipient-scoped, paginated, and deduplicated by workflow event. Supported triggers include problem validation/rejection, university interest/project creation, industry collaboration requests and decisions, and solution submission/review/lifecycle changes.

No email, SMS, push provider, external AI service, or invented historical event is used.
