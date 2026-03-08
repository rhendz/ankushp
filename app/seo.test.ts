import { describe, expect, it } from "vitest";
import siteMetadata from "@/data/siteMetadata";
import { genPageMetadata } from "./seo";

describe("genPageMetadata", () => {
  it("uses social banner by default when image is not provided", () => {
    const metadata = genPageMetadata({
      title: "Test Post",
      description: "Description",
    });

    expect(metadata.openGraph?.images).toEqual([siteMetadata.socialBanner]);
    expect(metadata.twitter?.images).toEqual([siteMetadata.socialBanner]);
  });

  it("uses custom image when provided", () => {
    const metadata = genPageMetadata({
      title: "Test Post",
      image: "https://example.com/custom-image.png",
    });

    expect(metadata.openGraph?.images).toEqual([
      "https://example.com/custom-image.png",
    ]);
    expect(metadata.twitter?.images).toEqual([
      "https://example.com/custom-image.png",
    ]);
  });

  it("passes through metadata overrides", () => {
    const metadata = genPageMetadata({
      title: "Test Post",
      alternates: {
        canonical: "https://ankushp.com/blog/posts/test-post",
      },
    });

    expect(metadata.alternates?.canonical).toBe(
      "https://ankushp.com/blog/posts/test-post",
    );
  });
});
