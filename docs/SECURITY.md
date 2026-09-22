# NeuroX Security Notes

## Controls

- JWT access tokens with expiration and role claims.
- Central authentication and role middleware.
- Ownership checks for private problems and university projects.
- Zod validation for request bodies and query parameters.
- Mongoose ObjectId validation and schema constraints.
- bcrypt password hashing.
- Helmet, CORS, JSON body limits, URL-encoded body limits, and Express rate limiting.
- Safe DTOs that omit password hashes and tokens.
- Participant checks for project communication.
- Notification recipient scoping and deduplication keys.

## Secret handling

Real `.env` files are local-only and ignored. Templates contain placeholders only. Required values include `MONGODB_URI`, `JWT_SECRET`, and the local `AI_SERVICE_URL`. Never paste secrets into source, documentation, or issue reports.

## Known limitations

This is a defensive application review, not a penetration test or security certification. Dependency audit results require working npm registry access. Runtime MongoDB and AI verification must be rerun whenever the local services or environment change.

The API request limit is configurable through `API_RATE_LIMIT_MAX`; development defaults to 300 requests per 15 minutes and production defaults to 100. Review this value for the deployment environment rather than copying the demo setting blindly.

## Responsible testing

Use an isolated test database and non-production accounts. Do not run destructive database commands or attempt attacks against external systems.
