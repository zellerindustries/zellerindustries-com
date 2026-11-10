# Zeller Industries site

Static Italian landing site (`lang="it"`), no framework, built with `@minimaz/sitekit`. Only the contact form has JS: a TypeScript handler under `src/scripts/`.

## Commands

```bash
npm run build   # mz b --overwrite — builds src/ into dist/ via @minimaz/sitekit (minimaz.config.json)
npm run start   # build, then serve ./dist locally with `serve`
```

Node version is pinned via `.nvmrc` (24.22.2); `.npmrc` sets `engine-strict=true` so installs fail outright on the wrong Node version. There is no test suite. Checks are lint scripts (also the template for the other `websites/` sites):

```bash
npm run format:check   # prettier --check .
npm run lint           # lint:html (htmlhint) + lint:css (stylelint) + lint:spelling (cspell, it/en)
npm run lint:a11y      # builds, serves dist/, runs axe-core over every page
npm run lint:links     # builds, serves dist/, crawls links with linkinator
npx minimaz validate --path=<file>   # minimaz's own validator for one file
```

The `.husky/pre-commit` hook runs `format:check`, `lint:html`, `lint:css` and `lint:spelling`; a failing commit means fix the finding or add a legitimate word to `cspell.json`, never `--no-verify`. `lint:a11y` and `lint:links` need a build and run by hand.

`TODO.md` at the repo root tracks outstanding work — check it before assuming a gap is unintentional.

## Architecture

**Build tool**: @minimaz/sitekit (`mz`), configured via `minimaz.config.json`. It reads `src/`, flattens `pages/`, `styles/`, `public/` into the output root (per the `input.mapping` in the config — all mapped to `""`), bundles + minifies CSS/HTML/JS, and writes to `dist/`. `bootstrap-icons` fonts are pulled in via `input.externals` and their referenced paths rewritten via `output.replace`.

**Page → CSS wiring**: pages do not import their own stylesheets individually. `src/style.css` is the single bundle entry point, pulled in via `@import` in this fixed order:

```
root.css → bootstrap-icons.css → header.css → prefers.css → hero.css → footer.css
→ bottom-bar.css → buttons.css → tiles.css → cards.css → forms.css
```

Every top-level page (`index.html`, `linkinbio.html`, `contact.html`, `form.html`) links only `/style.css`. Sub-section pages under `legal/` and `referral/` link `/style.css` **plus** their own local stylesheet (`legal.css`, `referral.css`) that lives next to them — those are not in the `@import` chain, they're linked directly in each page's `<head>`.

When adding a new component stylesheet, it only takes effect site-wide if you add an `@import` for it in `src/style.css`; page-local CSS (like `legal.css`/`referral.css`) is the pattern for styling scoped to one section instead.

**Design tokens**: all colors, spacing, font sizes, and radii are CSS custom properties defined once in `src/styles/root.css` (`:root`), built on a golden-ratio scale (`--ratio: 1.618`) for both `--fs-*` and `--space-*`. The color system follows a 60/30/10 split: dark navy (`--clr-bg-main`/`--clr-bg-alt`) dominant, dark surface (`--clr-surface`) secondary, orange (`--clr-primary`) as the sole accent used sparingly for CTAs and active states. `root.css` sets `color-scheme: dark` as the default, but `src/styles/prefers.css` (imported right after `header.css` in `style.css`) overrides the same custom properties under `prefers-color-scheme: light`, `prefers-contrast: more` (both light and dark), and `prefers-reduced-motion: reduce` — so the site is adaptive, not dark-only. New styles should consume the `--clr-*`/`--fs-*`/`--space-*` variables rather than hardcoding values specifically so they pick up these overrides automatically.

**Pages present**:

