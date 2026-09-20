# RECOVERY-DRILL-REPORT-2026-09-20.md — Drill #1 لقابلية الاستعادة (غير مدمر)

> **الغرض (P1-6 من خطة التقوية):** أول تدريب استعادة دوري مُوثق — إثبات عملي بأن Alkemos قابل لإعادة التشغيل من GitHub وحده + Supabase الحي، **بصفر كتابة على أي خدمة إنتاجية** (كل الخطوات قراءة فقط أو محلية).
> **القاعدة:** التقرير يحمل الأوامر والنتائج الحرفية المهمة فقط — بلا أي سر وبلا أي بيانات PII (عدادات فقط).
> **قابلية التكرار:** كل خطوة أدناه قابلة للتنفيذ الحرفي بأوامرها في أي وقت لاحق كـ Drill #2.

---

## 1. نتيجة Drill #1 بإيجاز

| # | البرهان | النتيجة |
|---|---|---|
| D1 | استنساخ مستودع النسخ الخاص (قراءة فقط) | ✅ نجح — آخر لقطة `snapshots/2026-09-20` |
| D2 | سلامة اللقطة داخليًا | ✅ 53/53 جدولًا يُفك JSON · 38 غير فارغ + 15 فارغ = 53 · مجموع 1121 صفًا **يطابق manifest بالضبط** |
| D3 | مسار الاستعادة الجاف `db-restore.mjs` (dry-run) | ✅ exit 0 · الجولة الأولى تغطي 38 جدولًا بمجموع **1121 صفًا = manifest بالضبط** · ملاحظة المخرجات: الطباعة تتكرر في الجولة الثانية افتراضيًا (تصميم الجولتين) |
| D4 | تماثل الميجريشنز | ✅ `migration_audit.py --ci` — صفر انحراف جديد |
| D5 | بوابات التوثيق | ✅ `docs_audit` · `docs_parity` · `stale-refs` خضراء على كل كوميتات الموجات |
| D6 | **بوابة الجودة الكاملة محليًا من HEAD** | ✅ `bun install --frozen-lockfile` (680 حزمة · 4.2 ث) · `tsc --noEmit` صفر أخطاء · `eslint .` صفر · `vitest run` **1531/1531** (وقت تشغيل Node) · `next build` **exit 0** بجدول المسارات كاملًا (.next = 299MB) |
| D7 | CI على كل دفعات الجلسة (5 كوميتات) | ✅ quality/parity/guard أخضراء (حالة cancel وحيدة = إلغاء superseded طبيعي بالتزامن) |
| D8 | **البناء الإنتاجي الحي** | ✅ أربع نشرات إنتاجية **READY** على Vercel لكوميتات الموجات — والكوميت التوثيقي الخالص **CANCELED عمدًا** بـ ignoreCommand (السلوك المصمم) |
| D9 | دخان الموقع الحي بعد كل التغييرات | ✅ `/` 200 · `/sitemap.xml` 200 · `/api/build-info` 200 |
| D10 | جرد Storage الحي (أول قياس فعلي) | ✅ 9 حاويات تعد بنجاح — **صفر كائنات في كلها** (خطر B4 نظري حاليًا لا عمليًا — لا ملفات معرضة اليوم) |

**الحكم:** المسار المقيس كامل: *GitHub وحده يبني المشروع (D6) · البيانات قابلة للاستعادة من المستودع الخاص (D1–D3) · البنية تُستعاد من الميجريشنز (D4) · الإنتاج يعمل بكل تغييرات التقوية (D7–D9).*

## 2. الأوامر الحرفية (للتكرار في Drill #2)

