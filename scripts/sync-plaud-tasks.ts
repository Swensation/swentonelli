import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  createTasksClient,
  ensureFamilyTaskLists,
  insertTaskForFamilyMember,
  resolveAssignee,
  getStoredCredentials,
} from '../src/lib/googleTasks';
import {
  isRecordingProcessed,
  recordProcessedRecording,
  ProcessedTaskRecord,
} from '../src/lib/plaudSyncLedger';

export interface PlaudActionItem {
  text: string;
  assignee?: string;
  due?: string;
}

export interface PlaudNoteInput {
  id: string;
  title: string;
  created_at?: string;
  tags?: string[];
  summary?: string;
  action_items?: string[] | PlaudActionItem[];
  content?: string;
}

// Sample mock Plaud notes for testing and verification
const MOCK_PLAUD_NOTES: PlaudNoteInput[] = [
  {
    id: 'plaud_rec_family_001',
    title: 'Family Weekend Planning Memo',
    created_at: new Date().toISOString(),
    tags: ['family', 'personal'],
    summary: 'Discussion regarding weekend household chores and sports gear prep.',
    action_items: [
      'Bennett needs to clean his football pads and put his cleats in his gym bag.',
      'Aria: remember to bring shin guards to soccer practice on Saturday morning.',
      'Callie will pick up fresh fruit and water bottles from the grocery store.',
      'Andrew: schedule the annual HVAC service before next Friday.',
      'Benjamin should pick up the dog toys in the backyard before the lawn gets mowed.',
      'Brighton needs to pack her mouthguard and field hockey stick.',
    ],
  },
  {
    id: 'plaud_rec_work_002',
    title: 'MathWorks Team Architecture Sync',
    created_at: new Date().toISOString(),
    tags: ['work'],
    summary: 'Internal engineering roadmap and sprint commitments.',
    action_items: [
      'Review pull request for telemetry pipeline.',
      'Schedule quarterly review with engineering manager.',
    ],
  },
];

function extractActionItems(note: PlaudNoteInput): { text: string; assignee: string; due?: string }[] {
  const results: { text: string; assignee: string; due?: string }[] = [];

  if (note.action_items && Array.isArray(note.action_items)) {
    for (const item of note.action_items) {
      if (typeof item === 'string') {
        const cleaned = item.replace(/^[-*•\d.]+\s*/, '').trim();
        if (cleaned) {
          const assignee = resolveAssignee(cleaned);
          results.push({ text: cleaned, assignee });
        }
      } else if (item && typeof item === 'object' && item.text) {
        const cleaned = item.text.replace(/^[-*•\d.]+\s*/, '').trim();
        const assignee = item.assignee || resolveAssignee(cleaned);
        results.push({ text: cleaned, assignee, due: item.due });
      }
    }
  }

  // Fallback: parse bullet points from summary or content if action_items array was empty
  if (results.length === 0 && (note.summary || note.content)) {
    const textToScan = `${note.summary || ''}\n${note.content || ''}`;
    const lines = textToScan.split('\n');
    let inActionSection = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (/action items|to[- ]do|next steps/i.test(trimmed)) {
        inActionSection = true;
        continue;
      }
      if (inActionSection && /^(###|##|#)\s+/i.test(trimmed)) {
        inActionSection = false;
      }
      if (/^[-*•]\s+/i.test(trimmed) || inActionSection) {
        const cleaned = trimmed.replace(/^[-*•\d.]+\s*/, '').trim();
        if (cleaned.length > 5) {
          const assignee = resolveAssignee(cleaned);
          results.push({ text: cleaned, assignee });
        }
      }
    }
  }

  return results;
}

