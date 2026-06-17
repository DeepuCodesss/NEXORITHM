# Nexorithm Deployment Guide

## Vercel Deployment

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Set the required environment variables.
4. Deploy to a preview environment first.
5. Validate auth, submissions, rewards, and withdrawals.
6. Promote the preview deployment to production.

## PostgreSQL Setup

1. Create a PostgreSQL database.
2. Set `DATABASE_URL` to the PostgreSQL connection string.
3. Update the Prisma datasource provider to PostgreSQL as part of the migration.
4. Generate and review the Prisma migration.
5. Apply the migration in staging, then production.

## Prisma Migration Commands

```bash
npx prisma migrate dev
npx prisma migrate deploy
npx prisma generate
```

## Environment Variables

- `DATABASE_URL`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_WEBHOOK_SECRET`
- `CLERK_SIGN_IN_URL`
- `CLERK_SIGN_UP_URL`
- `CLERK_AFTER_SIGN_IN_URL`
- `CLERK_AFTER_SIGN_UP_URL`
- `REDIS_URL` for distributed rate limiting
- `JUDGE_USE_DOCKER` if Docker-based judging is enabled

## Backup Strategy

- Enable automated PostgreSQL backups.
- Keep point-in-time recovery enabled if available.
- Store at least one offsite backup copy.
- Test restore procedures regularly.

## Migration Notes

- The app now validates critical environment variables on startup.
- All reward granting and withdrawal changes must remain transactional.
- Rate limiting falls back to memory when Redis is unavailable.
- Health checks should confirm both application startup and database connectivity.
