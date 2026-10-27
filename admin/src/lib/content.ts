// Entries of the editable collections: one YAML file per entry, named after its id.
import YAML from "yaml";
import { z } from "zod";
import { locales } from "@ogreif/shared/i18n";
import { editableCollections, type EditableCollectionId } from "@ogreif/shared/schemas";
import { storage } from "./storage";

// validation messages in French, like the rest of the admin
z.config(z.locales.fr());

export type Entry = { id: string; sha: string; data: Record<string, any> };
export type Option = { value: string; label: string };

export const getCollection = (id: string | undefined) =>
	id && id in editableCollections ? editableCollections[id as EditableCollectionId] : undefined;

// ids come from URLs: only allow the characters existing ids use, so a path can't escape the folder
export const isValidId = (id: string | undefined) => !!id && /^[a-z0-9_-]+$/.test(id);

export const entryPath = (folder: string, id: string) => {
	if (!isValidId(id)) throw new Error(`Invalid id: ${id}`);
	return `${folder}/${id}.yml`;
};

const toEntry = (name: string, sha: string, content: string): Entry => ({
	id: name.replace(/\.yml$/, ""),
	sha,
	data: YAML.parse(content) ?? {},
});

// newest first
export const listEntries = async (folder: string) =>
	(await storage.readFolder(folder))
		.filter((file) => file.name.endsWith(".yml"))
		.map((file) => toEntry(file.name, file.sha, file.content))
		.sort((a, b) => String(b.data.date ?? "").localeCompare(String(a.data.date ?? "")));

export const readEntry = async (folder: string, id: string) => {
	const file = await storage.readFile(entryPath(folder, id));
	return file && toEntry(file.name, file.sha, file.content);
};

// same style as the files the site was migrated with: no line wrapping
export const toYaml = (data: unknown) => YAML.stringify(data, { lineWidth: 0 });

// "Quintette à Laon" -> "quintette_a_laon", the convention of the existing ids
export const makeId = (title: string) =>
	title
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "") || "entree";

// whether every localized field that has a French value also has all other languages
export const isTranslated = (data: Record<string, any>) =>
	Object.values(data)
		.filter((v) => v && typeof v === "object" && "fr" in v)
		.every((v) => locales.every((locale) => v[locale]));

// options for fields pointing to another collection (`reference` in the schema meta)
let catalogueCache: { sha: string; options: Option[] } | undefined;
const loadCatalogue = async (): Promise<Option[]> => {
	const file = await storage.readFile("site/src/data/catalogue.yml");
	if (!file) return [];
	if (catalogueCache?.sha !== file.sha) {
		const items: Array<{ id: string; titre: string; opus?: string }> = YAML.parse(file.content);
		catalogueCache = {
			sha: file.sha,
			options: items.map((o) => ({ value: o.id, label: o.opus ? `Opus ${o.opus} — ${o.titre}` : o.titre })),
		};
	}
	return catalogueCache.options;
};
const referenceLoaders: Record<string, () => Promise<Option[]>> = { catalogue: loadCatalogue };

// names of the collections a schema references, e.g. { oeuvres: "catalogue" }
export const getReferenceFields = (schema: z.ZodType) => {
	const json = z.toJSONSchema(schema) as { properties: Record<string, any> };
	return Object.fromEntries(
		Object.entries(json.properties)
			.map(([field, prop]) => [field, prop.items?.reference ?? prop.reference])
			.filter(([, ref]) => ref),
	) as Record<string, string>;
};

export const getReferenceOptions = async (schema: z.ZodType) => {
	const refs = getReferenceFields(schema);
	const options: Record<string, Option[]> = {};
	for (const ref of new Set(Object.values(refs))) options[ref] = (await referenceLoaders[ref]?.()) ?? [];
	return options;
};