export async function processPlaudNotes(
  notes: PlaudNoteInput[],
  options: {
    dryRun?: boolean;
    force?: boolean;
    tagFilter?: string;
  } = {}
) {
  console.log('\n================================================================');
  console.log(`[Plaud -> Google Tasks] Processing ${notes.length} recording(s)...`);
  console.log(`Mode: ${options.dryRun ? 'DRY-RUN (Simulated)' : 'LIVE EXECUTION'}`);
  console.log('================================================================\n');

  const creds = getStoredCredentials();
  let tasksClient: any = null;
  let familyListsMap = new Map<string, string>();

  if (!options.dryRun) {
    if (!creds) {
      console.warn('⚠️ No Google Tasks credentials found. Falling back to DRY-RUN mode.');
      console.warn('Run "npm run auth:google-tasks" to authorize live Google Tasks syncing.');
      options.dryRun = true;
    } else {
      tasksClient = createTasksClient(creds);
      if (tasksClient) {
        familyListsMap = await ensureFamilyTaskLists(tasksClient);
      }
    }
  }

function isPersonalNote(note: PlaudNoteInput): boolean {
  const fullText = `${note.title || ''} ${note.content || ''} ${note.summary || ''} ${(note.tags || []).join(' ')}`.toLowerCase();

  // Explicit work and onboarding signals -> NOT personal
  if (
    fullText.includes('work task') ||
    fullText.includes('claude process note') ||
    fullText.includes('claude note') ||
    fullText.includes('#work') ||
    fullText.includes('mathworks') ||
    fullText.includes('team meeting') ||
    fullText.includes('steve jobs') ||
    fullText.includes('welcome to plaud') ||
    fullText.includes('how to use plaud')
  ) {
    return false;
  }

  // Explicit personal signals
  if (
    fullText.includes('personal task') ||
    fullText.includes('personal note') ||
    fullText.includes('personal research') ||
    fullText.includes('#personaltasks') ||
    fullText.includes('#personal') ||
    fullText.includes('callie') ||
    fullText.includes('bennett') ||
    fullText.includes('aria') ||
    fullText.includes('brighton') ||
    fullText.includes('benjamin') ||
    fullText.includes('hvac') ||
    fullText.includes('condensate')
  ) {
    return true;
  }

  return false;
}

  let totalTasksCreated = 0;
  let recordingsProcessed = 0;
  let skippedRecordings = 0;

  for (const note of notes) {
    // Check if recording has already been processed
    if (!options.force && isRecordingProcessed(note.id)) {
      console.log(`[Skip] Recording "${note.title}" (${note.id}) has already been processed.`);
      skippedRecordings++;
      continue;
    }

    // Filter out work memos unless explicitly targeting all
    if (!options.tagFilter && !isPersonalNote(note)) {
      console.log(`[Skip] Recording "${note.title}" (${note.id}) is not a personal/family note.`);
      skippedRecordings++;
      continue;
    }

    // Apply tag filter if specified
    if (options.tagFilter) {
      const tags = note.tags || [];
      const hasTag = tags.some(t => t.toLowerCase() === options.tagFilter?.toLowerCase());
      if (!hasTag) {
        console.log(`[Skip] Recording "${note.title}" does not match tag filter: ${options.tagFilter}`);
        skippedRecordings++;
        continue;
      }
    }

    console.log(`\n🎙️ Processing: "${note.title}" [ID: ${note.id}]`);
    const actionItems = extractActionItems(note);

    if (actionItems.length === 0) {
      console.log(`  ℹ️ No action items found in recording.`);
      continue;
    }

    const createdRecordTasks: ProcessedTaskRecord[] = [];

    for (const item of actionItems) {
      console.log(`  ➔ Task: "${item.text}"`);
      console.log(`    Assignee: ${item.assignee}`);

      if (options.dryRun) {
        console.log(`    [DryRun] Would insert into Google Tasks list: "${item.assignee}"`);
        createdRecordTasks.push({
          taskList: item.assignee,
          title: item.text,
          assignee: item.assignee,
          due: item.due,
        });
        totalTasksCreated++;
      } else if (tasksClient) {
        try {
          const res = await insertTaskForFamilyMember(tasksClient, familyListsMap, item.assignee, {
            title: item.text,
            notes: `Auto-generated from Plaud recording: "${note.title}" (${note.id})`,
            due: item.due,
          });
          console.log(`    ✓ Created Google Task ID: ${res.id} in list "${item.assignee}"`);
          createdRecordTasks.push({
            taskList: item.assignee,
            taskId: res.id || undefined,
            title: item.text,
            assignee: item.assignee,
            due: item.due,
          });
          totalTasksCreated++;
        } catch (err) {
          console.error(`    ✗ Error creating task in Google Tasks:`, err);
        }
      }
    }

    if (!options.dryRun) {
      recordProcessedRecording({
        recordingId: note.id,
        title: note.title,
        processedAt: new Date().toISOString(),
        status: 'moved_to_google_tasks',
        destinations: ['google_tasks'],
        createdTasks: createdRecordTasks,
      });
      console.log(`  ✓ Checkpointed recording "${note.id}" as [moved_to_google_tasks] in data/plaud_sync_state.json`);
    }

    recordingsProcessed++;
  }

  console.log('\n================================================================');
  console.log(`[Summary] Processed: ${recordingsProcessed} | Skipped: ${skippedRecordings} | Tasks Routed: ${totalTasksCreated}`);
  console.log('================================================================\n');

  return { recordingsProcessed, skippedRecordings, totalTasksCreated };
}

