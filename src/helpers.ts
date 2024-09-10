import slugify from "slugify";
import catalogue from "../data/catalogue.yml";
import concerts from "../data/concerts.yml";
import disques from "../data/disques.yml";
import editeurs from "../data/editeurs.yml";
import liens from "../data/liens.yml";
import actualites from "../data/actualites.yml";
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
import OeuvreComponent from "./components/catalogue/Oeuvre.astro";
import DisqueComponent from "./components/disques/Disque.astro";
import EditeurComponent from "./components/editeurs/Editeur.astro";
import ActualiteComponent from "./components/actualites/Actualite.astro";
import ConcertComponent from "./components/concerts/Concert.astro";

type ItemWithId =
	| OeuvreWithId
	| ConcertWithId
	| DisqueWithId
	| EditeurWithId
	| ActualiteWithId;

type Section<T> = {
	id: string;
	label: string;
	moreLabel: string;
	items: Array<T>;
	component: any;
};
type SectionIds =
	| "catalogue"
	| "concerts"
	| "disques"
	| "editeurs"
	| "actualites";

export const convertTitle = (title: string) => slugify(title, { lower: true });

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

export const getCatalogue = (options?: { instrumentId?: string }) => {
	const allItems = sortByOpus(decorate<Oeuvre>(catalogue, "catalogue"));
	const { instrumentId } = options || {};
	if (instrumentId) {
		console.log(instrumentId);
		if (instrumentId === convertTitle(OTHER_INSTRUMENTS)) {
			return allItems.filter(
				(oeuvre) =>
					oeuvre.instruments &&
					intersection(oeuvre.instruments, otherInstruments).length >
						0,
			);
		} else {
			return allItems.filter((oeuvre) =>
				oeuvre.instruments?.map(convertTitle).includes(instrumentId),
			);
		}
	} else {
		return allItems;
	}
};
export const getOeuvre = (id: string) =>
	getter<OeuvreWithId>(id, getCatalogue());

// Instruments

export const OTHER_INSTRUMENTS = "autres instruments";
export const otherInstruments = [
	"machine à vent",
	"saxophone",
	"harpe",
	"luth",
	"accordéon",
	"bandonéon",
	"orgue",
	"guitare",
	"célesta",
];

export const getFormations = () =>
	uniq(
		catalogue
			.filter((o) => !!o.formation)
			.map((oeuvre: OeuvreWithId) =>
				capitalizeFirstLetter(oeuvre.formation?.toLowerCase()!),
			),
	).toSorted() as string[];

export const getInstruments = () => {
	const allInstruments = catalogue
		.filter((o) => !!o.instruments)
		.map((oeuvre: OeuvreWithId) => oeuvre.instruments)
		.flat();
	const instruments = uniq(allInstruments)
		.sort()
		.filter((i) => !otherInstruments.includes(i));
	return instruments as string[];
};

// Concerts

const parseConcert = (concert: ConcertWithId) => {
	const [day, month, year] = concert.rawDate.split("/");
	return {
		...concert,
		date: new Date(`${month}/${day}/${year}`),
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

const parseActualite = (actu: ActualiteWithId) => ({
	...actu,
	date: new Date(Number(`${actu.rawDate}000`)),
});
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
export const uniq = (a) => [...new Set(a)];

// see https://youmightnotneed.com/lodash#intersection
export const intersection = (arr: any[], ...args: any[]) =>
	arr.filter((item) => args.every((arr) => arr.includes(item)));
