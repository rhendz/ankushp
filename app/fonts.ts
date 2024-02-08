import { Inter as FontSans, Roboto_Mono as FontMono } from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const fontMono = FontMono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});
