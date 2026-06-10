import { describe, it, expect } from "vitest";
import { cloudflareBeaconToken } from "../../src/lib/analytics";

describe("cloudflareBeaconToken", () => {
  it("returns the token in a production build when one is set", () => {
    expect(cloudflareBeaconToken("abc123", true)).toBe("abc123");
  });

  it("returns null in development even when a token is set", () => {
    expect(cloudflareBeaconToken("abc123", false)).toBeNull();
  });

  it("returns null when the token is empty or whitespace-only", () => {
    expect(cloudflareBeaconToken("", true)).toBeNull();
    expect(cloudflareBeaconToken("   ", true)).toBeNull();
  });

  it("trims surrounding whitespace from the token", () => {
    expect(cloudflareBeaconToken("  abc123  ", true)).toBe("abc123");
  });
});
