import { describe, it, expect } from "vitest";
import { isAdoptableInvitedUser } from "../auth-invite-adopt";

/**
 * H1-2026 canaries (UX-TEST-REPORT-2026-09-21 §3 — reproduced live twice
 * on production 2026-09-21 with SQL proof: both stranded invitees show
 * was_invited=true + never_signed_in=true + encrypted_password='').
 *
 * The adoption gate must open ONLY for a pending invite (invited_at set +
 * never signed in). Failing open for a self-registered or activated user
 * would let this path overwrite a real account's password — the critical
 * negative this suite pins.
 */
describe("isAdoptableInvitedUser — H1-2026 adoption gate", () => {
  // The live-verified shape of a stranded invitee (qa.ux0922.client3,
  // production SQL 2026-09-21): invite created the row, client never got in.
  const strandedInvitee = {
    id: "6682f0f8-0000-0000-0000-000000000000",
    invited_at: "2026-09-21T17:00:10.819628+00:00",
    last_sign_in_at: null,
    email: "qa.ux0922.client3@alkemos-test.com",
  };

  it("opens for the stranded invitee: invited + never signed in", () => {
    expect(isAdoptableInvitedUser(strandedInvitee)).toBe(true);
  });

  it("opens when last_sign_in_at is undefined (field absent)", () => {
    expect(isAdoptableInvitedUser({ invited_at: "2026-09-21T17:00:10Z" })).toBe(true);
  });

  it("CLOSES for a signed-in invitee (already activated — password protected)", () => {
    expect(
      isAdoptableInvitedUser({
        ...strandedInvitee,
        last_sign_in_at: "2026-09-21T18:00:00Z",
      }),
    ).toBe(false);
  });

  it("CLOSES for a self-registered user (no invited_at — normal signup)", () => {
    // The critical negative: regular accounts NEVER carry invited_at —
    // their passwords can never be rewritten by the adopt path.
    expect(
      isAdoptableInvitedUser({
        invited_at: null,
        last_sign_in_at: null,
      }),
    ).toBe(false);
  });

  it("CLOSES when invited_at is empty/missing (fail-closed default)", () => {
    expect(isAdoptableInvitedUser({ invited_at: "", last_sign_in_at: null })).toBe(false);
    expect(isAdoptableInvitedUser({})).toBe(false);
  });

  it("CLOSES on null/undefined user", () => {
    expect(isAdoptableInvitedUser(null)).toBe(false);
    expect(isAdoptableInvitedUser(undefined)).toBe(false);
  });
});
