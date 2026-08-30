/**
 * Autonomous User Proxy Simulator
 * Enables the AI agent to act as the user: submits feedback, triggers triage,
 * checks execution boxes, observes healing, and validates deployment end-to-end.
 */

import { execSync } from  child_process;
import fs from fs;
import path from path;
import { HarnessConfig } from ./types;

export class AutonomousSimulator {
  private config: HarnessConfig;
  private githubToken: string;

  constructor(config: HarnessConfig, githubToken?: string) {
    this.config = config;
    this.githubToken = githubToken || process.env.GITHUB_TOKEN || ;
 if (!this.githubToken) {
 throw new Error(GITHUB_TOKEN is required to run autonomous simulation.);
 }
 }

 private async fetchGithub(endpoint: string, options: any = {}) {
 const url = https://api.github.com/repos//;
 const res = await fetch(url, {
 ...options,
 headers: {
 Authorization: Bearer ,
 Accept: application/vnd.github.v3+json,
 Content-Type: application/json,
 User-Agent: Autonomous-Harness-Simulator,
 ...(options.headers || {}),
 },
 });
 if (res.status === 204) return null;
 return res.json();
 }

 /**
 * Run an end-to-end autonomous dogfooding scenario.
 */
 async runScenario(title: string, rawFeedback: string): Promise<boolean> {
 console.log(🤖 [Simulator] Initiating Autonomous Proxy Run: );

 // 1. Submit Issue as the User Proxy
 console.log(📝 [Simulator] Step 1: Submitting issue to repository...);
 const issue = await this.fetchGithub(/issues, {
 method: POST,
 body: JSON.stringify({
 title: [Website Feedback] ,
 body: ${rawFeedback}\n\n---\n*Submitted autonomously by Antigravity Agent as user proxy for continuous verification.*,
 labels: [feedback:website, test-issue-from-agent],
 }),
 });
 console.log(✅ [Simulator] Created Issue #: );

 // 2. Trigger Batch Triage Workflow
 console.log(⚙️ [Simulator] Step 2: Triggering batch triage workflow in GitHub Actions...);
 await this.fetchGithub(/actions/workflows/batch-triage-feedback.yml/dispatches, {
 method: POST,
 body: JSON.stringify({ ref: this.config.git.defaultBranch }),
 });

 // 3. Poll for the generated PR
 console.log(⏳ [Simulator] Step 3: Waiting for Functional PR proposal to be generated...);
 let targetPr: any = null;
 for (let i = 0; i < 20; i++) {
 await new Promise((r) => setTimeout(r, 10000));
 const openPrs = await this.fetchGithub(/pulls?state=open);
 targetPr = openPrs.find(
 (p: any) =>
 p.body &&
 (p.body.includes(Closes #) ||
 p.body.includes(Issues #))
 );
 if (targetPr) break;
 process.stdout.write(.);
 }
 console.log();

    if (!targetPr) {
      console.error(❌ [Simulator] Timed out waiting for Triage PR to be created.);
      return false;
    }
    console.log(✅ [Simulator] Functional PR # detected: );

    // 4. Programmatically Check the Execution Box
    console.log(☑️ [Simulator] Step 4: Programmatically checking execution box on PR...);
    const checkedBody = targetPr.body.replace(
      - [ ] **Ready to execute**,
      - [x] **Ready to execute**
    );
    await this.fetchGithub(/pulls/, {
      method: PATCH,
      body: JSON.stringify({ body: checkedBody }),
    });
    console.log(✅ [Simulator] Execution box checked. Cloud runner triggered.);

    // 5. Poll for Execution and Auto-Merge Completion
    console.log(🚀 [Simulator] Step 5: Monitoring autonomous execution and auto-merge gate...);
    let merged = false;
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 15000));
      const prStatus = await this.fetchGithub(/pulls/);
      if (prStatus.merged) {
        merged = true;
        console.log(🎉 [Simulator] PR # successfully auto-merged into !);
        break;
      }
      if (prStatus.state === closed && !prStatus.merged) {
        console.error(❌ [Simulator] PR # was closed without merging.);
        return false;
      }
      process.stdout.write(.);
    }
    console.log();

 if (!merged) {
 console.warn(⚠️ [Simulator] Execution did not complete auto-merge within timeout window.);
 return false;
 }

 // 6. Pull and Run Final Verification Suite Locally
 console.log(🔍 [Simulator] Step 6: Pulling main and running regression test suite locally...);
 try {
 execSync(git pull origin , { stdio: inherit });
 execSync(this.config.evaluation.testCommand, { stdio: inherit });
 console.log(🏆 [Simulator] End-to-End Autonomous Simulation PASSED! Zero human intervention required.);
 return true;
 } catch (err: any) {
 console.error(❌ [Simulator] Local regression test failed after merge:, err.message);
 return false;
 }
 }
}
