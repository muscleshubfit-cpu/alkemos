# RECOVERY-DRILL-2-STORAGE-REPORT-2026-09-20.md — Drill #2: قابلية استعادة ملفات Storage (غير مدمّر)

> **الغرض (أمر المالك 2026-09-20 مساءً — «التحقق من إمكانية استعادتها» + «نفّذ Recovery Drill إضافيًا إذا أصبح ذلك ضروريًا لإثبات أن نسخة Storage يمكن استعادتها، وليس مجرد إنشائها»):** الإثبات العملي بأن نسخة ملفات Storage اليومية **قابلة للاستعادة فعلًا** — رفع كامل عبر نفس Storage API التي تستخدمها الاستعادة الحقيقية، ثم قراءة كل ملف راجعًا ومطابقة sha256 حرفيًا — **بصفر كتابة على أي باكت إنتاجية** (كل الكتابة في باكت مؤقتة `restore-drill-*` خاصة تُحذف في نفس التشغيل).
> **القاعدة:** عدادات فقط — لا مسارات كائنات ولا أي PII في هذا التقرير (المسارات في المستودع الخاص حصرًا).
> **السابقة:** Drill #1 (`RECOVERY-DRILL-REPORT-2026-09-20.md`) أثبت استعادة البيانات (JSON) — هذا التقرير يكمل النصف الآخر من B4: الملفات.

---

## 1. نتيجة Drill #2 بإيجاز

| # | البرهان | النتيجة |
|---|---|---|
| S1 | أول نسخة رسمية آلية لملفات الستوريج (dispatch على `b62c1ca4`) | ✅ run 35528734912 نجح — دفع `storage-backups/2026-09-20` للمستودع الخاص |
| S2 | اكتمال النسخة وتطابقها | ✅ **10 باكتات · 24 كائنًا · 4,738,252 بايت · failed=0 · byteMismatch=0** — مطابقة حرفية للجرد الرسمي (storage-inventory 17:21Z) ولعدّاد SQL الحي (16/2/6 عبر 3 باكتات) |
| S3 | الملفات فعليًا في git (لا manifest فقط) | ✅ 24 blob تحت `storage-backups/2026-09-20/files/` بمجموع 4,738,252 بايت (git trees API) + بصمة sha256 سليمة 64-حرفًا لكل كائن في الـ manifest |
| S4 | بوابة السلامة قبل أي كتابة (dry-run داخل الدريل) | ✅ `integrity 24/24 ok · missing=0 · corrupt=0 · extra-files=0` — صفر كتابة شبكية |
| S5 | **الاستعادة الفعلية** إلى باكت مؤقتة `restore-drill-1` (خاصة) | ✅ `uploaded 24/24 · uploadFailed=0` (33.6 ث) |
| S6 | **التحقق الراجع حرفيًا** (قراءة كل كائن ومطابقة sha256) | ✅ `read-back verified 24/24 · verifyFailed=0` — كل كائن عاد مطابقًا بايتًا ببايت |
| S7 | التنظيف الكامل | ✅ `24 objects deleted, bucket restore-drill-1 removed` (خطوة `if: always()`) |
| S8 | الإنتاج سليم بعد الدريل (SQL قراءة فقط) | ✅ `total_buckets=10 · drill_residue=0 · total_objects=24 (16/2/6)` — لم يتغير شيء |

**الحكم:** سلسلة B4 مغلقة من طرفيها — *النسخة تُنشأ آليًا كل يوم (S1–S3) · والنسخة تُستعاد وتطابق بايتًا ببايت (S4–S6) · والإنتاج لا يتأثر أبدًا بالتمرين (S7–S8)*. نسخة لا يمكن استعادتها ليست نسخة — وهذا الدريل يثبت أنها تُستعاد.

## 2. الأوامر الحرفية (للتكرار في أي وقت)

```bash
# نسخة جديدة الآن (أو انتظر جدولة 06:00 UTC اليومية)
#   GitHub ▸ Actions ▸ "Storage backup (daily files → private musclehubeg-backups)" ▸ Run workflow
# ثم التمرين كاملًا:
#   GitHub ▸ Actions ▸ "Storage restore drill (non-destructive proof → temp bucket)" ▸ Run workflow
#   (مدخل اختياري: backup_date=YYYY-MM-DD لتتمرين تاريخ بعينه بدل الأحدث)

# أو يدويًا محليًا (نفس منطق الـ workflow، بعد استنساخ المستودع الخاص):
git clone https://github.com/muscleshubfit-cpu/musclehubeg-backups.git /tmp/backups
LATEST=$(ls /tmp/backups/storage-backups | sort | tail -1)

SUPABASE_URL=<مشروع-الهدف> SUPABASE_SERVICE_ROLE_KEY=<مفتاح-الهدف> \
  node scripts/storage-restore.mjs /tmp/backups/storage-backups/$LATEST            # dry-run — صفر كتابة

SUPABASE_URL=<مشروع-الهدف> SUPABASE_SERVICE_ROLE_KEY=<مفتاح-الهدف> \
  node scripts/storage-restore.mjs /tmp/backups/storage-backups/$LATEST \
    --execute --into-bucket restore-drill-manual --create-bucket                  # تمرين كامل

SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… \
  node scripts/storage-restore.mjs --delete-bucket restore-drill-manual           # تنظيف (يرفض غير restore-drill-*)
```

## 3. لقطات السجل الحرفية (run 35528872482 — عدادات فقط)

```text
Drilling against storage-backups/2026-09-20
storage-restore: manifest 2026-09-20T18:20:32.234Z — 10 buckets · 24 objects · 4627 KB
storage-restore: integrity 24/24 ok · missing=0 · corrupt=0 · extra-files=0
storage-restore: dry-run complete — zero network writes performed
storage-restore: drill bucket restore-drill-1 created (private)
storage-restore: drill→restore-drill-1 — uploaded 24/24 · read-back verified 24/24 · uploadFailed=0 · verifyFailed=0 · 33.6s
storage-restore: every object round-tripped byte-identically (sha256)
storage-restore: drill cleanup done — 24 objects deleted, bucket restore-drill-1 removed
Result      : PASS
```

## 4. حدود معلومة (ما لا يثبته هذا الدريل)

- **نافذة الـ 24 ساعة:** ملف يُرفع بعد نسخة 06:00 UTC ويُفقد قبل التالية يُفقد — الحد البنيوي للجدولة اليومية (يراجع لو نما حجم الرفع الفعلي).
- **تعريفات الباكتات تُستعاد من الميجريشنز** (0027/0037/0090) لا من النسخة — الـ manifest يسجلها للتحقق فقط، و`--confirm-original` يرفض الانطلاق إن نقصت باكت في الهدف.
- **الاستعادة الحقيقية على مشروع جديد فارغ** تظل بقرار مالك (كلفة/موارد — قانون الخطة P1-5)؛ الدريل أثبت بدائلها الكاملة على نفس المشروع.
- الحذف المتعمد لكائن في الإنتاج **ليس** استعادة-بالمسار من هذا النوع بعد تغير مساره في الصفوف المرجعية — الاستعادة upsert بنفس المسارات؛ الصفوف تُستعاد هي الأخرى من نسخ JSON اليومية.

## 5. الدورية

تكرار التمرين موصى به شهريًا مع Drill البياني (نفس دورية Drill #1 §5)، وبعد أي تغيير في سياسات الباكتات أو نمط الرفع — تشغيله يدوي دائمًا (لا جدولة عمدًا: التمرين يكتب حالة مؤقتة على المشروع الحي).
