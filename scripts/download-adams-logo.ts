import fs from "fs";
import path from "path";

async function downloadAdamsIcon() {
  const url = "https://resources.finalsite.net/images/f_auto,q_auto,t_image_size_1/v1614003270/hollistonk12maus/kmg9nl5nqnctzz67kf8h/rams-logo-colored-final.png";
  const targetDir = path.join(process.cwd(), "public", "icons", "schools");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetFile = path.join(targetDir, "adams.png");
  console.log(`Downloading Adams Middle School Rams logo from ${url} to ${targetFile}...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(targetFile, Buffer.from(buffer));
  console.log(`Successfully saved ${buffer.byteLength} bytes to ${targetFile}`);
}

downloadAdamsIcon().catch(console.error);

