# SOLSKIN

Marketing operations and website for **SOLSKIN** — a British self-tan brand made for
sensitive skin. Founded by Kaci and Grace, who both reacted to every tan they tried.

This is not a typical codebase. It holds two things: the brand's working context (so
strategy and copy stay consistent across everything produced) and a website built from it.

## What's here

```
CLAUDE.md          how to work on this project — guardrails, brand rules, index
context/           the brand's working memory (see below)
assets/            real brand assets: logo, icons, packaging, photography, tokens
site/              the website — static, no build step
output/            finished marketing work
FONTS.md           ⚠️ the display font is NOT in this repo — read this first
```

### `context/`
| File | What it holds |
|---|---|
| `brand-dossier.md` | Deep reverse-engineering of the brand. The reference doc for any revamp |
| `brand.md` | Positioning, mission, approved claims, and the claims we must not make |
| `products.md` | SKUs, prices, ingredients, objections |
| `avatar.md` | Who we sell to, their pains and buying triggers |
| `voice.md` | Tone rules, words we use and don't, copy patterns |
| `design-system.md` | Colour, type, spacing — read from the live site's CSS |
| `playbook.md` | Ad angles, UGC scripts, email and landing structures |
| `competitors.md`, `channels.md` | Competitive set, platform specs |

## The website

```bash
cd site && python3 -m http.server 8000
```

Static — no build, no dependencies. Deploy the `site/` folder as-is to Netlify, Vercel,
Cloudflare Pages or S3. Full detail in [site/README.md](site/README.md).

**Midnight & Bronze** palette, a live 3D bottle you can drag to spin, and a scroll
sequence where a drop falls from the bottle, lands on skin, and is worked in until the
tan spreads — one unbroken 3D take driven entirely by scroll position.

## Before this goes anywhere near production

- **Read [FONTS.md](FONTS.md).** The display face is a commercial licence and is not committed.
- **Substantiate the claims.** "UK's No.1 Rated", the 97.2% figure and the 250k customer
  count are carried over from the live site and have no stated source. UK cosmetics ads are
  ASA/CAP-regulated. See the claims section in `context/brand.md`.
- **Check creator image rights.** The community images are third-party creators. Permission
  for an organic post rarely covers use on the brand's own site or in paid media.
- The buttons are visual only — no cart, no quiz engine, no Shopify wiring yet.

## Licence
Brand assets, photography and copy are SOLSKIN's and not open source.
`site/js/three.min.js` is Three.js r159, MIT.
