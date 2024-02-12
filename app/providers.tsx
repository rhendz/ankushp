// app/providers.tsx
"use client";

import { ThemeProvider } from "next-themes";

export function Providers({ children }) {
  return <ThemeProvider enableSystem>{children}</ThemeProvider>;
}
