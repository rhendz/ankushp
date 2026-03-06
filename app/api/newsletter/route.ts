import { NewsletterAPI } from "pliny/newsletter";
import { NextRequest, NextResponse } from "next/server";
import {
  getNewsletterProvider,
  getNewsletterStatus,
} from "@/lib/newsletter-config";

const missingConfigError = {
  error:
    "Newsletter subscriptions are currently unavailable due to missing configuration.",
  code: "NEWSLETTER_NOT_CONFIGURED",
};

export async function GET() {
  const status = getNewsletterStatus();

  if (!status.configured) {
    return NextResponse.json({
      configured: false,
      provider: status.provider,
      message: missingConfigError.error,
    });
  }

  return NextResponse.json({ configured: true, provider: status.provider });
}

export async function POST(request: NextRequest) {
  const provider = getNewsletterProvider();

  if (!provider) {
    return NextResponse.json(missingConfigError, { status: 503 });
  }

  const status = getNewsletterStatus();
  if (!status.configured) {
    return NextResponse.json(missingConfigError, { status: 503 });
  }

  if (provider === "buttondown") {
    const { email } = (await request.json()) as { email?: string };
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const response = await fetch(
      "https://api.buttondown.email/v1/subscribers",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          type: "regular",
        }),
      },
    );

    let providerBody: { code?: string } | null = null;
    try {
      providerBody = (await response.json()) as { code?: string };
    } catch {
      providerBody = null;
    }

    if (providerBody?.code === "email_already_exists") {
      return NextResponse.json(
        {
          message: "You're already subscribed.",
        },
        { status: 200 },
      );
    }

    if (response.status >= 400) {
      return NextResponse.json(
        { error: "There was an error subscribing to the list" },
        { status: response.status },
      );
    }

    return NextResponse.json(
      { message: "Successfully subscribed to the newsletter" },
      { status: 201 },
    );
  }

  return NewsletterAPI(request, { provider });
}
