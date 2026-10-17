import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
const display = localFont({
  src: "./fonts/DelaGothicOne.ttf",
  variable: "--font-display",
  display: "swap",
});
const body = localFont({
  src: "./fonts/Manrope.ttf",
  variable: "--font-body",
  display: "swap",
});
export const metadata: Metadata = {
  title: "Oddpress — Perfectly off-register",
  description:
    "An imaginary independent print club. A little ink. A happy accident. Make something wonderfully imperfect.",
  metadataBase: new URL("https://oddpress-lndev.vercel.app"),
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
