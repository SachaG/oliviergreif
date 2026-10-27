import node from "@astrojs/node";
import react from "@astrojs/react";
import { defineConfig, envField } from "astro/config";

export default defineConfig({
	output: "server",
	adapter: node({ mode: "standalone" }),
	integrations: [react()],
	security: { checkOrigin: true },
	env: {
		schema: {
			ADMIN_PASSWORD: envField.string({ context: "server", access: "secret" }),
			SESSION_SECRET: envField.string({ context: "server", access: "secret" }),
			// without a token, the admin edits the local checkout instead of GitHub (development)
			GITHUB_TOKEN: envField.string({ context: "server", access: "secret", optional: true }),
			GITHUB_REPO: envField.string({ context: "server", access: "public", default: "SachaG/oliviergreif" }),
			GITHUB_BRANCH: envField.string({ context: "server", access: "public", default: "main" }),
		},
	},
});
