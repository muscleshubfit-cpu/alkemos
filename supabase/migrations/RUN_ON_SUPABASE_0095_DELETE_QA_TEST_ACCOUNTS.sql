-- =====================================================================
-- RUN_ON_SUPABASE_0095_DELETE_QA_TEST_ACCOUNTS.sql
-- =====================================================================
-- الهدف (أمر المالك 2026-09-27 «مطلوب مسح حسابين الاختبار»):
--   مسح حسابي أدمن QA بالكامل من قاعدة البيانات:
--
--     1) alkemos.qa.admin@gmail.com
--        (أُنشئ عبر التسجيل الحي ثم رُقّي أدمن QA بميجريشن 0073 —
--        تأكيد البريد من SQL + ترقية profiles.role إلى admin)
--     2) qa.admin1431@musclehub-test.com
--        (حساب اختبار معلَّم is_test_account=true — استُخدم لفحص
--        شاشات الأدمن بجلسات UX 2026-09-21؛ أُعيد ضبط كلمة مروره
--        بوسيلة 0050 المعتمدة. دورته admin → محمي من الحذف عبر
--        /admin/accounts بوابة GUARD 2 «admin_protected» — لذا المسح
--        من هنا هو المسار الوحيد، نفس سابقة 0066.)
--
-- ليه سكريبت يدوي مش تهجيرة تلقائية (YYYYMMDDHHMMSS)؟
--   نفس قانون 0066 حرفيًا: العملية بتلمس auth.users — وكل عمليات
--   auth في المشروع تاريخيًا يدوية (0040 / 0050 / 0055 / 0066).
--   لو اتعملت تهجيرة تلقائية ودور الـ GitHub integration مالوش
--   صلاحية DELETE على auth.users فهتفشل الترحيل وتوقف خط النشر
--   كله (درس إصلاح الـ ledger في 0054). SQL Editor بيتنفذ بدور
--   postgres — وده المجرَّب بنفس أسلوب 0066 v2.
--
-- خريطة المسح (نمط 0066 v2 + تدقيق كل الجداول المضافة بعدها):
--   الخطوة 0: تحديد user_id من auth.users أو profiles بالبريد
--            بالظبط — الحساب مش موجود → إقفال آمن (Idempotent).
--   الخطوة 1: صفوف الحساب في الجداول اللي اتحققت حيًا إنها بدون
--            أي FK حي يوصلها الكاسكيد أبدًا (مرآة 0066 v2:
--            coach_presence بعمود coach_id الحي):
--              chat_messages.client_id · saved_results.user_id ·
--              meal_plans.user_id · plan_swaps.user_id ·
--              coach_presence.coach_id · progress_photos.user_id ·
--              subscription_requests.user_id
--            + حذف وقائي (لو الـ FK cascade فعلًا فالأثر صفر):
--              evo_chat_usage.user_id · ticket_messages.sender_id ·
--              evo_call_stats.user_id (بدون FK إطلاقًا — 0081)
--            + tool_leads بالإيميل (مفتاح مزامنة العملاء في 0060
--              هو الإيميل وبلا FK).
--            + coach_wallet_transactions.created_by → NULL بدل حذف
--              الصف (حماية لحركات المحافظ الحقيقية).
--   الخطوة 2: حذف profiles — بيشغّل الكاسكيد الحي المثبت على:
--              subscriptions · notifications · admin_notifications
--              (target_coach_id) · coach_ads/fees/payments/wallets/
--              topup_requests(reviewer)/support_messages/pages ·
--              assignments (ومنها site_coach_assignments 0067) ·
--              referrals/earnings/payouts · affiliate_transactions/
--              commissions · refund_requests · external_plans ·
--              questionnaires/progress_entries/plans ·
--              evo_memory + evo_memory_state (0078) ·
--              evo_followup_prefs (0079)
--   الخطوة 3: حذف auth.users — كاسكيد داخلية في مخطط auth
--              (identities · sessions · refresh tokens) + كاسكيد
--              storage.objects (ملفات رفع الحساب) + ai_plan_usage
--              (0085 CASCADE) · ai_jobs.requested_by → NULL ·
--              evo_feedback.client_id → NULL (0077) ·
--              site_content.updated_by → NULL (0094)
--
-- الأمان:
--   * المسح محصور بالبريدين بالنص — مستحيل يمسح أي حساب تاني.
--   * كل حساب في معاملة ذرّية واحدة (DO block = transaction واحد —
--     درس 0066 v1: أي فشل يرجع كل شيء، صفر مسح جزئي).
--   * audit_log.changed_by هيفضل NULL (سجل تاريخي محايد — مقصود).
--   * صفر تغيير في الـ schema → types.ts مش محتاج إعادة توليد
--     (قانون MIGRATION INDEX §c: سياسات/بيانات فقط).
--   * Idempotent: تشغيله أكتر من مرة آمن تمامًا.
--
-- RUN: Supabase Dashboard → SQL Editor → paste → Run
-- التحقق: استعلام التحقق الأخير لازم يرجّع 3 أصفار → reply تم
-- =====================================================================

