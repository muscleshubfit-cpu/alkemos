#!/usr/bin/env python3
"""
Alkemos — Static OG card generator (Phase 187 / SEO-GEO-8, P0-2).

Generates the per-surface 1200×630 branded social cards for the surfaces
the dynamic /api/og-image route does NOT cover (exercise pages, food
pages, muscle hubs, collections, tools, blog categories, AR root).
Design mirrors the dynamic card in src/app/api/og-image/[slug]/route.tsx:
diagonal #1d1d1f → #0071e3 gradient, white circle "A" mark, Alkemos
wordmark, family title + tagline, alkemos.com footer.

Arabic cards render with libraqm (rtl + ar) using the same self-hosted
Cairo fonts as the dynamic route (public/fonts/og-cairo-{400,700}.ttf).

Copy rule: TIMELESS text only — no variable counts (868/8830 change as
the library grows; PNG text is un-greppable and un-guardable).

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
C_FROM = (29, 29, 31)      # #1d1d1f
C_TO = (0, 113, 227)        # #0071e3
WHITE = (255, 255, 255, 255)
DESC = (217, 222, 230, 255)      # ~85% white
FOOT = (168, 175, 185, 255)     # ~70% white
BLUE = (0, 113, 227, 255)
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


def measure_rtl_aware(draw: ImageDraw.ImageDraw, text, font, rtl: bool) -> float:
    kwargs = {"direction": "rtl", "language": "ar"} if rtl else {}
    return draw.textlength(text, font=font, **kwargs)


def make_card(name: str, lang: str, title: str, desc: str) -> None:
    rtl = lang == "ar"
    img = gradient()
    draw = ImageDraw.Draw(img)

    # ── Brand header: circle "A" + wordmark (top-left for EN, top-right for AR)
    r = 28
    cy = 88
    cx = MARGIN + r if not rtl else W - MARGIN - r
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=WHITE)
    f_mark = ImageFont.truetype(FONT_BOLD, 34)
    draw_text_rtl_aware(draw, (cx, cy - 2), "A", f_mark, BLUE, False, "mm")

    f_brand = ImageFont.truetype(FONT_BOLD, 33)
    if rtl:
        draw_text_rtl_aware(draw, (cx - r - 18, cy), "Alkemos", f_brand, WHITE, False, "rm")
    else:
        draw_text_rtl_aware(draw, (cx + r + 18, cy), "Alkemos", f_brand, WHITE, False, "lm")

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
    y = 240 + (260 - block_h) // 2  # optically centered between header & footer
    anchor_x = W - MARGIN if rtl else MARGIN
    anchor = "ra" if rtl else "la"
    for tl in title_lines:
        draw_text_rtl_aware(draw, (anchor_x, y), tl, f_title, WHITE, rtl, anchor)
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
    print(f"✓ {out} ({os.path.getsize(out) // 1024} KB)")


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
    # pair (was the vertical 1122×1402 coach-portrait.jpg) and the blog
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
]


if __name__ == "__main__":
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, lang, title, desc in SPECS:
        make_card(name, lang, title, desc)
    print(f"\n{len(SPECS)} cards → public/images/og/")
