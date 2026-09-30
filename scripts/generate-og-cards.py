#!/usr/bin/env python3
"""
Alkemos — Static OG card generator (Phase 187 / SEO-GEO-8, P0-2).

Generates the per-surface 1200x630 branded social cards for the surfaces
the dynamic /api/og-image route does NOT cover (exercise pages, food
pages, muscle hubs, collections, tools, blog categories, AR root).

SOCIAL-OG-3 (2026-09-30, owner order «ابدأ التنفيذ للخطة»): FULL VISUAL
REDESIGN + 13 new card families. The 2026-09-30 audits (SOCIAL-OG-2
follow-up) proved the root cause of the owner-reported "blue/placeholder
share cards" was the card DESIGN itself: a dark #1d1d1f -> #0071e3
Apple-blue gradient that matches nothing in the brand (the site is a
LIGHT monochrome marble & chrome system: --bg #FAF8F5, --text #201D1A,
--edge #E5DFD6, --tint #F1EDE7 — zero blue anywhere). Every one of the
~354 wired surfaces therefore shared a card that LOOKED like a generic
blue placeholder. New design = the real brand system:

  - warm off-white diagonal gradient #FAF8F5 -> #EAE3D8
  - machined hairline rules (#E5DFD6) under the header & above the footer
  - near-black circle "A" mark + near-black Alkemos wordmark
  - near-black title, warm-gray description/footer

New families (audit round 2 — every surface that previously fell back to
the generic og-home card now gets a dedicated card): programs,
memberships, coaching, diet-plan, equipment, authors, compare hub,
about, contact, faq, affiliate, legal (privacy+terms) + a STATIC card
per comparison page (the dynamic generator never understood
type=compare and rendered a default-English title — see
src/app/api/og-image/[slug]/route.tsx).

Arabic cards render with libraqm (rtl + ar) using the same self-hosted
Cairo fonts as the dynamic route (public/fonts/og-cairo-{400,700}.ttf).

Copy rule: TIMELESS text only — no variable counts (868/8830 change as
the library grows; PNG text is un-greppable and un-guardable). Guarded
by og-image-coverage.test.ts (+ the visual law in og-image-visual.test.ts:
cards must stay WARM-LIGHT, never regress to the blue gradient).

Usage:  python3 scripts/generate-og-cards.py   (from repo root)
Output: public/images/og/og-<family>-<lang>.png
"""
import os

from PIL import Image, ImageDraw, ImageFont

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(REPO, "public", "images", "og")
FONT_BOLD = os.path.join(REPO, "public", "fonts", "og-cairo-700.ttf")
FONT_REG = os.path.join(REPO, "public", "fonts", "og-cairo-400.ttf")

W, H = 1200, 630
# SOCIAL-OG-3 brand-true palette (globals.css light theme — monochrome
# marble & chrome; the old #0071e3 Apple blue is BANNED by the visual law).
C_FROM = (250, 248, 245)     # #FAF8F5  --bg
C_TO = (234, 227, 216)       # #EAE3D8  warm silver (gradient end)
TEXT = (32, 29, 26, 255)     # #201D1A  --text (titles, wordmark)
MARK = (32, 29, 26, 255)     # #201D1A  the "A" circle fill
WHITE = (255, 255, 255, 255)
DESC = (110, 103, 93, 255)   # #6E675D  warm gray body copy
FOOT = (138, 131, 120, 255)  # #8A8378  warm gray footer
RULE = (229, 223, 214, 255)  # #E5DFD6  --edge machined hairlines
MARGIN = 60


def gradient() -> Image.Image:
    """135deg diagonal gradient, built small and upscaled (fast + smooth)."""
    sw = 150
    small = Image.new("RGB", (sw, sw))
    px = small.load()
    for y in range(sw):
        for x in range(sw):
            t = (x + y) / (2 * sw - 2)
            px[x, y] = tuple(round(a + (b - a) * t) for a, b in zip(C_FROM, C_TO))
    return small.resize((W, H), Image.BICUBIC).convert("RGBA")


def fit_font(path: str, text: str, max_px: int, max_size: int) -> ImageFont.FreeTypeFont:
    """Shrink font size until the text fits max_px width."""
    size = max_size
    while size > 24:
        font = ImageFont.truetype(path, size)
        if font.getlength(text) <= max_px:
            return font
        size -= 2
    return ImageFont.truetype(path, 24)


