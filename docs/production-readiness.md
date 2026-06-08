# Production Readiness Checklist

## Current Status

The repository now contains:
- A polished Next.js frontend prototype.
- Product, IA, flow, roadmap, API, scaling, and schema documentation.
- PostgreSQL schema draft.
- Docker Compose service map for web, API, Postgres, Redis, and judge worker.
- Environment variable template.
- Health and platform API route handlers for frontend readiness checks.

Remaining before true production launch:
- Install and wire Clerk.
- Implement NestJS API modules.
- Add migrations and a database client.
- Build the judge worker and execution sandbox.
- Integrate Razorpay orders and signed webhooks.
- Add CI, test suite, observability, rate limiting, and secrets management.

## Environment Variables

Use `.env.example` as the source of required config. Production secrets must live in Vercel/AWS secret stores, not in git.

## Security Requirements

- Verify Clerk JWTs on every protected API route.
- Use role-based access for developer, recruiter, and admin flows.
- Verify Razorpay webhook signatures.
- Rate limit code runs, submissions, recruiter search, profile export, and checkout creation.
- Store reward changes in an idempotent ledger.
- Isolate code execution with strict CPU, memory, time, network, and filesystem limits.
- Audit recruiter profile views and exports.

## Quality Gates

Before release:
- `npm run lint`
- `npm run build`
- Unit tests for rewards, streaks, and ranking math.
- Integration tests for auth sync, submissions, payments, and recruiter flows.
- E2E tests for landing to first accepted solve and PRO upgrade.
- Lighthouse pass for landing and dashboard.
- Dependency audit and container image scan.

## Deployment Shape

Recommended:
- Web: Vercel, connected to the Next.js app.
- API: AWS ECS/Fargate running NestJS.
- Database: AWS RDS PostgreSQL.
- Cache/queue: AWS ElastiCache Redis.
- Judge worker: isolated ECS service with no public ingress.
- Object storage: S3 for generated Developer Cards and exports.
- Observability: OpenTelemetry, structured logs, error tracking, uptime checks.
