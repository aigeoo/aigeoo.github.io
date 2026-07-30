# WatchCom Security — Master Design System (shared across all 6 variants)

> Single source of truth. Every variant references these tokens & rules.
> Layout, **font**, and **red intensity** differ per variant (deliberately);
> the red *hue*, the neutral palette, the trust facts, and the RTL rules do not.

---

## 1. Brand color — RED IS A PLACEHOLDER

```
--brand-red:        #C8102E;   /* PLACEHOLDER — swap to real logo hex, 1 line   */
--brand-red-hover:  #A50D26;
--brand-red-soft:   rgba(200,16,46,0.12);
--brand-red-glow:   rgba(200,16,46,0.45);
```

The hex `#C8102E` appears in exactly ONE place per file — the `:root` block.
Everywhere else uses `var(--brand-red)`. One edit per file = whole-page reskin.

## 2. Neutral palette

```
--ink-900:#0A0F1A  --ink-800:#0F1B2D  --ink-700:#16233A  --ink-600:#24344E
--ink-100:#E6EAF1  --ink-050:#F5F7FA  --paper:#FFFFFF     --muted:#94A3B8
```

## 3. Typography — DISTINCT FONT PER VARIANT

Each sample uses a different Arabic web font so the client sees real range.
All from Google Fonts (Arabic subset) for reliable rendering.

| # | Variant | Font (headings / body) | Character |
|---|---------|------------------------|-----------|
| 1 | Trust & Authority | **IBM Plex Sans Arabic** | corporate / engineering |
| 2 | Conversion | **Tajawal** | modern, action-forward |
| 3 | Hero-Cyber | **Noto Kufi Arabic** + `JetBrains Mono` (Latin/numeric callouts) | techy / HUD |
| 4 | Minimal | **Almarai** | quiet, Swiss, neutral |
| 5 | Social Proof | **Readex Pro** | warm, humanist UI |
| 6 | Storytelling | **Amiri** (display) + **Markazi Text** (body) | editorial / classical |

- **Body line-height 1.75** (1.9 on long editorial passages). Headings 1.35–1.4.
- Never positive `letter-spacing` on Arabic (breaks joined glyphs).
- **Thmanyah:** not on Google Fonts — self-host only. Drop `Thmanyah.woff2` into
  `shared/fonts/` and it swaps into any variant via one `@font-face` + one
  `font-family` line. Not used yet to avoid a broken fallback.

## 4. Direction & numerals (non-negotiable)

- `<html lang="ar" dir="rtl">`. Logical props only (`ps/pe`, `ms/me`,
  `border-s/e`, `inset-inline-*`, `text-align:start/end`). No raw left/right.
- **Western numerals (0123)**; every digit/phone/email/URL inside `<span dir="ltr">`.
- Directional icons point RIGHT→LEFT (a "next/forward" arrow points **left**).

## 5. Partner logos (was: plain text)

Inline-SVG **logo lockups** = line-emblem (`stroke:currentColor`) + wordmark,
so they tint to any background. Partners: WatchGuard · Cisco · Keeper · Yubico ·
Panda Security · Seppmail. These are clean **representations** for the mockup —
replace with official brand SVGs before any public use.

## 6. Verified facts only (do NOT invent)

- **Contact:** phone `(+44) 333 242 1220` · email `sales@watchcom.co.uk`
  (verified from watchcom.co.uk). No public street address → omit or mark TBD.
- **Trust figures:** 14 عامًا · 6+ فروع · 3,000+ عميل · 3+ دول.
- **Partners:** WatchGuard · Cisco · Keeper · Yubico · Panda Security · Seppmail.
- **Tagline:** "Your Security, Our Responsibility" → أمنكم مسؤوليتنا.
- **Certifications:** NONE stated publicly → do not claim ISO/CREST/Cyber
  Essentials or "معتمد" anywhere. Say "متخصص/مزوّد", not "معتمد".
- Testimonials: verticals insurance / law / finance (structure real; quotes are
  written marketing copy, phrased generically — not attributed to a named person).

## 7. Copy register

Modern Standard Arabic (Fusha), B2B enterprise security tone. **Native Arabic
copy — written, not translated.** No Latin lorem/filler. Refined per-variant so
each headline reads idiomatically, not as a rendered English sentence.

## 8. Red-usage range across the set (deliberate spread)

| # | Variant | Red intensity |
|---|---------|---------------|
| 4 | Minimal | minimal — one button + one hairline |
| 1 | Trust | restrained — CTA, top rule, dividers, hover borders |
| 5 | Social proof | medium — rating stars, quote marks, card accents |
| 2 | Conversion | medium-high — primary actions, form focus, urgency chip |
| 6 | Storytelling | narrative — red grows act 1→2 (risk→response), gradients |
| 3 | Cyber | dramatic — red glow, scan-line, neon-adjacent accents on black |

## 9. Build constants

- Static, self-contained `index.html` per variant. Tailwind CDN + Google Fonts.
- Responsive without RTL breakage at **375 / 768 / 1024 / 1440**.
- Respect `prefers-reduced-motion`. Motion (scroll-reveal + motif) only on v3 & v6.
