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

export const getPath = (
	item:
		| OeuvreWithId
		| ConcertWithId
		| DisqueWithId
		| EditeurWithId
		| ActualiteWithId,
) => `/${item.parentSlug}/${item.id}`;

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
