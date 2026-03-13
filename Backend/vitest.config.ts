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
            include: ["src/**/*.ts"],
            exclude: [
                "src/**/*.test.ts",
                "src/**/*.integration.test.ts",
                "src/test/**",
                "src/seed.ts",
                "src/migrate.ts",
                "src/instrument.ts",
                "src/types/**",
                "src/workers/**",
            ],
            thresholds: {
                lines: 70,
                functions: 70,
                branches: 70,
                statements: 70,
            },
        },
        setupFiles: ["./src/test/setup.ts"],
    },
});
