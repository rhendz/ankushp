import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";
// App router includes @vercel/og.
// No need to install it.

// The edge runtime is deprecated in Next 16, and next/og's resvg wasm plus the
// bundled fonts pushed this function past the 1 MB edge size limit. On the
// nodejs runtime there is no such cap and the deprecation goes away; the font
// is read from disk below, since webpack rewrites
// `new URL(..., import.meta.url)` to a relative asset path that fetch rejects.
// next.config.js traces the font file into this function's bundle.
export const runtime = "nodejs";

const key = crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(process.env.OG_API_KEY),
  { name: "HMAC", hash: { name: "SHA-256" } },
  false,
  ["sign"],
);

function toHex(arrayBuffer: ArrayBuffer) {
  return Array.prototype.map
    .call(new Uint8Array(arrayBuffer), (n) => n.toString(16).padStart(2, "0"))
    .join("");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const token = searchParams.get("token");
    const title = searchParams.get("title");
    const imageSource = searchParams.get("image-src");

    if (!title || !imageSource) {
      throw new Error("Need to input valid title and/or image source!");
    }

    // Verify token
    const verifyToken = toHex(
      await crypto.subtle.sign(
        "HMAC",
        await key,
        new TextEncoder().encode(title + imageSource),
      ),
    );

    if (token !== verifyToken) {
      return new Response("Invalid token.", { status: 401 });
    }

    const interBold = await readFile(
      path.join(process.cwd(), "public", "fonts", "Inter-ExtraBold.ttf"),
    );

    // Set fontSize based off of title length
    const titleLength = title.length;
    let fontSize = 112;
    if (25 <= titleLength && titleLength < 50) {
      fontSize = 96;
    } else if (50 <= titleLength && titleLength < 100) {
      fontSize = 72;
    } else if (titleLength >= 100) {
      fontSize = 60;
    }

    return new ImageResponse(
      (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "1200px",
              height: "630px",
              display: "flex",
            }}
          >
            {/* Image */}
            {/* next/image is not supported inside next/og ImageResponse markup. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSource}
              alt="blog post banner"
              width="1200px"
              height="630px"
            />
            {/* Overlay Opaque Gradient */}
            <div
              style={{
                position: "absolute",
                background:
                  "linear-gradient(to right,rgba(0,0,0,0.5),rgba(0,0,0,0.5))",
                width: "100%",
                height: "100%",
                display: "flex",
              }}
            />
          </div>

          <div
            tw="text-gray-100"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              justifyItems: "center",
              width: "100%",
              height: "100%",
              flexDirection: "column",
              padding: "0 10%", // Added padding to maintain spacing for children
            }}
          >
            <h1
              style={{
                position: "relative",
                fontFamily: "Inter-ExtraBold",
                fontSize: fontSize,
                textAlign: "center", // Center align the text
              }}
            >
              {title.toUpperCase()}
            </h1>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Inter-ExtraBold",
            data: interBold,
            style: "normal",
          },
        ],
      },
    );
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.log(`${e}`);
    }
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
