import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";

/**
 * PHASE 340 — W1-4c (remediation plan §6.2, audit B-03): the meal
 * planner's food search (FoodSearchInput — the ONE implementation file
 * that serves BOTH /meal-planner and /ar/meal-planner; the AR route
 * re-exports this page) debounced its fetch but never cancelled the
 * in-flight request: a slow stale response («chick» resolving after
 * «chicken») landed its OLDER results over the newer, correct ones —
 * and its finally-block cleared the newer query's spinner mid-flight.
 *
 * The B-03 fix this canary pins as CLOSED (fix direction, verbatim:
 * «AbortController لكل استعلام + إلغاء بالتنظيف»):
 *   - every query owns its OWN AbortController — the effect cleanup
 *     aborts the superseded query's in-flight request (every keystroke
 *     that changes the query, and unmount);
 *   - ownership guards: an aborted query writes NOTHING — not results,
 *     not open, and not loading (a late-body belt drops a stale body
 *     that slips past the transport abort);
 *   - the empty-query branch resets the whole surface including the
 *     spinner (no successor query exists to own it);
 *   - the 300ms debounce, the URL law (`lang=${isAr ? "ar" : "en"}`),
 *     the empty-query reset, and pick() are all unchanged.
 *
 * Two layers, like the W1-3a..e + W1-4a/b canaries:
 *   1. SOURCE PINS — the contract machine-checked in the page source.
 *   2. BEHAVIOR — jsdom renders the REAL page (the anonymous visitor,
 *     the full site chrome mocked only at the true seams) and drives
 *     the exact race the audit described, with a fetch double whose
 *     transport is FAITHFUL to real fetch (an aborted signal rejects
 *     with AbortError and never delivers a response).
 */

vi.mock("next/navigation", () => {
  // Mutable path — the EN instance lives at /meal-planner, the AR
  // instance at /ar/meal-planner (the URL-first locale law reads it).
  let currentPath = "/meal-planner";
  return {
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    }),
    usePathname: () => currentPath,
    __setPath: (p: string) => {
      currentPath = p;
    },
  };
});

// The helmet MARK renders through a plain img stub (the
// seo-image-dimensions canary owns the real <ThemeImg> contract);
// EngravedIcon (OtherTools' marble tiles) rides the same stub shape.
vi.mock("@/components/ThemeImg", () => ({
  ThemeImg: ({ alt }: { alt?: string }) =>
    createElement("img", { alt: alt ?? "" }),
  EngravedIcon: ({ alt }: { alt?: string }) =>
    createElement("img", { alt: alt ?? "" }),
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    profile: null,
    loading: false,
    isCoach: false,
    isAdmin: false,
    coachKind: null,
    isSiteCoach: false,
    isB2BCoach: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signInGoogle: vi.fn(),
    signOutAsync: vi.fn(),
  }),
}));

// AdSenseAd reads the tier; the anonymous free tier is the surface the
// audit measured (same seam shape as the evo-chat canary).
vi.mock("@/hooks/use-membership-tier", () => ({
  useMembershipTier: () => ({ tier: "free", loading: false }),
}));

import { I18nProvider } from "@/lib/i18n";
import MealPlannerPage from "@/app/(en)/meal-planner/page";

const repoRoot = resolve(__dirname, "../../..");
const pageSrc = () =>
  readFileSync(resolve(repoRoot, "src/app/(en)/meal-planner/page.tsx"), "utf8");
const arMirrorSrc = () =>
  readFileSync(resolve(repoRoot, "src/app/(ar)/ar/meal-planner/page.tsx"), "utf8");

/** The substring between two markers (both must exist, in order). */
function span(src: string, from: string, to: string): string {
  const i = src.indexOf(from);
  const j = src.indexOf(to);
  expect(i).toBeGreaterThan(-1);
  expect(j).toBeGreaterThan(i);
  return src.slice(i, j);
}

