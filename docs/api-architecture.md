# NEXORITHM API Architecture

## Service Boundary

The production backend should be a NestJS API with modules that map to product capabilities:
- Auth and identity sync
- Users and public profiles
- Problems and daily challenges
- Submissions and judge orchestration
- Rewards, streaks, missions, badges
- Leaderboards
- Recruiter search and interview requests
- Premium subscriptions and Razorpay webhooks
- Admin operations

The current Next app should call this API through typed clients. Route Handlers can act as a backend-for-frontend for health checks, feature flags, and safe server-side proxying when useful.

## REST API Surface

Authentication:
- `POST /auth/clerk/sync` sync Clerk user to local user record.

Problems:
- `GET /problems/daily`
- `GET /problems/:slug`
- `POST /problems` admin only

Submissions:
- `POST /submissions/run`
- `POST /submissions`
- `GET /submissions/:id`
- `GET /users/:username/submissions`

Rewards:
- `GET /me/rewards`
- `POST /rewards/streak-shields/purchase`
- `GET /missions/active`

Leaderboards:
- `GET /leaderboards/global`
- `GET /leaderboards/college/:collegeId`
- `GET /leaderboards/friends`
- `GET /leaderboards/monthly`
- `GET /leaderboards/all-time`

Profiles:
- `GET /profiles/:username`
- `PATCH /profiles/me`
- `GET /profiles/:username/developer-card`

Recruiter:
- `GET /recruiter/candidates`
- `POST /recruiter/shortlists`
- `POST /recruiter/interviews`

Premium:
- `POST /billing/razorpay/order`
- `POST /billing/razorpay/webhook`
- `GET /billing/me`

## Event Model

Important events:
- `submission.created`
- `submission.judged`
- `reward.granted`
- `streak.updated`
- `leaderboard.rank_changed`
- `subscription.activated`
- `subscription.cancelled`
- `recruiter.profile_viewed`
- `interview.requested`

Events should be idempotent and include `event_id`, `actor_id`, `subject_id`, `occurred_at`, and source metadata.

## Judge Pipeline

1. API validates user, problem, language, code size, and rate limits.
2. API creates `submission` with status `queued`.
3. Worker pulls job from Redis/queue.
4. Worker executes code inside a locked-down container.
5. Worker records per-test-case results, runtime, memory, and status.
6. Rewards service grants XP/coins only for accepted first-time solves.
7. Leaderboard projections update asynchronously.

## Production Folder Structure

Target monorepo:

```text
apps/
  web/                 Next.js app
  api/                 NestJS API
  judge-worker/        Isolated execution workers
packages/
  contracts/           Shared TypeScript DTOs and OpenAPI-generated clients
  config/              Shared lint, tsconfig, env validation
  database/            SQL migrations, seed data, schema snapshots
infra/
  docker-compose.yml
  aws/
  vercel/
docs/
  product-platform-blueprint.md
  api-architecture.md
  production-readiness.md
```

This repository currently keeps the web app at the root. The added contracts and infra files are intentionally compatible with a later monorepo split.
