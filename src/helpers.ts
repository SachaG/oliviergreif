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

type SectionItem =
	| OeuvreWithId
	| ConcertWithId
	| DisqueWithId
	| EditeurWithId
	| ActualiteWithId;

type Section = {
	id: string;
	label: string;
	moreLabel: string;
	items: Array<SectionItem>;
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

export const getPath = (item: SectionItem) => `/${item.parentSlug}/${item.id}`;

// Catalogue

export const getCatalogue = () => decorate<Oeuvre>(catalogue, "catalogue");
export const getOeuvre = (id: string) =>
	getter<OeuvreWithId>(id, getCatalogue());

// Concerts

export const getConcerts = () => decorate<Concert>(concerts, "concerts");
export const getConcert = (id: string) =>
	getter<ConcertWithId>(id, getConcerts());

// Disques

export const getDisques = () => decorate<Disque>(disques, "disques");
export const getDisque = (id: string) => getter<DisqueWithId>(id, getDisques());

// Editeurs

export const getEditeurs = () => decorate<Editeur>(editeurs, "editeurs");
export const getEditeur = (id: string) =>
	getter<EditeurWithId>(id, getEditeurs());

// Actualites

export const getActualites = () =>
	decorate<Actualite>(actualites, "actualites");
export const getActualite = (id: string) =>
	getter<ActualiteWithId>(id, getActualites());

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
export const getSection = (sectionId: SectionIds) => ({
	id: sectionId,
	...allItems[sectionId],
});

export const getSectionPath = (section: Section) => `/${section.id}`;