// ── The fetch double: FAITHFUL transport semantics ────────────────────────
// Real fetch, aborted before the response arrives, rejects with an
// AbortError and NEVER delivers a body. The double reproduces that at
// settle time — plus a forceSettle escape hatch that deliberately
// violates it, to probe the component's late-body belt (the one place
// a real abort cannot reach once headers have landed).
type FoodCall = {
  url: string;
  signal: AbortSignal | undefined;
  /** Faithful success: an aborted signal rejects with AbortError. */
  settle: (results: unknown[]) => void;
  /** Belt probe: resolves the body even though the signal is aborted. */
  forceSettle: (results: unknown[]) => void;
  /** HTTP-level failure (res.ok false — the pre-existing silent path). */
  notOk: () => void;
  /** Network-level rejection (a genuine, non-abort error). */
  reject: (err?: Error) => void;
};

const calls: FoodCall[] = [];
const fetchMock = vi.fn((url: string, init?: { signal?: AbortSignal }) => {
  if (url.includes("/api/food-search")) {
    let onResolve!: (v: unknown) => void;
    let onReject!: (e: unknown) => void;
    const pending = new Promise<unknown>((res, rej) => {
      onResolve = res;
      onReject = rej;
    });
    calls.push({
      url,
      signal: init?.signal,
      settle: (results) => {
        if (init?.signal?.aborted) {
          onReject(
            Object.assign(new Error("The operation was aborted."), {
              name: "AbortError",
            }),
          );
          return;
        }
        onResolve({ ok: true, status: 200, json: async () => ({ results }) });
      },
      forceSettle: (results) =>
        onResolve({ ok: true, status: 200, json: async () => ({ results }) }),
      notOk: () => onResolve({ ok: false, status: 503, json: async () => ({}) }),
      reject: (err) => onReject(err ?? new Error("network down")),
    });
    return pending;
  }
  return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
});

// The two result sets: the STALE one (what /api/food-search would return
// for «chick») and the CORRECT one (for «chicken»). The marker names are
// disjoint so a text assertion can never confuse them.
const CHICK_RESULTS = [
  {
    name: "Chickpea Paste",
    source: "local",
    per100g: { calories: 180, protein: 8, carbs: 30, fat: 4 },
  },
  {
    name: "Chickpea Crumbs",
    source: "local",
    per100g: { calories: 140, protein: 7, carbs: 22, fat: 3 },
  },
];
const CHICKEN_RESULTS = [
  {
    name: "Chicken Breast",
    source: "local",
    per100g: { calories: 165, protein: 31, carbs: 0, fat: 4 },
  },
  {
    name: "Chicken Thigh",
    source: "local",
    per100g: { calories: 210, protein: 26, carbs: 0, fat: 10 },
  },
];
const AR_RESULTS = [
  {
    name: "صدور دجاج مشوية",
    source: "local",
    per100g: { calories: 165, protein: 31, carbs: 0, fat: 4 },
  },
];

