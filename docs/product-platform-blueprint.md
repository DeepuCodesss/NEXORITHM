# NEXORITHM Product Platform Blueprint

## Product Strategy

NEXORITHM combines competitive coding, consistency loops, verified reputation, rewards, and hiring workflows. The north star is weekly verified solves per active developer, because it connects retention, rankings, rewards, profile quality, and recruiter value.

Primary audiences:
- Developers: build consistency, solve real problems, earn XP/coins/reputation, and prove ability through verified submissions.
- Recruiters: discover verified talent using performance metrics instead of resumes alone.
- Colleges: compare cohort performance and surface high-signal students.
- Platform operators: run daily challenges, contests, rewards, abuse review, and premium membership operations.

Core positioning:
- Traditional platforms: practice now, maybe get recognized later.
- NEXORITHM: practice today, progress today, get recognized today.

## Information Architecture

Public:
- `/` Landing page
- `/rankings` Public rankings preview
- `/profile/[username]` Public developer card
- `/pro` NEXORITHM PRO pricing

Developer app:
- `/dashboard` Daily challenges, streaks, missions, rewards, upcoming contests, activity
- `/workspace/[problemId]` Problem statement, Monaco editor, run, submit, test cases, custom input
- `/rankings` Global, college, friends, monthly, all-time leaderboards
- `/profile/[username]` Personal reputation page and recruiter-ready proof

Recruiter app:
- `/recruiter` Candidate search, filters, profile review, interview scheduling
- Future: `/recruiter/projects`, `/recruiter/shortlists`, `/recruiter/billing`

Operator/admin:
- Future: challenge authoring, contest ops, rewards reconciliation, abuse review, payout review, college verification.

## User Flows

Developer onboarding:
1. Visitor lands on "Code. Compete. Earn."
2. Starts solving or signs in with Clerk.
3. Completes profile: college, graduation year, preferred languages, hiring status.
4. Solves first daily challenge.
5. Receives XP, coins, streak progress, and profile activity.

Daily retention:
1. User opens dashboard.
2. Reviews easy, medium, hard challenges and missions.
3. Solves a problem in the workspace.
4. Submission service verifies test cases.
5. Rewards service grants XP, coins, reputation, streak progress, badges.
6. Leaderboard service re-ranks relevant scopes.

Recruiter discovery:
1. Recruiter signs in to recruiter workspace.
2. Filters candidates by DevRank, college, language, solved count, speed/memory percentiles.
3. Opens public profile.
4. Exports Developer Card or schedules interview.
5. Candidate receives invitation and visibility analytics update.

Premium membership:
1. Developer opens `/pro`.
2. Reviews free vs PRO comparison.
3. Starts Razorpay checkout for INR 399/month plus taxes.
4. Payment webhook activates entitlement.
5. User receives premium contest access, analytics, boosted recruiter visibility, and streak shield benefits.

## Component Architecture

Design system:
- Tokens: background, foreground, card, border, primary blue, success, warning, error.
- Primitives: buttons, tabs, segmented controls, tables, modals, badges, progress bars, stat tiles.
- Domain components: challenge row, mission card, streak console, leaderboard table, profile metric card, heatmap, recruiter candidate result, checkout summary.

App state:
- Current prototype uses `AppProvider` and mock data.
- Production target uses server data from NestJS APIs and Clerk identity, with local optimistic updates only for transient UI state.

## Design System

Brand attributes:
- Premium, intelligent, trustworthy, minimal, professional, ambitious.

Visual rules:
- Dark-first, almost-black background, charcoal panels, soft gray borders.
- Single premium blue accent.
- Green success, amber warning, red error.
- No neon, no rainbow gradients, no cyberpunk or gamer styling.
- Rounded corners stay restrained.
- Motion is purposeful: submission status, reward confirmation, modal transitions, loading states.

Typography:
- Geist/Inter/SF Pro style.
- Large landing headings, compact dashboard headings, readable line lengths.

## MVP Roadmap

Milestone 1: Verified prototype
- Keep current frontend routes.
- Replace mock app state with API-backed reads.
- Add Clerk auth and user sync.
- Add Postgres schema and migrations.
- Add basic NestJS API modules.
- Add real Razorpay checkout and webhook sandbox.

Milestone 2: Judge beta
- Submission queue.
- Containerized code execution workers.
- Language support: JavaScript, Python, C++.
- Test case visibility controls.
- Runtime, memory, status, and audit logs.

Milestone 3: Reputation beta
- Daily challenge publishing.
- XP/coins/reputation ledger.
- Streak settlement job.
- Leaderboard materialized views.
- Public profile share links.

Milestone 4: Recruiter beta
- Recruiter organizations.
- Candidate search.
- Shortlists and interview requests.
- Profile export.

## Version 2 Roadmap

- College verification and campus leagues.
- Premium prize contests and payout reconciliation.
- Advanced analytics by topic, language, runtime, and consistency.
- Anti-cheat review queue and similarity detection.
- Team/company pages for recruiters.
- Public API for verified profile embeds.
- Mobile app wrapper or dedicated native app.

## Scaling Strategy

Application:
- Next.js on Vercel for frontend.
- NestJS API on AWS ECS/Fargate or Kubernetes.
- Postgres primary database with read replicas as leaderboard and search load grows.
- Redis for sessions, rate limits, leaderboard hot paths, queues, and idempotency.

Judge:
- Isolated execution workers in locked-down containers.
- Queue-based submission pipeline.
- Separate worker pools per language and difficulty.
- Strict CPU, memory, time, network, and filesystem limits.

Data:
- Append-only ledger for XP/coins/reputation changes.
- Materialized leaderboard tables updated by events.
- Audit trails for submissions, payments, recruiter access, and reward grants.

Security:
- Clerk for identity.
- Role-based access control for developer, recruiter, admin.
- Webhook signature verification for Razorpay.
- Rate limits for submissions, recruiter search, profile export, and auth-sensitive routes.
- PII isolation and explicit recruiter access audit logs.
