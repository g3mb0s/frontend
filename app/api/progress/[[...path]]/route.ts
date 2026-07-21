import { NextRequest } from "next/server";
const EXERCISE_SERVICE_URL = process.env.EXERCISE_SERVICE_URL ?? "http://localhost:8002";
type RouteContext = { params: Promise<{ path?: string[] }> };
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest, context: RouteContext) { return proxy(request, context); }
export async function POST(request: NextRequest, context: RouteContext) { return proxy(request, context); }
async function proxy(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  const url = new URL(`/progress/${path.join("/")}`, EXERCISE_SERVICE_URL);
  url.search = request.nextUrl.search;
  const headers = new Headers(request.headers); headers.delete("host"); headers.delete("connection");
  try { const response = await fetch(url, { method: request.method, headers, body: request.body, duplex: "half" } as RequestInit & { duplex: "half" }); return new Response(response.body, { status: response.status, statusText: response.statusText, headers: response.headers }); } catch { return Response.json({ message: "Exercise service is unavailable" }, { status: 503 }); }
}
