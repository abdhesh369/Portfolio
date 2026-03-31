import { logger } from "../lib/logger.js";
import { redis } from "../lib/redis.js";

export type HealthStatus = "up" | "down" | "checking" | "none";

class VitalsService {
  private readonly CACHE_TTL = 300; // 5 minutes

  async getHealthStatus(url: string | null | undefined): Promise<HealthStatus> {
    if (!url || url === "#") return "none";

    const cacheKey = `vitals:status:${url}`;
    
    // 1. Check Redis Cache
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) return cached as HealthStatus;
      } catch (err) {
        logger.error({ url, err }, "Failed to read vitals cache");
      }
    }

    // 2. Perform Ping
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(url, { 
        method: "HEAD", 
        signal: controller.signal,
        headers: { "User-Agent": "Portfolio-Vitals-Check/2.0" }
      });
      
      clearTimeout(timeoutId);

      const status: HealthStatus = response.ok ? "up" : "down";

      // 3. Cache Result
      if (redis) {
        await redis.set(cacheKey, status, "EX", this.CACHE_TTL);
      }

      return status;
    } catch (err) {
      logger.warn({ url, err }, "Health check failed for project");
      
      // If error, cache as "down" for a shorter time (1 min) to avoid repeated hangs
      if (redis) {
        await redis.set(cacheKey, "down", "EX", 60);
      }
      
      return "down";
    }
  }

  /**
   * Bulk check for a list of projects
   */
  async getBulkStatus(projects: { id: number; healthCheckUrl: string | null }[]): Promise<Record<number, HealthStatus>> {
    const results: Record<number, HealthStatus> = {};
    
    await Promise.all(
      projects.map(async (p) => {
        results[p.id] = await this.getHealthStatus(p.healthCheckUrl);
      })
    );

    return results;
  }
}

export const vitalsService = new VitalsService();
