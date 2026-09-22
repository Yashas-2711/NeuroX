# Analytics & Impact Dashboard

Step 20 provides role-scoped analytics derived from persisted NeuroX records. It does not fabricate history, fill missing dates, or infer causal impact.

## Routes

```text
GET /api/analytics?range=7|30|90|all&category=<category>&status=<status>
```

Frontend dashboards:

```text
/admin/analytics
/university/analytics
/industry/analytics
/citizen/analytics
```

## Scope

- Admin receives platform-wide counts.
- University receives projects, problems, collaborations, solutions, milestones, and impact records associated with its projects.
- Industry receives records associated with its collaboration projects.
- Citizens and Students receive only records for problems they submitted.

## Metrics

The API returns summary cards, status distributions, challenge creation activity, solution lifecycle, collaboration/project/milestone/revival distributions, and Impact Twin indicator/observation counts. Percentages are intentionally avoided where denominators or compatible units are unavailable. Impact scenario estimates are not merged with observed measurements.

## Security and performance

JWT authentication is required. Role scoping is enforced server-side. Filters are validated with Zod. Aggregations use MongoDB counts/grouping and only return safe aggregate values, not private users or messages. Date ranges are applied to persisted `createdAt` activity.

## Limitations

The current dashboard reports activity and persisted measurements; it does not claim causation, population-wide impact, or scientific success rates. Step 16 runtime status remains independent and is not changed by this dashboard.

## Verification

```powershell
cd backend
npm.cmd run type-check
npm.cmd run build

cd ../frontend
npm.cmd run lint
npm.cmd run type-check
npm.cmd run build
```

Step 21 is not included.
