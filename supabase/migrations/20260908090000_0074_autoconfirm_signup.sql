-- =====================================================================
-- 20260908090000_0074_autoconfirm_signup.sql
-- =====================================================================
-- الهدف (أمر المالك 2026-09-08): «نجعل تسجيل الدخول بدون رسالة تأكيد
-- كما كانت سابقا» — استعادة «التسجيل الفوري» الموثق أصلًا في
-- SECURITY.md (Instant activation trade-off — accepted by owner):
--
--   الخلفية الموثقة (STATE.md P1): تكامل Supabase/GoTrue الحي مضبوط
--   على mailer_autoconfirm=false بينما SMTP غير مُهيأ إطلاقًا → كل
--   تسجيل جديد يعلق في «بانتظار تأكيد البريد» والرابط لا يصل أبدًا →
--   المستخدم الجديد لا يستطيع الدخول نهائيًا. الوثائق الأمنية تنص
--   على أن الوضع المعتمد من المالك هو التسجيل الفوري (بلا تحقق بريد)
--   والمخاطرة محكومة بـ rate-limit + honeypot.
--
--   الحل هنا (طبقة DB — لا يحتاج تدخلًا يدويًا):
--     A) دالة trigger آمنة تضبط email_confirmed_at عند INSERT لكل
--        مستخدم بريد جديد غير مؤكد (Google OAuth يصل مؤكدًا أصلًا
--        فلا يتأثر — الشرط email_confirmed_at IS NULL).
--     B) تركيب التريغر على auth.users.
--     C) فتح الباب للمعلّقين الحاليين: تأكيد كل الحسابات العالقة
--        (locked out) بسبب نفس العطل — عملاء حقيقيون سجلوا ولم
--        يستطيعوا الدخول مطلقًا.
--
--   الأمان:
--     * صفر تغيير هيكلي على جداول public (types.ts وmigration_audit
--       بلا تأثير) — التريغر سلوك إدخال فقط.
--     * Idempotent: DROP TRIGGER IF EXISTS + CREATE OR REPLACE —
--       إعادة التشغيل آمنة.
--     * كل مسّ لـ auth.users محصّن بمعالج استثناء داخل DO block —
--       لو دور التكامل نفى الصلاحية تُطبع ملاحظة وتكمل الميجريشن
--       نجاحًا (لا يمكن لهذا الملف أن يوقف خط الترحيل — درس 0064 v1
--       / 0072؛ نفس نمط 0073 المجرب).
--     * الدالة SECURITY DEFINER بـ search_path مثبتة ولا تلمس أي
--       جدول — تعدّل NEW فقط.
--
--   ملاحظة استرجاع (عند تهيئة SMTP مستقبلًا وإعادة تفعيل التأكيد):
--     DROP TRIGGER alkemos_autoconfirm_email ON auth.users;
--     DROP FUNCTION public.alkemos_autoconfirm_email();
-- =====================================================================

do $qa74$
begin
  -- ---------- الجزء A: دالة التأكيد التلقائي (public — محصّنة) ----------
  begin
    create or replace function public.alkemos_autoconfirm_email()
    returns trigger
    language plpgsql
    security definer
    set search_path = pg_catalog, public
    as $fn$
    begin
      -- اشتراط البريد: مستخدمو الهاتف/OAuth خارج النطاق، والحسابات
      -- المؤكدة سلفًا لا تُلمس (الشرط IS NULL)
      if new.email is not null and new.email_confirmed_at is null then
        new.email_confirmed_at := now();
      end if;
      return new;
    end;
    $fn$;
    raise notice 'QA-74: function public.alkemos_autoconfirm_email() ready.';
  exception when others then
    raise notice 'QA-74: function creation skipped (%) — راجع يدويًا.', sqlerrm;
  end;

  -- ---------- الجزء B: تركيب التريغر (auth schema — محصّن) ----------
  begin
    drop trigger if exists alkemos_autoconfirm_email on auth.users;
    create trigger alkemos_autoconfirm_email
      before insert on auth.users
      for each row
      execute function public.alkemos_autoconfirm_email();
    raise notice 'QA-74: trigger installed on auth.users.';
  exception when others then
    raise notice 'QA-74: trigger install skipped (%) — يحتاج تفعيلًا يدويًا من SQL Editor.', sqlerrm;
  end;

  -- ---------- الجزء C: فتح الحسابات العالقة (بيانات فقط — محصّن) ----------
  begin
    update auth.users
       set email_confirmed_at = coalesce(email_confirmed_at, now()),
           updated_at = now()
     where email_confirmed_at is null
       and email is not null;
    raise notice 'QA-74: previously stuck signups confirmed.';
  exception when others then
    raise notice 'QA-74: stuck-signup confirm skipped (%)', sqlerrm;
  end;
end
$qa74$;

-- ---------- VERIFY (تشغيل يدوي اختياري من SQL Editor) ----------
-- select count(*) as confirmed_now from auth.users where email_confirmed_at is not null;
-- select tgname from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal;
