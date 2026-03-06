import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["src/**/*.test.ts"],
        exclude: ["src/**/*.integration.test.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov"],
            include: [
                "src/services/article.service.ts",
                "src/services/message.service.ts",
                "src/services/settings.service.ts",
                "src/services/project.service.ts",
                "src/services/guestbook.service.ts",
                "src/services/experience.service.ts",
                "src/repositories/article.repository.ts",
                "src/repositories/message.repository.ts",
                "src/repositories/project.repository.ts",
                "src/repositories/analytics.repository.ts",
                "src/middleware/**",
                "src/auth.ts",
            ],
            thresholds: {
                lines: 60,
                functions: 60,
            },
        },
        setupFiles: ["./src/test/setup.ts"],
    },
});