do $$
declare
  v_uid  uuid;
  v_mail text;
  v_accounts constant text[] := array[
    'alkemos.qa.admin@gmail.com',
    'qa.admin1431@musclehub-test.com'
  ];
begin
  foreach v_mail in array v_accounts loop

    -- ---------- الخطوة 0: تحديد الحساب ----------
    select id into v_uid from auth.users where email = v_mail;
    if v_uid is null then
      select id into v_uid from public.profiles where email = v_mail;
    end if;

    if v_uid is null then
      raise notice '«%» مش موجود أصلاً — مفيش حاجة تتعمل (Idempotent).', v_mail;
      continue;
    end if;
    raise notice 'جاري مسح حساب الاختبار «%»: %', v_mail, v_uid;

    -- ---------- الخطوة 1: الجداول بدون FK حي (بقايا مضمونة لو اتسابت) ----------
    if to_regclass('public.chat_messages') is not null then
      delete from public.chat_messages where client_id = v_uid;
    end if;

    if to_regclass('public.saved_results') is not null then
      delete from public.saved_results where user_id = v_uid;
    end if;

    if to_regclass('public.meal_plans') is not null then
      delete from public.meal_plans where user_id = v_uid;
    end if;

    if to_regclass('public.plan_swaps') is not null then
      delete from public.plan_swaps where user_id = v_uid;
    end if;

    -- (0066 v2): العمود الحي في الإنتاج هو coach_id — مش user_id
    if to_regclass('public.coach_presence') is not null then
      delete from public.coach_presence where coach_id = v_uid;
    end if;

    if to_regclass('public.progress_photos') is not null then
      delete from public.progress_photos where user_id = v_uid;
    end if;

    if to_regclass('public.subscription_requests') is not null then
      delete from public.subscription_requests where user_id = v_uid;
    end if;

    -- وقائي (لو الـ FK cascade فعلًا يبقى الأثر صفر):
    if to_regclass('public.evo_chat_usage') is not null then
      delete from public.evo_chat_usage where user_id = v_uid;
    end if;

    if to_regclass('public.ticket_messages') is not null then
      delete from public.ticket_messages where sender_id = v_uid;
    end if;

    -- (0081) عمود إحصائيات بلا FK إطلاقًا — حذف وقائي
    if to_regclass('public.evo_call_stats') is not null then
      delete from public.evo_call_stats where user_id = v_uid;
    end if;

    if to_regclass('public.tool_leads') is not null then
      delete from public.tool_leads where email = v_mail;
    end if;

    -- عمود نسبة بلا FK → تصفير مش حذف (حماية لحركات المحافظ الحقيقية):
    if to_regclass('public.coach_wallet_transactions') is not null then
      update public.coach_wallet_transactions
         set created_by = null
       where created_by = v_uid;
    end if;

    -- ---------- الخطوة 2: البروفايل (يشغّل الكاسكيد الحي) ----------
    delete from public.profiles where id = v_uid;

    -- ---------- الخطوة 3: مستخدم المصادقة (كاسكيد auth + التخزين) ----------
    delete from auth.users where id = v_uid;

    raise notice 'تم مسح «%» بالكامل — راجع جدول التحقق تحت.', v_mail;

  end loop;
end $$;

-- ---------- PostgREST schema reload ----------
notify pgrst, 'reload schema';

-- ---------- التحقق النهائي (لازم الأعمدة الثلاثة = 0) ----------
select
  (select count(*) from auth.users
    where email in ('alkemos.qa.admin@gmail.com',
                    'qa.admin1431@musclehub-test.com'))  as auth_users_left,
  (select count(*) from public.profiles
    where email in ('alkemos.qa.admin@gmail.com',
                    'qa.admin1431@musclehub-test.com'))  as profiles_left,
  (select count(*) from public.tool_leads
    where email in ('alkemos.qa.admin@gmail.com',
                    'qa.admin1431@musclehub-test.com'))  as leads_left;
