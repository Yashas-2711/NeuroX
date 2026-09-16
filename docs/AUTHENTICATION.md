# NeuroX Authentication Foundation

Step 5 uses bearer JWT authentication for the local prototype.

## Backend

- `POST /api/auth/register` creates only `CITIZEN`, `UNIVERSITY`, or `INDUSTRY` users.
- `POST /api/auth/login` validates credentials and returns a JWT.
- `GET /api/auth/me` returns the authenticated safe user profile.
- `POST /api/auth/logout` is stateless and confirms that the client should remove its token.
- `Authorization: Bearer <token>` is required for protected routes.

JWTs contain only the user ID and role. `passwordHash` is stored with `select: false` and is never returned through authentication responses.

## Frontend

The prototype stores the JWT under the browser-only `neurox_access_token` localStorage key inside `AuthProvider`. API authorization headers are added centrally by `frontend/lib/api.ts`; components do not access the token directly. Logout removes the token locally and calls the stateless backend logout endpoint when a token exists.

Admin users are not publicly registered. A future controlled provisioning process must create an admin account with a bcrypt hash outside the public registration route; credentials must remain local and must not be committed.
