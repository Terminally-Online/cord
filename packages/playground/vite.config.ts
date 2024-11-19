import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { resolve } from "path";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
            "@cord/core": resolve(__dirname, "../core/src"),
            "@cord/core/react": resolve(__dirname, "../core/src/react"),
        },
    },
    server: {
        port: 3000,
        open: true,
    },
});
