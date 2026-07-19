import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GitHubRateLimitError,
  parseGitHubRepositoryUrl,
  resolveGitHubRepository,
} from "@/lib/github/client";

afterEach(() => vi.unstubAllGlobals());

describe("parseGitHubRepositoryUrl", () => {
  it("parses a canonical public repository URL", () => {
    expect(parseGitHubRepositoryUrl("https://github.com/openai/openai-node")).toEqual({
      owner: "openai",
      repo: "openai-node",
    });
  });

  it("normalizes the optional git suffix", () => {
    expect(parseGitHubRepositoryUrl("https://github.com/openai/openai-node.git").repo).toBe(
      "openai-node",
    );
  });

  it.each([
    "http://github.com/openai/openai-node",
    "https://gitlab.com/openai/openai-node",
    "https://github.com/openai/openai-node/issues",
    "https://user:secret@github.com/openai/openai-node",
  ])("rejects unsupported repository URL %s", (url) => {
    expect(() => parseGitHubRepositoryUrl(url)).toThrow();
  });

  it("reports GitHub rate limiting distinctly and without leaking credentials", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", {
      status: 403,
      headers: { "x-ratelimit-remaining": "0" },
    })));
    await expect(resolveGitHubRepository("https://github.com/openai/openai-node"))
      .rejects.toBeInstanceOf(GitHubRateLimitError);
    await expect(resolveGitHubRepository("https://github.com/openai/openai-node"))
      .rejects.toThrow("try again later");
  });
});