```bash
# D1 — استنساخ مستودع النسخ (قراءة فقط)
git clone https://github.com/muscleshubfit-cpu/musclehubeg-backups.git /tmp/drill-backups
LATEST=$(ls /tmp/drill-backups/snapshots | sort | tail -1)   # → 2026-09-20

# D2 — السلامة الداخلية للقطة (عدادات فقط — لا يطبع أي صف)
python3 - <<'EOF'
import json
m = json.load(open(f"/tmp/drill-backups/snapshots/2026-09-20/manifest.json"))
nz = sum(1 for t in m["tables"].values() if t.get("rows", 0) > 0)
tot = sum(t.get("rows", 0) for t in m["tables"].values())
assert (len(m["tables"]), nz, tot) == (53, 38, 1121) == (m["totals"]["tables"], nz, m["totals"]["rows"])
print("SNAPSHOT CONSISTENT: 53 tables · 38 non-empty · 1121 rows")
EOF

# D3 — استعادة جافة (متغيرات وهمية غير فارغة: الوضع الجاف لا يصدر أي نداء شبكي إطلاقًا)
cd <استنساخ-نظيف-للمستودع-العام>
SUPABASE_URL=https://drill-dummy.supabase.co SUPABASE_SERVICE_ROLE_KEY=drill-dummy \
  node scripts/db-restore.mjs /tmp/drill-backups/snapshots/$LATEST
# المتوقع: "db-restore: dry-run complete" و exit 0 — ثم مطابقة مجموع الصفوف مع manifest

# D4–D5 — البوابات
python3 scripts/migration_audit.py --ci && python3 scripts/docs_audit.py --ci \
  && python3 scripts/docs_parity.py --ci && bash scripts/check-stale-refs.sh

# D6 — بوابة الجودة الكاملة (نفس تسلسل quality-gate.yml)
bun install --frozen-lockfile
# (ولّد next-env.d.ts كما في CI إن لم يكن موجودًا)
npx --no-install tsc --noEmit && npx --no-install eslint . && npx --no-install vitest run
bun run build   # exit 0

# D9 — دخان حي
curl -s -o /dev/null -w "%{http_code}" https://alkemos.com/            # 200
curl -s -o /dev/null -w "%{http_code}" https://alkemos.com/sitemap.xml # 200
```

## 3. ملاحظات تنفيذ مهمة (دروس Drill #1)

1. **درس وقت التشغيل:** تشغيل vit بعلامة `--bun` (وقت تشغيل Bun) يفشل 5 اختبارات بـ `z.enum is undefined` (مشكلة interop معروفة بين Bun وzod v4) — **المرجع دائمًا هو Node** (`npx vitest run`) كما في CI: 1531/1531 خضراء. أي Drill مستقبلي يستخدم Node.
2. **درس .gitignore:** `/scripts/*` يبتلع أي سكربت جديد غير مستثنى (وقع لـ `storage-inventory.mjs` في هذه الجلسة ونفسه وقع لـ generate-og-cards.py في Phase 188) — أي سكربت تشغيلي جديد = استثناء `!` + سطر توثيقي بالترويسة في نفس الفريم.
3. **درس مسار Storage API:** عدّ الكائنات هو `POST /storage/v1/object/list/{bucket}` وليس `/storage/v1/list/{bucket}` (404 صامت لو أخطأت).
4. **مخرجات dry-run تتضاعف:** db-restore يطبع الجولة الثانية حتى في الوضع الجاف — للمطابقة اجمع أول جولة فقط.

## 4. ما لم يثبته Drill #1 (حدود معلومة — بقرار/موارد خارجية)

| الحد | لماذا خارج هذا الـ Drill |
|---|---|
| استعادة فعلية (`--apply`) على مشروع Supabase جديد | يتطلب إنشاء مشروع جديد (قرار مالك — P1-5) — المسار موثق في `docs/SUPABASE-FULL-RECOVERY-RUNBOOK.md` |
| إعادة ربط الدومينات على مشروع Vercel جديد | سيناريو حي يتطلب قرار مالك — الخطوات في تقرير التدقيق §11 |
| إعادة إدخال قيم PayPal/GA/AdSense | بيد المالك من لوحات المزودين (P0-2 مرجع المصادر جاهز) |
| استعادة ملفات Storage | **لا يوجد ملفات أصلًا حاليًا (D10: صفر كائنات)** — وقرار النسخ مستقبلًا معلق بـ P0-3(ج) |

## 5. التوصية الدورية

تكرار هذا الـ Drill شهريًا (وبعد أي تغيير بنيوي في خط النسخ): نفس الأوامر، ومقارنة العدادات مع هذا التقرير كخط أساس — أي انحراف (جداول جديدة/صفوف لا تطابق/بوابة تحمرّ) = فتح بند فورًا وفق قانون الجدولة الصحية §8.
