import { describe, it, expect, vi, beforeAll, beforeEach, afterEach, afterAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import type { ReactElement } from "react";

/**
 * PHASE 341 — W1-5 (remediation plan §6.2, audit B-08): CheckoutView's
 * PayPalButtons carries a one-shot render guard (renderedRef) — once the
 * SDK buttons are rendered, every effect re-run is a no-op BY DESIGN (no
 * double render into one container). But a same-route navigation with new
 * params (checkout?tier=premium&months=1 → checkout?tier=pro&months=12)
 * re-rendered the SAME mounted instance: the guard froze the FIRST offer's
 * createOrder closure into the LIVE button — «منتج خاطئ يُحاسب» (the wrong
 * product billed), the money-path failure mode the audit flagged on a rare
 * but real navigation shape.
 *
 * The B-08 fix this canary pins as CLOSED (fix direction, verbatim:
 * «مفتاح component على planTier+durationMonths»): CheckoutView is keyed on
 * the OFFER identity — a plan/duration change REMOUNTS the whole surface
 * (fresh guard → fresh SDK buttons carrying the NEW closure), and the
 * manual form (method/name/whatsapp/receipt) resets with it, so a receipt
 * attached to the OLD amount can never ride into the NEW offer's request.
 *
 * Two layers, like the W1-3a..e + W1-4a/b/c canaries:
 *   1. SOURCE PINS — the contract machine-checked in the page + view.
 *   2. BEHAVIOR — jsdom renders the REAL page (a logged-in buyer, the
 *     site chrome mocked only at the true seams) and drives the exact
 *     same-route navigation the audit described, against a fake PayPal
 *     SDK that captures every Buttons() config — the money contract the
 *     mounted button actually holds.
 *
 * Honest harness laws discovered while building it:
 *   - NEXT_PUBLIC_PAYPAL_CLIENT_ID must be stubbed BEFORE the page module
 *     evaluates (the client id is a module-scope const — empty means the
 *     loader hard-fails into "PayPal is not available"), hence the
 *     dynamic page import in beforeAll.
 *   - The SDK script element is PRE-SEEDED in the DOM — the faithful
 *     state of a same-route navigation (and of any second checkout
 *     visit): the loader finds it and flips loaded synchronously, no
 *     network. This is also the loader's own pre-existing contract.
 */

vi.mock("next/navigation", () => {
  // Mutable params — a same-route navigation (checkout?tier=A →
  // checkout?tier=B) re-renders the page against NEW search params,
  // exactly what a real App-Router navigation does.
  let params = new URLSearchParams("tier=premium&months=1");
  return {
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    }),
    usePathname: () => "/checkout",
    useSearchParams: () => params,
    __setSearchParams: (qs: string) => {
      params = new URLSearchParams(qs);
    },
  };
});

// The page requires a logged-in buyer (unauthenticated → login redirect,
// never a payable surface). The profile seeds the manual form's defaults.
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    profile: {
      id: "u-canary",
      full_name: "Canary Buyer",
      phone: "+201000000000",
    },
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

// The manual-payment submits ride the data layer — stubbed at the seam
// (this canary's subject is the offer identity, not the submit path).
vi.mock("@/lib/data", () => ({
  submitSubscriptionRequest: vi.fn(async () => {}),
  uploadReceipt: vi.fn(async () => "receipts/canary.png"),
}));

import { I18nProvider } from "@/lib/i18n";

const repoRoot = resolve(__dirname, "../../..");
const pageSrc = () =>
  readFileSync(resolve(repoRoot, "src/app/(app)/checkout/page.tsx"), "utf8");
const viewSrc = () =>
  readFileSync(resolve(repoRoot, "src/components/views/CheckoutView.tsx"), "utf8");

/** The substring between two markers (both must exist, in order). */
function span(src: string, from: string, to: string): string {
  const i = src.indexOf(from);
  const j = src.indexOf(to);
  expect(i).toBeGreaterThan(-1);
  expect(j).toBeGreaterThan(i);
  return src.slice(i, j);
}

// ── The fake PayPal SDK ────────────────────────────────────────────────────
// Every Buttons(config) call is CAPTURED — the config IS the money
// contract the mounted button holds (createOrder's closure over the
// mounted offer). render() plants a REAL button element that drives the
// captured createOrder exactly like the SDK's own click does.
type FakeButtonsConfig = {
  createOrder: () => Promise<string>;
};

