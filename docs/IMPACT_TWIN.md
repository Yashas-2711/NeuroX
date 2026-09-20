# Impact Twin

Step 17 provides evidence-based impact tracking for validated NeuroX problems.

## Data model

- `ImpactIndicator` stores a problem indicator, unit, baseline, optional target, measurement period, and evidence reference.
- `ImpactScenario` stores an explicitly labelled estimate and its assumptions/method.
- `ImpactObservation` stores immutable historical measurements; a new measurement never overwrites an older one.
- The existing project-level `ImpactMetric` model is preserved for compatibility.

## API

All routes require the existing JWT. Problem owners have read-only access. Admins and authorized university/accepted-industry project stakeholders can write impact data.

```text
GET   /api/problems/:problemId/impact
POST  /api/problems/:problemId/impact/indicators
PATCH /api/problems/:problemId/impact/indicators/:indicatorId
POST  /api/problems/:problemId/impact/scenarios
PATCH /api/problems/:problemId/impact/scenarios/:scenarioId
POST  /api/problems/:problemId/impact/observations
GET   /api/problems/:problemId/impact/history
```

Only validated problems are eligible for non-admin access. IDs, numbers, URLs, dates, units, and uncertainty ranges are validated with Zod.

## Calculations

Target progress is calculated only when baseline, target, and observed values exist and the target differs from the baseline. It is clamped to 0–100%. A zero baseline is safe because the calculation uses the baseline-to-target delta rather than dividing by the baseline. Incompatible units are not converted; the API returns the stored unit and does not calculate across different indicators.

The summary is derived from persisted indicators, scenarios, and observations. Scenario values are estimates and are never presented as observed outcomes. `dataCompleteness` counts indicators with both evidence and an observation.

## UI

Problem owners can open `/citizen/problems/:id/impact` to view the summary, baseline/target/observed comparisons, and scenarios. Equivalent role entry routes are available at `/university/problems/:id/impact` and `/industry/opportunities/:id/impact`. Authorized stakeholder roles also receive baseline, scenario, and observation forms. Empty, loading, error, and retry states are included.

## Limitations

The current implementation intentionally does not infer population statistics or use predictive AI. Scenario calculations are supplied by authorized stakeholders and labelled as estimates. The Challenge Passport now derives impact baseline, scenario, and observation events from persisted records; it does not fabricate events when records are absent.

## Verification

Run from `backend`:

```powershell
npm run type-check
npm run build
```

Run from `frontend`:

```powershell
npm run lint
npm run type-check
npm run build
```
