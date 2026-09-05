import fs from 'fs';
import path from 'path';
import { google, tasks_v1 } from 'googleapis';
import childrenRegistry from '../../data/children_registry.json';

export const TOKEN_PATH = path.join(process.cwd(), '.credentials', 'google_tasks_token.json');

export interface FamilyMemberTarget {
  canonicalName: string;
  keywords: string[];
}

export const CANONICAL_FAMILY_MEMBERS: FamilyMemberTarget[] = [
  { canonicalName: 'Andrew', keywords: ['andrew', 'dad'] },
  { canonicalName: 'Callie', keywords: ['callie', 'mom'] },
  ...childrenRegistry.map((c: any) => ({
    canonicalName: c.name,
    keywords: [c.name.toLowerCase(), ...(c.matchKeywords || []).map((k: string) => k.toLowerCase())],
  })),
  { canonicalName: 'Family', keywords: ['family', 'house', 'everyone', 'all'] },
];

export function resolveAssignee(text: string): string {
  const lower = text.toLowerCase();
  for (const member of CANONICAL_FAMILY_MEMBERS) {
    for (const kw of member.keywords) {
      // Word boundary match or whole phrase match
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(lower)) {
        return member.canonicalName;
      }
    }
  }
  return 'Family';
}

function loadEnvLocal() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const envPath = path.join(process.cwd(), file);
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
      for (const line of lines) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let val = (match[2] || '').trim().replace(/^['"](.*)['"]$/, '$1');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}
loadEnvLocal();

export function getStoredCredentials(): any | null {
  if (fs.existsSync(TOKEN_PATH)) {
    try {
      const raw = fs.readFileSync(TOKEN_PATH, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`[GoogleTasks] Could not parse stored token file at ${TOKEN_PATH}:`, e);
    }
  }

  // Fallback to env vars if available
  if (process.env.GOOGLE_TASKS_REFRESH_TOKEN && process.env.GOOGLE_TASKS_CLIENT_ID && process.env.GOOGLE_TASKS_CLIENT_SECRET) {
    return {
      client_id: process.env.GOOGLE_TASKS_CLIENT_ID,
      client_secret: process.env.GOOGLE_TASKS_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_TASKS_REFRESH_TOKEN,
    };
  }

  return null;
}

export function createTasksClient(credentials?: any): tasks_v1.Tasks | null {
  const creds = credentials || getStoredCredentials();
  if (!creds) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    creds.client_id,
    creds.client_secret,
    creds.redirect_uri || 'http://localhost:8085/oauth2callback'
  );

  oauth2Client.setCredentials({
    refresh_token: creds.refresh_token,
    access_token: creds.access_token,
  });

  return google.tasks({ version: 'v1', auth: oauth2Client });
}

export async function ensureFamilyTaskLists(
  tasksClient: tasks_v1.Tasks
): Promise<Map<string, string>> {
  const listMap = new Map<string, string>();
  const res = await tasksClient.tasklists.list({ maxResults: 100 });
  const existingLists = res.data.items || [];

  for (const item of existingLists) {
    if (item.title && item.id) {
      listMap.set(item.title.trim().toLowerCase(), item.id);
    }
  }

  // Ensure lists exist for all canonical family members
  for (const member of CANONICAL_FAMILY_MEMBERS) {
    const key = member.canonicalName.toLowerCase();
    if (!listMap.has(key)) {
      console.log(`[GoogleTasks] Creating task list for "${member.canonicalName}"...`);
      const created = await tasksClient.tasklists.insert({
        requestBody: {
          title: member.canonicalName,
        },
      });
      if (created.data.id) {
        listMap.set(key, created.data.id);
      }
    }
  }

  return listMap;
}

export interface NewTaskInput {
  title: string;
  notes?: string;
  due?: string; // RFC 3339 format, e.g. "2026-09-05T00:00:00.000Z"
}

export async function insertTaskForFamilyMember(
  tasksClient: tasks_v1.Tasks,
  listMap: Map<string, string>,
  assignee: string,
  task: NewTaskInput
): Promise<tasks_v1.Schema$Task> {
  const targetKey = assignee.trim().toLowerCase();
  let listId = listMap.get(targetKey);

  if (!listId) {
    // Fallback to Family or default list
    listId = listMap.get('family') || '@default';
  }

  const res = await tasksClient.tasks.insert({
    tasklist: listId,
    requestBody: {
      title: task.title,
      notes: task.notes,
      due: task.due,
      status: 'needsAction',
    },
  });

  return res.data;
}