describe("W1-4c source pins — AbortController per query, abort on cleanup", () => {
  it("the B-03 fix, literally: a controller per query, the signal on the fetch, the abort in the cleanup", () => {
    const s = pageSrc();
    const effect = span(
      s,
      "if (debounceRef.current) clearTimeout(debounceRef.current);",
      "const pick = (r: SearchResult) => {",
    );
    // A controller per effect run — not a ref shared across queries.
    expect(effect).toContain("const controller = new AbortController();");
    // The fetch carries the signal — the transport is cancellable.
    expect(effect).toMatch(/fetch\(\s*`\/api\/food-search\?q=\$\{encodeURIComponent\(query\.trim\(\)\)\}&lang=\$\{isAr \? "ar" : "en"\}`,\s*\{ signal \},\s*\)/);
    // The cleanup cancels THIS query's in-flight request.
    expect(effect).toContain("controller.abort();");
  });

  it("ownership guards: an aborted query writes nothing — not results, not open, not loading", () => {
    const s = pageSrc();
    const effect = span(
      s,
      "if (debounceRef.current) clearTimeout(debounceRef.current);",
      "const pick = (r: SearchResult) => {",
    );
    // The late-body belt: a superseded query's body never lands.
    expect(effect).toContain("if (signal.aborted) return;");
    expect(effect.indexOf("if (signal.aborted) return;")).toBeLessThan(
      effect.indexOf("setResults(data.results || []);"),
    );
    // The spinner belongs to the NEWEST query — an aborted request's
    // finally must not clear it (that would kill the successor's
    // spinner mid-flight — the second half of the B-03 race).
    expect(effect).toContain("if (!signal.aborted) setLoading(false);");
    // The catch stays silent — the AbortError of a superseded query is
    // an expected outcome, not a user-facing failure.
    expect(effect).toContain("// silent — includes the AbortError of a superseded query.");
  });

  it("the empty-query branch now resets the WHOLE surface — including the spinner", () => {
    const s = pageSrc();
    const effect = span(
      s,
      "if (debounceRef.current) clearTimeout(debounceRef.current);",
      "const pick = (r: SearchResult) => {",
    );
    const emptyBranch = span(effect, "if (!query.trim()) {", "setLoading(true);");
    expect(emptyBranch).toContain("setResults([]);");
    expect(emptyBranch).toContain("setOpen(false);");
    // The B-03 addition: without this, an aborted request whose finally
    // is guarded would leave the spinner stuck forever once the query
    // empties (no successor query exists to own the state).
    expect(emptyBranch).toContain("setLoading(false);");
  });

  it("the pre-existing contract must not regress: 300ms debounce + cleanup clearTimeout + [query] deps", () => {
    const s = pageSrc();
    const effect = span(
      s,
      "if (debounceRef.current) clearTimeout(debounceRef.current);",
      "const pick = (r: SearchResult) => {",
    );
    expect(effect).toContain("setTimeout(async () => {");
    expect(effect).toContain("}, 300);");
    expect(effect).toContain("return () => {");
    expect(effect).toContain("if (debounceRef.current) clearTimeout(debounceRef.current);");
    expect(effect).toMatch(/\}, \[query\]\);/);
    // pick() resets the surface exactly as before.
    const pickFn = span(
      s,
      "const pick = (r: SearchResult) => {",
      'placeholder={isAr ? "بحث عن صنف غذائي..." : "Search food..."}',
    );
    expect(pickFn).toContain('setQuery("");');
    expect(pickFn).toContain("setResults([]);");
    expect(pickFn).toContain("setOpen(false);");
  });

  it("EN and AR are the SAME file — the /ar mirror re-exports this page (the fix covers both)", () => {
    // The audit note: «العيب في المرآة العربية أيضًا (نفس الملف)» — the
    // AR mirror is this very module, so one fix closes both surfaces.
    const mirror = arMirrorSrc();
    expect(mirror).toContain('export { default } from "@/app/(en)/meal-planner/page";');
    expect(mirror).toContain("renders AR via urlLocale");
  });
});

