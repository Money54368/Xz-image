import { NextRequest } from "next/server";

const upstreamOrigin = process.env.SUB2API_PROXY_ORIGIN || "http://127.0.0.1:5000";
const strippedUpstreamOrigin = upstreamOrigin.replace(/\/+$/, "");

function buildUpstreamUrl(pathSegments: string[], request: NextRequest) {
  const pathname = pathSegments.length > 0 ? `/${pathSegments.join("/")}` : "/";
  const url = new URL(`${strippedUpstreamOrigin}${pathname}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });
  return url;
}

function buildUpstreamHeaders(request: NextRequest) {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey === "host" ||
      lowerKey === "connection" ||
      lowerKey === "content-length" ||
      lowerKey === "x-forwarded-host" ||
      lowerKey === "x-forwarded-proto" ||
      lowerKey === "x-forwarded-for"
    ) {
      return;
    }
    headers.set(key, value);
  });
  return headers;
}

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const method = request.method.toUpperCase();
  const upstreamUrl = buildUpstreamUrl(pathSegments, request);
  const headers = buildUpstreamHeaders(request);

  const init: RequestInit & { duplex?: "half" } = {
    method,
    headers,
    redirect: "manual",
  };

  if (method !== "GET" && method !== "HEAD") {
    init.body = Buffer.from(await request.arrayBuffer());
    init.duplex = "half";
  }

  const upstreamResponse = await fetch(upstreamUrl, init);

  const responseHeaders = new Headers();
  upstreamResponse.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey === "content-encoding" || lowerKey === "transfer-encoding" || lowerKey === "connection") {
      return;
    }
    responseHeaders.set(key, value);
  });

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

async function handle(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  return proxyRequest(request, path);
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE, handle as OPTIONS, handle as HEAD };
