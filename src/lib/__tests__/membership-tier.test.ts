import { describe, it, expect } from "vitest";
import { resolveMembershipTier } from "@/lib/membership-tier";

/**
 * Audit A-6 / Phase 141 canaries — the single tier resolver both auth
 * entry points share. These cases pin the EXACT semantics that used to
 * drift between getAuthUser() (API routes) and
 * getAuthUserFromHeaders() (server components).
 */

const sub = (tier: string) => ({
  tier,
  status: "active",
  end_date: "2099-01-01",
});

describe("resolveMembershipTier — staff", () => {
  it("coach → coaching (regardless of any subs)", () => {
    expect(resolveMembershipTier("coach", null)).toBe("coaching");
    expect(resolveMembershipTier("coach", [sub("free")])).toBe("coaching");
  });

  it("admin → coaching", () => {
    expect(resolveMembershipTier("admin", undefined)).toBe("coaching");
  });
});

describe("resolveMembershipTier — client, no membership", () => {
  it("no subs at all → free", () => {
    expect(resolveMembershipTier("client", null)).toBe("free");
  });

  it("empty array → free", () => {
    expect(resolveMembershipTier("client", [])).toBe("free");
  });

  it("undefined subs → free", () => {
    expect(resolveMembershipTier("client", undefined)).toBe("free");
  });

  it("coaching-only sub → coaching (EVO access)", () => {
    expect(resolveMembershipTier("client", [sub("coaching")])).toBe("coaching");
  });
});

describe("resolveMembershipTier — client, memberships", () => {
  it("premium → premium", () => {
    expect(resolveMembershipTier("client", [sub("premium")])).toBe("premium");
  });

  it("pro → pro", () => {
    expect(resolveMembershipTier("client", [sub("pro")])).toBe("pro");
  });

  it("premium + pro → pro (best membership wins)", () => {
    expect(resolveMembershipTier("client", [sub("premium"), sub("pro")])).toBe("pro");
    // order-independence: pro first
    expect(resolveMembershipTier("client", [sub("pro"), sub("premium")])).toBe("pro");
  });

  it("coaching + premium → premium (membership_tier reports the MEMBERSHIP; EVO merge is client-side)", () => {
    expect(
      resolveMembershipTier("client", [sub("coaching"), sub("premium")]),
    ).toBe("premium");
  });

  it("coaching + pro → pro", () => {
    expect(resolveMembershipTier("client", [sub("coaching"), sub("pro")])).toBe("pro");
  });
});

describe("resolveMembershipTier — 0045 legacy rows (the A-6 drift)", () => {
  it("legacy starter → premium (belt-and-suspenders 0045 map)", () => {
    // THIS is the exact case the old getAuthUserFromHeaders() got
    // wrong: a stray starter row resolved to "free" there while
    // getAuthUser() correctly said "premium".
    expect(resolveMembershipTier("client", [sub("starter")])).toBe("premium");
  });

  it("legacy elite → pro", () => {
    expect(resolveMembershipTier("client", [sub("elite")])).toBe("pro");
  });

  it("legacy elite + premium → pro (legacy maps to the stronger tier)", () => {
    expect(
      resolveMembershipTier("client", [sub("elite"), sub("premium")]),
    ).toBe("pro");
  });

  it("legacy starter + premium → premium (same priority band, stable)", () => {
    expect(
      resolveMembershipTier("client", [sub("starter"), sub("premium")]),
    ).toBe("premium");
  });

  it("legacy starter + coaching → premium (membership beats coaching-only)", () => {
    expect(
      resolveMembershipTier("client", [sub("starter"), sub("coaching")]),
    ).toBe("premium");
  });
});

describe("resolveMembershipTier — defensive behavior", () => {
  it("unknown tier strings are ignored → free (auth can never crash on bad data)", () => {
    expect(resolveMembershipTier("client", [sub("mega")])).toBe("free");
  });

  it("unknown tier + coaching → coaching", () => {
    expect(resolveMembershipTier("client", [sub("mega"), sub("coaching")])).toBe(
      "coaching",
    );
  });
});
