import { CalendarEvent } from "@/types/calendar";
import { ChildProfile, getChildrenRegistry } from "@/lib/childrenRegistry";
import { MissingIconItem, MissingDetailWarning } from "@/lib/admin";
import { loadEventRules } from "@/lib/eventRules";

export interface GeminiAuditPromptInput {
  uncategorizedEvents: CalendarEvent[];
  missingIcons: MissingIconItem[];
  missingDetailsWarnings: MissingDetailWarning[];
}

export function generateGeminiSanitizationPrompt(input: GeminiAuditPromptInput): string {
  const children = getChildrenRegistry();
  const rules = loadEventRules();

  const childrenSummary = children
    .map(
      (c) =>
        `- **${c.name}** (${c.grade}, ${c.school}): Primary sport "${c.primarySport}", Teacher "${c.teacher}", Therapist "${c.therapist}", Custody: "${c.custody}", Keywords: [${c.matchKeywords.join(", ")}]`
    )
    .join("\n");

  const unassignedSample = input.uncategorizedEvents.slice(0, 15).map((e) => {
    return `- Event: "${e.summary}" | Start: ${e.start} | Location: ${e.location || "None"} | Source: ${e.sourceName}`;
  });

  const missingIconsSample = input.missingIcons.slice(0, 10).map((m) => {
    return `- "${m.summaryGroup}" (${m.countIn30Days}x in next 30d) | Sample: "${m.sampleEvents[0]}"`;
  });

  return `### Role & Goal
You are the AI Family Calendar Assistant for the Swenson-Antonelli family dashboard.
Your goal is to keep our calendar clean and automated while keeping invites 100% human-friendly in Google Calendar. We do NOT want family members to manually add awkward tags or child names to event titles. Instead, analyze our calendar events against our family registry to automatically infer child assignments, venue websites for brand crests (e.g. Level99 -> level99.com), and generate clean classification rules.

---

### Family Profiles Registry
${childrenSummary}

---

### Custody & Annotation Rules
- Brighton & Bennett: "Liz kids" -> With Mom (Liz); "Andrew kids" or "Swen kids" -> With Dad (Andrew).
- Aria & Benjamin: "Callie kids" -> With Mom (Callie); default -> With Dad (Chris).
- "No School" -> School status badge.

---

### Events Currently Requiring Classification & Brand Crests
#### Uncategorized / Unassigned Events:
${unassignedSample.length > 0 ? unassignedSample.join("\n") : "- None! All current events are mapped."}

#### Events Missing Custom Team / School / Venue Crests:
${missingIconsSample.length > 0 ? missingIconsSample.join("\n") : "- None! All upcoming events are branded."}

---

### Action Requested:
1. **Child Ownership Inferences**: For each uncategorized event (e.g. "Juliana's bday Level99 in Natick", class events, sports practices), identify which child (Aria, Brighton, Benjamin, or Bennett) or if it is a whole-family event, explaining your reasoning based on school, grade, teacher, or sport.
2. **Venue / Entity Brand Resolution**: For venue events like Level99, Urban Air, Fore Kicks, Apex Entertainment, identify the venue's official domain name (e.g., \`level99.com\`) so high-resolution favicons/logos can be fetched automatically.
3. **JSON Rule Output**: Provide the suggested configuration entries in JSON format ready to be added to \`config/event_rules.json\` or keyword additions for \`data/children_registry.json\`.

Output format:
\`\`\`json
[
  {
    "id": "rule-suggest-...",
    "childId": "aria | brighton | benjamin | bennett | null",
    "category": "Descriptive Category Name",
    "badgeText": "Short Badge (max 12 chars)",
    "iconUrl": "https://www.google.com/s2/favicons?domain=example.com&sz=128",
    "summaryPatterns": ["pattern1", "pattern2"]
  }
]
\`\`\`
`;
}

