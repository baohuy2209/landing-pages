import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
const display = localFont({
  src: "./fonts/archivo-latin-standard-normal.woff2",
  variable: "--font-display",
  display: "swap",
});
const body = localFont({
  src: "./fonts/Manrope.ttf",
  variable: "--font-body",
  display: "swap",
});
export const metadata: Metadata = {
  title: "Tempo — Make room for a better move.",
  description:
    "A sculptural journey through sixty-four squares. Explore chess, one thoughtful move at a time.",
  metadataBase: new URL("https://tempo-lndev.vercel.app"),
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
