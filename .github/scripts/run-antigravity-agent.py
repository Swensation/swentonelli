#!/usr/bin/env python3
"""
Autonomous Antigravity Agent Runner for GitHub Actions
"""

import asyncio
import os
import sys
import json
from datetime import datetime, timezone

async def main():
    issue_number = os.environ.get("ISSUE_NUMBER", "0")
    issue_title = os.environ.get("ISSUE_TITLE", "")
    issue_body = os.environ.get("ISSUE_BODY", "")
    api_key = os.environ.get("GEMINI_API_KEY")

    if not api_key:
        print("❌ Error: GEMINI_API_KEY environment variable is not set.", file=sys.stderr)
        sys.exit(1)

    print(f"🤖 Initializing Google Antigravity Agent for Issue #{issue_number}...")
    print(f"   Title: {issue_title}")

    # Import Antigravity SDK
    try:
        from google.antigravity import Agent, LocalAgentConfig, types
        from google.antigravity.hooks import policy
    except ImportError:
        print("❌ google-antigravity SDK not found. Attempting install...", file=sys.stderr)
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "google-antigravity"])
        from google.antigravity import Agent, LocalAgentConfig, types
        from google.antigravity.hooks import policy

    workspace_dir = os.path.abspath(os.getcwd())
    print(f"   Workspace: {workspace_dir}")

    config = LocalAgentConfig(
        api_key=api_key,
        workspaces=[workspace_dir],
        system_instructions=(
            "You are Google Antigravity, an expert software engineering AI agent. "
            "Your task is to autonomously implement user feedback and feature requests in this Next.js TypeScript repository. "
            "You must inspect files, make clean and precise edits, ensure TypeScript builds cleanly with zero errors, "
            "and update public/build-meta.json with the current UTC timestamp and summary."
        ),
        policies=[policy.allow_all()],
        capabilities=types.CapabilitiesConfig(
            agent_behavior=types.AgentBehavior.AUTONOMOUS,
        ),
    )

    prompt = f"""
We received the following user feedback via the Scouty Voice Feedback pipeline:

Issue #{issue_number}: {issue_title}

{issue_body}

Instructions:
1. Examine the relevant files in the codebase.
2. Implement the fix or feature requested cleanly, adhering to existing patterns and TypeScript types.
3. Overwrite public/build-meta.json with:
{{
  "timestamp": "{datetime.now(timezone.utc).isoformat()}",
  "commitSha": "agent-issue-{issue_number}",
  "issueNumber": {issue_number},
  "summary": "Fix for issue #{issue_number}: {issue_title}"
}}
4. Verify your changes pass typechecking (`npx tsc --noEmit`).
"""

    async with Agent(config=config) as agent:
        print("🚀 Agent execution started...")
        response = await agent.chat(prompt)
        print("✅ Agent execution finished:")
        print(await response.text())

if __name__ == "__main__":
    asyncio.run(main())