def wrap(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont,
         max_px: int, rtl: bool) -> list[str]:
    """Greedy word wrap (works for AR too — words are space-separated)."""
    words = text.split()
    lines, cur = [], ""
    for w in words:
        cand = (cur + " " + w).strip()
        if font.getlength(cand) <= max_px or not cur:
            cur = cand
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def draw_text_rtl_aware(draw: ImageDraw.ImageDraw, xy, text, font, fill, rtl: bool,
                         anchor: str):
    kwargs = {"direction": "rtl", "language": "ar"} if rtl else {}
    draw.text(xy, text, font=font, fill=fill, anchor=anchor, **kwargs)


def make_card(name: str, lang: str, title: str, desc: str) -> None:
    rtl = lang == "ar"
    img = gradient()
    draw = ImageDraw.Draw(img)

    # ── Machined hairline rules (the "1px machined edge" brand motif)
    draw.rectangle([MARGIN, 150, W - MARGIN, 152], fill=RULE)
    draw.rectangle([MARGIN, H - 112, W - MARGIN, H - 110], fill=RULE)

    # ── Brand header: near-black circle "A" + wordmark (top-left EN,
    #    top-right AR) — inverted from the old white-circle/blue-A mark.
    r = 28
    cy = 88
    cx = MARGIN + r if not rtl else W - MARGIN - r
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=MARK)
    f_mark = ImageFont.truetype(FONT_BOLD, 34)
    draw_text_rtl_aware(draw, (cx, cy - 2), "A", f_mark, WHITE, False, "mm")

    f_brand = ImageFont.truetype(FONT_BOLD, 33)
    if rtl:
        draw_text_rtl_aware(draw, (cx - r - 18, cy), "Alkemos", f_brand, TEXT, False, "rm")
    else:
        draw_text_rtl_aware(draw, (cx + r + 18, cy), "Alkemos", f_brand, TEXT, False, "lm")

    # ── Title (auto-fit ≤ 1080px, up to 2 lines) + description
    max_w = 1080
    f_title = ImageFont.truetype(FONT_BOLD, 56)
    title_lines = wrap(draw, title, f_title, max_w, rtl)
    if len(title_lines) > 2:
        f_title = ImageFont.truetype(FONT_BOLD, 46)
        title_lines = wrap(draw, title, f_title, max_w, rtl)
    f_desc = ImageFont.truetype(FONT_REG, 26)
    desc_lines = wrap(draw, desc, f_desc, 980, rtl)[:2]

    line_h = lambda f: int(f.size * 1.38)
    block_h = len(title_lines) * line_h(f_title) + 18 + len(desc_lines) * line_h(f_desc)
    y = 240 + (260 - block_h) // 2  # optically centered between the rules
    anchor_x = W - MARGIN if rtl else MARGIN
    anchor = "ra" if rtl else "la"
    for tl in title_lines:
        draw_text_rtl_aware(draw, (anchor_x, y), tl, f_title, TEXT, rtl, anchor)
        y += line_h(f_title)
    y += 18
    for dl in desc_lines:
        draw_text_rtl_aware(draw, (anchor_x, y), dl, f_desc, DESC, rtl, anchor)
        y += line_h(f_desc)

    # ── Footer: alkemos.com (left) + Alkemos (right)
    f_foot = ImageFont.truetype(FONT_REG, 21)
    fy = H - MARGIN - 8
    if rtl:
        draw_text_rtl_aware(draw, (W - MARGIN, fy), "alkemos.com", f_foot, FOOT, False, "rs")
        draw_text_rtl_aware(draw, (MARGIN, fy), "Alkemos", f_foot, FOOT, False, "ls")
    else:
        draw_text_rtl_aware(draw, (MARGIN, fy), "alkemos.com", f_foot, FOOT, False, "ls")
        draw_text_rtl_aware(draw, (W - MARGIN, fy), "Alkemos", f_foot, FOOT, False, "rs")

    out = os.path.join(OUT_DIR, f"{name}.png")
    img.convert("RGB").save(out, "PNG", optimize=True)
    print(f"OK {out} ({os.path.getsize(out) // 1024} KB)")


