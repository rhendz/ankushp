import "./globals.css"
import { fontSans } from "../lib/fonts"

export const metadata = {
  title: "Ankush Patel",
  description: "Ankush Patel | ML Engineer in the Bay Area",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={fontSans.variable}>{children}</body>
    </html>
  )
}
