# Rule: Static Assets, Next.js Standalone Bundling & Hosting

## 1. Static Asset Contract
1. **Single Source of Truth in `public/`**:
   - All static assets (child avatars, sports crests, school logos, dashboard mascots, approved venue icons) MUST be stored under the `public/` directory.
   - All asset paths referenced in code and JSON configuration MUST be root-relative absolute paths (e.g. `/icons/teams/osfc.png`, `/icons/children/aria.png`, `/scout.png`).
   - Never reference relative paths (e.g. `../public/`) or mismatched file extensions across different pages (e.g. `/scout.jpeg` vs `/scout.png`).

2. **Standard Mascot & Brand Assets**:
   - Standard Scout mascot path: `/scout.png` (optimized 38KB web PNG).
   - If photo versions exist (`/scout.jpeg`), ensure both are tracked in `public/` and never reference a nonexistent filename.

3. **Registry & Rule Asset Parity**:
   - Every `avatarIcon` and `schoolIcon` in `data/children_registry.json` MUST have a corresponding physical file on disk.
   - Every `iconUrl` in `config/event_rules.json` MUST have a corresponding physical file on disk.

---

## 2. Next.js Standalone Build & Asset Bundling Contract
1. **Standalone Build Asset Requirement**:
   - Next.js `output: "standalone"` produces a self-contained server bundle in `.next/standalone/`, but Next.js **does NOT copy `public/` or `.next/static/` into `.next/standalone/` by default**.
   - In containerized and serverless environments (Firebase App Hosting, Cloud Run, Docker), the server looks for static assets inside `.next/standalone/public/`.
   - The build command in `package.json` MUST always execute the asset synchronization hook:
     ```json
     "build": "next build && tsx scripts/copy-standalone-assets.ts"
     ```
   - [`scripts/copy-standalone-assets.ts`](file:///c:/Users/aswenson/personal/swentonelli/scripts/copy-standalone-assets.ts) copies:
     - `public/` ➔ `.next/standalone/public/`
     - `.next/static/` ➔ `.next/standalone/.next/static/`

2. **Next.js Config Image Optimization**:
   - [`next.config.ts`](file:///c:/Users/aswenson/personal/swentonelli/next.config.ts) MUST include:
     ```typescript
     const nextConfig: NextConfig = {
       reactStrictMode: true,
       output: "standalone",
       images: {
         unoptimized: true,
       },
     };
     ```
   - Disabling dynamic image optimization (`images.unoptimized: true`) prevents runtime 404s and sharp native binary compilation errors in serverless containers while ensuring standard `<img>` tags and Next.js `<Image>` components serve raw static assets directly.

---

## 3. Git & CI/CD Deployment Invariant
1. **Always Commit & Push to `main`**:
   - Firebase App Hosting automatically triggers builds from commits on `origin/main`.
   - Never consider a production issue resolved until all new assets and code changes are committed and pushed to `main` (`git push origin main`).
2. **Live Verification Required**:
   - After pushing changes, run `npm run test:all:prod` or `npm run test:assets:prod` against the live production endpoint to verify that the deployed CDN / Cloud Run instance serves all assets with HTTP 200 and zero broken images.

---

## 4. Image Processing & EXIF Orientation Safety
1. **Always Auto-Orient Photographic Assets**:
   - Photos captured on mobile devices (e.g. iPhone portraits) embed EXIF orientation tags (e.g., orientation 6 = rotate 90° clockwise).
   - When converting, resizing, or creating PNG/WebP thumbnails with `sharp`, ALWAYS call `.rotate()` before `.resize()`:
     ```typescript
     await sharp(inputPath)
       .rotate() // Automatically applies EXIF orientation before stripping metadata
       .resize(400, 400, { fit: 'cover', position: 'center' })
       .png()
       .toFile(outputPath);
     ```
   - Failing to call `.rotate()` causes converted PNG images to appear sideways (90° counter-clockwise) in browsers because PNG formats do not support EXIF orientation tags.