describe("W1-4c behavior — the real page through the B-03 race", () => {
  beforeAll(() => {
    // jsdom ships no matchMedia — the REAL ThemeToggle's use-theme-mode
    // listens to it on mount. Polyfill it (rather than stubbing the
    // toggle away) so the canary keeps rendering the real header at
    // full fidelity (the W1-3d canary's precedent).
    if (typeof window.matchMedia !== "function") {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: (query: string) =>
          ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
          }) as unknown as MediaQueryList,
      });
    }
  });

  // Every mounted page is force-unmounted after EACH test — even when
  // a test body aborts on a failed assertion (the orphan lesson from
  // the W1-4b canary: a leaked tree keeps its effects alive).
  const mountedViews: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    calls.length = 0;
    fetchMock.mockClear();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    while (mountedViews.length) mountedViews.pop()?.unmount();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  /** Mounts the REAL page (full site chrome) under the real i18n
   * provider — `en` lives at /meal-planner, `ar` at /ar/meal-planner. */
  async function mountPage(locale: "en" | "ar") {
    const rtl = await import("@testing-library/react");
    const nav = (await import("next/navigation")) as unknown as {
      __setPath: (p: string) => void;
    };
    nav.__setPath(locale === "ar" ? "/ar/meal-planner" : "/meal-planner");
    const view = rtl.render(
      // eslint-disable-next-line react/no-children-prop -- createElement needs children in props (test-only; repo precedent mobile-drawer-a11y.test.tsx)
      createElement(I18nProvider, {
        urlLocale: locale,
        children: createElement(MealPlannerPage),
      }),
    );
    mountedViews.push(view);
    await rtl.act(async () => {});
    return { rtl, view };
  }

  const searchBox = () =>
    document.querySelector(
      'input[placeholder="Search food..."], input[placeholder="بحث عن صنف غذائي..."]',
    ) as HTMLInputElement;
  const dropdown = () => document.querySelector(".absolute.z-20");
  const spinner = () => document.querySelector(".animate-spin");

  /** Types a query (synchronously flushes the effect). */
  async function type(rtl: typeof import("@testing-library/react"), text: string) {
    await rtl.act(async () => {
      rtl.fireEvent.change(searchBox(), { target: { value: text } });
    });
  }

  /** Fires the pending debounce so the fetch flies. */
  async function advanceDebounce(rtl: typeof import("@testing-library/react")) {
    await rtl.act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });
  }

  /** Settles call #index and drains the await chain (fetch → json →
   * setState) so the assertions see the post-settle DOM. */
  async function settleCall(
    rtl: typeof import("@testing-library/react"),
    index: number,
    how: "settle" | "forceSettle" | "notOk" | "reject",
    results?: unknown[],
  ) {
    await rtl.act(async () => {
      const call = calls[index];
      if (how === "settle") call.settle(results ?? []);
      else if (how === "forceSettle") call.forceSettle(results ?? []);
      else if (how === "notOk") call.notOk();
      else call.reject();
      await Promise.resolve();
      await Promise.resolve();
    });
    await rtl.act(async () => {});
  }

  it("B-03 core: the stale «chick» response can no longer overwrite «chicken»", async () => {
    const { rtl, view } = await mountPage("en");
    await type(rtl, "chick");
    await advanceDebounce(rtl);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("/api/food-search?q=chick&lang=en");
    expect(calls[0].signal).toBeTruthy();

    // The user refines the query → the first request is superseded.
    await type(rtl, "chicken");
    await advanceDebounce(rtl);
    expect(calls).toHaveLength(2);
    expect(calls[1].url).toBe("/api/food-search?q=chicken&lang=en");
    // The supersede happened the instant the query changed — before
    // «chicken»'s fetch even fired.
    expect(calls[0].signal?.aborted).toBe(true);

    // The fast, CORRECT response lands…
    await settleCall(rtl, 1, "settle", CHICKEN_RESULTS);
    expect(dropdown()).toBeTruthy();
    expect(dropdown()!.textContent).toContain("Chicken Breast");

    // …then the slow, STALE response finally resolves: the faithful
    // double rejects it with AbortError (the transport was cancelled).
    await settleCall(rtl, 0, "settle", CHICK_RESULTS);
    // The stale results never land over the correct ones:
    expect(dropdown()!.textContent).not.toContain("Chickpea Paste");
    expect(dropdown()!.textContent).toContain("Chicken Breast");
    expect(dropdown()!.textContent).toContain("Chicken Thigh");
    view.unmount();
  });

  it("the late-body belt: a stale body that slips PAST the transport abort is still dropped", async () => {
    const { rtl, view } = await mountPage("en");
    await type(rtl, "chick");
    await advanceDebounce(rtl);
    await type(rtl, "chicken");
    await advanceDebounce(rtl);
    await settleCall(rtl, 1, "settle", CHICKEN_RESULTS);

    // forceSettle: the stale response's headers arrived just BEFORE the
    // abort hit the transport, so its body resolves anyway. Only the
    // signal guard can stop it now.
    await settleCall(rtl, 0, "forceSettle", CHICK_RESULTS);
    expect(calls[0].signal?.aborted).toBe(true);
    expect(dropdown()!.textContent).toContain("Chicken Breast");
    expect(dropdown()!.textContent).not.toContain("Chickpea Paste");
    view.unmount();
  });

  it("loading ownership: the aborted request never kills the newer query's spinner", async () => {
    const { rtl, view } = await mountPage("en");
    await type(rtl, "chick");
    await advanceDebounce(rtl);
    expect(spinner()).toBeTruthy(); // spinner while «chick» flies

    await type(rtl, "chicken");
    await advanceDebounce(rtl);
    // «chick»'s rejection lands (AbortError swallowed) — under the OLD
    // code its finally-block ran unconditionally and killed «chicken»'s
    // spinner mid-flight. The guarded finally hands the state over.
    await settleCall(rtl, 0, "settle", CHICK_RESULTS);
    expect(spinner()).toBeTruthy(); // still loading «chicken»

    await settleCall(rtl, 1, "settle", CHICKEN_RESULTS);
    expect(spinner()).toBeNull(); // «chicken» landed → spinner cleared
    view.unmount();
  });

  it("clearing the query mid-flight: request aborted, surface reset, spinner dropped", async () => {
    const { rtl, view } = await mountPage("en");
    // Old results on screen (the dropdown survives a refinement — the
    // surface keeps showing them while the new query flies).
    await type(rtl, "chick");
    await advanceDebounce(rtl);
    await settleCall(rtl, 0, "settle", CHICK_RESULTS);
    expect(dropdown()).toBeTruthy();

    // A new query goes in flight…
    await type(rtl, "chicken");
    await advanceDebounce(rtl);
    expect(spinner()).toBeTruthy();

    // …then the user clears the box (what pick() does via setQuery("")):
    await type(rtl, "");
    expect(calls[1].signal?.aborted).toBe(true);
    expect(dropdown()).toBeNull(); // setResults([]) + setOpen(false)
    expect(spinner()).toBeNull(); // the empty branch owns the spinner

    // And the aborted rejection still lands silently afterwards:
    await settleCall(rtl, 1, "settle", CHICKEN_RESULTS);
    expect(dropdown()).toBeNull();
    expect(spinner()).toBeNull();
    view.unmount();
  });

  it("unmount cancels the in-flight request — «إلغاء بالتنظيف»", async () => {
    const { rtl, view } = await mountPage("en");
    await type(rtl, "chick");
    await advanceDebounce(rtl);
    expect(calls[0].signal?.aborted).toBe(false);

    view.unmount();
    expect(calls[0].signal?.aborted).toBe(true);
    // Delivering after unmount is swallowed — no crash, no zombie write.
    await rtl.act(async () => {
      calls[0].settle(CHICK_RESULTS);
      await Promise.resolve();
      await Promise.resolve();
    });
    view.unmount();
  });

  it("pick end-to-end: the chosen food lands in the meal plan and the surface resets", async () => {
    const { rtl, view } = await mountPage("en");
    await type(rtl, "chick");
    await advanceDebounce(rtl);
    await settleCall(rtl, 0, "settle", CHICK_RESULTS);

    // Click the first result — the REAL onPick → addItemToMeal path.
    const first = dropdown()!.querySelector("button")!;
    await rtl.act(async () => {
      rtl.fireEvent.click(first);
    });
    // The meal builder received the item: the grams input + the P/C/F
    // chips only exist inside an ItemRow.
    expect(document.querySelector('input[type="number"]')).toBeTruthy();
    expect(document.body.textContent).toContain("Chickpea Paste");
    expect(document.body.textContent).toMatch(/P8/); // protein chip
    // The surface reset exactly as before:
    expect(searchBox().value).toBe("");
    expect(dropdown()).toBeNull();
    expect(spinner()).toBeNull();
    view.unmount();
  });

  it("honest failure paths preserved: !ok → no dropdown + spinner cleared", async () => {
    const { rtl, view } = await mountPage("en");
    await type(rtl, "chick");
    await advanceDebounce(rtl);
    await settleCall(rtl, 0, "notOk");
    expect(dropdown()).toBeNull(); // res.ok false → nothing renders
    expect(spinner()).toBeNull(); // finally still clears the spinner
    view.unmount();
  });

  it("honest failure paths preserved: a genuine network rejection stays silent", async () => {
    const { rtl, view } = await mountPage("en");
    await type(rtl, "chick");
    await advanceDebounce(rtl);
    await settleCall(rtl, 0, "reject");
    expect(dropdown()).toBeNull();
    expect(spinner()).toBeNull();
    view.unmount();
  });

  it("the AR instance of the SAME page sends lang=ar and renders the localized labels", async () => {
    const { rtl, view } = await mountPage("ar");
    expect(searchBox().getAttribute("placeholder")).toBe("بحث عن صنف غذائي...");
    await type(rtl, "صدور");
    await advanceDebounce(rtl);
    expect(calls[0].url).toBe(
      "/api/food-search?q=" + encodeURIComponent("صدور") + "&lang=ar",
    );
    await settleCall(rtl, 0, "settle", AR_RESULTS);
    // The localized result-row labels (محلي · سعرة) — the AR mirror
    // inherits the whole fixed surface from the same file.
    expect(dropdown()!.textContent).toContain("صدور دجاج مشوية");
    expect(dropdown()!.textContent).toContain("محلي");
    view.unmount();
  });
});
