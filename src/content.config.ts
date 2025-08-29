// 1. Import utilities from `astro:content`
import { defineCollection, z } from "astro:content";

// 2. Import loader(s)
import { glob, file } from "astro/loaders";

// 3. Define your collection(s)
const catalogue = defineCollection({
	loader: file("src/data/catalogue.yml"),
	schema: z.object({
		opus: z.string(),
		titre: z.string(),
		categorie: z.string(),
		formation: z.string(),
		instruments: z.array(z.string()),
		annee: z.number().optional().nullable(),
		nb_pages: z.number().optional().nullable(),
		duree: z.string().optional().nullable(),
		texte: z.string().optional().nullable(),
		editeur: z.string().optional().nullable(),
		commentaire: z.string().optional().nullable(),
	}),
});

// 4. Export a single `collections` object to register your collection(s)
export const collections = { catalogue };
