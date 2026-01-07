import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";

const cySans = localFont({
  src: [
    {
      path: "../public/fonts/Cy-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Cy-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Cy-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Paythru - Institutional Crypto Trading Desk",
  description: "Execute large-volume cryptocurrency trades with deep liquidity, competitive pricing, and white-glove service. Trusted OTC desk for institutions, funds, and high-net-worth individuals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${cySans.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
