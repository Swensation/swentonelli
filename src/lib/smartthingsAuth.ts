/**
 * Autonomous SmartThings Token Refresh Manager
 *
 * Reads OAuth tokens from .credentials/smartthings_token.json
 * Automatically rotates and exchanges refresh_token when access_token nears expiry (or is expired).
 * Zero manual token maintenance forever!
 */

import fs from "fs";
import path from "path";

const TOKEN_PATH = path.join(process.cwd(), ".credentials", "smartthings_token.json");
const BASE_OAUTH_URL = "https://oauthin-regional.api.smartthings.com/oauth";

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expires: string;
  clientId: string;
  scope?: string;
  installedAppId?: string;
  deviceId?: string;
}

export async function getValidSmartThingsToken(): Promise<string | null> {
  // First check if token file exists
  if (!fs.existsSync(TOKEN_PATH)) {
    return process.env.SMARTTHINGS_PAT || null;
  }

  try {
    const raw = fs.readFileSync(TOKEN_PATH, "utf-8");
    const data: TokenData = JSON.parse(raw);

    if (!data.accessToken) {
      return process.env.SMARTTHINGS_PAT || null;
    }

    const expiresTime = new Date(data.expires).getTime();
    const now = Date.now();

    // If token is valid for more than 10 minutes, return it immediately
    if (expiresTime - now > 10 * 60 * 1000) {
      return data.accessToken;
    }

    // Token is expiring or expired, refresh it!
    if (!data.refreshToken || !data.clientId) {
      console.warn("Missing refreshToken or clientId in smartthings_token.json");
      return data.accessToken || process.env.SMARTTHINGS_PAT || null;
    }

    console.log("🔄 Auto-refreshing SmartThings OAuth token...");
    const bodyParams = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: data.clientId,
      refresh_token: data.refreshToken,
    });

    const res = await fetch(`${BASE_OAUTH_URL}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams.toString(),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.error(`Failed to refresh SmartThings token (${res.status})`);
      return data.accessToken;
    }

    const fresh = await res.json();
    const newExpires = new Date(Date.now() + (fresh.expires_in || 86400) * 1000).toISOString();

    data.accessToken = fresh.access_token;
    if (fresh.refresh_token) {
      data.refreshToken = fresh.refresh_token;
    }
    data.expires = newExpires;

    fs.writeFileSync(TOKEN_PATH, JSON.stringify(data, null, 2), "utf-8");
    console.log("✅ SmartThings token rotated and refreshed successfully!");

    return data.accessToken;
  } catch (err) {
    console.error("Error in getValidSmartThingsToken:", err);
    return process.env.SMARTTHINGS_PAT || null;
  }
}
