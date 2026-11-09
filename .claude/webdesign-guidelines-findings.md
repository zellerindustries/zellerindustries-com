# Web Interface Guidelines — Findings Ledger

Tracks outstanding findings from `/webdesign-guidelines` audits so future runs only need to
re-check open items and any newly changed files, instead of re-scanning the whole site.

Status values: `open`, `fixed`, `wontfix` (with reason).

Last full audit: 2026-09-26

## src/pages/index.html

- [ ] open — index.html:557 — "..." → "…" ("Altro in arrivo...")
- [ ] open — index.html:829,834,839 — decorative icons in bottom-bar missing `aria-hidden="true"`

## src/pages/contact.html

- [ ] open — contact.html:323,328,333 — decorative icons in bottom-bar missing `aria-hidden="true"`

## src/pages/referral/index.html

- [ ] open — referral/index.html:320-333 — decorative icons in bottom-bar missing `aria-hidden="true"`

## src/pages/form.html

- [ ] open — form.html:117-119 — checkbox label wraps nested `<a>` (privacy policy link); split link out of label's hit target
- [ ] open — form.html:123 — submit button disabled until form valid; should stay enabled until request starts
- [ ] open — form.html:221,225 — no unsaved-changes guard (beforeunload/router guard)

## src/scripts/form.ts

- [ ] open — form.ts:156 — updateSubmitState disables submit pre-submission (pairs with form.html:123)
- [ ] open — form.ts:217-220 — validateFormUI() doesn't focus first invalid field on failed submit
- [ ] open — form.ts:239 — "Invio in corso..." → "Invio in corso…"

## src/styles/root.css

- [ ] open — root.css:9-15 — Orbitron @font-face has no matching `<link rel="preload" as="font">` in any page head

## src/styles/header.css

- [ ] open — header.css:48 — `border-radius: 50px` hardcoded, not a token
- [ ] open — header.css:68 — custom `cubic-bezier()` instead of `--ease` token
- [ ] open — header.css:136 — box-shadow rgba hardcoded, not a token
- [ ] open — header.css:165 — `border-radius: 4px` hardcoded, not a token

## src/styles/buttons.css

- [ ] open — buttons.css:29,36 — transition/will-change include box-shadow (paint-triggering, not compositor-friendly)
- [ ] open — buttons.css:62,145,152,159 — box-shadow rgba literals, no token
- [ ] open — buttons.css:8-37 — `.btn` missing `touch-action: manipulation`

## src/styles/cards.css

- [ ] open — cards.css:15-20 — transition/will-change include box-shadow
- [ ] open — cards.css:29 — box-shadow rgba hardcoded

## src/styles/hero.css

- [ ] open — hero.css:19,38,42,59,62,63,70,78 — hardcoded rem/vw values bypass `--fs-*`/`--space-*` tokens
- [ ] open — hero.css:37-43 — h1 has no `text-wrap: balance`

## src/styles/footer.css

- [ ] open — footer.css:54 — `letter-spacing` hardcoded (minor, no token exists)
- [ ] open — footer.css:135,143,229 — box-shadow hardcoded rather than a shared token

## src/styles/bottom-bar.css

- [ ] open — bottom-bar.css:37-38 — box-shadow hardcoded rgba
- [ ] open — bottom-bar.css:155 — `padding-bottom: 6.5rem` hardcoded, not a `--space-*` token

## src/styles/form.css

- [ ] open — form.css:291 — `transition: all var(--t-fast)` — list properties explicitly
- [ ] open — form.css:14,297,307,332 — box-shadow hardcoded rgba
- [ ] open — form.css:83-86 — input/select/textarea transition includes box-shadow

## src/styles/bootstrap-icons.css

- [ ] open — bootstrap-icons.css:2 — `font-display: block`, inconsistent with root.css's `swap`

## Clean (passed full audit, no open items)

- src/pages/error/index.html
- src/pages/legal/privacy.html, cookie.html, terms.html
- src/pages/linkinbio.html
- src/pages/referral/terms.html
- src/pages/services/*.html (all four)
- src/styles/prefers.css, tiles.css
