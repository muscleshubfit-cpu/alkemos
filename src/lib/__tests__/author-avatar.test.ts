import { describe, expect, it } from "vitest";
import { existsSync, statSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { AHMED_ZAKE, getPersonSchema, resolveAuthor } from "../authors";

/**
 * Owner follow-up item 3 (2026-09-28) — «صورة المؤسس في المقالات».
 *
 * The article author card rendered a letter-"A" circle fallback instead of
 * the founder's photo. Guarded contracts:
 *
 *   1. The registry avatarUrl IS the founder's real photo — the dedicated
 *      square 400×400 face crop of the site's studio portrait
 *      /images/coach-portrait.jpg (the Facebook page picture was checked
 *      first per the owner's instruction and rejected: branded collage
 *      unreadable at avatar sizes + expiring signed CDN URLs).
 *   2. The avatar asset exists on disk, is non-trivial, and is a square
 *      400×400 JPEG (matches the og:image 400×400 declaration on the
 *      author profile pages — no aspect mismatch).
 *   3. The article byline component (shared EN+AR) renders the registry
 *      avatar through next/image AND keeps the letter-circle fallback for
 *      any future author without an avatar.
 *   4. Every historical DB author value resolves to a profile that CARRIES
 *      the avatar — no article byline can fall through to the letter.
 *   5. Person JSON-LD image = the same avatarUrl (byline ↔ schema never
 *      diverge).
 */

const PUBLIC_DIR = resolve(__dirname, "../../../public");
const ARTICLE_PAGE = resolve(
  __dirname,
  "../../components/blog/BlogArticlePage.tsx",
);
const AVATAR_ASSET = "images/authors/ahmed-zake-avatar.jpg";
const AVATAR_URL = `https://alkemos.com${"/"}images/authors/ahmed-zake-avatar.jpg`;

/** Minimal JPEG dimension reader (handles baseline + progressive SOFn). */
function jpegSize(buf: Buffer): { width: number; height: number } | null {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = buf[i + 1];
    // SOF0–SOF15 except DHT (C4), JPG (C8), DAC (CC) carry the frame
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    const len = buf.readUInt16BE(i + 2);
    if (len <= 0) return null;
    i += 2 + len;
  }
  return null;
}

describe("Owner follow-up item 3 — founder photo on every author card", () => {
  it("registry avatarUrl is the dedicated square founder avatar", () => {
    expect(AHMED_ZAKE.avatarUrl).toBe(AVATAR_URL);
    // the raw fallback (vertical portrait as avatar) must not return
    expect(AHMED_ZAKE.avatarUrl).not.toContain("coach-portrait");
  });

  it("avatar asset exists on disk, is non-trivial, and is a square 400×400 JPEG", () => {
    const p = resolve(PUBLIC_DIR, AVATAR_ASSET);
    expect(existsSync(p), `missing asset: ${AVATAR_ASSET}`).toBe(true);
    const size = statSync(p).size;
    expect(size).toBeGreaterThan(10_000); // real photo, not a stub
    expect(size).toBeLessThan(200_000); // avatar-sized, not a hero photo
    const dims = jpegSize(readFileSync(p));
    expect(dims, "parseable JPEG frame").not.toBeNull();
    expect(dims!.width).toBe(400);
    expect(dims!.height).toBe(400);
  });

  it("article byline renders the registry avatar with the letter-circle fallback intact", () => {
    const src = readFileSync(ARTICLE_PAGE, "utf8");
    // the avatar branch
    expect(src).toContain("resolveAuthor(post.author).avatarUrl");
    expect(src).toContain("bylineAvatarUrl");
    expect(src).toContain('sizes="40px"');
    // the graceful letter fallback branch survives for avatar-less authors
    expect(src).toContain("post.author.charAt(0)");
  });

  it("every historical DB author value resolves to a profile that carries the avatar", () => {
    for (const dbAuthor of [
      "Ahmed Zake",
      "Alkemos",
      "MuscleHub",
      "MuscleHubEG",
      null,
      undefined,
      "Some Future Coach",
    ]) {
      const profile = resolveAuthor(dbAuthor as string | null | undefined);
      expect(
        profile.avatarUrl,
        `byline must have an avatar for author value: ${String(dbAuthor)}`,
      ).toBe(AVATAR_URL);
    }
  });

  it("Person JSON-LD image = the byline avatar (schema ↔ UI consistency)", () => {
    const person = getPersonSchema(AHMED_ZAKE) as Record<string, unknown>;
    expect(person.image).toBe(AVATAR_URL);
  });
});
