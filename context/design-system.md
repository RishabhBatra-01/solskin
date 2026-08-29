# SOLSKIN — Visual Identity & Design System
*Reverse-engineered from live DOM + computed styles, solskin.com, 29 Aug 2026. Values marked
**observed** were read directly from CSS; anything else is labelled.*

## 1. Colour — OBSERVED (read from CSS custom properties)

### Core theme tokens (`--color-*`, the Shopify theme's own variables)
| Token | Value | Role |
|---|---|---|
| `--color-foreground` | `#885946` (rgb 136 89 70) | **The brand brown.** Body text, headings, logo fill, primary button fill |
| `--color-background` | `#EDD8C5` (rgb 237 216 197) | **Sand.** Footer, alternating section bands |
| `--color-secondary-button-background` | `#32201A` (rgb 50 32 26) | **Espresso.** Announcement bar, sticky tabs, dark UI |
| body background | `#F6F0EB` (rgb 246 240 235) | **Cream.** Default page canvas |
| `--atlas-background-main` | `#F4F0EB` | Near-identical cream used by widgets |
| `--atlas-primary-color` | `#805B4A` | Widget brown — **a second, slightly different brown** |

### Notes on the palette
- It is a **four-value warm neutral system**: cream → sand → mid brown → espresso. There is
  no true black and no true white in the brand layer (white appears only as button text and
  studio backdrops).
- The palette is literally the product: these are self-tan colours. Cream = untanned, sand =
  gradual, brown = dark, espresso = very dark. That is a genuinely ownable idea.
- **Inconsistency found:** `#885946` (theme) and `#805B4A` (widgets) are two different browns
  running side by side, plus `#F6F0EB` vs `#F4F0EB` for cream. Visually near-identical, but it
  means there is no single source of truth. A revamp should collapse to one.
- **Off-palette colours in use:** the comparison table uses standard success-green ticks and
  `#be2119`-family red crosses. Nothing else on the site is red or green — these read as
  bought-in conversion furniture rather than brand.
- A **dusty rose** card colour appears behind the press quotes (approx `#C4A0A0`, sampled from
  screenshot, **not** confirmed in CSS — treat as approximate).

## 2. Typography — OBSERVED

| Role | Family | Weight | Treatment |
|---|---|---|---|
| Display / headings | **Vanguard CF** (Connary Fagen) | Bold only — one file loaded | ALL CAPS, `text-transform: uppercase` |
| Body / UI | **DM Sans** (variable, 300–900) | 400 / 500 / 700 | Sentence case |
| Script accent | **Caveat** | 400 / 700 | Used sparingly on lifestyle graphics ("*The* Birthday edit") |

**Font files observed:** `VanguardCF-bold.otf` and `VanguardCF-Bold.woff` on the Shopify CDN;
`DMSans-VariableFont_opsz_wght.ttf` + italic variable.

**Type scale (from `--atlas-font-size-*` and computed values):**
- Hero H1: 60px / 72px line-height, uppercase, Vanguard CF
- H2: 28–32px, uppercase, Vanguard CF
- H3/H4: 12px, **DM Sans 700** — headings drop *out* of the display face at small sizes
- Body: 14px / 21px line-height, DM Sans 400
- Scale tokens: display 40, h1 40, h2 32, h3 24, h4 18, h5 16, normal 16, small 14, tiny 12

**Vanguard CF is the single strongest brand asset on the site.** It is a heavy condensed
grotesque — poster-like, high-impact, slightly sporty/vintage-athletic. Set in all caps at
60px it does almost all the work of making the page feel like a brand rather than a Shopify
store. **Preserve this.**

**Font sprawl — a real problem.** Seven families are loaded on the homepage: Vanguard CF,
DM Sans, Caveat, **Bebas Neue**, **Open Sans**, **Poppins** (Klaviyo-hosted), and a Stamped
review icon font. Bebas Neue is a near-duplicate of Vanguard's condensed-caps role. Poppins
and Open Sans arrive from third-party widgets and are visibly off-brand wherever those widgets
render. This is both a performance cost and a consistency leak.

## 3. Shape, radius, elevation — OBSERVED
- **Buttons: fully rounded pills.** Computed `border-radius: 28px` on a 56px-tall button;
  `50px` on the quiz options. This is the site's defining shape.
