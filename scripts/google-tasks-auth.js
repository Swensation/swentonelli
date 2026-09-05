const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { google } = require('googleapis');

const TOKEN_DIR = path.join(process.cwd(), '.credentials');
const TOKEN_PATH = path.join(TOKEN_DIR, 'google_tasks_token.json');
const CREDENTIALS_FILE = path.join(process.cwd(), 'credentials.json');

const SCOPES = [
  'https://www.googleapis.com/auth/tasks',
];

const PORT = 8085;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

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

function getClientConfig() {
  if (fs.existsSync(CREDENTIALS_FILE)) {
    try {
      const content = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf-8'));
      const installed = content.installed || content.web;
      if (installed && installed.client_id) {
        return {
          client_id: installed.client_id,
          client_secret: installed.client_secret || '',
        };
      }
    } catch (err) {
      console.warn('Could not parse credentials.json:', err);
    }
  }

  if (process.env.GOOGLE_TASKS_CLIENT_ID) {
    return {
      client_id: process.env.GOOGLE_TASKS_CLIENT_ID,
      client_secret: process.env.GOOGLE_TASKS_CLIENT_SECRET || '',
    };
  }

  console.error('\n================================================================');
  console.error('Google Tasks Authentication Setup Required');
  console.error('================================================================');
  console.error('To authenticate Google Tasks, you need an OAuth 2.0 Client ID.');
  console.error('\nSet in .env.local:');
  console.error('GOOGLE_TASKS_CLIENT_ID=your_client_id.apps.googleusercontent.com');
  console.error('GOOGLE_TASKS_CLIENT_SECRET=your_client_secret');
  console.error('================================================================\n');
  process.exit(1);
}

function openBrowser(targetUrl) {
  if (process.platform === 'win32') {
    exec(`powershell -NoProfile -Command "Start-Process '${targetUrl.replace(/'/g, "''")}'"`);
  } else if (process.platform === 'darwin') {
    exec(`open "${targetUrl}"`);
  } else {
    exec(`xdg-open "${targetUrl}"`);
  }
}

async function authenticate() {
  const { client_id, client_secret } = getClientConfig();

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        if (req.url && req.url.startsWith('/oauth2callback')) {
          const parsed = url.parse(req.url, true);
          const code = parsed.query.code;

          if (!code) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end('<h1>Authentication Failed: No code received</h1>');
            server.close();
            return reject(new Error('No code received'));
          }

          console.log('[Auth] Exchanging authorization code for tokens...');
          const { tokens } = await oauth2Client.getToken(code);

          if (!fs.existsSync(TOKEN_DIR)) {
            fs.mkdirSync(TOKEN_DIR, { recursive: true });
          }

          const tokenData = {
            client_id,
            client_secret,
            redirect_uri: REDIRECT_URI,
            ...tokens,
          };

          fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenData, null, 2), 'utf-8');
          console.log(`[Auth] Tokens securely saved to: ${TOKEN_PATH}`);

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                <h1 style="color: #16a34a;">Authentication Successful!</h1>
                <p>Google Tasks has been authorized for Swentonelli. You can close this window now.</p>
              </body>
            </html>
          `);
          server.close();

          oauth2Client.setCredentials(tokens);
          const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
          const listsRes = await tasks.tasklists.list({ maxResults: 10 });
          console.log('\n[Verification] Successfully connected to Google Tasks! Found task lists:');
          (listsRes.data.items || []).forEach(l => console.log(` - ${l.title} (ID: ${l.id})`));

          resolve();
        }
      } catch (e) {
        console.error('\n[Auth Exchange Error]:', e.response?.data || e.message || e);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end(`<h1>Authentication Error</h1><p>${e.message}</p>`);
        }
        server.close();
        reject(e);
      }
    });

    server.on('error', (err) => {
      console.error('[Server Error]:', err.message);
      reject(err);
    });

    server.listen(PORT, '127.0.0.1', () => {
      console.log('\n================================================================');
      console.log(`Local authentication server active on http://127.0.0.1:${PORT}`);
      console.log('Opening browser for Google Tasks authorization...');
      console.log('================================================================\n');
      console.log('👉 If your browser does not open automatically, copy and paste this URL:\n');
      console.log(authUrl);
      console.log('\n================================================================\n');
      openBrowser(authUrl);
    });
  });
}

authenticate().catch((err) => {
  console.error('[Auth Error]', err);
  process.exit(1);
});

