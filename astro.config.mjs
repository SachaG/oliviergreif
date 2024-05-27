import { defineConfig } from "astro/config";
import yaml from "@rollup/plugin-yaml";

export default defineConfig({
	vite: {
		plugins: [yaml()],
	},
	site: "https://ogreifv2.sachagreif.com",
});
