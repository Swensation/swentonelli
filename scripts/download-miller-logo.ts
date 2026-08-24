import fs from "fs";
import path from "path";

async function downloadMillerIcon() {
  const url = "https://resources.finalsite.net/images/f_auto,q_auto/v1598277235/hollistonk12maus/x6msntdeahcwu1wrdlil/logo-no-words.png";
  const targetDir = path.join(process.cwd(), "public", "icons", "schools");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetFile = path.join(targetDir, "miller.png");
  console.log(`Downloading Miller School logo from ${url} to ${targetFile}...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(targetFile, Buffer.from(buffer));
  console.log(`Successfully saved ${buffer.byteLength} bytes to ${targetFile}`);
}

downloadMillerIcon().catch(console.error);

