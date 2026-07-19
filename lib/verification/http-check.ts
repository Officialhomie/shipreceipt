import type { VerificationCheck } from "@/lib/evidence/schema";
import { validateUrlForRequest } from "./url-safety";

interface SafeHttpResult {
  url: string;
  status: number;
  durationMs: number;
  headers: Record<string, string>;
  preview: string;
}

function numberSetting(name: string, fallback: number): number {
  const parsed = Number(process.env[name]);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function safeHttpRequest(input: string): Promise<SafeHttpResult> {
  const timeout = numberSetting("VERIFICATION_REQUEST_TIMEOUT_MS", 8000);
  const maxRedirects = numberSetting("VERIFICATION_MAX_REDIRECTS", 3);
  const maxBytes = numberSetting("VERIFICATION_MAX_RESPONSE_BYTES", 65_536);
  let current = (await validateUrlForRequest(input)).toString();
  const started = performance.now();

  for (let redirects = 0; redirects <= maxRedirects; redirects += 1) {
    const response = await fetch(current, {
      method: "GET",
      redirect: "manual",
      headers: { Accept: "text/plain,text/html,application/json;q=0.9,*/*;q=0.1" },
      signal: AbortSignal.timeout(timeout),
      cache: "no-store",
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error(`Redirect ${response.status} had no Location header`);
      if (redirects === maxRedirects) throw new Error("Target exceeded the redirect limit");
      current = (await validateUrlForRequest(new URL(location, current).toString())).toString();
      continue;
    }

    const contentLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > maxBytes) {
      throw new Error(`Response exceeds the ${maxBytes}-byte limit`);
    }
    const reader = response.body?.getReader();
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    if (reader) {
      while (bytes < maxBytes) {
        const { done, value } = await reader.read();
        if (done) break;
        const remaining = maxBytes - bytes;
        chunks.push(value.slice(0, remaining));
        bytes += Math.min(value.length, remaining);
        if (value.length > remaining) break;
      }
      await reader.cancel().catch(() => undefined);
    }
    const body = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.length;
    }
    const preview = new TextDecoder().decode(body).replace(/\s+/g, " ").slice(0, 500);
    return {
      url: current,
      status: response.status,
      durationMs: Math.round(performance.now() - started),
      headers: Object.fromEntries(
        ["content-type", "content-length", "cache-control"]
          .map((name) => [name, response.headers.get(name)])
          .filter((entry): entry is [string, string] => Boolean(entry[1])),
      ),
      preview,
    };
  }
  throw new Error("Redirect limit exceeded");
}

export async function runHttpCheck(
  id: string,
  url: string,
  label: string,
): Promise<VerificationCheck> {
  const startedAt = new Date().toISOString();
  const started = performance.now();
  try {
    const result = await safeHttpRequest(url);
    const passed = result.status >= 200 && result.status < 300;
    const completedAt = new Date().toISOString();
    return {
      id,
      type: "http",
      status: passed ? "passed" : "failed",
      startedAt,
      completedAt,
      durationMs: Math.round(performance.now() - started),
      summary: `${label} returned HTTP ${result.status}`,
      details: {
        ...result,
        target: result.url,
        expectedStatus: "200-299",
        observationSource:
          id === "health" || id === "readiness" ? "project-reported" : "independent",
      },
    };
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || /timed out|timeout/i.test(error.message));
    return {
      id,
      type: "http",
      status: "failed",
      startedAt,
      completedAt: new Date().toISOString(),
      durationMs: Math.round(performance.now() - started),
      summary: timedOut
        ? `${label} timed out before a response was completed`
        : `${label} failed: ${error instanceof Error ? error.message : "unknown error"}`,
      details: {
        target: url,
        url,
        expectedStatus: "200-299",
        observationSource:
          id === "health" || id === "readiness" ? "project-reported" : "independent",
        failureKind: timedOut ? "timeout" : "request",
      },
    };
  }
}
