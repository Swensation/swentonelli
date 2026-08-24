import fs from "fs";
import path from "path";

async function downloadIcon() {
  const url = "https://static.wixstatic.com/media/17d4a4_9cf4748b173f49a9b1bf1367a9c892f0~mv2.png/v1/fill/w_158,h_159,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/old%20school%20png.png";
  const targetDir = path.join(process.cwd(), "public", "icons", "teams");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetFile = path.join(targetDir, "osfc.png");
  console.log(`Downloading OSFC logo from ${url} to ${targetFile}...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(targetFile, Buffer.from(buffer));
  console.log(`Successfully saved ${buffer.byteLength} bytes to ${targetFile}`);
}

downloadIcon().catch(console.error);

