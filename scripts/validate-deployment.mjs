import { existsSync } from "node:fs";
import { resolve } from "node:path";

const requiredVars = ["DATABASE_URL", "CLERK_SECRET_KEY", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"];
const missing = requiredVars.filter((name) => !process.env[name]?.trim());

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const generatedClientPath = resolve("src/generated/prisma/client.ts");
if (!existsSync(generatedClientPath)) {
  console.error("Prisma client has not been generated.");
  process.exit(1);
}

if (!process.env.REDIS_URL?.trim()) {
  console.warn("REDIS_URL is missing. Memory rate limiting will be used.");
}

console.log("Deployment validation passed.");
