import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      category,
      badgeText,
      iconUrl,
      summaryPatterns = [],
      descriptionPatterns = [],
      childName,
      childId,
    } = body;

    if (!category || !iconUrl) {
      return NextResponse.json(
        { error: "Missing required fields: category and iconUrl" },
        { status: 400 }
      );
    }

    const safeSlug = (id || category)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    const iconsDir = path.join(process.cwd(), "public", "icons", "approved");
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }

    const fileName = `${safeSlug}.png`;
    const localFilePath = path.join(iconsDir, fileName);
    const publicIconUrl = `/icons/approved/${fileName}`;

    console.log(`[Approve Icon] Downloading candidate icon from ${iconUrl}...`);
    const imageRes = await fetch(iconUrl);
    if (!imageRes.ok) {
      throw new Error(`Failed to fetch candidate image: ${imageRes.status} ${imageRes.statusText}`);
    }

    const arrayBuffer = await imageRes.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Optimize image with sharp
    await sharp(inputBuffer)
      .resize(256, 256, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(localFilePath);

    console.log(`[Approve Icon] Successfully saved optimized icon to ${localFilePath}`);

    // Update config/event_rules.json
    const rulesPath = path.join(process.cwd(), "config", "event_rules.json");
    let rules: any[] = [];
    if (fs.existsSync(rulesPath)) {
      const raw = fs.readFileSync(rulesPath, "utf-8");
      rules = JSON.parse(raw);
    }

    const newRuleId = `rule-${safeSlug}`;
    const existingIndex = rules.findIndex((r) => r.id === newRuleId || r.category === category);

    const ruleData = {
      id: newRuleId,
      childId: childId || (childName ? childName.toLowerCase() : undefined),
      childName: childName || undefined,
      category,
      badgeText: badgeText || category,
      iconUrl: publicIconUrl,
      summaryPatterns: summaryPatterns.length > 0 ? summaryPatterns : [safeSlug.replace(/_/g, " ")],
      descriptionPatterns: descriptionPatterns.length > 0 ? descriptionPatterns : undefined,
    };

    if (existingIndex >= 0) {
      rules[existingIndex] = { ...rules[existingIndex], ...ruleData };
    } else {
      rules.push(ruleData);
    }

    fs.writeFileSync(rulesPath, JSON.stringify(rules, null, 2), "utf-8");
    console.log(`[Approve Icon] Appended rule "${category}" to config/event_rules.json`);

    return NextResponse.json({
      success: true,
      message: `Icon approved and configured for ${category}!`,
      rule: ruleData,
      publicIconUrl,
    });
  } catch (err: any) {
    console.error("[Approve Icon] Error processing approval:", err);
    return NextResponse.json(
      { error: "Failed to approve and save icon", details: err.message },
      { status: 500 }
    );
  }
}
