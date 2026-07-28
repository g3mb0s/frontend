import { NextRequest } from "next/server";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:8003";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyAiRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyAiRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyAiRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyAiRequest(request, context);
}

async function proxyAiRequest(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  const upstreamUrl = new URL(`/${path.join("/")}`, AI_SERVICE_URL);
  upstreamUrl.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");

  try {
    const response = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body: request.body,
      duplex: "half",
    } as RequestInit & { duplex: "half" });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch {
    return Response.json({ message: "AI service is unavailable" }, { status: 503 });
  }
}