type SdkCall = {
  seq: number;
  config: FakeButtonsConfig;
  renderTarget: HTMLElement;
};

const sdkCalls: SdkCall[] = [];
let sdkSeq = 0;

function installFakePaypalSdk() {
  sdkCalls.length = 0;
  sdkSeq = 0;
  (window as unknown as { paypal?: unknown }).paypal = {
    Buttons: (config: FakeButtonsConfig) => ({
      render: async (el: HTMLElement) => {
        const seq = ++sdkSeq;
        sdkCalls.push({ seq, config, renderTarget: el });
        const btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("data-paypal-fake-button", String(seq));
        btn.textContent = `Fake PayPal ${seq}`;
        btn.addEventListener("click", () => {
          void config.createOrder().catch(() => {});
        });
        el.appendChild(btn);
      },
    }),
  };
}

// ── The fetch double: what createOrder actually POSTS ─────────────────────
// The billed product identity — the literal money assertion.
const createOrderPosts: Array<{ planTier: string; durationMonths: number }> = [];
const fetchMock = vi.fn((url: string, init?: { body?: string }) => {
  if (url.includes("/api/paypal/create-order")) {
    createOrderPosts.push(JSON.parse(init?.body ?? "{}"));
    return Promise.resolve({
      ok: true,
      json: async () => ({ orderId: `CANARY-ORDER-${createOrderPosts.length}` }),
    });
  }
  return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
});

describe("W1-5 source pins — CheckoutView keyed on the offer identity", () => {
  it("the B-08 fix, literally: CheckoutView carries a key on tierParam+months (the normalized offer identity)", () => {
    const s = pageSrc();
    expect(s).toContain("const offerKey = `${tierParam}-${months}`;");
    expect(s).toMatch(/<CheckoutView\s+key=\{offerKey\}/);
    // The key's inputs are the URL params themselves, with months
    // normalized to the billable 1|12 BEFORE keying — the key can never
    // drift from what the money path charges.
    expect(s).toContain('const tierParam = searchParams.get("tier") || "premium";');
    expect(s).toContain("const months = (monthsParam === 12 ? 12 : 1) as Duration;");
  });

  it("the identity key and the money path are the SAME values — PayPalButtons receives the parent's tier/months", () => {
    const s = viewSrc();
    expect(s).toMatch(
      /<PayPalButtons\s+planTier=\{tier as string\}\s+durationMonths=\{months as number\}/,
    );
  });

  it("the one-shot guard is intact per-mount — the fix scopes it with the key, it does not weaken it", () => {
    const s = viewSrc();
    const effect = span(
      s,
      "if (renderedRef.current || !paypalRef.current) return;",
      "if (processing) {",
    );
    expect(effect).toContain("renderedRef.current = true;");
    expect(effect).toMatch(/\}, \[planTier, durationMonths, isAr, onSuccess, onError\]\);/);
  });

  it("createOrder posts the MOUNTED identity — the money contract from the closure", () => {
    const s = viewSrc();
    const effect = span(
      s,
      "if (renderedRef.current || !paypalRef.current) return;",
      "if (processing) {",
    );
    expect(effect).toContain('fetch("/api/paypal/create-order", {');
    expect(effect).toContain("body: JSON.stringify({ planTier, durationMonths }),");
  });

  it("the manual path reads the CURRENT props at submit time — only the mounted PayPal button ever held a closure", () => {
    const s = viewSrc();
    const submit = span(s, "const submit = async () => {", "const isManualMethod");
    expect(submit).toContain("plan_tier: tier as string,");
    expect(submit).toContain("duration_months: months as number,");
    expect(submit).toContain("price_usd: plan.price,");
  });

  it("the loader's existing-script short-circuit must not regress — an offer remount never re-downloads the SDK", () => {
    const s = viewSrc();
    const loader = span(s, "function usePayPalScript", "return { loaded, error };");
    expect(loader).toContain('const existing = document.getElementById(scriptId);');
    expect(loader).toContain("setLoaded(true);");
  });
});

