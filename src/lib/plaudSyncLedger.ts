import fs from 'fs';
import path from 'path';

export type DestinationSystem = 'google_tasks' | 'claude' | 'ms_teams' | string;

export interface ProcessedTaskRecord {
  taskList: string;
  taskId?: string;
  title: string;
  assignee: string;
  due?: string;
  destination?: DestinationSystem;
}

export interface ProcessedRecordingRecord {
  recordingId: string;
  title?: string;
  processedAt: string;
  status: 'moved_to_google_tasks' | 'moved_to_claude' | 'moved_to_ms_teams' | string;
  destinations: DestinationSystem[];
  createdTasks: ProcessedTaskRecord[];
}

export interface PlaudSyncLedger {
  lastSyncTimestamp: string | null;
  processedRecordings: ProcessedRecordingRecord[];
}

const LEDGER_PATH = path.join(process.cwd(), 'data', 'plaud_sync_state.json');

export function getSyncLedger(): PlaudSyncLedger {
  try {
    if (!fs.existsSync(LEDGER_PATH)) {
      return { lastSyncTimestamp: null, processedRecordings: [] };
    }
    const content = fs.readFileSync(LEDGER_PATH, 'utf-8');
    return JSON.parse(content) as PlaudSyncLedger;
  } catch (err) {
    console.error(`[PlaudLedger] Error reading sync ledger:`, err);
    return { lastSyncTimestamp: null, processedRecordings: [] };
  }
}

export function isRecordingProcessed(recordingId: string, destination: DestinationSystem = 'google_tasks'): boolean {
  const ledger = getSyncLedger();
  const found = ledger.processedRecordings.find(r => r.recordingId === recordingId);
  if (!found) return false;
  // If destination specified, check if already dispatched to that target system
  if (found.destinations && Array.isArray(found.destinations)) {
    return found.destinations.includes(destination);
  }
  return true;
}

export function recordProcessedRecording(record: ProcessedRecordingRecord): void {
  const ledger = getSyncLedger();
  const existingIndex = ledger.processedRecordings.findIndex(r => r.recordingId === record.recordingId);

  if (existingIndex >= 0) {
    const existing = ledger.processedRecordings[existingIndex];
    const mergedDestinations = [...new Set([...(existing.destinations || []), ...(record.destinations || [])])];
    const mergedTasks = [...(existing.createdTasks || []), ...(record.createdTasks || [])];
    ledger.processedRecordings[existingIndex] = {
      ...existing,
      ...record,
      destinations: mergedDestinations,
      createdTasks: mergedTasks,
    };
  } else {
    ledger.processedRecordings.push(record);
  }

  ledger.lastSyncTimestamp = new Date().toISOString();

  const dir = path.dirname(LEDGER_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2), 'utf-8');
}

