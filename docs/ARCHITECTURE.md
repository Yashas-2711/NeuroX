# NeuroX Architecture

## Components

- `frontend/`: Next.js, React, TypeScript, Tailwind, shadcn/ui, and Recharts.
- `backend/`: Express, TypeScript, Mongoose, JWT authentication, RBAC, and domain services.
- `ai/`: FastAPI with local BERT-Tiny classification and MiniLM 384-dimensional embeddings.
- MongoDB Atlas stores users, problems, projects, teams, milestones, solutions, collaborations, impact data, notifications, and analytics source records.

## Request flow

The browser sends a Bearer JWT to the backend. Express validates the token, applies role and ownership checks, validates input with Zod, and delegates business logic to services. Services query MongoDB and return safe DTOs. AI inference is called only through the backend AI client and the configured local `AI_SERVICE_URL`.

## Security boundaries

Public registration permits Citizen, Student, University, and Industry roles; Admin is not self-registerable. Password hashes are excluded from normal queries and safe responses. Private problem, project, team, collaboration, communication, notification, and analytics data are scoped server-side.

## Analytics

Analytics are derived from persisted records and are exposed through the role-scoped `/api/analytics` endpoint. Counts do not claim causation or verified societal impact.