export async function getPlaudAccessToken(): Promise<string | null> {
  const tokenFile = path.join(os.homedir(), '.plaud', 'tokens-mcp.json');
  if (!fs.existsSync(tokenFile)) {
    return null;
  }

  try {
    const tokens = JSON.parse(fs.readFileSync(tokenFile, 'utf-8'));
    // Test access token (Plaud requires page_size >= 10)
    const testRes = await fetch('https://platform.plaud.ai/developer/api/open/third-party/files/?page=1&page_size=10', {
      headers: { Authorization: `Bearer ${tokens.access_token}`, Accept: 'application/json' },
    });

    if (testRes.status >= 500) {
      console.warn(`[Plaud] Upstream server returned HTTP ${testRes.status} (service temporarily unavailable).`);
      return tokens.access_token;
    }

    let testData: any = null;
    const contentType = testRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      testData = await testRes.json().catch(() => null);
    }

    if ((testRes.status === 401 || testData?.detail === 'ACCESS_TOKEN_INVALID') && tokens.refresh_token) {
      console.log('[Plaud] Refreshing expired access token...');
      const refreshRes = await fetch('https://platform.plaud.ai/developer/api/oauth/third-party/access-token/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: new URLSearchParams({ refresh_token: tokens.refresh_token }),
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json().catch(() => null);
        if (refreshData?.access_token) {
          tokens.access_token = refreshData.access_token;
          if (refreshData.refresh_token) tokens.refresh_token = refreshData.refresh_token;
          fs.writeFileSync(tokenFile, JSON.stringify(tokens, null, 2), 'utf-8');
          console.log('[Plaud] Token refreshed successfully.');
          return tokens.access_token;
        }
      }
    }
    return tokens.access_token;
  } catch (err) {
    console.error('[Plaud] Error reading/refreshing tokens:', err);
    return null;
  }
}

