-- =====================================================================
-- 20260907200000_0073_qa_admin_bootstrap.sql
-- =====================================================================
-- الهدف: تهيئة حساب أدمن لضمان الجودة (QA) لتجربة لوحة التحكم كاملة:
--
--   الحساب (أُنشئ عبر نموذج التسجيل الحي في alkemos.com):
--     البريد:    alkemos.qa.admin@gmail.com
--     كلمة السر: (محفوظة لدى مالك المشروع — ليست في هذا الملف)
--     الاسم:     QA Admin Test
--
--   المشكلة التي يعالجها:
--     1) التسجيل تم بنجاح لكن البريد بانتظار التأكيد، وSMTP غير
--        مُهيأ (موثق في STATE.md — P1 دعوة/تأكيد بريد معلّق) فلا
--        يمكن الوصول لرابط التأكيد إطلاقًا → تأكيد مباشر من SQL.
--     2) الدور الافتراضي عند التسجيل = client → ترقية للبروفايل
--        إلى admin (نفس نمط 0050 المجرب: الترقية من SQL مباشرة).
--
--   الأمان:
--     * بيانات فقط — صفر تغيير هيكلي (types.ts وmigration_audit بلا
--       تأثير).
--     * Idempotent: إعادة التشغيل آمنة (تحديثات مشروطة).
--     * التحديث على auth.users محصّن بمعالج استثناء داخل DO block —
--       لو دور التكامل نفى الصلاحية تُطبع ملاحظة وتكمل التهجيرة
--       نجاحًا (لا يمكن لهذا الملف أن يوقف خط الترحيل أبدًا — درس
--       0064 v1 / 0072).
--     * الحساب محدد بالبريد نصًا — مستحيل يمس أي حساب آخر.
-- =====================================================================

do $qa73$
begin
  -- ---------- الجزء A: تأكيد البريد (auth schema — محصّن) ----------
  begin
    update auth.users
       set email_confirmed_at = coalesce(email_confirmed_at, now()),
           confirmation_token = '',
           updated_at = now()
     where email = 'alkemos.qa.admin@gmail.com'
       and email_confirmed_at is null;
    raise notice 'QA-73: email confirmed (or already confirmed).';
  exception when others then
    raise notice 'QA-73: auth.users update skipped (%) — يحتاج تأكيد يدوي من لوحة Supabase.', sqlerrm;
  end;
end
$qa73$;

-- ---------- الجزء B: ترقية الدور إلى admin (public — مجرب عبر التكامل) ----------
update public.profiles
   set role = 'admin'
 where email = 'alkemos.qa.admin@gmail.com'
   and role <> 'admin';

-- ---------- التحقق النهائي (لازم السطر يظهر role = admin) ----------
select p.id, p.email, p.full_name, p.role,
       (select u.email_confirmed_at is not null
          from auth.users u
         where u.email = p.email) as email_confirmed
  from public.profiles p
 where p.email = 'alkemos.qa.admin@gmail.com';
