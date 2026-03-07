import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import {
  addClap,
  getClapsCapPerVisitor,
  getClapSummary,
} from "@/lib/claps-store";

const VISITOR_COOKIE = "clap_visitor_id";
const VISITOR_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function getVisitorId(request: NextRequest) {
  return request.cookies.get(VISITOR_COOKIE)?.value || randomUUID();
}

function withVisitorCookie(
  response: NextResponse,
  request: NextRequest,
  visitorId: string,
) {
  if (request.cookies.get(VISITOR_COOKIE)?.value) {
    return response;
  }

  response.cookies.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: VISITOR_COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}

function normalizeSlug(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().replace(/^\/+|\/+$/g, "");
}

function createInvalidSlugResponse() {
  return NextResponse.json(
    {
      error: "Missing or invalid slug.",
      code: "CLAPS_INVALID_SLUG",
    },
    { status: 400 },
  );
}

function createUnavailableResponse(cap: number) {
  return NextResponse.json(
    {
      configured: false,
      total: 0,
      user: 0,
      cap,
    },
    { status: 200 },
  );
}

export async function GET(request: NextRequest) {
  const slug = normalizeSlug(request.nextUrl.searchParams.get("slug"));
  if (!slug) {
    return createInvalidSlugResponse();
  }

  const visitorId = getVisitorId(request);
  const summary = await getClapSummary(slug, visitorId);
  const response = summary.configured
    ? NextResponse.json(summary, {
        status: 200,
        headers: {
          "Cache-Control": "private, max-age=10, stale-while-revalidate=30",
        },
      })
    : createUnavailableResponse(getClapsCapPerVisitor());

  return withVisitorCookie(response, request, visitorId);
}

export async function POST(request: NextRequest) {
  let body: { slug?: string; amount?: number } = {};
  try {
    body = (await request.json()) as { slug?: string; amount?: number };
  } catch {
    return createInvalidSlugResponse();
  }

  const slug = normalizeSlug(body.slug);
  if (!slug) {
    return createInvalidSlugResponse();
  }
  const amount =
    typeof body.amount === "number" && Number.isFinite(body.amount)
      ? Math.max(1, Math.min(10, Math.floor(body.amount)))
      : 1;

  const visitorId = getVisitorId(request);
  const summary = await addClap({
    slug,
    visitorId,
    ip: getClientIp(request),
    userAgent: request.headers.get("user-agent") || "unknown",
    amount,
  });

  if (!summary.configured) {
    const response = createUnavailableResponse(getClapsCapPerVisitor());
    return withVisitorCookie(response, request, visitorId);
  }

  if (summary.limited) {
    const response = NextResponse.json(
      {
        ...summary,
        error:
          "Too many claps in a short window. Please try again in a moment.",
        code: "CLAPS_RATE_LIMITED",
      },
      { status: 429 },
    );
    return withVisitorCookie(response, request, visitorId);
  }

  const response = NextResponse.json(summary, { status: 200 });
  return withVisitorCookie(response, request, visitorId);
}
