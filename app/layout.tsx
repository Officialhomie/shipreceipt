import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "ShipReceipt — Proof your build works",
  description: "Verify a live deployment, bind it to a GitHub commit, and create a tamper-evident receipt on Monad.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="h-full antialiased"><body className="min-h-full"><Providers>{children}</Providers></body></html>;
}
