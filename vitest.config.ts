import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        globalSetup: "vitest.setup.ts",
        globals: true,
        environment: "node",
        coverage: {
            provider: "istanbul",
            reporter: ["text", "html"],
            include: ["src/**/*.ts"],
            exclude: [
                "node_modules/",
                "tests/",
                "src/migrations",
                "src/config",
                "src/database",
                "src/swagger.ts"
            ],
        },
        include: ["src/**/*.test.ts"],
        exclude: [
            "node_modules",
            "build",
            "dist",
            "**/build/**",
            "**/dist/**"
        ],
        watch: false,
        pool: 'forks',
        sequence: {
            concurrent: false
        }
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src")
        }
    }
});
