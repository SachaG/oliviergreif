import { getCollection, getEntry } from "astro:content";

import slugify from "slugify";
// import catalogue_ from "./data/catalogue.yml";
import concerts_ from "./data/concerts.yml";
import disques_ from "./data/disques.yml";
import editeurs_ from "./data/editeurs.yml";
import liens_ from "./data/liens.yml";
import actualites_ from "./data/actualites.yml";
import photos_ from "./data/photos.yml";

import sortBy from "lodash/sortBy";

import type {
	WithId,
	Concert,
	Disque,
	Editeur,
	Oeuvre,
	Actualite,
	OeuvreWithId,
	ConcertWithId,
	DisqueWithId,
	EditeurWithId,
	ActualiteWithId,
	Lien,
	Photo,
	PhotoWithId,
	EditeurWithCount,
	LienExterne,
} from "./types";

// see https://youmightnotneed.com/lodash#intersection
export const intersection = (arr: any[], ...args: any[]) =>
	arr.filter((item) => args.every((arr) => arr.includes(item)));

export const decorate = <
	T extends Oeuvre | Concert | Disque | Editeur | Actualite | Photo,
>(
	items: T[],
	parentSlug: string,
) =>
	items.map((item) => ({
		...item,
		parentSlug,
		id: convertTitle(item.titre),
	})) as Array<T & WithId>;

export const convertTitle = (title: string = "") =>
	slugify(title.replaceAll("/", ""), {
		lower: true,
		remove: /[*+~.()'"!:@]/g,
	});

export const getter = <T extends WithId>(id: string, items: T[]) => {
	const item = items.find((item) => item.id === id);
	if (item) {
		return item;
	} else {
		throw new Error(`Could not find item ${id}`);
	}
};

// Catalogue

export const sortByOpus = (catalogue: OeuvreWithId[]) =>
	catalogue.toSorted(
		(a: OeuvreWithId, b: OeuvreWithId) => Number(a.opus) - Number(b.opus),
	);

export const getOeuvre = (id: string) =>
	getter<OeuvreWithId>(id, getCatalogue());

export const getOeuvreByTitre = (titre: string) =>
	getCatalogue().find((oeuvre) => oeuvre.titre === titre);

export const instrumentGroups = {
	violon: ["violon"],
	piano: ["piano"],
	alto: ["alto"],
	violoncelle: ["violoncelle"],
	percussions: ["batterie", "percussions"],
	cuivres: ["saxophone", "cor", "trompette"],
	vents: ["vents", "flûte", "hautbois", "clarinette", "basson", "bois"],
	voix: [
		"voix",
		"mezzo soprano",
		"soprano",
		"ténor",
		"alto (voix)",
		"baryton",
		"chœur",
		"basse (voix)",
		"soli",
	],
	"clavier-et-orgue": [
		"synthétiseur",
		"clavecin",
		"orgue",
		"orgue électronique",
	],
	"autres-instruments": [
		"machine à vent",
		"harpe",
		"luth",
		"accordéon",
		"bandonéon",
		"orgue",
		"guitare",
		"célesta",
		"orchestre",
	],
};

const catalogue = await getCollection("catalogue");

export const getCatalogue = (options?: {
	instrumentId?: string;
	editeurId?: string;
	instrumentGroupId?: keyof typeof instrumentGroups;
	categoryId?: string;
}) => {
	const rawCatalog = catalogue.map((c) => c.data as Oeuvre);
	const allItems = sortByOpus(decorate<Oeuvre>(rawCatalog, "catalogue"));
	const { instrumentId, instrumentGroupId, categoryId, editeurId } =
		options || {};
	if (instrumentGroupId) {
		return allItems.filter(
			(oeuvre) =>
				oeuvre.instruments &&
				intersection(
					oeuvre.instruments,
					instrumentGroups[instrumentGroupId],
				).length > 0,
		);
	} else if (instrumentId) {
		return allItems.filter((oeuvre) =>
			oeuvre.instruments?.map(convertTitle).includes(instrumentId),
		);
	} else if (categoryId) {
		return allItems.filter((oeuvre) => oeuvre.categorie === categoryId);
	} else if (editeurId) {
		return allItems.filter((oeuvre) => oeuvre.editeur === editeurId);
	} else {
		return allItems;
	}
};
