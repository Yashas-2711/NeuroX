# Admin Validation

Authenticated `ADMIN` users review citizen submissions through `/admin`.

API endpoints:

- `GET /api/admin/problems?status=SUBMITTED&page=1&limit=20`
- `GET /api/admin/problems/:id`
- `PATCH /api/admin/problems/:id/validate`
- `PATCH /api/admin/problems/:id/reject` with `{ "reason": "..." }`

Only `SUBMITTED` problems can transition to `VALIDATED` or `REJECTED`. Rejection requires a reason. All endpoints require the existing JWT authentication and `ADMIN` role; other roles receive `403` and unauthenticated requests receive `401`.

The portal displays safe citizen information and local AI results without exposing credentials. University matching and later workflows are intentionally deferred.
