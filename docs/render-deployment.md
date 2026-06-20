# Render Deployment

## Services

- Web Service for the Next.js app
- PostgreSQL database
- Redis or Key Value store for distributed rate limiting
- Optional Docker-based judge service if you want isolated execution

## Build Command

```bash
npm ci
npm run build
```

## Start Command

```bash
npm start
```

## Required Environment Variables

- `DATABASE_URL`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `REDIS_URL`
- `CLERK_SIGN_IN_URL`
- `CLERK_SIGN_UP_URL`
- `CLERK_AFTER_SIGN_IN_URL`
- `CLERK_AFTER_SIGN_UP_URL`
- `JUDGE_USE_DOCKER`
- `JAVA_JUDGE_SERVICE_URL`

## PostgreSQL Migration Steps

1. Create a Render PostgreSQL instance.
2. Copy the connection string into `DATABASE_URL`.
3. Generate Prisma client after the schema update.
4. Run Prisma migrations against the Render database.
5. Verify the app can query the database with `/api/health`.

## Judge Service

- The judge can run as a separate Render Web Service or Docker-backed service.
- Required port is whatever your service binds to internally, typically `10000` on Render or the port provided by `PORT`.
- Java submissions are sent to `JAVA_JUDGE_SERVICE_URL`.
- The Docker deployment exposes the Java judge endpoint at `/api/java-judge`.
- Set `JAVA_JUDGE_SERVICE_URL` on the main website to `https://nexorithm-docker.onrender.com/api/java-judge`.
- The Next.js app still judges C, C++, Python, and JavaScript in-process.

## Notes

- `npm run lint` and `npm run build` should pass before deployment.
- For free-tier launch, keep the app, database, and rate limiting on free plans if available.
