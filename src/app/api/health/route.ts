export async function GET() {
  return Response.json({
    ok: true,
    service: "nexorithm-web",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
}