- `src/pages/index.html` — main landing page (hero, services, portfolio, collaborators, socials, contact — all single-page sections)
- `src/pages/linkinbio.html`
- `src/pages/contact.html` — `/contact`, static contact info (email/WhatsApp/socials), no form
- `src/pages/form.html` — `/form`, the actual contact form; behavior lives in `src/scripts/form.ts`
- `src/pages/legal/{privacy,terms,cookie}.html` + `legal.css`
- `src/pages/referral/{index,terms}.html` + `referral.css`
- `src/pages/servizi/{sviluppo-software,consulenza,manutenzione-assistenza,ricerca-sviluppo}.html` — one detail page per homepage service card, linked from `index.html`'s service-card footers (`Scopri di più`). All four share one structural template (header, hero, `Cosa Include` card grid, `Come Lavoriamo` 4-step process, closing CTA, footer) with only meta/hero/card copy differing — when adding a fifth, copy the closest-matching existing file rather than composing from scratch, and keep the `Come Lavoriamo` section's four steps identical across all pages.

All top-level and `servizi/` pages use the standard `#site-header`/`#site-footer` markup (copy from `contact.html`); `legal/*` and `referral/*` pages use the same footer but a lighter header (no mobile bottom-bar), and `referral/*` pages get a referral-specific nav (extra "Referral" link) and footer (own Contatti column) instead of the standard one — match the existing sibling file's variant, not `contact.html`'s, when adding to `legal/` or `referral/`.

**Contact form** (`src/pages/form.html` + `src/scripts/form.ts`): client-side only, no server in this repo. Validates fields, applies a honeypot field and a minimum-fill-time check for bot filtering, and rate-limits repeat submissions via a `localStorage` timestamp lock (24h). On submit it POSTs JSON directly to an external AWS Lambda function URL (hardcoded in `form.ts`) — there's no local API route to look for. `contact.html`'s "Contact Us" nav CTA and the form page are separate destinations; don't assume one links to the other beyond what's currently in the markup.

`form.ts` imports its pure/stateless pieces from sibling files — `form-types.ts` (config + `ContactFormData`), `form-validators.ts` (field validators), `form-utils.ts` (`debounce`, `sanitize`). Everything DOM-coupled stays inlined in `form.ts` itself, since it's one big closure guarded by early-returns for pages that don't have the form. **Gotcha**: @minimaz/sitekit emits one ES module per file under `src/scripts/` (bundling does not concatenate), so `dist/form.js` imports `./form-types.js`, `./form-validators.js` and `./form-utils.js`, which must stay in `dist/` — do not list them in `input.exclude`. `form.html` loads `/form.js` from an inline `<script type="module">`.

