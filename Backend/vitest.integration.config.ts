import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["src/**/*.integration.test.ts"],
        testTimeout: 30000,
        hookTimeout: 30000,
        setupFiles: ["./src/test/integration-setup.ts"],
    },
});
