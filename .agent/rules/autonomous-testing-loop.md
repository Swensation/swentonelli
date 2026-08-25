# Autonomous Testing & Self-Healing Rule

## Objective
When tasked with feature work, bug fixes, refactoring, or testing:
1. **Never pause or prompt for manual approval during execution/repair loops.**
2. **Execute the full testing suite autonomously**:
   - `npm run test`: In-memory business logic & contract tests.
   - `npm run test:crawler`: Zero-404 and error-free calendar link crawler.
   - `npm run test:e2e`: Headless browser (Puppeteer) test against real Chromium DOM.
3. **If any test fails**:
   - Immediately inspect the failure details, stack trace, and DOM output.
   - Apply the necessary code patches.
   - Re-run the tests.
   - Repeat autonomously until all tests are 100% green.
4. **Push completed, verified changes to GitHub `main`** for automated Firebase App Hosting deployment.
