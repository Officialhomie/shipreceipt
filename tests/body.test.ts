import { describe, expect, it } from "vitest";
import { readBoundedJson, RequestBodyTooLargeError } from "@/lib/http/body";

describe("bounded JSON bodies", () => {
  it("parses a body below the byte limit", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ ok: true }),
    });
    await expect(readBoundedJson(request, 64)).resolves.toEqual({ ok: true });
  });

  it("rejects a streamed body above the byte limit", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ value: "x".repeat(100) }),
    });
    await expect(readBoundedJson(request, 24)).rejects.toBeInstanceOf(
      RequestBodyTooLargeError,
    );
  });
});
