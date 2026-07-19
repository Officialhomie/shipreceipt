const buckets = new Map<string, number[]>();
let lastSweep = 0;

export function assertRateLimit(key: string): void {
  const max = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 10;
  const windowMs = (Number(process.env.RATE_LIMIT_WINDOW_SECONDS) || 60) * 1000;
  const now = Date.now();
  if (now - lastSweep > windowMs) {
    for (const [bucketKey, timestamps] of buckets) {
      const active = timestamps.filter((timestamp) => timestamp > now - windowMs);
      if (active.length === 0) buckets.delete(bucketKey);
      else buckets.set(bucketKey, active);
    }
    lastSweep = now;
  }
  const recent = (buckets.get(key) || []).filter((timestamp) => timestamp > now - windowMs);
  if (recent.length >= max) throw new Error("RATE_LIMITED");
  recent.push(now);
  buckets.set(key, recent);
}
