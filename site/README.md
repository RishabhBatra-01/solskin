# SOLSKIN — website

A premium, interactive marketing site built on the brand's real assets and the findings in
[../context/brand-dossier.md](../context/brand-dossier.md).

## Run it
```bash
cd site && python3 -m http.server 8000
```
Then open <http://localhost:8000>. It's static — no build step, no dependencies. Drop the
folder on any host (Netlify, Vercel, Cloudflare Pages, S3) as-is.

## Structure
```
site/
  index.html          one page, heavily commented by section
  css/styles.css      Midnight & Bronze tokens + all layout
  js/three.min.js     Three.js r159 (vendored, MIT)
  js/scene3d.js       3D core: hero bottle + shared factories (SOLSKIN3D)
  js/cinema3d.js      the scroll sequence: bottle -> drop -> skin -> proof
  js/scroll.js        the scroll engine (cinema + reveals)
  img/                web-optimised imagery, derived from ../assets
  icons/ logo/ fonts/ copied from ../assets
```

## Palette — Midnight & Bronze
| Token | Value | Role |
|---|---|---|
| `--ink` | `#0E0B0A` | page ground |
| `--ink-2` | `#141010` | alternate band |
| `--charcoal` | `#1A1512` | panels, cards |
| `--bronze` | `#C98A4B` | accent, CTA |
| `--bronze-lit` | `#E8B87A` | glow, stats, headings |
| `--ivory` | `#F2EBE1` | primary text |

Bronze is the only saturated colour in the system — everything else is a warm neutral, so
the 3D glow has nothing to compete with.

## The 3D (`js/scene3d.js`)
Two WebGL pieces, both running continuously rather than being static renders:

1. **Hero bottle** — real geometry, lit as a product shot:
   - `LatheGeometry` profile revolved into the 200ml bottle
   - label drawn to a canvas *in the actual Vanguard CF brand face*, mapped to a cylinder band
   - **procedural studio environment** (emissive softboxes → `PMREMGenerator`) so the plastic
     reflects something. This is the single biggest reason it reads as an object rather than
     a shaded shape.
   - `MeshPhysicalMaterial` with clearcoat for the moulded-plastic sheen
   - a real **shadow map** plus a contact pool, so it sits on a surface instead of hovering
   - drifting gold motes for atmosphere and depth cues
   - a raised three-quarter camera (dead-level reads flat)
   - pointer parallax on the rig and camera
   - an **entrance on load**: the camera dollies in over 2.1s while the bottle turns to present
     its label, and the hero copy staggers up in step (`.hero-in` in the CSS)
2. **Cinema backdrop** — a molten bronze fragment shader (domain-warped fbm) flowing behind
   the pinned scroll flight, its heat rising with scroll progress.

Both pause when off-screen. If WebGL is missing or the visitor prefers reduced motion,
`<html>` gets `.no-webgl` and the CSS falls back to the still pack shot.

Three things worth knowing if you edit this:
- The wordmark sits at `u ≈ 0.537` on the label cylinder — the *back* of the bottle. `FRONT`
  in `scene3d.js` offsets for that. Change the label artwork and you'll need to re-measure.
- The label band must stay a little proud of the body radius (`0.802` vs `0.79`) with
  `polygonOffset` on, or it z-fights and the wordmark disappears.
- `.hero-in` is added by the 3D on its first frame, and by a 1.2s failsafe in `scroll.js`.
  Keep the failsafe — without it, a machine with no WebGL would leave the hero copy at
  `opacity: 0` forever.

## The scroll sequence: bottle -> drop -> skin -> proof

`js/cinema3d.js`. One unbroken 3D take, no cuts, with scroll as the timeline:

| progress | beat |
|---|---|
| 0.00–0.18 | the bottle, tilting as the pump presses |
| 0.13–0.33 | a drop gathers at the nozzle, stretches, necks off |
| 0.30–0.55 | it falls; the camera rides it down; the bottle exits upward |
| 0.52–0.68 | impact — the drop flattens, ripples spread |
| 0.56–0.90 | **the rub** — a stroke works back and forth, the tan spreads under it |
| 0.84–1.00 | resolves into the real, unretouched photograph |

Every value is derived from scroll position, never accumulated frame to frame, so it is
**seek-safe**: scrub backwards and it runs exactly in reverse; land mid-fall and it draws the
right frame.

**The drop lands on a forearm, deliberately.** An earlier cut landed it on a torso crop with
the bloom centred on the chest. That reads sexually whatever the intent, and it argues against
the thing the brand is for. A limb is neutral, it is where you actually apply and patch-test
tan, and it keeps the sequence about skin rather than about a body. See the creative guardrail
in `../context/brand.md`. The landing texture is `img/skin-forearm.jpg`.

**On the rub, and what was tried and rejected.** The tan is worked in rather than magically
blooming: a coverage front advances while a hand-band travels back and forth over it, leaving
faint stroke marks at the frontier and wet product that hasn't sunk in yet. Both derive from
`p`, so scrubbing back un-rubs it.

I also tried building the forearm as real curved geometry — first a tapered cylinder, then a
lathed profile with a wrist and forearm swell. **Both were worse and were reverted.** A bare
solid of revolution reads as a pipe or a wooden baton, because a limb is legible from its hand,
wrist crease and anatomy, none of which are modelled. The photographic plane wins: it looks
like skin because it *is* skin. The curve isn't what was missing — the rub was.

