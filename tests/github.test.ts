import { describe, expect, it } from "vitest";
import { parseGitHubRepositoryUrl } from "@/lib/github/client";

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
});

