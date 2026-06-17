# Nexorithm Production Checklist

## Required Environment Variables

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `CLERK_SIGN_IN_URL`
- `CLERK_SIGN_UP_URL`
- `CLERK_AFTER_SIGN_IN_URL`
- `CLERK_AFTER_SIGN_UP_URL`
- `JUDGE_USE_DOCKER` when Docker-based judging is enabled

## Deployment Checklist

- Run `npm run lint`
- Run `npm run build`
- Apply Prisma migrations before release
- Verify Clerk auth configuration in production
- Confirm `DATABASE_URL` points to the production database
- Test submission, withdrawal, and admin reward flows in staging
- Confirm live reward and leaderboard pages render with real data

## Security Checklist

- Keep all write APIs authenticated
- Keep admin routes restricted to admin users only
- Return `401` for unauthenticated access
- Return `403` for unauthorized access
- Return `404` when records do not exist
- Return `409` for duplicate or conflicting reward claims
- Return `429` for rate-limited operations
- Validate all request bodies before database writes
- Keep reward claims inside transactions
- Do not trust client-side reward or streak state

## Backup Strategy

- Use automated daily database backups
- Keep point-in-time restore available if the DB provider supports it
- Retain at least one recent offsite backup copy
- Test restore procedures on a schedule

## Database Migration Guide

1. Update `prisma/schema.prisma`
2. Run `prisma migrate dev` locally for validation
3. Review the generated SQL migration
4. Apply migrations in staging first
5. Verify indexes, reward claims, and profile queries
6. Promote the same migration to production
7. Back up the database before each production migration

## Operational Notes

- Reward awarding must remain server-side only
- Live rewards must be claimed atomically
- Any future balance-changing endpoint should use a transaction
- Keep demo/mock state isolated from persisted user state
