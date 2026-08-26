import fs from "fs";
import path from "path";

export interface ParentInfoDocument {
  id: string;
  title: string;
  filename: string;
  content: string;
  lastModified: string;
}

export interface ParentInfoQuickReference {
  schoolHours: {
    millerRegular: string;
    adamsRegular: string;
    adamsEarly: string;
    millerEarly: string;
    departureRecommendation: string;
  };
}

export interface ParentInfoData {
  documents: ParentInfoDocument[];
  quickReference: ParentInfoQuickReference;
}

export function loadParentInfoDocuments(): ParentInfoData {
  const docsDir = path.join(process.cwd(), "docs", "parent-info");
  const documents: ParentInfoDocument[] = [];

  if (fs.existsSync(docsDir)) {
    const entries = fs.readdirSync(docsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".md") && entry.name !== "README.md") {
        const fullPath = path.join(docsDir, entry.name);
        const raw = fs.readFileSync(fullPath, "utf-8");
        const stat = fs.statSync(fullPath);

        // Extract title from the first # line if present
        const titleMatch = raw.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1].trim() : entry.name.replace(/\.md$/, "").replace(/[-_]/g, " ");

        documents.push({
          id: entry.name.replace(/\.md$/, ""),
          title,
          filename: entry.name,
          content: raw,
          lastModified: stat.mtime.toISOString(),
        });
      }
    }
  }

  // Fallback single document check: docs/parent_info.md
  const singleDocPath = path.join(process.cwd(), "docs", "parent_info.md");
  if (fs.existsSync(singleDocPath) && !documents.some((d) => d.filename === "parent_info.md")) {
    const raw = fs.readFileSync(singleDocPath, "utf-8");
    const stat = fs.statSync(singleDocPath);
    const titleMatch = raw.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : "Parent Information";

    documents.push({
      id: "parent_info",
      title,
      filename: "parent_info.md",
      content: raw,
      lastModified: stat.mtime.toISOString(),
    });
  }

  // Default quick reference data extracted from verified district specs
  const quickReference: ParentInfoQuickReference = {
    schoolHours: {
      millerRegular: "2:18 PM",
      adamsRegular: "3:03 PM",
      adamsEarly: "10:44 AM",
      millerEarly: "10:47 AM",
      departureRecommendation: "Plan to leave your house between 10:15 AM and 10:25 AM.",
    },
  };

  return {
    documents,
    quickReference,
  };
}