# (file name, lang, title, description) — TIMELESS copy only (no counts).
SPECS = [
    ("og-home-en", "en", "Alkemos — Fitness & Nutrition, Bilingual",
     "Exercises, foods, calculators, AI plan generators & coaching — in English & Arabic."),
    ("og-home-ar", "ar", "منصة Alkemos الرياضية الشاملة",
     "تمارين وأطعمة وحاسبات ومولدات خطط بالذكاء الاصطناعي ومدربون معتمدون — بالعربية والإنجليزية."),
    ("og-exercises-en", "en", "Exercise Library",
     "Complete guides: form, target muscles & equipment — in English & Arabic."),
    ("og-exercises-ar", "ar", "مكتبة التمارين",
     "طريقة الأداء والعضلات المستهدفة والمعدات — بالعربية والإنجليزية."),
    ("og-foods-en", "en", "Food & Nutrition Database",
     "Calories, protein, carbs & fat for every food — with smart serving sizes."),
    ("og-foods-ar", "ar", "الأطعمة والقيم الغذائية",
     "السعرات والبروتين والكارب والدهون لكل أكلة — ومقاسات تقديم ذكية."),
    ("og-hubs-en", "en", "Muscle Group Guides",
     "The best exercises for every muscle — sets, reps & alternatives."),
    ("og-hubs-ar", "ar", "أدلة مجموعات العضلات",
     "أفضل التمارين لكل عضلة — المجموعات والتكرارات والتمارين البديلة."),
    ("og-collections-en", "en", "Curated Food Collections",
     "Hand-picked foods by goal, macro profile & diet — high-protein, vegan & more."),
    ("og-collections-ar", "ar", "مجموعات الأطعمة المختارة",
     "أطعمة منتقاة حسب الهدف والماكروز والنظام — عالي البروتين ونباتي والمزيد."),
    ("og-tools-en", "en", "Free Fitness Calculators",
     "BMI, calories, macros, body fat & water tracking — free, fast & bilingual."),
    ("og-tools-ar", "ar", "حاسبات اللياقة المجانية",
     "كتلة الجسم والسعرات والماكروز ودهون الجسم وتتبع الماء — مجانية وثنائية اللغة."),
    ("og-blog-category-en", "en", "Fitness & Nutrition Articles",
     "Evidence-based training, nutrition & supplement guides — in English & Arabic."),
    ("og-blog-category-ar", "ar", "مقالات اللياقة والتغذية",
     "أدلة التدريب والتغذية والمكملات مبنية على الدليل — بالعربية والإنجليزية."),
    # Phase 231 (owner order «نفّذ الآن جميع إصلاحات Social Sharing
    # المتبقية…» — C): dedicated cards for the three surfaces that still
    # shared a family card — EVO (was og-home), the for-coaches landing
    # pair (was the vertical 1122x1402 coach-portrait.jpg) and the blog
    # index pair (was the homepage card via inheritance).
    ("og-evo-en", "en", "EVO — AI Fitness Coach",
     "Personalized nutrition & workout plans built from your data — smart swaps and 24/7 consulting, free for everyone."),
    ("og-evo-ar", "ar", "مدرب اللياقة الذكي EVO",
     "خطط تغذية وتمارين مخصصة مبنية من بياناتك — وبدائل ذكية واستشارات على مدار الساعة، مجاني للجميع."),
    ("og-for-coaches-en", "en", "Coach on Alkemos",
     "Your clients, your prices, your money — zero commission, a fixed monthly activation fee only."),
    ("og-for-coaches-ar", "ar", "انضم كمدرب في Alkemos",
     "عملاؤك بأسعارك وأموالك بين يديك — بدون أي نسبة، برسم تفعيل شهري ثابت فقط."),
    ("og-blog-en", "en", "The Alkemos Blog",
     "Science-based workout, nutrition & supplement articles from the Alkemos team — in English & Arabic."),
    ("og-blog-ar", "ar", "مدونة Alkemos",
     "مقالات رياضية وتغذية علمية من فريق Alkemos — بالعربية والإنجليزية."),
    # ─────────────────────────────────────────────────────────────────
    # SOCIAL-OG-3 (2026-09-30): dedicated cards for EVERY surface that
    # previously fell back to the generic og-home card (audit round 2 —
    # ~90 URLs across ~15 page types x 2 languages shared one card).
    # Copy stays TIMELESS (no counts, no years).
    ("og-programs-en", "en", "Workout Programs",
     "Structured training blocks for every goal & level — with full guidance inside the app."),
    ("og-programs-ar", "ar", "برامج التدريب",
     "برامج منظمة لكل هدف ومستوى — مع إرشاد كامل داخل التطبيق."),
    ("og-memberships-en", "en", "Memberships & Pricing",
     "One plan, every tool — transparent pricing, no hidden fees, cancel anytime."),
    ("og-memberships-ar", "ar", "العضويات والأسعار",
     "عضوية واحدة وكل الأدوات — أسعار شفافة بلا رسوم خفية، وإلغاء في أي وقت."),
    ("og-coaching-en", "en", "1-on-1 Coaching",
     "Certified coaches build your plan, track your progress & adjust it weekly."),
    ("og-coaching-ar", "ar", "التدريب الشخصي 1-on-1",
     "مدربون معتمدون يبنون خطتك ويتابعون تقدمك ويعدّلونها أسبوعياً."),
    ("og-diet-plan-en", "en", "Free Diet Plans",
     "Ready-made meal plans by level & diet system — balanced, practical, bilingual."),
    ("og-diet-plan-ar", "ar", "خطط غذائية مجانية",
     "خطط وجبات جاهزة حسب المستوى والنظام الغذائي — متوازنة وعملية وثنائية اللغة."),
    ("og-equipment-en", "en", "Train by Equipment",
     "Every exercise for the gear you have — dumbbells, bars, machines & more."),
    ("og-equipment-ar", "ar", "تدرب حسب المعدات",
     "كل التمارين للمعدات المتاحة لك — دمبل وبار وأجهزة والمزيد."),
    ("og-authors-en", "en", "Meet the Authors",
     "The coaches & specialists behind every Alkemos article and program."),
    ("og-authors-ar", "ar", "تعرف على الكُتّاب",
     "المدربون والمتخصصون خلف كل مقال وبرنامج في Alkemos."),
    ("og-compare-en", "en", "Alkemos vs The Rest",
     "Honest feature-by-feature comparisons — content, AI coaching, pricing & languages."),
    ("og-compare-ar", "ar", "Alkemos مقابل المنافسين",
     "مقارنات صادقة ميزةً بميزة — المحتوى والتدريب الذكي والأسعار واللغات."),
    ("og-about-en", "en", "About Alkemos",
     "Our mission: world-class fitness & nutrition guidance — free & bilingual."),
    ("og-about-ar", "ar", "عن Alkemos",
     "رسالتنا: إرشاد رياضي وتغذوي عالمي المستوى — مجاني وثنائي اللغة."),
    ("og-contact-en", "en", "Contact & Support",
     "Questions, feedback or partnership — the team reads everything and replies fast."),
    ("og-contact-ar", "ar", "التواصل والدعم",
     "سؤال أو ملاحظة أو شراكة — الفريق يقرأ كل شيء ويرد بسرعة."),
    ("og-faq-en", "en", "Frequently Asked Questions",
     "Accounts, billing, coaching, EVO AI — the answers, all in one place."),
    ("og-faq-ar", "ar", "الأسئلة الشائعة",
     "الحسابات والفواتير والتدريب وEVO — كل الإجابات في مكان واحد."),
    ("og-affiliate-en", "en", "Alkemos Affiliate Program",
     "Earn recurring commissions sharing the platform you already train on."),
    ("og-affiliate-ar", "ar", "برنامج التسويق بالعمولة",
     "اربح عمولات متكررة بمشاركة المنصة التي تتدرب عليها بالفعل."),
    ("og-legal-en", "en", "Alkemos — Policies",
     "Privacy policy & terms of service, in plain language."),
    ("og-legal-ar", "ar", "سياسات Alkemos",
     "سياسة الخصوصية وشروط الخدمة بلغة واضحة ومباشرة."),
    # SOCIAL-OG-3: STATIC per-comparison cards — the dynamic generator
    # never understood type=compare (it looked the slug up in blog_posts,
    # missed, and rendered a default-English title), and its ~5s cold
    # render burned the FB/WhatsApp crawler budget. Static cards kill
    # both defects. Slugs must mirror src/lib/comparisons.ts — guarded
    # by og-image-coverage.test.ts (every COMPARISONS slug must have a
    # card pair on disk).
    ("og-compare-alkemos-vs-myfitnesspal-en", "en", "Alkemos vs MyFitnessPal",
     "The full feature-by-feature comparison — database depth, AI coaching, pricing & languages."),
    ("og-compare-alkemos-vs-myfitnesspal-ar", "ar", "Alkemos مقابل MyFitnessPal",
     "المقارنة الكاملة ميزةً بميزة — عمق قاعدة البيانات والتدريب الذكي والأسعار واللغات."),
    ("og-compare-alkemos-vs-freeletics-en", "en", "Alkemos vs Freeletics",
     "AI coaching vs bodyweight training — features, pricing & content, compared."),
    ("og-compare-alkemos-vs-freeletics-ar", "ar", "Alkemos مقابل Freeletics",
     "تدريب الذكاء الاصطناعي مقابل تمارين وزن الجسم — الميزات والأسعار والمحتوى."),
    ("og-compare-alkemos-vs-exrx-en", "en", "Alkemos vs ExRx.net",
     "Exercise-library face-off — size, guidance, tools & usability."),
    ("og-compare-alkemos-vs-exrx-ar", "ar", "Alkemos مقابل ExRx.net",
     "مواجهة مكتبات التمارين — الحجم والإرشاد والأدوات وسهولة الاستخدام."),
]


if __name__ == "__main__":
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, lang, title, desc in SPECS:
        make_card(name, lang, title, desc)
    print(f"\n{len(SPECS)} cards → public/images/og/")
