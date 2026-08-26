# Rule: Autonomous Multi-Tier Testing Loop

## 1. Multi-Tier Testing Hierarchy
All code changes, feature additions, layout modifications, and asset updates MUST be verified through the four-tier automated testing hierarchy before being considered complete:

```
[Tier 1: Smoke Tests] ➔ [Tier 2: Asset & Link Crawler] ➔ [Tier 3: Generic Live-Asset Audit] ➔ [Tier 4: Browser E2E]
```

### Tier 1: Unit & Smoke Tests (`npm test` / `scripts/smoke-test.ts`)
- TypeScript and JSX validation (`tsc --noEmit`).
- Data schema, child registry, and event rules JSON integrity.
- Verification that all internal APIs (`/api/calendar`, `/api/lunch`, `/api/admin`) return HTTP 200 with valid payloads.
- Verification that widgets adhere to master date context (zero internal date strings).

### Tier 2: Autonomous Link & Asset Crawler (`npm run test:crawler` / `scripts/link-crawler-test.ts`)
- Validates that every configured icon in `config/event_rules.json` and `data/children_registry.json` physically exists in `public/`.
- Scans all calendar event URLs across all active feeds (e.g. >300 events) to ensure Google Calendar deep links use safe day-view URLs, preventing 400/500 errors.

### Tier 3: Generic Live-Asset E2E Audit (`npm run test:assets` / `scripts/test-live-assets.ts`)
- **Direct Asset Validation**: Checks every file in `public/` to ensure direct HTTP 200 status on localhost and production (`--prod`).
- **Rendered Image Audit**: Launches headless browser (Puppeteer) across all app views (Homepage Kids Columns, Daily Summary, Admin Restricted Gate, Admin Dashboard, Admin Profiles, Admin Rules) and asserts every rendered `<img>`:
  - `img.complete === true`
  - `img.naturalWidth > 0` and `img.naturalHeight > 0`
- **Network Response Interceptor**: Asserts zero 404 HTTP errors across all pages and network requests.

### Tier 4: Headless Browser E2E Suite (`npm run test:e2e` / `scripts/e2e-browser-test.ts`)
- Real headless browser automation (Puppeteer) validating 4-column equal height layout, 50% larger child avatars, fixed-width non-jumping custody badges, view switching, and Dad mode authentication gates (`aswens@gmail.com`).

---

## 2. Test Execution Commands
- `npm run test:all`: Runs Tiers 1–4 sequentially against local development server.
- `npm run test:all:prod`: Runs Tiers 1–4 sequentially against live production deployment (`https://swentonelli--scouty-planner.us-east4.hosted.app`).
- `npm run test:assets:prod`: Runs standalone Tier 3 live asset verification against production.
- `npm run test:e2e:prod`: Runs standalone Tier 4 browser E2E tests against production.

---

## 3. Autonomous Execution & Zero Regressions
- Never ask the user to manually verify things that automated tests can check.
- When fixing production issues, always follow Test-Driven Development (TDD):
  1. Write / run the test to reproduce the failure against the target environment.
  2. Implement the fix in configuration / code.
  3. Run the local and production test suites iteratively until 100% green assertions pass.
  4. Push verified changes to `main`.
