// 1. Import utilities from `astro:content`
import { defineCollection, reference, z } from "astro:content";

// 2. Import loader(s)
import { glob, file } from "astro/loaders";

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
		oeuvres: z.array(reference("catalogue")).optional(),
		image: z.string().optional().nullable(),
		ecouter: z.array(lien).optional().nullable(),
		acheter: z.array(lien).optional().nullable(),
		liens: z.array(lien).optional().nullable(),
	}),
});

// 4. Export a single `collections` object to register your collection(s)
export const collections = { catalogue, disques };
