import localFont from "next/font/local";

export const fontSans = localFont({
  display: "swap",
  src: "../public/fonts/Inter-VariableFont_slnt,wght.ttf",
  variable: "--font-sans",
});

export const fontMono = localFont({
  src: [
    {
      path: "../public/fonts/SourceCodePro-Italic-VariableFont_wght.ttf",
      style: "italic",
    },
    {
      path: "../public/fonts/SourceCodePro-VariableFont_wght.ttf",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-mono",
});
