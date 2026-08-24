import fs from "fs";
import path from "path";
import sharp from "sharp";

async function downloadHollistonPediatricsLogo() {
  const url = "https://i0.wp.com/hollistonpediatricgroup.com/wp-content/uploads/2020/05/cropped-title-logo-5.png?w=532&ssl=1";
  const targetDir = path.join(process.cwd(), "public", "icons", "general");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetFile = path.join(targetDir, "holliston_pediatrics.png");
  console.log(`Downloading Holliston Pediatrics logo from ${url}...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const inputBuffer = Buffer.from(buffer);

  await sharp(inputBuffer)
    .resize(256, 256, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(targetFile);

  console.log(`Successfully saved optimized Holliston Pediatrics logo to ${targetFile}`);
}

downloadHollistonPediatricsLogo().catch(console.error);
