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

## Bug-fix pass

- Passport events now use a deterministic secondary sort when persisted timestamps are equal.
- Notification links select a role-appropriate destination for problem notifications instead of always routing to the citizen view.
- Notification read actions report failures safely and refresh the authenticated header unread count.

## Finalization verification

- Backend type-check: passed.
- Backend build: passed.
- Frontend lint: passed.
- Frontend type-check: passed.
- Frontend production build: passed.
- Local unauthenticated HTTP smoke checks: `/api/health` returned 200; notification and passport endpoints returned 401 as expected.
- Isolated MongoDB/API runtime script: added as `npm run test:step14`; execution was blocked before connection because the configured MongoDB endpoint was unreachable in this environment. No shared or production database was modified.
- AI regression suite: attempted, but blocked because the configured local Python executable was inaccessible in the execution environment.

The milestone remains PARTIAL until MongoDB-backed API tests and the local AI regression suite can be rerun successfully in an environment with reachable MongoDB and a working Python installation.
