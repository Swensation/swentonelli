/**
 * Adaptive Rate Limiter & Resilience Pacing Engine
 * Protects LLM quota stocks and ensures smooth execution in constrained environments.
 */

export class AdaptiveRateLimiter {
  private interTurnDelayMs: number;
  private backoffMultiplierMs: number;
  private lastCallTimestamp: number = 0;

  constructor(interTurnDelayMs = 4000, backoffMultiplierMs = 15000) {
    this.interTurnDelayMs = interTurnDelayMs;
    this.backoffMultiplierMs = backoffMultiplierMs;
  }

  /**
   * Enforce inter-turn delay to stay strictly under RPM limits.
   */
  async paceTurn(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastCallTimestamp;
    if (elapsed < this.interTurnDelayMs) {
      const waitTime = this.interTurnDelayMs - elapsed;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.lastCallTimestamp = Date.now();
  }

  /**
   * Handle HTTP 429 Quota Throttling with exponential backoff.
   */
  async handleRateLimit(attempt: number, modelName: string): Promise<void> {
    const coolOffMs = attempt * this.backoffMultiplierMs;
    console.warn(
      `⏳ [RateLimiter] HTTP 429 Quota Exceeded on '${modelName}' (attempt ${attempt}). Pausing for ${
        coolOffMs / 1000
      }s to clear quota window...`
    );
    await new Promise((resolve) => setTimeout(resolve, coolOffMs));
  }

  /**
   * Handle transient server congestion (HTTP 503 / network errors).
   */
  async handleCongestion(attempt: number, modelName: string): Promise<void> {
    const waitMs = attempt * 3000;
    console.warn(
      `⚠️ [RateLimiter] Server congestion or network error on '${modelName}' (attempt ${attempt}). Retrying in ${
        waitMs / 1000
      }s...`
    );
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
}

