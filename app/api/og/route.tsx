import { ImageResponse } from "next/og";
// App router includes @vercel/og.
// No need to install it.

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title");
    const imageSource = searchParams.get("image-src");

    if (!title || !imageSource) {
      throw new Error("Need to input valid title and/or image source!");
    }

    const interBold = await fetch(
      new URL("../../../public/fonts/Inter-ExtraBold.ttf", import.meta.url),
    ).then((res) => res.arrayBuffer());

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
