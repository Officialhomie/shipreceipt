const buckets = new Map<string, number[]>();

export function assertRateLimit(key: string): void {
  const max = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 10;
  const windowMs = (Number(process.env.RATE_LIMIT_WINDOW_SECONDS) || 60) * 1000;
  const now = Date.now();
  const recent = (buckets.get(key) || []).filter((timestamp) => timestamp > now - windowMs);
  if (recent.length >= max) throw new Error("RATE_LIMITED");
  recent.push(now);
  buckets.set(key, recent);
}

