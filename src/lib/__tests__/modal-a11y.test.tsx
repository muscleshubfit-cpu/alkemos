import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";

/**
 * PHASE 333 — W1-3a (remediation plan §6.2, audit A-03 direction):
 * the unified `<Modal>` wrapper over the EXISTING Radix primitives
 * (`src/components/ui/dialog.tsx`) — infrastructure ONLY, no view is
 * migrated yet (that is W1-3b's frame).
 *
 * This canary pins the wrapper's a11y contract in two layers:
 *
 *   1. SOURCE PINS — the wrapper composes the Radix dialog (never a fresh
 *      hand-rolled overlay), the stock unlabeled-English close button is
 *      disabled (showCloseButton={false}), the wrapper's own close carries
 *      XIcon + a localized aria-label, `title` is a REQUIRED prop (an
 *      unlabeled Modal cannot compile), the file uses logical properties
 *      only, and the three A-03 views are NOT yet migrated (the W1-3a/W1-3b
 *      frame boundary, machine-checked — W1-3b flips this pin).
 *   2. BEHAVIOR — jsdom renders: role=dialog + modal isolation (Radix 1.1.x
 *      aria-hides the outside world — its documented equivalent of a literal
 *      aria-modal), the mandatory title is wired via aria-labelledby, the
 *      description via aria-describedby, Escape reaches onOpenChange(false)
 *      (the exact A-03 gap), focus lands inside the dialog, and the close
 *      button's accessible name is localized ("Close" / "إغلاق") in both
 *      provider languages.
 */

vi.mock("next/navigation", () => ({ usePathname: () => null }));

import { I18nProvider } from "@/lib/i18n";
import { Modal, type ModalProps } from "@/components/ui/modal";

const repoRoot = resolve(__dirname, "../../..");
const src = (p: string) => readFileSync(resolve(repoRoot, p), "utf8");
const modalSrc = () => src("src/components/ui/modal.tsx");

describe("W1-3a source pins — the wrapper is Radix, labeled, and RTL-clean", () => {
  it("composes the existing Radix primitives from ui/dialog.tsx (not a fresh overlay)", () => {
    const s = modalSrc();
    expect(s).toContain('from "@/components/ui/dialog"');
    expect(s).toMatch(
      /import\s*\{[^}]*\bDialog\b[^}]*\bDialogClose\b[^}]*\bDialogContent\b[^}]*\bDialogTitle\b[^}]*\}/
    );
    // The hand-rolled disease A-03 flagged — fixed inset-0 overlay divs —
    // must NOT exist in the wrapper.
    expect(s).not.toContain("fixed inset-0");
    expect(s).not.toContain("bg-black/50");
    expect(s).not.toContain("stopPropagation");
  });

  it("disables the stock close button (hardcoded English sr-only name) and renders its own labeled one", () => {
    const s = modalSrc();
    expect(s).toContain("showCloseButton={false}");
    // The wrapper's close: Radix DialogClose + XIcon + i18n aria-label.
    expect(s).toMatch(/<DialogClose[\s\S]{0,400}aria-label=\{t\("common\.close"\)\}/);
    expect(s).toContain("<XIcon />");
    expect(s).toContain('useI18n()');
  });

  it("title is a REQUIRED prop — an unlabeled Modal cannot compile", () => {
    const s = modalSrc();
    // The interface declares `title: React.ReactNode` (no `?`).
    expect(s).toMatch(/^\s*title:\s*React\.ReactNode\s*$/m);
    expect(s).not.toMatch(/^\s*title\?:/m);
    // And it renders inside Radix DialogTitle (the aria-labelledby wiring).
    expect(s).toMatch(/<DialogTitle[\s\S]{0,300}\{title\}/);
  });

  it("logical properties only — no new physical left/right debt (A-11 is W3-2's legacy sweep)", () => {
    const s = modalSrc();
    expect(s).not.toMatch(/\b(right|left)-\d/);
    expect(s).not.toMatch(/\b[mp][lr]-\d/);
    expect(s).not.toMatch(/text-(left|right)\b/);
    expect(s).toContain("text-start");
  });

  it("i18n carries the close label in BOTH dictionaries", () => {
    const i18n = src("src/lib/i18n.tsx");
    expect(i18n).toContain('"common.close": "Close"');
    expect(i18n).toContain('"common.close": "إغلاق"');
  });

  it("FRAME BOUNDARY — the three A-03 views are NOT yet migrated (W1-3b flips this pin)", () => {
    const views = [
      "src/components/views/PlansView.tsx",
      "src/components/views/ReferralView.tsx",
      "src/components/views/CoachClientView.tsx",
    ];
    for (const v of views) {
      const s = src(v);
      // Pre-W1-3b: the manual overlay still exists and the wrapper is not imported.
      expect(s).toContain("fixed inset-0");
      expect(s).not.toContain('from "@/components/ui/modal"');
    }
  });
});

