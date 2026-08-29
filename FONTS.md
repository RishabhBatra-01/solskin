# Fonts

## Vanguard CF — required, not included

The display face is **Vanguard CF Bold** (Connary Fagen). It is the single most
recognisable element of the SOLSKIN identity: every heading, the wordmark, and the
label on the 3D bottle are set in it.

It is **not committed to this repository** because this repo is public and the font is
a commercial licence. Redistributing it here would publish a paid product to anyone
who clones the repo.

### To restore it
Drop your licensed copies at:

```
assets/fonts/VanguardCF-Bold.otf     # archive / master
assets/fonts/VanguardCF-Bold.woff    # archive / master
site/fonts/VanguardCF-Bold.woff      # the one the site actually loads
```

`.gitignore` will keep them out of commits.

### Without it
The site runs. `@font-face` 404s and headings fall back to `Arial Narrow / Impact`.
The 3D bottle label is drawn to a canvas at runtime, so it also renders in the fallback
face. Everything works, it just stops looking like SOLSKIN.

### Licence check before shipping
Confirm your Vanguard CF licence covers the web traffic and seat count the live site
will need. Webfont licences are usually capped on monthly pageviews.

## DM Sans — included
Body and UI face. Open source under the SIL Open Font License, so it is committed.
Also available from Google Fonts.
