// Schemas for the content edited in the admin. The site's content.config.ts
// extends them with Astro-only pieces (references), and the admin generates
// its forms from them, so both always agree on the data.
//
// `.meta()` keys used by the admin:
// - title: field label
// - widget: "textarea" | "html" | "time" (default: a one-line text input)
// - reference: name of the collection a value points to
// - localized: the field holds one value per locale ({ fr, en })
import { z } from "zod";

// one value per locale; French is the source language and is required
export const localized = <T extends z.ZodType>(schema: T) =>
	z
		.object({
			fr: schema,
			en: schema.optional(),
		})
		.meta({ localized: true });

// "2024-06-04"; unquoted YAML dates are parsed into Date objects, so accept those too
export const isoDate = z.preprocess(
	(value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
	z.iso.date(),
);

export const concertSchema = z.object({
	titre: localized(z.string()).meta({ title: "Titre" }),
	date: isoDate.meta({ title: "Date" }),
	heure: z
		.string()
		.regex(/^\d{2}:\d{2}$/)
		.optional()
		.meta({ title: "Heure", widget: "time" }),
	oeuvres: z
		.array(z.string().meta({ reference: "catalogue" }))
		.optional()
		.meta({ title: "Œuvres" }),
	interpretes: localized(z.string()).meta({ title: "Interprètes", widget: "textarea" }),
	adresse: z.string().meta({ title: "Adresse", widget: "textarea" }),
	commentaire: localized(z.string())
		.optional()
		.meta({ title: "Commentaire", widget: "html" }),
});
export type ConcertData = z.infer<typeof concertSchema>;

export const actualiteSchema = z.object({
	titre: localized(z.string()).meta({ title: "Titre" }),
	date: isoDate.meta({ title: "Date" }),
	texte: localized(z.string()).meta({ title: "Texte", widget: "html" }),
});
export type ActualiteData = z.infer<typeof actualiteSchema>;

// collections editable in the admin, with the folder holding one YAML file per entry
export const editableCollections = {
	concerts: { label: "Concerts", folder: "site/src/data/concerts", schema: concertSchema },
	actualites: { label: "Actualités", folder: "site/src/data/actualites", schema: actualiteSchema },
} as const;
export type EditableCollectionId = keyof typeof editableCollections;