- **Cards: 24–32px radius** (`--atlas-card-border-radius-normal: 32px`, `small: 24px`).
- Thumbnails 16px, chips 12px, drawers 24px.
- **Shadows are minimal**: `0px 2px 8px rgba(55,63,71,.08), 0px 1px 2px rgba(55,63,71,.12)`.
  The site is essentially flat — depth comes from colour bands, not elevation.
- **Borders are rare.** `rgba(0,0,0,0.05)` hairlines only. Sections separate by background
  colour change.

**Read:** soft, rounded, pillowy, friendly. Nothing on the page has a sharp corner. This is a
deliberate counterweight to the aggressive condensed type — the softness keeps a very bold
typeface from feeling harsh.

## 4. Spacing & layout — OBSERVED
- 4px base unit; tokens at 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40.
- Centred max-width container, generous vertical rhythm between full-bleed bands.
- Layout logic is **full-bleed colour band → centred content**, repeated. Alternating
  cream / sand / image gives the page its rhythm.
- Horizontal carousels are the dominant content module (products, bundles, videos, press,
  community). Counted **five+ separate carousels on the homepage alone.**

## 5. Logo — OBSERVED
- Inline **SVG wordmark**, `viewBox="0 0 94 29"` — a 3.24:1 ratio, i.e. very wide and
  condensed. Letterforms are drawn paths, consistent with Vanguard CF.
- Rendered at 90×27px in the header; `currentColor` inherits `#885946`.
- **No icon/monogram lockup found anywhere on the site.** No favicon-scale mark, no "S" device.
- On pack, the wordmark is rotated 90° and runs vertically up the bottle in dark brown on sand.
- The footer repeats the wordmark at large scale as a graphic element.

**Gap:** the brand has a wordmark but not a *system* — no monogram, no secondary mark, no
lockup rules. That limits it in avatars, favicons, app icons, stamps, and stickers.

## 6. Iconography — OBSERVED
- Custom line SVGs for the six benefit icons (Streak Free, Derma Approved, Mood Enhancing,
  Anti-inflammatory, Vegan, Cruelty Free) — thin stroke, single colour, consistent.
- Header icons (account, bag, burger) are simple line icons in brand brown.
- Comparison table uses filled circular tick/cross badges — **off-system**, as noted.

## 7. Badges & seals — OBSERVED
- **Consumer Choice Awards UK — Winner 2026** roundel, seen on the Birthday Edit product card.
- **"No skin retouching or filters applied"** — a small pill caption on before/after imagery.
  This is the single most on-brand trust device on the site and it is used almost nowhere.
- Payment strip: Visa, Mastercard, Amex, PayPal, Diners, Google Pay, Apple Pay, **Klarna**.
- Press logos: **SheerLuxe, The Independent, PopSugar, OK!**

## 8. Motion — OBSERVED
- Hero is an autoplaying, muted, looping HLS video (`.m3u8`).
- UGC videos are click-to-play with sound, HD 1080p MP4.
- Carousels use Swiper.js.
- No scroll-triggered reveal animation was found — all content renders at `opacity: 1` on load.
  Motion is confined to video and carousel transitions.

## 9. Rebuild starter tokens (RECOMMENDATION)
```css
:root{
  --sol-cream:      #F6F0EB;  /* page canvas — "untanned" */
  --sol-sand:       #EDD8C5;  /* alternate band, footer — "gradual" */
  --sol-brown:      #885946;  /* THE brand colour — text, logo, primary CTA */
  --sol-espresso:   #32201A;  /* announcement bar, dark bands — "very dark" */
  --sol-white:      #FFFFFF;  /* button text, studio backdrop only */
  --sol-rose:       #C4A0A0;  /* press/editorial accent — APPROXIMATE, confirm */

  --sol-display: "Vanguard CF", "Bebas Neue", sans-serif;  /* ALL CAPS ONLY */
  --sol-body:    "DM Sans", system-ui, sans-serif;
  --sol-script:  "Caveat", cursive;                        /* accents only, never body */

  --sol-radius-pill: 999px;   /* all buttons */
  --sol-radius-card: 28px;
  --sol-radius-thumb: 16px;
  --sol-shadow: 0 2px 8px rgba(55,63,71,.08), 0 1px 2px rgba(55,63,71,.12);
  --sol-space: 4px;           /* 4/8/12/16/20/24/32/40 */
}
```
Rules to carry over: one brown, one cream. Display face is uppercase-only and never used below
~20px. Every button is a pill. Sections separate by colour band, not by line or shadow. Kill
Bebas Neue, Open Sans and Poppins; theme third-party widgets to DM Sans.
