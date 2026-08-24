/**
 * School Lunch PDF Ingestion & Parser Utility
 *
 * Usage:
 *   npx tsx scripts/parse-lunch-pdf.ts [path-to-pdf-or-google-drive-link]
 *
 * Example:
 *   npx tsx scripts/parse-lunch-pdf.ts sample_lunch.pdf
 */

import fs from "fs";
import path from "path";
import { MonthlyLunchSchedule } from "../src/types/lunch";

async function main() {
  const args = process.argv.slice(2);
  const targetPath = args[0] || "sample_lunch.pdf";

  console.log("==========================================");
  console.log("🍱 School Lunch Ingestion Utility");
  console.log("==========================================");
  console.log(`Target input: ${targetPath}`);

  const fullPath = path.isAbsolute(targetPath)
    ? targetPath
    : path.join(process.cwd(), targetPath);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Error: File not found at ${fullPath}`);
    process.exit(1);
  }

  const stats = fs.statSync(fullPath);
  console.log(`✅ Loaded PDF (${(stats.size / 1024).toFixed(1)} KB)`);

  const outputPath = path.join(process.cwd(), "data", "lunch_schedule.json");
  console.log(`Target output file: ${outputPath}`);

  if (fs.existsSync(outputPath)) {
    const existing = JSON.parse(fs.readFileSync(outputPath, "utf-8")) as MonthlyLunchSchedule;
    console.log(`ℹ️ Current parsed schedule contains ${Object.keys(existing.days).length} menu days.`);
    console.log(`ℹ️ Month: ${existing.month} ${existing.year} (${existing.schoolType})`);
  }

  console.log("\n✨ Tip: To update meals or add subsequent months, you can modify 'data/lunch_schedule.json'");
  console.log("or prompt Antigravity with: 'Update school lunch with the new September PDF!'");
}

main().catch((err) => {
  console.error("Extraction failed:", err);
  process.exit(1);
});