describe("W1-5 behavior — the real page through the B-08 navigation", () => {
  // The page module — imported DYNAMICALLY after the env stub below, so
  // the module-scope PAYPAL_CLIENT_ID const captures a non-empty value
  // (empty = the loader's honest "PayPal is not available" dead end).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let CheckoutPage: any;

  beforeAll(async () => {
    vi.stubEnv("NEXT_PUBLIC_PAYPAL_CLIENT_ID", "canary-client-id");
    CheckoutPage = (await import("@/app/(app)/checkout/page")).default;

    // jsdom ships no matchMedia — the REAL LanguageToggle's use-theme-mode
    // listens to it on mount (the meal-planner canary's precedent).
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

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  // Every mounted page is force-unmounted after EACH test — even when
  // a test body aborts on a failed assertion (the orphan lesson from
  // the W1-4b canary: a leaked tree keeps its effects alive).
  const mountedViews: Array<{ unmount: () => void }> = [];

  beforeEach(async () => {
    window.localStorage.clear();
    createOrderPosts.length = 0;
    fetchMock.mockClear();
    vi.stubGlobal("fetch", fetchMock);

    // The SDK script ALREADY in the DOM — the faithful state of a
    // same-route navigation (and of any second checkout visit).
    const scriptId = "paypal-sdk-script";
    document.getElementById(scriptId)?.remove();
    const script = document.createElement("script");
    script.id = scriptId;
    document.head.appendChild(script);

    installFakePaypalSdk();

    const nav = (await import("next/navigation")) as unknown as {
      __setSearchParams: (qs: string) => void;
    };
    nav.__setSearchParams("tier=premium&months=1");
  });

  afterEach(() => {
    while (mountedViews.length) mountedViews.pop()?.unmount();
    document.getElementById("paypal-sdk-script")?.remove();
    delete (window as unknown as { paypal?: unknown }).paypal;
    vi.unstubAllGlobals();
  });

  /** Mounts the REAL page (a logged-in buyer) under the real i18n
   * provider, then flushes the loader effect (seeded script → loaded)
   * and the fake SDK's async render (the button lands in the DOM). */
  async function mountCheckoutPage() {
    const rtl = await import("@testing-library/react");
    const view = rtl.render(
      // eslint-disable-next-line react/no-children-prop -- createElement needs children in props (test-only; repo precedent meal-planner-food-search-abort.test.tsx)
      createElement(I18nProvider, {
        urlLocale: "en",
        children: createElement(CheckoutPage),
      }),
    );
    mountedViews.push(view);
    await rtl.act(async () => {});
    await rtl.act(async () => {});
    await rtl.act(async () => {});
    return { rtl, view };
  }

  /** Re-renders the SAME tree against NEW search params — exactly what a
   * real same-route navigation does (the audit's B-08 trigger). */
  async function navigateSameRoute(
    rtl: typeof import("@testing-library/react"),
    view: { rerender: (el: ReactElement) => void },
    qs: string,
  ) {
    const nav = (await import("next/navigation")) as unknown as {
      __setSearchParams: (qs: string) => void;
    };
    nav.__setSearchParams(qs);
    await rtl.act(async () => {
      view.rerender(
        // eslint-disable-next-line react/no-children-prop -- test-only; same precedent as mount
        createElement(I18nProvider, {
          urlLocale: "en",
          children: createElement(CheckoutPage),
        }),
      );
    });
    await rtl.act(async () => {});
    await rtl.act(async () => {});
  }

  const fakeButtonsInDocument = () =>
    Array.from(document.querySelectorAll("[data-paypal-fake-button]"));

  /** Clicks the LIVE fake PayPal button and drains the await chain
   * (click → createOrder → fetch → json) so the posts array settles. */
  async function clickLivePaypalButton(
    rtl: typeof import("@testing-library/react"),
  ) {
    await rtl.act(async () => {
      rtl.fireEvent.click(fakeButtonsInDocument()[0]);
    });
    await rtl.act(async () => {});
  }

  it("B-08 core: a same-route offer change re-bills the NEW offer, never the first", async () => {
    // The first offer mounts — its button holds the premium/1 closure.
    const { rtl, view } = await mountCheckoutPage();
    expect(sdkCalls).toHaveLength(1);
    expect(fakeButtonsInDocument()).toHaveLength(1);

    await clickLivePaypalButton(rtl);
    expect(createOrderPosts.at(-1)).toEqual({
      planTier: "premium",
      durationMonths: 1,
    });

    // The same-route navigation the audit described: new params, same
    // route — the B-08 trigger.
    await navigateSameRoute(rtl, view, "tier=pro&months=12");

    // The surface REMOUNTED: a FRESH Buttons() render for the new offer…
    expect(sdkCalls).toHaveLength(2);
    expect(sdkCalls[1].config).not.toBe(sdkCalls[0].config);
    // …the FIRST offer's button is GONE from the document…
    expect(fakeButtonsInDocument()).toHaveLength(1);
    expect(fakeButtonsInDocument()[0].getAttribute("data-paypal-fake-button")).toBe("2");
    // …and the LIVE button bills the NEW offer — the money assertion.
    await clickLivePaypalButton(rtl);
    expect(createOrderPosts.at(-1)).toEqual({
      planTier: "pro",
      durationMonths: 12,
    });
    // Under the B-08 bug this exact click billed the FIRST offer:
    // {planTier: "premium", durationMonths: 1} — the literal
    // «منتج خاطئ يُحاسب».
    expect(createOrderPosts.at(-1)).not.toEqual({
      planTier: "premium",
      durationMonths: 1,
    });
  });

  it("the DURATION is part of the identity: premium/12 → premium/1 is a different offer", async () => {
    const nav = (await import("next/navigation")) as unknown as {
      __setSearchParams: (qs: string) => void;
    };
    nav.__setSearchParams("tier=premium&months=12");
    const { rtl, view } = await mountCheckoutPage();
    await clickLivePaypalButton(rtl);
    expect(createOrderPosts.at(-1)).toEqual({
      planTier: "premium",
      durationMonths: 12,
    });

    // Same tier, different duration — a tier-only key would NOT remount
    // and the live button would keep billing the yearly offer.
    await navigateSameRoute(rtl, view, "tier=premium&months=1");
    expect(sdkCalls).toHaveLength(2);
    await clickLivePaypalButton(rtl);
    expect(createOrderPosts.at(-1)).toEqual({
      planTier: "premium",
      durationMonths: 1,
    });
  });

  it("an identity-preserving re-render does NOT re-render the buttons — the one-shot guard's preserved purpose", async () => {
    const { rtl, view } = await mountCheckoutPage();
    expect(sdkCalls).toHaveLength(1);

    // Same params re-render (a parent re-render with the same offer):
    // the mounted button must not churn — the guard is one-shot per
    // mount, and the key change is the ONLY thing that resets it.
    await navigateSameRoute(rtl, view, "tier=premium&months=1");
    expect(sdkCalls).toHaveLength(1);
    expect(fakeButtonsInDocument()).toHaveLength(1);

    // The mounted button still bills its own offer.
    await clickLivePaypalButton(rtl);
    expect(createOrderPosts.at(-1)).toEqual({
      planTier: "premium",
      durationMonths: 1,
    });
  });

  it("the manual surface resets with the offer — a receipt for the OLD amount never rides into the NEW offer", async () => {
    const { rtl, view } = await mountCheckoutPage();

    // The buyer switches to a manual method and attaches a receipt for
    // the CURRENT (first) offer's amount.
    await rtl.act(async () => {
      rtl.fireEvent.click(rtl.screen.getByText("InstaPay"));
    });
    expect(document.querySelector('img[src="/qr-instapay.png"]')).toBeTruthy();

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await rtl.act(async () => {
      rtl.fireEvent.change(fileInput, {
        target: {
          files: [new File(["r"], "old-offer-receipt.png", { type: "image/png" })],
        },
      });
    });
    expect(document.body.textContent).toContain("old-offer-receipt.png");

    // The offer changes — the whole surface (method + receipt) resets
    // with it: the receipt was evidence for the OLD amount.
    await navigateSameRoute(rtl, view, "tier=pro&months=1");

    expect(document.querySelector('img[src="/qr-instapay.png"]')).toBeNull();
    expect(document.body.textContent).not.toContain("old-offer-receipt.png");
    // PayPal is the default again — a FRESH payable surface.
    expect(sdkCalls).toHaveLength(2);
    expect(fakeButtonsInDocument()).toHaveLength(1);
    await clickLivePaypalButton(rtl);
    expect(createOrderPosts.at(-1)).toEqual({
      planTier: "pro",
      durationMonths: 1,
    });
  });

  it("the summary card follows the offer: the billed price on screen is the new offer's", async () => {
    const { rtl, view } = await mountCheckoutPage();
    expect(document.body.textContent).toContain("$14.99"); // premium monthly

    await navigateSameRoute(rtl, view, "tier=pro&months=12");
    expect(document.body.textContent).toContain("$239"); // pro yearly
    expect(document.body.textContent).toContain("19.92"); // monthly equivalent
    expect(document.body.textContent).not.toContain("$14.99");
  });
});
