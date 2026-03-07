import { beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/claps/route";
import { resetLocalClapStoreForTests } from "@/lib/claps-store";

function requestWithCookie(
  url: string,
  init?: RequestInit & { cookie?: string },
) {
  const headers = new Headers(init?.headers);
  if (init?.cookie) {
    headers.set("cookie", init.cookie);
  }
  return new NextRequest(url, { ...init, headers });
}

describe("/api/claps", () => {
  beforeEach(() => {
    resetLocalClapStoreForTests();
  });

  it("returns 400 when slug is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/claps");
    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  it("returns summary for valid slug and sets visitor cookie", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/claps?slug=sample-post",
    );
    const response = await GET(request);
    const body = (await response.json()) as {
      configured: boolean;
      total: number;
      user: number;
      cap: number;
    };

    expect(response.status).toBe(200);
    expect(body.configured).toBe(true);
    expect(body.total).toBe(0);
    expect(body.user).toBe(0);
    expect(body.cap).toBe(50);
    expect(response.headers.get("set-cookie")).toContain("clap_visitor_id=");
  });

  it("increments count with same visitor and enforces cap", async () => {
    const cookie = "clap_visitor_id=test-visitor-1";
    for (let index = 0; index < 60; index += 1) {
      const request = requestWithCookie("http://localhost:3000/api/claps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug: "cap-check-post" }),
        cookie,
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    }

    const summaryRequest = requestWithCookie(
      "http://localhost:3000/api/claps?slug=cap-check-post",
      {
        cookie,
      },
    );
    const summaryResponse = await GET(summaryRequest);
    const summaryBody = (await summaryResponse.json()) as {
      total: number;
      user: number;
      cap: number;
    };

    expect(summaryBody.user).toBe(50);
    expect(summaryBody.total).toBe(50);
    expect(summaryBody.cap).toBe(50);
  });
});
