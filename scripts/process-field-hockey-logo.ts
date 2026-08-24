import sharp from "sharp";
import fs from "fs";
import path from "path";

async function processLogo() {
  const sourceImage = "C:/Users/aswenson/.gemini/antigravity/brain/382011ee-6837-4f13-9b70-21196c5b4ed5/.user_uploaded/media_1787575777034.png";
  const targetDir = path.join(process.cwd(), "public", "icons", "teams");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const targetFile = path.join(targetDir, "brighton_field_hockey.png");

  const metadata = await sharp(sourceImage).metadata();
  console.log("Image metadata:", metadata.width, "x", metadata.height);

  const width = metadata.width || 1000;
  const height = metadata.height || 1000;

  // The emblem is centered horizontally in the upper chest region:
  // roughly 30% to 70% width, and 20% to 55% height
  const cropLeft = Math.round(width * 0.30);
  const cropTop = Math.round(height * 0.20);
  const cropWidth = Math.round(width * 0.40);
  const cropHeight = Math.round(height * 0.35);

  console.log(`Cropping region: left=${cropLeft}, top=${cropTop}, width=${cropWidth}, height=${cropHeight}`);

  // Extract the emblem, trim surrounding uniform space, and resize to high-res 256x256
  await sharp(sourceImage)
    .extract({
      left: cropLeft,
      top: cropTop,
      width: cropWidth,
      height: cropHeight,
    })
    .resize(256, 256, {
      fit: "contain",
      background: { r: 168, g: 30, b: 50, alpha: 1 }, // matching Holliston crimson red
    })
    .png()
    .toFile(targetFile);

  console.log("Saved cropped Holliston Field Hockey crest to:", targetFile);
}

processLogo().catch(console.error);
