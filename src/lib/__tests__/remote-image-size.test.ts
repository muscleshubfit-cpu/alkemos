import { describe, expect, it } from "vitest";
import { sizedRemoteImage } from "../remote-image-size";

const PEXELS =
  "https://images.pexels.com/photos/5837247/pexels-photo-5837247.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";

describe("sizedRemoteImage (Phase 139 render-time Pexels resize)", () => {
  it("rewrites w/h/fit/fm on images.pexels.com urls", () => {
    const out = sizedRemoteImage(PEXELS, 800, 16 / 9);
    expect(out).toBeTruthy();
    expect(out).toContain("images.pexels.com/photos/5837247/");
    const u = new URL(out!);
    expect(u.searchParams.get("w")).toBe("800");
    expect(u.searchParams.get("h")).toBe("450");
    expect(u.searchParams.get("fit")).toBe("crop");
    expect(u.searchParams.get("fm")).toBe("webp");
    // auto=compress + cs=tinysrgb survive
    expect(u.searchParams.get("auto")).toBe("compress");
    expect(u.searchParams.get("cs")).toBe("tinysrgb");
  });

  it("2:1 hero aspect computes h = w/2", () => {
    const u = new URL(sizedRemoteImage(PEXELS, 1080, 2)!);
    expect(u.searchParams.get("w")).toBe("1080");
    expect(u.searchParams.get("h")).toBe("540");
  });

  it("passes non-Pexels hosts through UNCHANGED (Unsplash/Pixabay/local)", () => {
    const unsplash =
      "https://images.unsplash.com/photo-123?auto=format&fit=crop&w=1080&q=80";
    expect(sizedRemoteImage(unsplash, 600, 16 / 9)).toBe(unsplash);
    expect(sizedRemoteImage("/images/brand/hero-light.webp", 600)).toBe(
      "/images/brand/hero-light.webp",
    );
  });

  it("returns null for empty/null urls", () => {
    expect(sizedRemoteImage(null, 600)).toBeNull();
    expect(sizedRemoteImage(undefined, 600)).toBeNull();
    expect(sizedRemoteImage("", 600)).toBeNull();
  });

  it("handles a pexels url with no query string", () => {
    const out = sizedRemoteImage(
      "https://images.pexels.com/photos/1/pexels-photo-1.jpeg",
      600,
      16 / 9,
    );
    const u = new URL(out!);
    expect(u.searchParams.get("w")).toBe("600");
    expect(u.searchParams.get("h")).toBe("338");
    expect(u.searchParams.get("fit")).toBe("crop");
  });

  it("keeps the path intact (image-safety compare is query-insensitive)", () => {
    const out = sizedRemoteImage(PEXELS, 600, 16 / 9)!;
    expect(out.split("?")[0]).toBe(PEXELS.split("?")[0]);
  });
});
