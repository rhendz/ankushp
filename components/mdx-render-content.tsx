"use client";

import { MDXLayoutRenderer } from "pliny/mdx-components";

import { components } from "@/components/mdx-components";

type MdxRenderContentProps = {
  code: string;
  toc?: unknown;
};

export default function MdxRenderContent({ code, toc }: MdxRenderContentProps) {
  return <MDXLayoutRenderer code={code} components={components} toc={toc} />;
}
