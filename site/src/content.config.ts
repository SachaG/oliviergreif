// 1. Import utilities from `astro:content`
import { defineCollection, reference, z } from "astro:content";

// 2. Import loader(s)
import { glob, file } from "astro/loaders";
import { actualiteSchema, concertSchema } from "@ogreif/shared/schemas";

import catalogueData from "@data/catalogue.yml";

// let other collections reference catalogue items by title as well as by id
const catalogueIdsByTitle = new Map<string, string>(
	catalogueData.map((oeuvre: { id: string; titre: string }) => [oeuvre.titre, oeuvre.id]),
);
const oeuvreReference = () =>
	z.preprocess(
		(value) => (typeof value === "string" && catalogueIdsByTitle.get(value)) || value,
		reference("catalogue"),
	);

const instruments = [
	// clavier
	"piano",
	"clavecin",
	"orgue_electronique",
	"celesta",
	"synthetiseur",
	"orgue",

	// cordes
	"violon",
	"alto",
	"violoncelle",
	// vents et cuivres
	"flute",
	"trompette",
	"cor",
	"vents",
	"saxophone",
	"hautbois",
	"basson",
	"clarinette",
	"bois",
	"cuivres",

	// voix
	"choeur",
	"voix",
	"soprano_voix",
	"tenor_voix",
	"mezzo_soprano_voix",
	"baryton_voix",
	"alto_voix",
	"basse_voix",
	"soli_voix",
	"choeur",
	// percussions
	"percussions",
	"batterie",
	// autres
	"guitare",
	"luth",
	"machine_a_vent",
	"bandoneon",
	"accordeon",
	"orchestre",
	"harpe",
];

// 3. Define your collection(s)
const catalogue = defineCollection({
	loader: file("src/data/catalogue.yml"),
	schema: z.object({
		id: z.string(),
		opus: z.string(),
		titre: z.string(),
		categorie: z.string(),
		formation: z.string(),
		instruments: z.array(z.enum(instruments)),
		annee: z.number().optional().nullable(),
		partitionUrl: z.string().optional(),
		nb_pages: z.number().optional().nullable(),
		duree: z.string().optional().nullable(),
		texte: z.string().optional().nullable(),
		editeur: z.string().optional().nullable(),
		commentaire: z.string().optional().nullable(),
	}),
});

const lien = z.object({
	url: z.string().optional(),
	titre: z.string().optional(),
	id: z.string().optional(),
});

const disques = defineCollection({
	loader: file("src/data/disques.yml"),
	schema: z.object({
		id: z.string(),
		titre: z.string(),
		annee: z.number(),
		interpretes_disque: z.string().nullable(),
		maison: z.string().nullable(),
		oeuvres: z.array(oeuvreReference()).optional(),
		image: z.string().optional().nullable(),
		ref: z.coerce.string().optional().nullable(),
		maisonUrl: z.string().optional().nullable(),
		commentaire: z.string().optional().nullable(),
		ecouter: z.array(lien).optional().nullable(),
		acheter: z.array(lien).optional().nullable(),
		liens: z.array(lien).optional().nullable(),
		articles: z.array(lien).optional().nullable(),
	}),
});

// one YAML file per entry, named after its id (src/data/actualites/<id>.yml)
const yamlFolder = (base: string) =>
	glob({
		pattern: "*.yml",
		base,
		generateId: ({ entry }) => entry.replace(/\.yml$/, ""),
	});

// schemas are shared with the admin (shared/src/schemas.ts)
const actualites = defineCollection({
	loader: yamlFolder("src/data/actualites"),
	schema: actualiteSchema,
});

const editeurs = defineCollection({
	loader: file("src/data/editeurs.yml"),
	schema: z.object({
		id: z.string(),
		titre: z.string(),
		url: z.string().optional().nullable(),
		adresse: z.string().optional().nullable(),
		commentaire: z.string().optional().nullable(),
	}),
});

const photos = defineCollection({
	loader: file("src/data/photos.yml"),
	schema: z.object({
		id: z.string(),
		titre: z.string(),
		image: z.string(),
	}),
});

const liens = defineCollection({
	loader: file("src/data/liens.yml"),
	schema: z.object({
		id: z.string(),
		texte: z.string(),
	}),
});

const concerts = defineCollection({
	loader: yamlFolder("src/data/concerts"),
	schema: concertSchema.extend({
		oeuvres: z.array(oeuvreReference()).optional(),
	}),
});

// 4. Export a single `collections` object to register your collection(s)
export const collections = {
	catalogue,
	disques,
	concerts,
	actualites,
	editeurs,
	photos,
	liens,
};
