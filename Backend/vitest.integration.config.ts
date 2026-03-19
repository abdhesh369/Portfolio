import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["src/**/*.integration.test.ts"],
        testTimeout: 120000,
        hookTimeout: 120000,
        setupFiles: ["./src/test/integration-setup.ts"],
        // Disable parallel execution to prevent database interference
        fileParallelism: false,
    },
});