## Wiring real footage of the rub

The sequence has a slot for **real film of the tan being applied and rubbed in, scrubbed
frame-by-frame by scroll** — the Scroll World technique proper. It is off by default.

**To turn it on:** put the clip at `video/rub.mp4` and add `data-src="video/rub.mp4"` to the
`<video id="cinemaVideo">` element in `index.html`. That's it. With no `data-src` the 3D
shader rub plays instead, so the page is complete either way.

The clip is mapped across scroll 0.56 → 0.90, crossfading in over the first 5% and out over
the last 4%. The 3D drops to 12% opacity behind it while it plays.

### Shooting spec
- **Locked-off camera on a tripod.** Any handheld drift reads as a glitch when scrubbed.
- Forearm across frame, dark or neutral background so it cuts against the palette.
- Constant lighting — no auto-exposure, no white-balance shifts.
- Start on bare skin with the product already dispensed as a blob.
- Action: blend it in with slow, even strokes. Don't let the hand fill the frame.
- End fully blended and even.
- 4–6 seconds is plenty. The whole clip maps to the scroll window, so longer just means
  the viewer has to scroll further per second of footage.

### Encoding — the one thing that matters
Scrubbing seeks to arbitrary times. With normal encoding the player lands on the nearest
keyframe and the scrub stutters badly. **Put a keyframe on every frame:**

```bash
ffmpeg -i source.mov -an -vf scale=1280:-2   -c:v libx264 -pix_fmt yuv420p -crf 24   -g 1 -keyint_min 1 -sc_threshold 0   -movflags +faststart video/rub.mp4
```

`-g 1 -keyint_min 1 -sc_threshold 0` is the critical part. `-an` strips audio (unused, and it
blocks autoplay policies). Every-frame keyframes inflate the file ~4–6×, which is why the clip
should stay short and 1280px wide rather than 4K.

`video/scrub-test-clip.mp4` is a synthetic gradient I generated to verify the pipeline — not
brand footage. Delete it once the real clip is in.

**Rights:** SOLSKIN's existing creator clips are third-party. Check the usage terms in each
creator agreement before using one here — permission for an organic post rarely covers the
brand's own site.

Three implementation notes if you edit it:
- The drop must fall from where it **detached**, not from the live nozzle — the bottle is
  exiting upward at that point and would drag the drop with it. `DETACH_Y` is the fixed
  hand-off height.
- During the fall the camera's `lookY` tracks `dropY` directly, so the drop cannot fall out of
  frame however the timings are retuned.
- The molten-bronze backdrop is drawn as a fullscreen quad **inside this renderer**, not as a
  second stacked canvas. One WebGL context for the whole section instead of two.
- The skin plane fades its own edges to transparent in the shader. Without that it reads as a
  floating rectangle of texture rather than skin you are close to.

On the liquid: real fluid simulation (metaballs, marching cubes) is far too expensive for a
scroll backdrop on a phone. This is a deformed sphere with a stretched neck plus expanding ring
geometry — the same cheat product films use, and it reads as liquid at this scale.

## Scroll World


The pinned section (`.cinema`) is a **hybrid** of the Scroll World approach
(github.com/oso95/scroll-world). Scroll World generates AI video clips per scene and scrubs
them with a config-driven vanilla-JS engine; this engine mirrors that contract using the
brand's real photography, so generated clips can replace stills later without a rewrite.

`js/scroll.js` opens with a `SCENES` array — the config. Each scene has an `in`/`out` scroll
window and a camera transform (`scale`, `y`, `fade`). One normalised progress value (0–1)
across the pinned rail drives everything, so adding scenes only changes the rail height
(`.cinema__rail { height }` in CSS), never the logic.

**To drop in a Scroll World clip:** replace the `<img>` inside that scene's `.cinema__media`
with a muted, `playsinline` `<video>`. The engine already looks for one and will scrub
`video.currentTime` from scroll progress instead of animating transforms — the "no cuts"
flight. Nothing else changes.

## Deliberate decisions worth keeping
- **The hero leads with the proposition, not a promotion.** The live site gives its most
  valuable space to a giveaway; promotions belong in the announcement bar.
- **One entry offer, no scroll lock, no floating element over a CTA.** All three were problems
  on the live site.
- **Founders brought forward**, because Kaci's eczema and Grace's acne are the one thing a
  competitor can't copy.
- **The before/after is presented honestly** as a labelled pair with the "no skin retouching"
  badge. It is *not* a crossfade or a filter — simulating a tan on a "before" photo would
  undercut the exact honesty the brand trades on.
- **Boots (96 stores) and the 10% subscription are surfaced**, not buried in the footer.
- **No absolute or medical claims.** No "zero irritation", no treating named conditions —
  see the claims note in ../context/brand.md.

## Known gaps
- **No founder photography exists.** The founders section is typographic on purpose; there's a
  marked slot in `index.html` for portraits of Kaci and Grace when they're shot.
- Buttons are visual only — no cart, quiz engine or Shopify wiring yet.
- Statistics ("No.1 rated", 97.2%, 250k) are carried over from the live site and still need
  substantiation before use in paid media.
- `Vanguard CF` is a commercial licence — confirm coverage before shipping.
- Creator images in `img/community-*` need per-creator rights checked before any paid use.
