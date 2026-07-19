import { afterEach, describe, expect, it, vi } from "vitest";

const { validateUrlForRequest } = vi.hoisted(() => ({
  validateUrlForRequest: vi.fn(async (input: string) => {
    if (input.includes("127.0.0.1")) {
      throw new Error("Private IP targets are not allowed");
    }
    return new URL(input);
  }),
}));

vi.mock("@/lib/verification/url-safety", () => ({ validateUrlForRequest }));

import { safeHttpRequest } from "@/lib/verification/http-check";

afterEach(() => {
  vi.restoreAllMocks();
  validateUrlForRequest.mockClear();
});

describe("safe HTTP requests", () => {
  it("revalidates every redirect target before following it", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, {
      status: 302,
      headers: { location: "http://127.0.0.1/admin" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(safeHttpRequest("https://example.com"))
      .rejects.toThrow("Private IP targets are not allowed");
    expect(validateUrlForRequest).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
