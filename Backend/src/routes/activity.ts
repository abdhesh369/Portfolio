import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { cachePublic } from "../middleware/cache.js";

export function registerActivityRoutes(app: Router) {
  /**
   * GET /activity/coding - Returns coding stats (languages, hours)
   * This is a mock implementation that can be linked to WakaTime API later.
   */
  app.get(
    "/activity/coding",
    cachePublic(3600), // Cache for 1 hour
    asyncHandler(async (req, res) => {
      // High-quality mock data based on actual portfolio tech stack
      const stats = {
        last7Days: {
          totalHours: 38.5,
          languages: [
            { name: "TypeScript", percent: 45, color: "#3178c6" },
            { name: "React", percent: 25, color: "#61dafb" },
            { name: "PostgreSQL", percent: 15, color: "#336791" },
            { name: "Node.js", percent: 10, color: "#339933" },
            { name: "Other", percent: 5, color: "#888888" }
          ],
          daily: [
            { day: "Mon", hours: 5.2 },
            { day: "Tue", hours: 6.8 },
            { day: "Wed", hours: 4.5 },
            { day: "Thu", hours: 7.1 },
            { day: "Fri", hours: 5.9 },
            { day: "Sat", hours: 3.2 },
            { day: "Sun", hours: 5.8 }
          ]
        },
        allTime: {
          commits: 1452,
          projectsCount: 24,
          yearsCoding: 3
        }
      };

      res.json(stats);
    })
  );
}