export async function fetchLivePlaudNotes(limit = 20): Promise<PlaudNoteInput[]> {
  const token = await getPlaudAccessToken();
  if (!token) {
    throw new Error('No Plaud tokens found. Run "npx -y @plaud-ai/mcp@latest" to log in.');
  }

  const listRes = await fetch(`https://platform.plaud.ai/developer/api/open/third-party/files/?page=1&page_size=${limit}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });

  if (!listRes.ok) {
    console.warn(`[Plaud] Unable to list files (HTTP ${listRes.status}). Skipping this cycle.`);
    return [];
  }

  const listData = await listRes.json().catch(() => ({ data: [] }));
  const files = listData.data || [];
  const notes: PlaudNoteInput[] = [];

  for (const file of files) {
    const detailRes = await fetch(`https://platform.plaud.ai/developer/api/open/third-party/files/${file.id}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (!detailRes.ok) continue;
    const detailData = await detailRes.json().catch(() => null);
    if (!detailData) continue;
    const d = detailData.data || detailData;
    if (!d || !d.id) continue;

    let contentText = '';
    const actionItems: string[] = [];
    const tags: string[] = [];

    if (d.note_list && Array.isArray(d.note_list)) {
      for (const note of d.note_list) {
        let noteContent = note.data_content || '';
        if (!noteContent && note.data_link) {
          try {
            const linkRes = await fetch(note.data_link);
            noteContent = await linkRes.text();
          } catch {}
        }

        if (noteContent) {
          contentText += `\n${noteContent}`;
          const tagMatches = noteContent.match(/#(\w+)/g);
          if (tagMatches) {
            tags.push(...tagMatches.map((t: string) => t.replace('#', '')));
          }
          const actionSectionMatch = noteContent.match(/\*\*Action Items:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
          if (actionSectionMatch) {
            const lines = actionSectionMatch[1].split('\n');
            for (const line of lines) {
              const cleaned = line.replace(/^[-*•`[ \]]+\s*/, '').replace(/`$/, '').trim();
              if (cleaned.length > 3) {
                actionItems.push(cleaned);
              }
            }
          }
        }
      }
    }

    // Always extract raw transcript if available
    let rawTranscript = '';
    if (d.source_list && Array.isArray(d.source_list)) {
      for (const src of d.source_list) {
        if (src.data_type === 'transaction' && src.data_content) {
          try {
            const parsed = JSON.parse(src.data_content);
            rawTranscript += parsed.map((p: any) => p.content).join(' ');
          } catch {
            rawTranscript += ' ' + src.data_content;
          }
        }
      }
    }
    if (rawTranscript) {
      contentText += `\n${rawTranscript}`;
    }

    // Fallback: If Plaud generated no formal action items (common for brief notes < 15s), extract from transcript
    if (actionItems.length === 0 && rawTranscript) {
      const rawSentences = rawTranscript.split(/[.!?]+/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      const sentences: string[] = [];
      for (const raw of rawSentences) {
        if (/^(had\s+personal\s+tasks?|add\s+a\s+personal\s+task|personal\s+tasks?)$/i.test(raw)) {
          continue;
        }
        const cleaned = raw.replace(/^(had\s+personal\s+tasks?[:,\s]*|add\s+a\s+personal\s+task[:,\s]*)/i, '').trim();
        if (cleaned.length === 0) continue;

        // If very short trailing fragment (e.g. "All in one email"), append to previous task
        if (sentences.length > 0 && cleaned.length < 25 && !/^(call|send|tell|give|ask|buy|check|schedule|pick|pack|clean|bring|order|remember)/i.test(cleaned)) {
          sentences[sentences.length - 1] += ` (${cleaned})`;
        } else if (cleaned.length > 5) {
          sentences.push(cleaned);
        }
      }
      for (const sent of sentences) {
        actionItems.push(sent);
      }
    }

    notes.push({
      id: d.id,
      title: d.name || d.filename || 'Untitled Note',
      created_at: d.created_at,
      tags: [...new Set(tags)],
      summary: contentText,
      action_items: actionItems,
      content: contentText,
    });
  }

  return notes;
}

// CLI Execution Handler
async function main() {
  const args = process.argv.slice(2);
  const isMock = args.includes('--mock');
  const isDryRun = args.includes('--dry-run');
  const force = args.includes('--force');

  let tagFilter: string | undefined = undefined;
  const tagIdx = args.indexOf('--tag');
  if (tagIdx >= 0 && args[tagIdx + 1]) {
    tagFilter = args[tagIdx + 1];
  }

  let queryFilter: string | undefined = undefined;
  const queryIdx = args.indexOf('--query');
  if (queryIdx >= 0 && args[queryIdx + 1]) {
    queryFilter = args[queryIdx + 1].toLowerCase();
  }

  let fileIdx = args.indexOf('--file');
  let notes: PlaudNoteInput[] = [];

  if (fileIdx >= 0 && args[fileIdx + 1]) {
    const filePath = path.resolve(args[fileIdx + 1]);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      notes = JSON.parse(raw);
    } else {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }
  } else if (isMock) {
    notes = MOCK_PLAUD_NOTES;
  } else {
    console.log('[Plaud] Connecting to Plaud live cloud library...');
    notes = await fetchLivePlaudNotes(15);
    console.log(`[Plaud] Retrieved ${notes.length} recording(s) from Plaud.`);
  }

  if (queryFilter) {
    notes = notes.filter(n =>
      (n.title && n.title.toLowerCase().includes(queryFilter!)) ||
      (n.content && n.content.toLowerCase().includes(queryFilter!)) ||
      (n.tags && n.tags.some(t => t.toLowerCase().includes(queryFilter!)))
    );
    console.log(`[Plaud] ${notes.length} recording(s) matched query filter: "${queryFilter}"`);
  }

  await processPlaudNotes(notes, { dryRun: isDryRun, force, tagFilter });
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error in sync-plaud-tasks:', err);
    process.exit(1);
  });
}

