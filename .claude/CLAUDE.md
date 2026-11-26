# Zeller Industries site

Static Italian landing site (`lang="it"`), no framework, built with `@minimaz/sitekit`. JS is limited to the contact form handler (`src/scripts/`) and the error page script (`src/pages/error/script.ts`), both TypeScript.

## Commands

This site is the template for the other `websites/` sites' lint scripts and configs. `lint:css` runs stylelint on `src/styles` only, and `lint:spelling` runs cspell with it/en.

```bash
npx minimaz validate --path=<file>   # minimaz's own validator for one file
```

`scripts/lint-a11y.mjs` and `scripts/lint-links.mjs` share `scripts/serve-dist.mjs`, which spawns `serve` and refuses to run if the page on that port isn't this site.

`TODO.md` tracks outstanding work — check it before assuming a gap is unintentional.

## Architecture

**Build tool**: `@minimaz/sitekit` (`mz`), configured in `minimaz.config.json`. It maps `src/pages`, `scripts`, `styles` and `public` into the output root, bundles and minifies CSS/HTML/JS, and writes `dist/`. Subfolders survive (`src/pages/linkinbio/linkinbio.css` is served as `/linkinbio/linkinbio.css`). `bootstrap-icons` fonts come in via `input.externals`, with paths rewritten by `output.replace`, which also holds the `__TOKEN__` placeholders pages write instead of repeated literals: site URL (so canonical and hreflang URLs are `__SITE_URL__/...`), bare domain, email, WhatsApp, each social link, store and VAT number. Add or change those values only in the config. `robots.txt`, `sitemap.xml`, `llms.txt` and `security.txt` are copied raw, so they stay literal.

**Page → CSS wiring**: `src/style.css` is the single bundle entry. It `@import`s every file in `src/styles/` in a fixed order (tokens and base first: `root`, `fonts`, `reset`, `typography`, `layout`, `accessibility`, `base`; then components, including `items.css` (plain content items, the `.item` pattern) and `services.css` (services overview rows) after `tiles.css`; `prefers.css` after `header.css`; `responsive.css` last). A new stylesheet in `src/styles/` has no effect until it is added there, and order matters for overrides. Top-level pages link only `/style.css`. Section pages add their own stylesheet next to them: `legal/legal.css`, `referral/referral.css`, `error/error.css`, `linkinbio/linkinbio.css`. These sit outside the import chain and are linked directly in each page's `<head>`.

**Pages** (`src/pages/`): `index.html` (landing: hero with the process panel, services, reusable bases, recent work, closing CTA), `services/index.html` (overview) plus seven detail pages `services/{software-development,consulting,maintenance-and-support,research-and-development,training,automation,creator-support}.html`, `work/index.html` (`/work`), `about/index.html` (`/about`), `contact.html` (static info, no form), `form.html` (the contact form), `linkinbio/index.html`, `legal/{privacy,terms,cookie}`, `referral/{index,terms}` and `error/index.html` (+ `script.ts`, which maps HTTP status codes to Italian messages). `src/pages/form/` and `src/pages/restaurants/` are empty folders.

- Header nav: `Servizi`, `Lavori`, `Azienda`, then `Contatti` (`/contact`) as `.btn.secondary`. `aria-current="page"` marks the current route, and `Servizi` on every `/services/*` page. `form.html` and `legal/*` mark nothing.
- The seven `services/` detail pages share one template (header, hero, `Cosa include` list, `Come lavoriamo` 5-step process, closing CTA, footer). To add one, copy the closest existing file, and keep the five `Come lavoriamo` steps identical across pages (and on the home and overview). Also add it to `sitemap.xml`, `llms.txt`, the overview and home service lists, the footer on every page, the `form.html` subject select and the `index.html` JSON-LD `OfferCatalog`.
- `work/` and `about/` are built from `.item` blocks (`items.css`), not cards. A `.card` is for the hero process panel and the referral page.
- Top-level and `services/` pages use the standard `#site-header`/`#site-footer` markup (copy from `contact.html`). `referral/*` adds a `Referral` header item; header and footer are otherwise identical on every page. Only `/`, `/contact`, `/form` and `/referral` carry the mobile bottom bar.

