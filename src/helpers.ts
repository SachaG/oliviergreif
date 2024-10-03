import slugify from "slugify";
import catalogue_ from "../data/catalogue.yml";
import concerts_ from "../data/concerts.yml";
import disques_ from "../data/disques.yml";
import editeurs_ from "../data/editeurs.yml";
import liens_ from "../data/liens.yml";
import actualites_ from "../data/actualites.yml";

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
} from "./types";
import OeuvreComponent from "./components/catalogue/oeuvre/Oeuvre.astro";
import DisqueComponent from "./components/disques/Disque.astro";
import EditeurComponent from "./components/editeurs/Editeur.astro";
import ActualiteComponent from "./components/actualites/Actualite.astro";
import ConcertComponent from "./components/concerts/Concert.astro";

const catalogue = catalogue_ as Oeuvre[];
const concerts = concerts_ as Concert[];
const disques = disques_ as Disque[];
const editeurs = editeurs_ as Editeur[];
const liens = liens_ as Lien[];
const actualites = actualites_ as Actualite[];

export type ItemWithId =
	| OeuvreWithId
	| ConcertWithId
	| DisqueWithId
	| EditeurWithId
	| ActualiteWithId;

export type Section<T> = {
	id: string;
	label: string;
	moreLabel: string;
	items: Array<T>;
	component: any;
};

export type SectionIds =
	| "catalogue"
	| "concerts"
	| "disques"
	| "editeurs"
	| "actualites";

export const convertTitle = (title: string) =>
	slugify(title.replaceAll("/", ""), {
		lower: true,
		remove: /[*+~.()'"!:@]/g,
	});

const getter = <T extends WithId>(id: string, items: T[]) => {
	const item = items.find((item) => item.id === id);
	if (item) {
		return item;
	} else {
		throw new Error(`Could not find item ${id}`);
	}
};

const decorate = <T extends Oeuvre | Concert | Disque | Editeur | Actualite>(
	items: T[],
	parentSlug: string,
) =>
	items.map((item) => ({
		...item,
		parentSlug,
		id: convertTitle(item.titre),
	})) as Array<T & WithId>;

// paths helpers
export const getItemsStaticPaths = (items: WithId[]) =>
	items.map((item) => ({ params: { id: item.id } }));

export const getPath = (item: ItemWithId) => `/${item.parentSlug}/${item.id}`;

// Catalogue

export const sortByOpus = (catalogue: OeuvreWithId[]) =>
	catalogue.toSorted(
		(a: OeuvreWithId, b: OeuvreWithId) => Number(a.opus) - Number(b.opus),
	);

export const getCatalogue = (options?: {
	instrumentId?: string;
	instrumentGroupId?: keyof typeof instrumentGroups;
}) => {
	const allItems = sortByOpus(decorate<Oeuvre>(catalogue, "catalogue"));
	const { instrumentId, instrumentGroupId } = options || {};
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
	} else {
		return allItems;
	}
};
export const getOeuvre = (id: string) =>
	getter<OeuvreWithId>(id, getCatalogue());

// Instruments

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
export const getFormations = () =>
	uniq(
		getCatalogue()
			.filter((o) => !!o.formation)
			.map((oeuvre: Oeuvre) =>
				capitalizeFirstLetter(oeuvre.formation?.toLowerCase()!),
			),
	).toSorted() as string[];

export const getInstruments = () => {
	const allInstruments = getCatalogue()
		.filter((o: OeuvreWithId) => !!o.instruments)
		.map((oeuvre: OeuvreWithId) => oeuvre.instruments)
		.flat() as string[];
	const groupedInstruments = Object.values(instrumentGroups).flat();
	const instruments = uniq(allInstruments)
		.sort()
		.filter((i) => !groupedInstruments.includes(i as string));
	return instruments;
};

export const getInstrumentsGroups = () =>
	Object.keys(instrumentGroups) as Array<keyof typeof instrumentGroups>;

