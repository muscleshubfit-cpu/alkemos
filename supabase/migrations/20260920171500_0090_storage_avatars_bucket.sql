-- =====================================================================
--  Alkemos — 0090: dedicated PUBLIC `avatars` bucket (security split 1/2)
--  (Owner-approved urgent security item, 2026-09-20 — see worklog entry
--   STORAGE-AVATAR-SPLIT-A-2026-09-20 and the audit trail that flagged the
--   drift: docs/SUPABASE-FULL-RECOVERY-RUNBOOK.md §5 + W2 census)
--
--  WHY: `questionnaire-photos` was created PUBLIC-by-accident (bucket
--  pre-existed 0027, whose INSERT ... ON CONFLICT DO NOTHING never
--  converged the live flag) and later kept public deliberately for the
--  avatar flow (0071 §1 comment: avatars are served via getPublicUrl).
--  That mixes two privacy classes in ONE bucket: member physique photos
--  (sensitive health data, /api/upload → /api/file proxy design, private)
--  and profile avatars (public-by-design — coach avatars render on PUBLIC
--  coach landing + featured-coaches pages where signed URLs expire and
--  /api/file would 403 for anonymous visitors).
--
--  THE FIX (two migrations, two frames, zero-breakage ordering):
--    0090 (this file) — create the public `avatars` bucket + owner RLS
--           policies, and route the avatar flow to it (code side:
--           src/app/profile/page.tsx). Nothing is flipped yet.
--    0091 (next frame, after the code deploy is READY) — flip
--           `questionnaire-photos` to private + rewrite the ONE legacy
--           avatar_url to the /api/file proxy form.
--
--  LESSON APPLIED (the 0027 drift class): this INSERT uses
--  ON CONFLICT DO UPDATE — it CONVERGES the live flag instead of the
--  silent DO NOTHING no-op that let a public bucket masquerade as
--  private for 23 days.
--
--  Idempotent: drop-if-exists + create policies, upserting bucket row.
--  types.ts untouched (storage schema, not public schema).
-- =====================================================================

-- 1) The bucket: PUBLIC, images only, 2MB (mirrors the client-side
--    avatar gate in src/app/profile/page.tsx — 512px WebP ≈ a few
--    hundred KB; 2MB is the same ceiling the page enforces).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152,
    array['image/jpeg','image/png','image/webp','image/heic','image/heif'])
on conflict (id) do update
  set public = true,
      file_size_limit = 2097152,
      allowed_mime_types = array['image/jpeg','image/png','image/webp','image/heic','image/heif'];

-- 2) Owner-scoped RLS policies (the 0071 qphotos_* pattern, proven in
--    production since 2026-09-07): a signed-in user may write objects
--    ONLY under their own <uid>/ folder. Public READ of the bucket is
--    governed by the bucket's public flag (avatars are public-by-design
--    — same model 0071 documented); listing for anonymous stays denied
--    because there is no SELECT policy (and none is wanted).
drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert" on storage.objects
  for insert to authenticated
  with check ((bucket_id = 'avatars') and ((storage.foldername(name))[1] = auth.uid()::text));

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update" on storage.objects
  for update to authenticated
  using ((bucket_id = 'avatars') and ((storage.foldername(name))[1] = auth.uid()::text))
  with check ((bucket_id = 'avatars') and ((storage.foldername(name))[1] = auth.uid()::text));

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete" on storage.objects
  for delete to authenticated
  using ((bucket_id = 'avatars') and ((storage.foldername(name))[1] = auth.uid()::text));

-- VERIFY (expect 1 row, public = true):
-- select id, public, file_size_limit from storage.buckets where id = 'avatars';
-- select policyname, cmd from pg_policies
--  where schemaname='storage' and tablename='objects'
--    and (qual like '%avatars%' or with_check like '%avatars%');
