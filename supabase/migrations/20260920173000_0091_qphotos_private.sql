-- =====================================================================
--  Alkemos — 0091: flip `questionnaire-photos` PRIVATE (security split 2/2)
--  (Owner-approved urgent security item, 2026-09-20 — see worklog entry
--   STORAGE-AVATAR-SPLIT-B-2026-09-20; sibling: 20260920171500_0090)
--
--  CONTEXT: 0090 (previous frame) created the public `avatars` bucket and
--  the avatar flow was rerouted to it and deployed. This frame closes the
--  W2-flagged drift: the sensitive physique-photo bucket becomes what
--  RUN_ON_SUPABASE_0027 always claimed it was (PRIVATE — objects are
--  streamed through the authenticated /api/file proxy, never public URLs).
--
--  LIVE APPLICATION ORDER (this file shipped ONLY after the code deploy
--  from 0090's frame was READY on Vercel — no window where old code
--  uploaded avatars into a bucket that had just gone private):
--    1. update storage.buckets → public = false
--    2. rewrite the ONE legacy avatar_url (profiles row) from the public
--       storage-URL form to the permanent /api/file proxy form — the
--       object itself is NOT moved: the owner renders it via the proxy
--       (owner-or-coach authorization), and images.unoptimized means the
--       browser fetches it with session cookies. Client avatars have no
--       anonymous render context (only coach avatars appear on public
--       pages, and those upload into `avatars` from 0090 onward).
--
--  VERIFIED BEFORE SHIPPING (live, read-only, 2026-09-20):
--    * exactly 1 profile row matches the WHERE below;
--    * the regexp rewrite yields a valid
--      /api/file?bucket=questionnaire-photos&path=<uid>/avatar-<ts>.<ext>
--      shape for that row;
--    * the only getPublicUrl dependency on this bucket in the whole codebase
--      was src/app/profile/page.tsx (rerouted in 0090's frame);
--    * questionnaire jsonb photos are data: URLs only (zero storage refs).
--
--  Idempotent: both statements are no-ops on re-run. types.ts untouched.
-- =====================================================================

-- 1) THE FIX: physique photos are private health data — serve them ONLY
--    through the authenticated proxy (and signed URLs where used).
update storage.buckets set public = false where id = 'questionnaire-photos';

-- 2) Data migration for the single legacy avatar that pointed at this
--    bucket's public URL (per SECURITY.md §5: data migrations go through
--    migration files, applied via the standard channel).
update public.profiles
   set avatar_url = regexp_replace(
         avatar_url,
         '^https://[^/]+/storage/v1/object/public/questionnaire-photos/(.+)$',
         '/api/file?bucket=questionnaire-photos&path=\1')
 where avatar_url ~ '^https://[^/]+/storage/v1/object/public/questionnaire-photos/';

-- VERIFY (expect: public = false; zero public-URL avatars remaining):
-- select id, public from storage.buckets where id = 'questionnaire-photos';
-- select count(*) from public.profiles
--  where avatar_url like '%/storage/v1/object/public/questionnaire-photos/%';
