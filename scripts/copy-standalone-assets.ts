import fs from "fs";
import path from "path";

function copyFolderRecursiveSync(source: string, target: string) {
  if (!fs.existsSync(source)) return;

  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const entries = fs.readdirSync(source, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyFolderRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function main() {
  const rootDir = process.cwd();
  const standaloneDir = path.join(rootDir, ".next", "standalone");
  const publicSrc = path.join(rootDir, "public");
  const staticSrc = path.join(rootDir, ".next", "static");

  if (fs.existsSync(standaloneDir)) {
    console.log("📦 Standalone output detected. Copying public and static assets...");
    
    // 1. Copy public/ -> .next/standalone/public/
    const publicDest = path.join(standaloneDir, "public");
    copyFolderRecursiveSync(publicSrc, publicDest);
    console.log(`  ✓ Copied public/ to ${publicDest}`);

    // 2. Copy .next/static/ -> .next/standalone/.next/static/
    const staticDest = path.join(standaloneDir, ".next", "static");
    copyFolderRecursiveSync(staticSrc, staticDest);
    console.log(`  ✓ Copied .next/static/ to ${staticDest}`);

    console.log("✅ Standalone asset bundling complete.");
  } else {
    console.log("ℹ️ No .next/standalone directory found. Skipping asset copy.");
  }
}

main();