**Contact CTA convention**: primary contact CTAs site-wide link to `/form`, not `mailto:info@zellerindustries.com` — email is kept only as plain informational text (e.g. `contact.html`'s info card) or inside legal/GDPR contact-channel disclosures (`legal/privacy.html`, `legal/terms.html`, `referral/terms.html`) and `form.html`'s `<noscript>` fallback. A new CTA should point at `/form`, not add another `mailto:` link.

**Custom icon subset**: `src/styles/bootstrap-icons.css` doesn't load the full bootstrap-icons stylesheet — it hand-picks one `.icon.<name>::before { content: "\<hex>"; }` rule per icon actually used, sourced from `node_modules/bootstrap-icons/font/bootstrap-icons.json` (values there are decimal codepoints; convert to hex, e.g. via `printf '%X\n' <decimal>`). Adding a new icon means adding one such rule here, not switching to the full bootstrap-icons CSS.

**Assets**: `src/public/` maps straight to the output root (favicons, `robots.txt`, `sitemap.xml`, `llms.txt`, images under `assets/`, fonts). `src/public/llms.txt` is a structured plain-text summary of the company (services, portfolio, contacts) intended for LLM crawlers — keep it in sync with `index.html` content if either changes.

## CSS & UI/UX Conventions

- **Tokens only, no hardcoded values.** Every color, spacing, font-size, radius, or transition timing must come from the custom properties in `src/styles/root.css`. If a needed value doesn't exist as a token, add it to `:root` there rather than inlining a literal in a component stylesheet.
- **Adaptive theming already exists — extend it, don't fight it.** `src/styles/prefers.css` overrides the `--clr-*` tokens under `prefers-color-scheme: light`, `prefers-contrast: more`, and `prefers-reduced-motion: reduce`. A component that hardcodes a color instead of using a token silently opts out of all three. If a new component needs a color not covered by an existing token, add the token to `root.css` _and_ consider whether `prefers.css` needs a matching override, rather than inlining a literal.
- **Respect the `@import` chain.** `src/style.css` is the only entry point pages load; a new component stylesheet has zero effect until it's added to the `@import` list (see Architecture above for the current order). Check that order before assuming a new rule will even apply.
- **Transitions use `--t-fast` / `--ease`** — no new durations or easing curves per component.
- **Gate every `:hover` behind `@media (hover: hover) and (pointer: fine)`.** A bare `:hover` rule stays visually "stuck" after a tap on touch devices. Every stylesheet in this repo groups its hover-only rules under one such block near the bottom of the file (see `buttons.css`, `header.css`, `footer.css`, `cards.css`, `bottom-bar.css`, `forms.css`, `legal.css` for the pattern) — `:focus-visible` states stay ungated since focus is keyboard/AT-driven, not touch-driven. New interactive components should follow the same split rather than writing an unguarded `selector:hover`.
- **Custom properties only inherit downward.** If two sibling/descendant selectors both need a locally-scoped token (not from `:root`), declare it on their common ancestor, not on one of the descendants — declaring it lower means anything outside that subtree (e.g. `body`'s own `background-color`) can't see it. (`legal.css` learned this the hard way: its doc tokens were declared on `#legal-document`, a child of `body`, so `body`'s background couldn't read them.)
- **Never suppress the global `:focus-visible` outline** from `root.css` without an equivalent visible state.
- **Icon badges stay rounded-square.** The `.tile` icon treatment (padding + `border-radius: var(--radius-sm)`) is deliberate, not a placeholder — a `clip-path` hexagon version was tried and rejected. Don't reintroduce hexagon clip-paths on small (~44px) icon badges; if hexagon brand motifs come up again, ask the maintainers what form they want first.
- **Typography roles are fixed.** `--font-display` (Orbitron) is for `h2`/`h3` and other display/brand moments; `--font-body` (Roboto) is everything else. Don't mix the two within the same text block.
- **One breakpoint (`768px`)** collapses grids/lists to a single column; new layouts degrade the same way, no extra breakpoints.
- **Wrap `auto-fit`/`auto-fill` grid track minimums in `min(Npx, 100%)`.** A bare `minmax(280px, 1fr)` forces the grid wider than its container (horizontal overflow) once the viewport drops below track-width-plus-padding; `.grid`'s two breakpoints in `root.css` both do this already — match it in any new grid.
- **No visual-identity changes on judgment call alone.** Anything touching brand colors, the hexagon/brand mark, or the overall dark palette is a design decision the maintainers should confirm before it is rolled out broadly — small component tweaks (a card's padding, a button's hover state) don't need sign-off.

## Skills

- **claude-in-chrome** — before calling any CSS/layout change done, run `npm run start` and drive a real browser against `localhost` to check it, rather than relying on reading the CSS.
- **design-sync** (`/design-sync`, backed by the `DesignSync` tool) — use to push components in `src/styles/` to a claude.ai/design project incrementally, or pull design changes back into these files. Only relevant when working component-by-component against a Design System project on claude.ai, not for routine page edits.

## Deployment

`.github/workflows/deploy.yml` runs on every push to `main` (also manually triggerable via `workflow_dispatch`), as two jobs: **build** (`npm ci --omit=dev` → `npm run build` → verifies `dist/index.html` exists → uploads `dist/` as a build artifact) and **deploy** (downloads that artifact → rsyncs it over SSH to the production server). Self-hosted target, not GitHub Pages, despite the repo name. Secrets used: `SSH_PRIVATE_KEY`, `SSH_KNOWN_HOSTS`, `SERVER_USER`, `SERVER_IP`, `SERVER_PATH`.

## Scope

@SCOPE.md
