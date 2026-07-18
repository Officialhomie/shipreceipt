import { describe, expect, it } from "vitest";
import { isBlockedIp, resolveEndpoint } from "@/lib/verification/url-safety";

describe("SSRF protection", () => {
  it.each([
    "127.0.0.1",
    "10.0.0.1",
    "172.16.2.4",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "::1",
    "fc00::1",
    "fe80::1",
    "::ffff:127.0.0.1",
  ])("blocks private or special IP %s", (address) => {
    expect(isBlockedIp(address)).toBe(true);
  });

  it.each(["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"])(
    "allows a public IP %s",
    (address) => expect(isBlockedIp(address)).toBe(false),
  );

  it("resolves a relative endpoint against the deployment", () => {
    expect(resolveEndpoint("https://example.com/app", "/ready")).toBe(
      "https://example.com/ready",
    );
  });
});

