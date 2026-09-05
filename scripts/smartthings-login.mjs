/**
 * SmartThings Native OAuth Login Helper
 *
 * Uses the official SmartThings CLI Client ID (d18cf96e-c626-4433-bf51-ddbb10c5d1ed)
 * to perform a PKCE OAuth authorization flow.
 *
 * Persists permanent refresh token to .credentials/smartthings_token.json
 * so tokens auto-refresh forever without 24-hour expiration!
 */

import http from "node:http";
import url from "node:url";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { exec } from "node:child_process";

const CLIENT_ID = "d18cf96e-c626-4433-bf51-ddbb10c5d1ed";
const SCOPES = ["controller:stCli"];
const PORT = 61973;
const REDIRECT_URI = `http://localhost:${PORT}/finish`;
const BASE_OAUTH_URL = "https://oauthin-regional.api.smartthings.com/oauth";
const TOKEN_DIR = path.join(process.cwd(), ".credentials");
const TOKEN_PATH = path.join(TOKEN_DIR, "smartthings_token.json");

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest();
}

async function run() {
  console.log("==========================================");
  console.log("🔑 SmartThings Official OAuth Login");
  console.log("==========================================");

  const verifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = sha256(verifier).toString("base64url");

  const authorizeUrl = new URL(`${BASE_OAUTH_URL}/authorize`);
  authorizeUrl.searchParams.set("scope", SCOPES.join("+"));
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", CLIENT_ID);
  authorizeUrl.searchParams.set("code_challenge", codeChallenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");
  authorizeUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authorizeUrl.searchParams.set("client_type", "USER_LEVEL");

  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (parsedUrl.pathname === "/finish") {
      const code = parsedUrl.query.code;
      const error = parsedUrl.query.error;

      if (error) {
        console.error("❌ Authentication error from SmartThings:", error);
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end(`<h1>Authentication Failed</h1><p>${error}</p>`);
        server.close();
        process.exit(1);
      }

      if (code) {
        console.log("✅ Received authorization code from SmartThings. Exchanging for tokens...");

        try {
          const bodyParams = new URLSearchParams({
            grant_type: "authorization_code",
            client_id: CLIENT_ID,
            code_verifier: verifier,
            code: code,
            redirect_uri: REDIRECT_URI,
          });

          const tokenRes = await fetch(`${BASE_OAUTH_URL}/token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: bodyParams.toString(),
          });

          if (!tokenRes.ok) {
            const errText = await tokenRes.text();
            throw new Error(`Token exchange failed (${tokenRes.status}): ${errText}`);
          }

          const tokenData = await tokenRes.json();
          const expiresAt = new Date(Date.now() + (tokenData.expires_in || 86400) * 1000).toISOString();

          const authInfo = {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expires: expiresAt,
            scope: tokenData.scope,
            installedAppId: tokenData.installed_app_id,
            deviceId: tokenData.device_id,
            clientId: CLIENT_ID,
          };

          if (!fs.existsSync(TOKEN_DIR)) {
            fs.mkdirSync(TOKEN_DIR, { recursive: true });
          }

          fs.writeFileSync(TOKEN_PATH, JSON.stringify(authInfo, null, 2), "utf-8");

          // Also write to .env.local SMARTTHINGS_PAT for immediate local fallback
          const envLocalPath = path.join(process.cwd(), ".env.local");
          let envContent = fs.existsSync(envLocalPath) ? fs.readFileSync(envLocalPath, "utf-8") : "";
          if (envContent.includes("SMARTTHINGS_PAT=")) {
            envContent = envContent.replace(/SMARTTHINGS_PAT=.*/, `SMARTTHINGS_PAT="${tokenData.access_token}"`);
          } else {
            envContent += `\nSMARTTHINGS_PAT="${tokenData.access_token}"\n`;
          }
          fs.writeFileSync(envLocalPath, envContent, "utf-8");

          console.log(`\n🎉 SUCCESS! SmartThings permanent OAuth credentials stored!`);
          console.log(`📁 Saved to: ${TOKEN_PATH}`);
          console.log(`🔑 Refresh Token obtained (valid permanently with auto-refresh)`);

          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`
            <html>
              <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #0f172a; color: #f8fafc;">
                <h1 style="color: #10b981;">✅ SmartThings Authentication Successful!</h1>
                <p>Permanent refresh token saved. You can close this window and return to your terminal.</p>
              </body>
            </html>
          `);

          server.close();

          // Immediately test reading devices
          console.log("\n🔍 Testing connection by querying devices...");
          exec("npx tsx scripts/inspect-smartthings.ts", (err, stdout) => {
            if (stdout) console.log(stdout);
            process.exit(0);
          });
        } catch (err) {
          console.error("❌ Failed to exchange code for tokens:", err);
          res.writeHead(500, { "Content-Type": "text/html" });
          res.end(`<h1>Error</h1><p>${err.message}</p>`);
          server.close();
          process.exit(1);
        }
      }
    }
  });

  server.listen(PORT, () => {
    console.log(`\n🌐 Listening on port ${PORT} for SmartThings callback.`);
    console.log(`🚀 Opening browser to login page:\n`);
    console.log(`   ${authorizeUrl.toString()}\n`);

    // Open browser on Windows
    const startCmd = process.platform === "win32" ? `start "" "${authorizeUrl.toString()}"` : `open "${authorizeUrl.toString()}"`;
    exec(startCmd, (err) => {
      if (err) {
        console.log("👉 If your browser did not open automatically, click the link above!");
      }
    });
  });
}

run();