**Design tokens**: all colors, spacing, font sizes, radii, shadows and transitions are CSS custom properties in `src/styles/root.css`, on a golden-ratio scale (`--ratio`). Names are `--color-*`, `--spacing-*`, `--font-size-*`, `--radius-*`, `--shadow-*`, `--transition-fast`/`--transition-base`, `--ease`, with a few `--clr-*` leftovers; read `root.css` for the current set. `root.css` sets `color-scheme: dark`, and `src/styles/prefers.css` overrides the same properties under `prefers-color-scheme: light`, `prefers-contrast: more` and `prefers-reduced-motion: reduce`, so the site is adaptive, not dark-only. The brand split is dark navy dominant, dark surface secondary, orange (`--color-primary`) as the sparing accent.

**Contact form** (`form.html` + `src/scripts/form.ts`): 24h resubmission lock. All limits live in `CONFIG` in `form-types.ts`. There is no local API route. `form.ts` imports `form-types.ts`, `form-validators.ts` and `form-utils.ts`; everything DOM-coupled stays in `form.ts` as one closure with early returns for pages without the form.

**Gotcha**: sitekit emits one ES module per file under `src/scripts/` (no concatenation), so `dist/form.js` imports `./form-types.js`, `./form-validators.js` and `./form-utils.js`. They must stay in `dist/`, so don't add them to `input.exclude`. `form.html` loads `/form.js` from an inline `<script type="module">`.

**Contact CTA convention**: primary contact CTAs link to `/form`, not `mailto:info@zellerindustries.com`. Email stays only as plain informational text (`contact.html`), in legal/GDPR contact disclosures (`legal/privacy`, `legal/terms`, `referral/terms`) and in `form.html`'s `<noscript>` fallback.

**Icons**: the icon rules are in `src/styles/bootstrap-icons.css`.

**Assets**: `src/public/` maps to the output root (favicon, fonts, `assets/`, `robots.txt`, `sitemap.xml`, `llms.txt`, `.well-known/security.txt`). `llms.txt` is a plain-text company summary for LLM crawlers; keep it in sync with `index.html`.

## CSS & UI/UX conventions

- **Tokens only.** Every color, spacing, font size, radius or timing comes from `root.css`. If a value is missing, add the token there. A hardcoded color silently opts out of the light, high-contrast and reduced-motion overrides in `prefers.css`. Add a matching override there when a new color token needs one.
- **Transitions** use `--transition-fast`/`--transition-base` and `--ease`; no new durations or curves per component.
- **Gate every `:hover` behind `@media (hover: hover) and (pointer: fine)`**, grouped in one block near the bottom of the stylesheet (see `buttons.css`, `items.css`, `header.css`). `:focus-visible` stays ungated, and the global outline from `root.css` is never suppressed without an equivalent visible state.
- **Custom properties inherit downward.** A locally scoped token must be declared on the common ancestor of every selector that reads it (`legal.css` once declared its tokens on a child of `body`, so `body`'s background couldn't see them).
- **One breakpoint (`768px`)** collapses grids to a single column; new layouts degrade the same way.
- **Wrap `auto-fit`/`auto-fill` track minimums in `min(Npx, 100%)`**, as `.grid` in `root.css` does, to avoid horizontal overflow on narrow viewports.
- **Icon badges stay rounded-square** (`.tile`: padding + `border-radius: var(--radius-sm)`). A `clip-path` hexagon was tried and rejected; ask the maintainers before reintroducing hexagon motifs.
- **Brand changes need sign-off.** Brand colors, the hexagon mark or the dark palette are design decisions to confirm with the maintainers. Small component tweaks are not.

## Skills

- **claude-in-chrome** — before calling any CSS/layout change done, run `npm run start` and check it in a real browser on `localhost`; stop the server afterwards.
- **design-sync** (`/design-sync`) — pushes or pulls `src/styles/` components against a claude.ai/design project. Not for routine page edits.

## Deployment

`.github/workflows/deploy.yml` also runs on `workflow_dispatch`: **build** (`npm ci --omit=dev` → `npm run build` → checks `dist/index.html` → uploads `dist/`) then **deploy** (rsync of that artifact over SSH to the production server). Self-hosted, not GitHub Pages. Secrets: `SSH_PRIVATE_KEY`, `SSH_KNOWN_HOSTS`, `SERVER_USER`, `SERVER_IP`, `SERVER_PATH`. The build runs with `--omit=dev`, so anything the build needs belongs in `dependencies`.

## Scope

@SCOPE.md