export const isInstrumentGroup = (instrument: string) =>
	Object.keys(instrumentGroups).includes(instrument);

export const getInstrumentGroupLink = (instrumentGroupId: string) =>
	`/catalogue/instruments/${instrumentGroupId}`;

export const getInstrumentLink = (instrumentId: string) => {
	const instrumentGroupId = getInstrumentsGroups().find((id) => {
		const instruments = instrumentGroups[id];
		return instruments.includes(instrumentId);
	});
	return instrumentGroupId && getInstrumentGroupLink(instrumentGroupId);
};

// Concerts

const parseConcert = (concert: ConcertWithId) => {
	const [day, month, year] = concert.rawDate.split("/");
	const date = new Date(`${month}/${day}/${year}`);
	return {
		...concert,
		date,
		annee: date.getFullYear(),
	};
};

export const getConcerts = () =>
	decorate<Concert>(concerts, "concerts").map(parseConcert);
export const getConcert = (id: string) =>
	parseConcert(getter<ConcertWithId>(id, getConcerts()));

// Disques

export const getDisques = () => decorate<Disque>(disques, "disques");
export const getDisque = (id: string) => getter<DisqueWithId>(id, getDisques());

// Editeurs

export const getEditeurs = () => decorate<Editeur>(editeurs, "editeurs");
export const getEditeur = (id: string) =>
	getter<EditeurWithId>(id, getEditeurs());

// Actualites

const parseActualite = (actu: ActualiteWithId) => {
	const date = new Date(Number(`${actu.rawDate}000`));
	return {
		...actu,
		date,
		annee: date.getFullYear(),
	};
};

export const getActualites = () =>
	decorate<Actualite>(actualites, "actualites")
		.map(parseActualite)
		.toReversed();
export const getActualite = (id: string) =>
	parseActualite(getter<ActualiteWithId>(id, getActualites()));

// Liens

export const getLiens = () => liens as Lien[];

// Items

const allItems = {
	catalogue: {
		label: "Catalogue",
		items: getCatalogue(),
		moreLabel: "Voir toutes les oeuvres",
		component: OeuvreComponent,
	},
	concerts: {
		label: "Concerts",
		items: getConcerts(),
		moreLabel: "Voir tous les concerts",
		component: ConcertComponent,
	},
	disques: {
		label: "Disques",
		items: getDisques(),
		moreLabel: "Voir tous les disques",
		component: DisqueComponent,
	},
	editeurs: {
		label: "Éditeurs",
		items: getEditeurs(),
		moreLabel: "Voir tous les éditeurs",
		component: EditeurComponent,
	},
	actualites: {
		label: "Actualités",
		items: getActualites(),
		moreLabel: "Voir toutes les actualités",
		component: ActualiteComponent,
	},
};

export const getSection = <T>(sectionId: SectionIds) =>
	({
		id: sectionId,
		...allItems[sectionId],
	}) as Section<T>;

export const getSectionPath = <T>(section: Section<T>) => `/${section.id}`;

export function capitalizeFirstLetter(s: string) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

export const pluralize = (s: string, n: number) => (n > 1 ? `${s}s` : s);

// see https://youmightnotneed.com/lodash#uniq
export const uniq = (a: any) => [...new Set(a)];

// see https://youmightnotneed.com/lodash#intersection
export const intersection = (arr: any[], ...args: any[]) =>
	arr.filter((item) => args.every((arr) => arr.includes(item)));

export const getItemsByYear = <
	X extends OeuvreWithId | ConcertWithId | DisqueWithId | ActualiteWithId,
>(
	items: Array<X>,
) => {
	const years = uniq(items.filter((i) => i.annee).map((i) => i.annee))
		.toSorted()
		.toReversed() as number[];
	const itemsByYear: Array<{ year: number; items: X[] }> = years.map(
		(year) => ({
			year,
			items: items.filter((o) => o.annee === year),
		}),
	);
	return itemsByYear;
};
