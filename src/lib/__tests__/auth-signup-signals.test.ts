import { describe, it, expect } from "vitest";
import { isDuplicateEmailSignup } from "../auth-signup-signals";

/**
 * M2 canaries (DEEP-UX-AUDIT-2026-09-18, owner decision 2026-09-18 —
 * m9 resolved: signup stays INSTANT, no email confirmation).
 *
 * The duplicate-email signal is the deterministic GoTrue discriminator
 * verified live against production on 2026-09-18: a signup for an
 * already-registered email answers HTTP 200 with a FAKE user whose
 * `identities` array is EMPTY (anti-enumeration) and no session — while
 * a genuine new signup always carries ≥1 identity. The predicate must
 * never mislabel a genuine signup (that would block real registrations).
 */
describe("isDuplicateEmailSignup — GoTrue duplicate-email signal (M2)", () => {
  // The exact shape captured live from production GoTrue (2026-09-18):
  // signUp for qa.audit227.free1@alkemos-test.com → 200 + fake user.
  const goTrueDuplicateAnswer = {
    id: "1d7e5ed6-6d3f-491d-a1be-34f298da9e69",
    aud: "authenticated",
    role: "",
    email: "qa.audit227.free1@alkemos-test.com",
    phone: "",
    confirmation_sent_at: "2026-09-18T00:56:15.38108491Z",
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {},
    identities: [],
    created_at: "2026-09-18T00:56:15.38108491Z",
    updated_at: "2026-09-18T00:56:15.38108491Z",
    is_anonymous: false,
  };

  it("detects GoTrue's duplicate answer: truthy user + EMPTY identities", () => {
    expect(isDuplicateEmailSignup(goTrueDuplicateAnswer)).toBe(true);
  });

  it("genuine signup (one identity) is NOT a duplicate — the critical negative", () => {
    const genuine = {
      ...goTrueDuplicateAnswer,
      identities: [
        {
          id: "1d7e5ed6-6d3f-491d-a1be-34f298da9e69",
          user_id: "1d7e5ed6-6d3f-491d-a1be-34f298da9e69",
          identity_data: { email: "new.user@example.com" },
          provider: "email",
        },
      ],
    };
    expect(isDuplicateEmailSignup(genuine)).toBe(false);
  });

  it("null / undefined user is never a duplicate (honest fallback)", () => {
    expect(isDuplicateEmailSignup(null)).toBe(false);
    expect(isDuplicateEmailSignup(undefined)).toBe(false);
  });

  it("missing or non-array identities is NOT a duplicate (never blocks a signup)", () => {
    expect(isDuplicateEmailSignup({})).toBe(false);
    expect(isDuplicateEmailSignup({ identities: undefined })).toBe(false);
    expect(isDuplicateEmailSignup({ identities: null })).toBe(false);
  });
});
