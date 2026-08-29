# SOLSKIN — Asset Library
Collected and generated 2026-08-29. Everything here came from **solskin.com's own CDN** or was
derived from the site's CSS. Nothing is invented, and nothing is a placeholder.

---

## `logo/` — the wordmark
The header logo is an **inline SVG**, so this is the true vector source, not a trace.
`viewBox="0 0 94 29"` — a 3.24:1 ratio, very wide and condensed, drawn in the display face.

| File | Use |
|---|---|
| `solskin-wordmark.svg` | `fill="currentColor"` — **the one to use in code.** Inherits text colour |
| `solskin-wordmark-brown.svg` | `#885946` — on cream or sand grounds |
| `solskin-wordmark-espresso.svg` | `#32201A` — maximum contrast on light grounds |
| `solskin-wordmark-cream.svg` | `#F6F0EB` — on brown, espresso or photography |

Fixed `width`/`height` were stripped so these scale cleanly. **There is no monogram, icon mark
or lockup anywhere on the site** — that's a genuine gap for favicons, avatars and app icons,
noted in the dossier.

## `icons/` — the six benefit icons
The custom thin-line SVGs from the "What Makes Us Unique" row. Single colour, consistent
stroke, inherit `currentColor`.

`streak-free` · `derma-approved` · `mood-enhancing` · `anti-inflammatory` · `vegan` ·
`cruelty-free`

These six are the brand's benefit shorthand and appear on both the homepage and About page —
the closest thing SOLSKIN has to a proprietary icon set.

## `packaging/` — product on white
Studio pack shots. The packaging is the quietest thing in the brand: sand bottle, dark brown
wordmark **rotated 90°** running up the label, small caps descriptor beneath. Deliberately not
the neon of the mass tan brands, and a big part of why the brand reads more expensive than it
is priced.

`mousse-dark.png` · `mousse-very-dark-with-icons.png` · `gradual-medium-to-dark.jpg` ·
`tan-drops.jpg` · `shimmer-body.jpg`

## `lifestyle/` — the proof imagery
| File | What it is | Why it matters |
|---|---|---|
| `before-after-dark.png` | Before/after pair, white underwear, plain ground | **Visible spots, marks and texture left in**, captioned "No skin retouching or filters applied" |
| `before-after-very-dark.png` | Same, Very Dark shade | The honesty device that converts |
| `editorial-fair-freckled-01/02.png` | Fair, freckled, red-haired model on cream | Proof the inclusivity claim is real, not stated |
| `pdp-mousse-02.png`, `pdp-mousse-04.png` | PDP editorial | Warm studio lighting, neutral ground |
| `bundle-birthday-edit.png` | Birthday Edit still life — cake, cherries, candle, gold confetti | The most art-directed asset the brand owns; also shows the Caveat script accent in use |
| `website-update-pic.jpg` | Homepage editorial | — |

**The before/afters and the no-retouching caption are the single most ownable visual asset
SOLSKIN has, and on the live site they sit below the fold.**

## `press/` — earned credibility
`independent.png` · `sheerluxe.png` · `popsugar.png` · `ok.png` — the four press logos, white
on transparent, as used on the dusty-rose quote cards.
`payment-methods.png` — the footer payment strip (Visa, Mastercard, Amex, PayPal, Diners,
Google Pay, Apple Pay, **Klarna**).

*Not captured:* the Consumer Choice Awards UK Winner 2026 roundel — it renders inside a product
card image rather than as a standalone file. Worth getting the original from the awards body.

## `social/` — the SOLSQUAD grid
`creator-grid-01` … `creator-grid-08.jpg` — the eight community images from the homepage
Instagram grid. Creators, in order as they appear on the page:
@kaci.jay (1.1m) · @kikisophiax (4k) · @keirabrookewhitehead (2.5k) · @kyramaeturner (374k) ·
@jessicarosegale (1.3m) · @courtneyjones02 (71.2k) · @sophiecracknell (5.1k) ·
@tennesseethresh (1.1m)

Note the deliberate spread from nano to mega — that's a strategy, not an accident.

## `fonts/` — ⚠️ licence check required
| File | Role |
|---|---|
| `VanguardCF-Bold.otf` / `.woff` | The display face. **The strongest brand asset on the site** |
| `DMSans-Variable.woff2` | Body face, variable 300–900 |

These were pulled from SOLSKIN's own CDN, where they are already served publicly to every
visitor. **Vanguard CF is a commercial face from Connary Fagen — confirm the licence covers
the seats and web traffic the new site will need before shipping.** DM Sans is open source
(SIL Open Font License) and also available from Google Fonts.

## `tokens/` — generated, not downloaded
| File | What it is |
|---|---|
| `solskin-tokens.css` | Drop-in custom properties + the two observed button styles + `@font-face` rules |
| `solskin-tokens.json` | Same tokens as data, for a design tool or build pipeline |
| `palette-sheet.svg` | One-page visual palette reference |

These **de-duplicate** what the live site actually carries. The site currently runs two browns
(`#885946` theme / `#805B4A` widgets) and two creams (`#F6F0EB` / `#F4F0EB`); the token files
pick one of each and note what to retire. The comparison-table red and green have also been
rebalanced toward the warm palette, since the live values are generic and off-brand.

---

## What is deliberately **not** here
- **Founder photography of Kaci and Grace** — none exists anywhere on the site. Given the
  founder story is the brand's strongest differentiator, this is the most valuable missing
  asset. Shooting it should be a priority for the revamp.
- **The hero video.** It streams as HLS (`.m3u8`) and its poster frame 404s. Source the master
  file from whoever holds the footage.
- **Lab, formulation, dermatologist or Boots in-store photography** — none exists. The
  "science-backed", "made in Britain" and "96 Boots stores" claims currently have no visual
  evidence behind them.
- Anything AI-generated or mocked up. Every file here is the real thing.

## Rights
All imagery is SOLSKIN's own, pulled from its public CDN for use on SOLSKIN's own project.
Creator images in `social/` show named third-party creators — **check the usage rights in each
creator agreement before using them anywhere new**, particularly in paid media, since
permission for an organic grid post rarely covers advertising.
