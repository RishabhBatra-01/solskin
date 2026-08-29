# Dossier — George Gazzard, SOLSKIN

## The person
- **George Gazzard**, **Co-Founder, SOLSKIN** — https://uk.linkedin.com/in/georgegazzard
- Also works in D2C advisory, investment and incubation — https://uk.linkedin.com/in/georgegazzard
- ~7,176 LinkedIn followers, 353 posts — active poster, writes casually, uses emoji
- Note: the SOLSKIN About page names **Kaci and Grace** as founders (Kaci has eczema,
  Grace acne-prone) — https://solskin.com/pages/about-us . George is a co-founder who
  does not appear on that page. Do not tell him his own founder story.

## The company
- SOLSKIN — British self-tan formulated for sensitive skin. Vegan, cruelty-free,
  dermatologically tested, made in Britain — https://solskin.com
- Solskin Group Limited, company no. 14766564, Stratford-upon-Avon — solskin.com footer
- Stocked in **96 Boots stores**, UK & Ireland — https://solskin.com/pages/boots-store-locations
- Claims 250k+ customers; Trustpilot "Excellent"; press in The Independent, SheerLuxe,
  PopSugar, OK! — https://solskin.com
- Shopify. Klaviyo, Stamped reviews, Upfluence, Klarna — read from the live DOM
- Origin: developed after the founding family's daughter could not find a tan that
  didn't irritate her eczema — web search, multiple sources

## The post (the actual brief)
Source: https://www.linkedin.com/posts/georgegazzard_were-looking-for-a-d2c-ux-designer-dev-activity-7499137049367666688-muho

He is hiring a **D2C UX designer + developer** for a website refresh. Named criteria:
- "Make sleek, considered design that stays simple"
- "Performance as a design decision, not an afterthought"
- Comfortable with "bootstrapped-friendly pricing"
- Portfolio with **D2C case studies with well-optimised product pickers**

**How he wants to be approached: DM him with your best homepage, collection page and
product picker.**

## The six questions

**What is he actually buying?** Not a redesign. A faster, simpler store that converts —
built by someone cheap enough for a bootstrapped brand.

**What is the bottleneck?** By his own words, performance and the product picker. On the
live site the strongest supporting evidence is that choosing is genuinely hard: 30+ live
SKUs with real duplicates (`Glow Starter Kit - Mousse` and `Tan Mousse & Drops` are the
same SKU at the same price), and one shade variant labelled "Light to Medium" in one
bundle and "Fair to Medium" in another — read from solskin.com/products.json

**What does he already know?** He runs the store and advises D2C brands. He does not need
the category explained, and he will spot a generic teardown instantly.

**What would make him lean in?** A working product picker for *his* catalogue that is
faster than what he has.

**What would make him bounce?** A heavy, slow showcase site. He said performance is a
design decision. Turning up with 650KB of Three.js is the opposite of the brief unless
it is explicitly framed and measured.

**Is there a warm path?** Unknown — ask the user.

## Strategy

- **Channel: LinkedIn DM, not email.** He asked for a DM. Doing what he asked is itself
  a signal. Email is the fallback / follow-up.
- **Angle: built-it (angles.md #2)**, narrowed. The artifact is the email.
- **The gap:** he asked for three things — homepage, collection page, product picker.
  We have built one (homepage). The product picker is the one he named as the portfolio
  differentiator and it is the one we do not have.

## Calls
- **Tier:** deferred — cannot score without the CV. See intake gap.
- **Angle:** built-it.
- **Send now?** No. Two blockers below.

## Blockers before any send
1. **The deployed site is not in the brand typeface.** `fonts/VanguardCF-Bold.woff`
   returns 404 on https://solskin.vercel.app — the font is gitignored because the repo
   is public. Headings render in a fallback. Sending a brand revamp that is not in the
   brand's own font to that brand's co-founder is a self-inflicted wound.
2. **No product picker exists.** It is the artefact he explicitly named.

## Risk to weigh
The public repo https://github.com/RishabhBatra-01/solskin contains `context/`, which
includes flagged ASA/CAP claim exposures in SOLSKIN's live advertising and notes on which
of their public statistics have no stated source. Useful judgment to show him privately.
Sitting in a public repo attached to his brand, it reads differently. Consider making
the repo private before sending.
