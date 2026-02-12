import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		devtools(),
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
		viteReact(),
		tailwindcss(),
	],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	define: {
		// Polyfills for simple-peer (expects Node.js globals)
		global: "globalThis",
	},
	server: {
		cors: {
			origin: "https://www.owlbear.rodeo",
		},
	},
	test: {
		globals: true,
		environment: "jsdom",
	},
	optimizeDeps: {
		include: ["y-textarea"], // pre-bundle it as ESM
	},
});
