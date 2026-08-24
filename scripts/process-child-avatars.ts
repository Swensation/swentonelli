import fs from "fs";
import path from "path";
import sharp from "sharp";

async function processChildAvatars() {
  const artifactDir = "C:\\Users\\aswenson\\.gemini\\antigravity\\brain\\382011ee-6837-4f13-9b70-21196c5b4ed5";
  const targetDir = path.join(process.cwd(), "public", "icons", "children");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const avatars = [
    { kid: "aria", src: path.join(artifactDir, "galinda_wicked_avatar_1787580091400.jpg") },
    { kid: "brighton", src: path.join(artifactDir, "elphaba_wicked_avatar_1787580104152.jpg") },
    { kid: "benjamin", src: path.join(artifactDir, "fortnite_avatar_1787580119100.jpg") },
    { kid: "bennett", src: path.join(artifactDir, "moes_tavern_avatar_1787580147432.jpg") },
  ];

  for (const { kid, src } of avatars) {
    const dest = path.join(targetDir, `${kid}.png`);
    console.log(`Processing avatar for ${kid}: ${src} -> ${dest}...`);

    if (!fs.existsSync(src)) {
      throw new Error(`Source image not found: ${src}`);
    }

    await sharp(src)
      .resize(256, 256, { fit: "cover" })
      .png()
      .toFile(dest);

    console.log(`Saved ${kid}.png successfully.`);
  }
}

processChildAvatars().catch(console.error);
