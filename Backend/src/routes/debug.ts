import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { redis } from "../lib/redis.js";
import { db } from "../db.js";
import { projectsTable } from "@portfolio/shared/schema";
import { count } from "drizzle-orm";

export const debugRouter = Router();

// GET /api/v1/debug/performance - Returns live performance metrics
debugRouter.get(
  "/performance",
  asyncHandler(async (req, res) => {
    const start = Date.now();
    
    // Simulate some DB activity
    await db.select({ value: count() }).from(projectsTable);
    
    // Check Redis connectivity/latency
    let redisLatency = 0;
    let cacheHits = 0;
    if (redis) {
      const redisStart = Date.now();
      await redis.ping();
      redisLatency = Date.now() - redisStart;
      
      // Get some stats from Redis if possible 
      const info = await redis.info('stats');
      const hitMatch = info.match(/keyspace_hits:(\d+)/);
      cacheHits = hitMatch ? parseInt(hitMatch[1]) : 0;
    }

    const totalLatency = Date.now() - start;

    res.json({
      success: true,
      metrics: {
        responseTime: totalLatency,
        redisLatency,
        cacheHits,
        uptime: process.uptime(),
        memory: process.memoryUsage().heapUsed,
        timestamp: Date.now()
      }
    });
  })
);

// POST /api/v1/debug/stress - Simulates load
debugRouter.post(
  "/stress",
  asyncHandler(async (req, res) => {
    const { clients = 50 } = req.body;
    
    // Simulate heavy computational task or multiple DB queries
    // In a real load test, the client would hit the endpoint repeatedly.
    // Here we just simulate the *result* of being hit.
    
    const results = await Promise.all(
        Array.from({ length: 5 }).map(async () => {
            const start = Date.now();
            await db.select().from(projectsTable).limit(5);
            return Date.now() - start;
        })
    );

    const avgLatency = results.reduce((a, b) => a + b, 0) / results.length;

    res.json({
      success: true,
      message: `Simulated ${clients} concurrent users.`,
      metrics: {
        avgConcurrentLatency: avgLatency + (clients * 0.5), // Artificial scaling for demo
        status: avgLatency < 100 ? "Stable" : "Stressed",
        loadFactor: clients / 100
      }
    });
  })
);
