-- ============================================================================
-- 0093 — structured payload for system notifications (NOTIF-I18N-250)
-- ============================================================================
-- WHY (live evidence, frame 250 sweep 2026-09-22):
--   An EN-UI member received «تم تفعيل اشتراكك! … لمدة 1 أشهر.» — raw
--   Arabic server text inside the English UI, plus the «1 أشهر» grammar
--   bug (singular numeral + plural noun). The bell renders whatever text
--   was stored at creation time, and creation sites hardcode one language.
--
-- THE FIX PATTERN (mirrors the M1 error-i18n law, one layer deeper):
--   - The stored title/body remain the single at-rest source (legacy rows
--     and free-text coach broadcasts keep rendering verbatim).
--   - System creation sites additionally write typed fields into `payload`
--     (tier/months/reason/end/plan_type/qtype/status).
--   - The client bell re-renders KNOWN system types from
--     lib/notification-i18n.ts + payload at DISPLAY time; anything unknown
--     falls back to the stored text verbatim (honest fallback).
--
-- SCOPE GUARD (additive only):
--   - New nullable-defaulted column on the two notification tables — no
--     RLS change, no backfill, no signature change on any RPC, no data
--     migration. Old clients never read it; new clients tolerate rows
--     without it (payload ?? {}).
-- ============================================================================

alter table public.notifications
  add column if not exists payload jsonb not null default '{}'::jsonb;

alter table public.admin_notifications
  add column if not exists payload jsonb not null default '{}'::jsonb;

-- VERIFY (psql sample):
--   select column_name, data_type, column_default from information_schema.columns
--    where table_schema='public' and table_name in ('notifications','admin_notifications')
--      and column_name='payload';
