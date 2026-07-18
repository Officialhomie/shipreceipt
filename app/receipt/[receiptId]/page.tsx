import Link from "next/link";
import { PublicReceipt } from "@/components/public-receipt";

export default async function ReceiptPage({ params }: { params: Promise<{ receiptId: string }> }) {
  const { receiptId } = await params;
  return <main><nav className="nav shell"><Link className="brand" href="/"><span className="brand-mark"/>ShipReceipt</Link><span className="nav-note">Public verification receipt</span></nav><header className="page-header shell"><span className="eyebrow">Public proof</span><h1>Receipt #{receiptId}</h1><p>The visible evidence is independently re-hashed and compared with the receipt stored on Monad Testnet.</p></header><section className="shell"><PublicReceipt receiptId={receiptId}/></section></main>;
}

