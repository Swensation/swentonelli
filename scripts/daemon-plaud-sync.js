const { exec } = require('child_process');
const path = require('path');

const SYNC_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

function runSync() {
  const timestamp = new Date().toLocaleString();
  console.log(`\n================================================================`);
  console.log(`[${timestamp}] Running Plaud -> Google Tasks check...`);
  console.log(`================================================================`);

  const cmd = 'npx tsx scripts/sync-plaud-tasks.ts';
  exec(cmd, { cwd: path.resolve(__dirname, '..') }, (error, stdout, stderr) => {
    if (error) {
      console.error(`[Plaud Daemon Error]:`, error.message);
    }
    if (stdout) {
      console.log(stdout.trim());
    }
    if (stderr && !stdout) {
      console.error(stderr.trim());
    }
    console.log(`[${new Date().toLocaleTimeString()}] Next check in 10 minutes.\n`);
  });
}

console.log('Plaud to Google Tasks background sync daemon started.');
console.log('Interval: Every 10 minutes.');
runSync();
setInterval(runSync, SYNC_INTERVAL_MS);
