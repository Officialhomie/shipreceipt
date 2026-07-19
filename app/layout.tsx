import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://shipreceipt.vercel.app"),
  title: "ShipReceipt — Proof of What Actually Shipped",
  description: "Verify an AI-assisted software build, record what passed or failed, and preserve the evidence in a tamper-evident receipt on Monad.",
  openGraph: {
    type: "website",
    title: "ShipReceipt — Proof of What Actually Shipped",
    description: "Verify an AI-assisted software build, record what passed or failed, and preserve the evidence in a tamper-evident receipt on Monad.",
    url: "https://shipreceipt.vercel.app",
    siteName: "ShipReceipt",
  },
  twitter: {
    card: "summary",
    title: "ShipReceipt — Proof of What Actually Shipped",
    description: "Real build checks. Honest failures. Tamper-evident receipts on Monad.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="h-full antialiased"><body className="min-h-full"><Providers>{children}</Providers></body></html>;
}
