"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

import siteMetadata from "@/data/siteMetadata";

/**
 * The palette in `app/globals.css` and the mermaid theme observer both key off
 * `data-theme`, and `tailwind.config.js` enables `dark:` variants from the same
 * attribute, so next-themes must write `data-theme` rather than a class.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme={siteMetadata.theme}
      enableSystem
    >
      {children}
    </ThemeProvider>
  );
}
