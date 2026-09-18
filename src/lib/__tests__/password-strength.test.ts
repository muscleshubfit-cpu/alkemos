import { describe, it, expect } from "vitest";
import { passwordStrength, strengthLabel } from "../password-strength";

/**
 * m8 canaries (DEEP-UX-AUDIT-2026-09-18) — the password meter is
 * DISPLAY-ONLY (the enforced gates stay minlength=8 + HIBP); these tests
 * pin the deterministic scoring so the meter never disagrees with itself.
 */

describe("passwordStrength — deterministic scoring", () => {
  it("returns 0 below the 8-char minimum (any content)", () => {
    expect(passwordStrength("")).toBe(0);
    expect(passwordStrength("Ab1!")).toBe(0);
    expect(passwordStrength("7chars!")).toBe(0);
  });

  it("meets-minimum single-class passwords are weak (1)", () => {
    expect(passwordStrength("password")).toBe(1); // lowercase only
    expect(passwordStrength("12345678")).toBe(1); // digits only
  });

  it("mixed-but-short or long-but-single-class are fair (2)", () => {
    expect(passwordStrength("Password1")).toBe(2); // 9 chars, 3 classes
    expect(passwordStrength("passwordspasswords")).toBe(2); // 17 chars, 1 class — length carries it
  });

  it("long + mixed classes are strong (3)", () => {
    expect(passwordStrength("Correct Horse 42")).toBe(3);
    expect(passwordStrength("Str0ng!Passw0rd")).toBe(3);
  });

  it("labels are bilingual", () => {
    expect(strengthLabel(3, true)).toBe("قوية");
    expect(strengthLabel(3, false)).toBe("Strong");
    expect(strengthLabel(0, false)).toBe("Too short");
  });
});
