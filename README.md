# Barrier Report

Unofficial concept. A browser-only tool that helps someone who hit an accessibility barrier on a federal website turn plain-language answers into a clear Section 508 complaint, and shows where to send it. It sends nothing, stores answers only in the open tab (sessionStorage), and uses no AI.

## Run it

```bash
npm install
npm run dev        # compiles the USWDS theme, watches the Sass, starts Vite
npm test           # unit and data tests
npm run build      # copies USWDS fonts/images, typecheck, production build with CSP
npm run preview    # serve the build; this is where the CSP applies
```

The agency directory is unverified, so by default every agency takes the "send to the program manager" path. To try the agency-specific paths locally:

```bash
VITE_DRAFT_DIRECTORY=verified npm run dev
```

## The flow

Start → 1 Where (link, app, document, or work system; confirm the agency) → 2 What happened → 3 What you need → 4 Review → 5 Send. Exits: a state or local site goes to ADA guidance. Each step is `?step=<id>`, so the browser's Back button works and in-page links never collide with routing.

## Layout

- `src/steps/`: one file per screen (`where`, `agency`, `whatHappened`, `whatYouNeed`, `review`, `send`, and Start/About in `placeholders`)
- `src/lib/`: state, validation, the escaping `html` template, shared form behavior (`form.ts`), complaint assembly (`complaint.ts`), routing (`routing.ts`), the domain lookup (`lookup.ts`)
- `src/data/`: plain-language barriers with their possibly related WCAG 2.0 criteria; the directory loader
- `src/sass/_uswds-theme.scss`: USWDS 3.14.0 settings (indigo-cool, gray-cool, blue-60v focus, VA.gov typefaces)
- `src/sass/custom/`: the project's own styles, compiled with USWDS so every value is a token (`units()`, `color()`, `at-media()`):
  - `_tokens.scss`: named spacing stacks (VA's semantic spacing tokens, as USWDS units) and system colors
  - `_layout.scss`: one grid column per page (`grid-col-12 desktop:grid-col-8`) and the vertical rhythm
  - `_type.scss`: VA.gov's typography primitives (Bitter headings, Source Sans Pro body; Bitter self-hosted from `@fontsource/bitter`, OFL)
  - `_chrome.scss`: the filled header and footer
  - `_components.scss`: compositions USWDS doesn't provide (review list, agency card, confirm dialog)
- `data/domains.json`: base domain to agency, from GSA's Federal Website Index (CC0), built by `scripts/build-domains.mjs`
- `data/domain-overrides.json`: federal sites the index misses
- `data/agencies.draft*.json`: 22 directory entries covering the 20 agencies. **Draft, unverified.** See `research/verification-queue.md`.
- `data/program-managers.json`: GSA's Section 508 program manager listing, as data
- `data/coverage.json`: index owners Section 508 doesn't cover, or may not
- `research/`: Day 1 checks and the research behind every data file

## Accessibility notes

- Every step: errors in a focused summary whose links move to the field, page title starting "Error:", focus on the new h1 after each step change, no time limits, answers kept as you type.
- Status messages (copy, download) use a `role="status"` region that exists before any message.
- The "Clear my answers" confirmation is a native `<dialog>`: focus starts on Cancel, the page behind is inert, Escape closes it and returns focus.
- Checked with keyboard and axe (0 violations on every step) and at 320px. Not yet checked with screen readers.
