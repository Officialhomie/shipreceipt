import type { Metadata } from "next";
import Link from "next/link";
import { createPublicClient, http } from "viem";
import { PublicReceipt } from "@/components/public-receipt";
import { monadTestnet } from "@/lib/config/monad";
import { registryAbi } from "@/lib/monad/registry";
import { getEvidenceRepository } from "@/lib/persistence/repository";

async function receiptStatusLabel(receiptId: string): Promise<string | null> {
  if (!/^\d+$/.test(receiptId)) return null;
  try {
    const metadata = await getEvidenceRepository().getReceiptMetadata(receiptId);
    if (!metadata) return null;
    const client = createPublicClient({
      chain: monadTestnet,
      transport: http(process.env.MONAD_RPC_URL || process.env.NEXT_PUBLIC_MONAD_RPC_URL || "https://testnet-rpc.monad.xyz"),
    });
    const receipt = await client.readContract({
      address: metadata.contractAddress,
      abi: registryAbi,
      functionName: "getReceipt",
      args: [BigInt(receiptId)],
    });
    return ["Failed", "Partial", "Verified", "Revoked"][receipt.status] || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ receiptId: string }> }): Promise<Metadata> {
  const { receiptId } = await params;
  const status = await receiptStatusLabel(receiptId);
  const title = `ShipReceipt #${receiptId} — ${status ? `${status} ` : ""}Build Receipt`;
  const description = "Inspect what passed or failed, who issued the receipt, and whether the stored evidence still matches its Monad integrity anchor.";
  return { title, description, openGraph: { title, description, type: "article" }, twitter: { card: "summary", title, description } };
}

export default async function ReceiptPage({ params }: { params: Promise<{ receiptId: string }> }) {
  const { receiptId } = await params;
  return <main>
    <nav className="nav shell"><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true" />ShipReceipt</Link><Link className="nav-link" href="/verify">Check another build</Link></nav>
    <header className="page-header receipt-page-header shell"><span className="eyebrow">Public build snapshot</span><h1>Receipt #{receiptId}</h1><p>See what was checked, who issued the receipt, and whether the available evidence still matches the root recorded on Monad.</p></header>
    <section className="shell"><PublicReceipt receiptId={receiptId} /></section>
  </main>;
}