describe("W1-3a behavior — jsdom render of the wrapper", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.body.innerHTML = "";
  });

  const renderModal = async (over: Partial<ModalProps> = {}) => {
    const { render } = await import("@testing-library/react");
    const props: ModalProps = {
      open: true,
      onOpenChange: () => {},
      title: "Test modal",
      children: createElement("div", null, "Modal body"),
      ...over,
    };
    return render(
      // eslint-disable-next-line react/no-children-prop -- createElement needs children in props (test-only; repo precedent share-url.test.tsx)
      createElement(I18nProvider, {
        urlLocale: "en",
        children: createElement(Modal, props),
      })
    );
  };

  it("renders a real Radix dialog: role=dialog + labelled title + modal isolation", async () => {
    const view = await renderModal({});
    const dialog = document.body.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    // Radix 1.1.x implements modal-ness by aria-hiding everything outside
    // the dialog (hideOthers — its documented "better supported equivalent"
    // of a literal aria-modal): pin the sibling-hide, not the attribute.
    expect(view.container.getAttribute("aria-hidden")).toBe("true");
    // The mandatory title is wired: aria-labelledby points at the title node.
    const labelledBy = dialog?.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy as string)?.textContent).toBe("Test modal");
    // Focus lands INSIDE the dialog on open (FocusScope arms the trap).
    expect(
      dialog === document.activeElement || dialog?.contains(document.activeElement)
    ).toBe(true);
    view.unmount();
  });

  it("wires the description via aria-describedby when provided", async () => {
    const view = await renderModal({ description: "Payout description" });
    const dialog = document.body.querySelector('[role="dialog"]');
    const describedBy = dialog?.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)?.textContent).toBe("Payout description");
    view.unmount();
  });

  it("close button: XIcon + localized accessible name (EN then AR)", async () => {
    const en = await renderModal({});
    const enClose = document.body.querySelector('button[aria-label="Close"]');
    expect(enClose).not.toBeNull();
    expect(enClose?.querySelector("svg")).not.toBeNull(); // the icon
    expect(enClose?.getAttribute("aria-label")).toBe("Close");
    en.unmount();

    // Arabic: the provider effect resolves from the saved preference.
    window.localStorage.setItem("mhe:lang", "ar");
    const ar = await renderModal({});
    const arClose = document.body.querySelector('button[aria-label="إغلاق"]');
    expect(arClose).not.toBeNull();
    ar.unmount();
  });

  it("Escape reaches onOpenChange(false) — the exact A-03 gap, closed by Radix", async () => {
    const onOpenChange = vi.fn();
    const view = await renderModal({ onOpenChange });
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
    view.unmount();
  });

  it("size presets and scroll map to the width/overflow classes", async () => {
    const sm = await renderModal({ size: "sm" });
    expect(document.body.innerHTML).toContain("sm:max-w-md");
    sm.unmount();

    const lg = await renderModal({ size: "lg", scroll: true });
    expect(document.body.innerHTML).toContain("sm:max-w-2xl");
    expect(document.body.innerHTML).toContain("overflow-y-auto");
    lg.unmount();
  });

  it("header actions render inside the header cluster (the W1-3b adoption slot)", async () => {
    const actionLabel = "Print plan";
    const view = await renderModal({
      actions: createElement("button", { type: "button" }, actionLabel),
    });
    const dialog = document.body.querySelector('[role="dialog"]');
    expect(dialog?.textContent).toContain(actionLabel);
    // The action sits in the same header row as the labeled close button.
    const header = dialog?.querySelector("div.flex");
    expect(header?.textContent).toContain(actionLabel);
    expect(header?.querySelector('button[aria-label="Close"]')).not.toBeNull();
    view.unmount();
  });
});
