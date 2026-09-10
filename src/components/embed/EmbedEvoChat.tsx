"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * EmbedEvoChat — EVO-6 (W6) the WHITE-LABEL partner chat rendered inside
 * the isolated iframe at /embed/widget.
 *
 * Honest scope (v1 contract, docs/EVO-PARTNER-API.md):
 * - Talks ONLY to /api/evo/v1/chat (same origin inside the iframe — no
 *   CORS surface) with the partner key as Bearer.
 * - Renders PLAIN TEXT bubbles (dir="auto" per bubble) — no markdown,
 *   no links (the platform search is deliberately out of the v1 API).
 * - Theme = CSS variables from the validated partner theme (accent);
 *   logo/greeting flow as data props. Never markup.
 * - History is client-side only (session chat) — the partner API stores
 *   NOTHING personal (no user account exists in this surface).
 * - Sends the bounded last-8 history turns with every request so EVO
 *   keeps conversation context inside the partner session.
 */

export type EmbedTheme = {
  accent?: string;
  logo_url?: string;
  partner_label?: string;
};

type ChatMessage = { role: "user" | "assistant"; content: string };

export function EmbedEvoChat({
  apiKey,
  lang,
  theme,
  greeting,
}: {
  apiKey: string;
  lang: "ar" | "en";
  theme: EmbedTheme;
  greeting: string;
}) {
  const isAr = lang === "ar";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const accent = theme.accent || "#0071e3";
  const logoUrl = theme.logo_url;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, busy]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;
    setError(null);
    setInput("");
    const nextHistory = [...messages, { role: "user" as const, content: text }];
    setMessages(nextHistory);
    setBusy(true);
    try {
      const res = await fetch("/api/evo/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-8),
          language: lang,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        reply?: string;
        error?: string;
      } | null;
      if (!res.ok || !data?.reply) {
        setError(
          data?.error === "quota_exceeded"
            ? isAr
              ? "انتهت حصة هذا الشهر — جرب لاحقًا"
              : "Monthly quota reached — try later"
            : data?.error === "rate_limited"
              ? isAr
                ? "طلبات كتير بسرعة — استنى شوية"
                : "Too many requests — slow down"
              : isAr
                ? "EVO مش متاح حاليًا — جرب تاني"
                : "EVO is unavailable — try again",
        );
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply! }]);
      }
    } catch {
      setError(isAr ? "تعذر الاتصال — جرب تاني" : "Connection failed — try again");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }, [input, busy, messages, apiKey, lang, isAr]);

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="flex h-dvh flex-col bg-white"
      style={{ fontFamily: "-apple-system, 'Segoe UI', Tahoma, sans-serif" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 border-b border-black/5 px-4 py-3"
        style={{ backgroundColor: "#141518", color: "#fff" }}
      >
        {logoUrl ? (
          // Plain <img> deliberately: partner logo hosts are arbitrary
          // https URLs — next/image would need an ever-growing
          // remotePatterns allow-list (next.config unoptimized anyway).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={theme.partner_label || "EVO"}
            className="h-10 w-10 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
            style={{ backgroundColor: accent }}
          >
            E
          </div>
        )}
        <div className="min-w-0">
          <div className="text-base font-semibold leading-tight">EVO</div>
          {theme.partner_label ? (
            <div className="truncate text-[11px] text-white/60">
              {theme.partner_label}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[10px] text-white/60">
              <span className="h-2 w-2 rounded-full bg-[#34c759]" />
              {isAr ? "متاح الآن" : "Online now"}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
        <div className="flex flex-col items-start">
          <div
            className="max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap"
            style={{ backgroundColor: "#f5f5f7", color: "#1d1d1f" }}
            dir="auto"
          >
            {greeting}
          </div>
        </div>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap"
              dir="auto"
              style={
                m.role === "user"
                  ? { backgroundColor: accent, color: "#fff" }
                  : { backgroundColor: "#f5f5f7", color: "#1d1d1f" }
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div
              className="rounded-2xl px-3.5 py-2 text-sm"
              style={{ backgroundColor: "#f5f5f7", color: "#6e6e73" }}
            >
              {isAr ? "بيكتب…" : "Typing…"}
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-start">
            <div
              className="max-w-[85%] rounded-2xl px-3.5 py-2 text-sm"
              style={{ backgroundColor: "#fff2f2", color: "#c93030" }}
              dir="auto"
            >
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-black/5 px-3 py-2.5">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={isAr ? "اكتب سؤالك…" : "Ask EVO…"}
          maxLength={2000}
          className="h-10 flex-1 rounded-full bg-[#f5f5f7] px-4 text-sm outline-none"
          style={{ color: "#1d1d1f" }}
          aria-label={isAr ? "رسالتك" : "Your message"}
        />
        <button
          onClick={send}
          disabled={busy || input.trim().length === 0}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: accent }}
          aria-label={isAr ? "إرسال" : "Send"}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: isAr ? "scaleX(-1)" : undefined }}
          >
            <path d="M22 2 11 13" />
            <path d="M22 2 15 22 11 13 2 9z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
