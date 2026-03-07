import { NewsletterAPI } from "pliny/newsletter";
import { NextRequest, NextResponse } from "next/server";
import {
  getNewsletterProvider,
  getNewsletterStatus,
} from "@/lib/newsletter-config";
import { newsletterMessages } from "@/lib/newsletter-messages";

type ErrorCategory = "provider" | "missing-config" | "api-failure";
type LogLevel = "info" | "warn" | "error";

interface ErrorDescriptor {
  category: ErrorCategory;
  code: string;
  status: number;
  error: string;
}

const userFacingUnavailableMessage = newsletterMessages.unavailable;
const cacheHeaders = {
  "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
};

const errorByPath = {
  providerUnavailable: {
    category: "provider",
    code: "NEWSLETTER_PROVIDER_UNAVAILABLE",
    status: 503,
    error: userFacingUnavailableMessage,
  },
  missingConfig: {
    category: "missing-config",
    code: "NEWSLETTER_NOT_CONFIGURED",
    status: 503,
    error: userFacingUnavailableMessage,
  },
  providerApiFailure: {
    category: "api-failure",
    code: "NEWSLETTER_PROVIDER_API_ERROR",
    status: 502,
    error: newsletterMessages.providerApiError,
  },
} as const satisfies Record<string, ErrorDescriptor>;

function logNewsletter(
  level: LogLevel,
  event: string,
  {
    provider,
    configured,
    errorCategory,
    errorCode,
    responseStatus,
  }: {
    provider: string | null;
    configured: boolean;
    errorCategory?: ErrorCategory;
    errorCode?: string;
    responseStatus?: number;
  },
) {
  const payload = {
    event,
    provider,
    configured,
    errorCategory,
    errorCode,
    responseStatus,
  };

  if (level === "error") {
    console.error("[newsletter-api]", payload);
    return;
  }
  if (level === "warn") {
    console.warn("[newsletter-api]", payload);
    return;
  }
  console.info("[newsletter-api]", payload);
}

function jsonErrorResponse(errorDescriptor: ErrorDescriptor) {
  return NextResponse.json(
    {
      error: errorDescriptor.error,
      code: errorDescriptor.code,
      category: errorDescriptor.category,
    },
    { status: errorDescriptor.status },
  );
}

export async function GET() {
  const status = getNewsletterStatus();

  if (!status.configured) {
    const descriptor = status.provider
      ? errorByPath.missingConfig
      : errorByPath.providerUnavailable;
    logNewsletter("warn", "newsletter.get.unavailable", {
      provider: status.provider,
      configured: status.configured,
      errorCategory: descriptor.category,
      errorCode: descriptor.code,
      responseStatus: 200,
    });

    return NextResponse.json(
      {
        configured: false,
        provider: status.provider,
        message: descriptor.error,
        category: descriptor.category,
        code: descriptor.code,
      },
      { headers: cacheHeaders },
    );
  }

  logNewsletter("info", "newsletter.get.available", {
    provider: status.provider,
    configured: status.configured,
    responseStatus: 200,
  });

  return NextResponse.json(
    { configured: true, provider: status.provider },
    { headers: cacheHeaders },
  );
}

export async function POST(request: NextRequest) {
  const provider = getNewsletterProvider();
  const status = getNewsletterStatus();

  logNewsletter("info", "newsletter.post.received", {
    provider,
    configured: status.configured,
  });

  if (!provider) {
    const descriptor = errorByPath.providerUnavailable;
    logNewsletter("warn", "newsletter.post.failed", {
      provider: null,
      configured: false,
      errorCategory: descriptor.category,
      errorCode: descriptor.code,
      responseStatus: descriptor.status,
    });
    return jsonErrorResponse(descriptor);
  }

  if (!status.configured) {
    const descriptor = errorByPath.missingConfig;
    logNewsletter("warn", "newsletter.post.failed", {
      provider,
      configured: false,
      errorCategory: descriptor.category,
      errorCode: descriptor.code,
      responseStatus: descriptor.status,
    });
    return jsonErrorResponse(descriptor);
  }

  if (provider === "buttondown") {
    const { email } = (await request.json()) as { email?: string };
    if (!email) {
      logNewsletter("warn", "newsletter.post.failed", {
        provider,
        configured: true,
        errorCategory: "provider",
        errorCode: "NEWSLETTER_EMAIL_REQUIRED",
        responseStatus: 400,
      });
      return NextResponse.json(
        {
          error: newsletterMessages.emailRequired,
          code: "NEWSLETTER_EMAIL_REQUIRED",
          category: "provider",
        },
        { status: 400 },
      );
    }

    let response: Response;
    try {
      response = await fetch("https://api.buttondown.email/v1/subscribers", {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          type: "regular",
        }),
      });
    } catch {
      const descriptor = errorByPath.providerApiFailure;
      logNewsletter("error", "newsletter.post.failed", {
        provider,
        configured: true,
        errorCategory: descriptor.category,
        errorCode: descriptor.code,
        responseStatus: descriptor.status,
      });
      return jsonErrorResponse(descriptor);
    }

    let providerBody: { code?: string } | null = null;
    try {
      providerBody = (await response.json()) as { code?: string };
    } catch {
      providerBody = null;
    }

    if (providerBody?.code === "email_already_exists") {
      logNewsletter("info", "newsletter.post.already-subscribed", {
        provider,
        configured: true,
        responseStatus: 200,
      });
      return NextResponse.json(
        {
          message: newsletterMessages.alreadySubscribed,
        },
        { status: 200 },
      );
    }

    if (response.status >= 400) {
      const descriptor = errorByPath.providerApiFailure;
      logNewsletter("error", "newsletter.post.failed", {
        provider,
        configured: true,
        errorCategory: descriptor.category,
        errorCode: providerBody?.code || descriptor.code,
        responseStatus: response.status,
      });
      return jsonErrorResponse({ ...descriptor, status: response.status });
    }

    logNewsletter("info", "newsletter.post.success", {
      provider,
      configured: true,
      responseStatus: 201,
    });
    return NextResponse.json(
      { message: newsletterMessages.subscribed },
      { status: 201 },
    );
  }

  try {
    const response = await NewsletterAPI(request, { provider });
    if (response.status >= 400) {
      const descriptor = errorByPath.providerApiFailure;
      logNewsletter("error", "newsletter.post.failed", {
        provider,
        configured: true,
        errorCategory: descriptor.category,
        errorCode: descriptor.code,
        responseStatus: response.status,
      });
    } else {
      logNewsletter("info", "newsletter.post.success", {
        provider,
        configured: true,
        responseStatus: response.status,
      });
    }
    return response;
  } catch {
    const descriptor = errorByPath.providerApiFailure;
    logNewsletter("error", "newsletter.post.failed", {
      provider,
      configured: true,
      errorCategory: descriptor.category,
      errorCode: descriptor.code,
      responseStatus: descriptor.status,
    });
    return jsonErrorResponse(descriptor);
  }
}
