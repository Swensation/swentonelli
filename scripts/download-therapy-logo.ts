import fs from "fs";
import path from "path";

async function downloadTherapyIcon() {
  const url = "https://images.squarespace-cdn.com/content/v1/6678c47a7c137673eccdcdc2/711c7379-5a26-409e-a3f3-79e39f5081a8/Original+Logo.png";
  const targetDir = path.join(process.cwd(), "public", "icons", "general");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetFile = path.join(targetDir, "therapy.png");
  console.log(`Downloading Therapy logo from ${url} to ${targetFile}...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(targetFile, Buffer.from(buffer));
  console.log(`Successfully saved ${buffer.byteLength} bytes to ${targetFile}`);
}

downloadTherapyIcon().catch(console.error);

