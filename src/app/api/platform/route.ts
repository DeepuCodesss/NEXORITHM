export async function GET() {
  return Response.json({
    brand: "NEXORITHM",
    tagline: "Code. Compete. Earn.",
    capabilities: [
      "daily-challenges",
      "streak-economy",
      "leaderboards",
      "monaco-workspace",
      "rewards",
      "public-profiles",
      "premium-membership",
    ],
    productionDependencies: [
      "NestJS API",
      "PostgreSQL",
      "Clerk",
      "Redis",
      "Razorpay",
      "isolated judge worker",
    ],
  });
}
