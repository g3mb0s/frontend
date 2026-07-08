import { NextRequest } from "next/server";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL ?? "http://localhost:8000";

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyAuthRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyAuthRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyAuthRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyAuthRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyAuthRequest(request, context);
}

async function proxyAuthRequest(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  const upstreamUrl = new URL(`/auth/${path.join("/")}`, AUTH_SERVICE_URL);
  upstreamUrl.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");

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
}
