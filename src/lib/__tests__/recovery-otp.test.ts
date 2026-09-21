import { describe, expect, it } from "vitest";

import { isValidOtpToken, normalizeOtpToken } from "../recovery-otp";

/**
 * RECOVERY-OTP MODE (2026-09-22, owner order «نفذ خيار otp») — the
 * 6-digit code entry on /auth/reset?mode=code. The normalizer must
 * accept every realistic typing/pasting form (Arabic-Indic digits,
 * spaces, dashes) and the validator must reject partial entry before
 * verifyOtp is ever called.
 */

describe("normalizeOtpToken", () => {
  it("passes clean ASCII digits through", () => {
    expect(normalizeOtpToken("123456")).toBe("123456");
  });

  it("strips spaces, dashes and separators from pasted codes", () => {
    expect(normalizeOtpToken("123 456")).toBe("123456");
    expect(normalizeOtpToken("123-456")).toBe("123456");
    expect(normalizeOtpToken(" 1 2 3 - 4 5 6 ")).toBe("123456");
  });

  it("maps Arabic-Indic digits (٠-٩) to ASCII", () => {
    expect(normalizeOtpToken("١٢٣٤٥٦")).toBe("123456");
    expect(normalizeOtpToken("٠٩٨٧٦٥")).toBe("098765");
  });

  it("maps Eastern Arabic-Indic digits (۰-۹) to ASCII", () => {
    expect(normalizeOtpToken("۱۲۳۴۵۶")).toBe("123456");
  });

  it("maps a mixed Arabic/ASCII paste", () => {
    expect(normalizeOtpToken("١2 ٣٤ 5٦")).toBe("123456");
  });

  it("drops letters and symbols entirely", () => {
    expect(normalizeOtpToken("abc123def456!@#")).toBe("123456");
  });

  it("returns an empty string for empty and non-digit input", () => {
    expect(normalizeOtpToken("")).toBe("");
    expect(normalizeOtpToken(null)).toBe("");
    expect(normalizeOtpToken(undefined)).toBe("");
    expect(normalizeOtpToken("abcdef")).toBe("");
    expect(normalizeOtpToken("   ---   ")).toBe("");
  });

  it("keeps extra digits (validation is the validator's job)", () => {
    expect(normalizeOtpToken("1234567")).toBe("1234567");
  });
});

describe("isValidOtpToken", () => {
  it("accepts exactly six ASCII digits", () => {
    expect(isValidOtpToken("123456")).toBe(true);
    expect(isValidOtpToken("000000")).toBe(true);
    expect(isValidOtpToken("903425")).toBe(true);
  });

  it("rejects partial entry, longer strings and non-digits", () => {
    expect(isValidOtpToken("12345")).toBe(false);
    expect(isValidOtpToken("1234567")).toBe(false);
    expect(isValidOtpToken("")).toBe(false);
    expect(isValidOtpToken("12 45a")).toBe(false);
    expect(isValidOtpToken("١٢٣٤٥٦".replace(/[٠-٩]/g, "x"))).toBe(false);
  });

  it("pairs with the normalizer for the full entry law", () => {
    const token = normalizeOtpToken("١٢٣ - ٤٥٦");
    expect(isValidOtpToken(token)).toBe(true);
    expect(isValidOtpToken(normalizeOtpToken("12 345"))).toBe(false);
  });
});
