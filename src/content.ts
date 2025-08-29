import slugify from "slugify";
// import catalogue_ from "./data/catalogue.yml";
import concerts_ from "./data/concerts.yml";
import disques_ from "./data/disques.yml";
import editeurs_ from "./data/editeurs.yml";
import liens_ from "./data/liens.yml";
import actualites_ from "./data/actualites.yml";
import photos_ from "./data/photos.yml";
import { getItemSlug, intersection } from "./helpers";
import sortBy from "lodash/sortBy";

import fr from "./locales/fr.yml";

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
// import OeuvreComponent from "./components/catalogue/oeuvre/Oeuvre.astro";
// import DisqueComponent from "./components/disques/Disque.astro";
// import EditeurComponent from "./components/editeurs/Editeur.astro";
// import ActualiteComponent from "./components/actualites/Actualite.astro";
// import ConcertComponent from "./components/concerts/Concert.astro";

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

export const decorate = <
	T extends Oeuvre | Concert | Disque | Editeur | Actualite | Photo,
>(
	items: T[],
	parentSlug: string,
) =>
	items.map((item) => {
		const id = item.id || convertTitle(item.titre);
		const slug = id.replaceAll("_", "-");
		return {
			...item,
			id,
			slug,
			parentSlug,
		};
	}) as Array<T & WithId>;

export const getter = <T extends WithId>(id: string, items: T[]) => {
	const item = items.find((item) => item.id === id);
	if (item) {
		return item;
	} else {
		throw new Error(`Could not find item ${id}`);
	}
};

const concerts = concerts_ as Concert[];
const disques = disques_ as Disque[];
const editeurs = editeurs_ as Editeur[];
const liens = liens_ as LienExterne[];
const actualites = actualites_ as Actualite[];
const photos = photos_ as Photo[];

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

export enum SectionId {
	CATALOGUE = "catalogue",
	CONCERTS = "concerts",
	DISQUES = "disques",
	EDITEURS = "editeurs",
	BIOGRAPHIE = "biographie",
	LIENS = "liens",
	ACTUALITES = "actualites",
	PHOTOS = "photos",
}

export const convertTitle = (title: string = "") =>
	slugify(title.replaceAll("°", "-").replaceAll("/", ""), {
		lower: true,
		remove: /[*+~.()'"!:@]/g,
	});

export const getPath = (item: ItemWithId) =>
	`/${item.parentSlug}/${getItemSlug(item)}`;

// Catalogue
const catalogue = await getCollection("catalogue");

export const sortByOpus = (catalogue: OeuvreWithId[]) =>
	catalogue.toSorted(
		(a: OeuvreWithId, b: OeuvreWithId) => Number(a.opus) - Number(b.opus),
	);

export const getOeuvre = (id: string) =>
	getter<OeuvreWithId>(id, getCatalogue());
export const getOeuvreBySlug = (slug: string) =>
	getCatalogue().find((o) => o.slug === slug);

export const getOeuvreByTitre = (titre: string) =>
	getCatalogue().find((oeuvre) => oeuvre.titre === titre);

export const getCatalogue = (options?: {
	instrumentId?: string;
	editeurId?: string;
	instrumentGroupId?: keyof typeof instrumentGroups;
	categoryId?: string;
}) => {
	const collectionData = catalogue.map(
		({ data, id }) => ({ ...data, id }) as OeuvreWithId,
	);
	const decoratedData = decorate<Oeuvre>(collectionData, "catalogue");
	const allItems = sortByOpus(decoratedData);
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

// Instruments

export const getFormations = () =>
	uniq(
		getCatalogue()
			.filter((o) => !!o.formation)
			.map((oeuvre: Oeuvre) =>
				capitalizeFirstLetter(oeuvre.formation?.toLowerCase()!),
			),
	).toSorted() as string[];

type Category = {
	id: string;
	count: number;
};
export const getCategories = () => {
	const categoryIds = compact(
		uniq(getCatalogue().map((oeuvre) => oeuvre.categorie)),
	);
	const categories = categoryIds.map((id) => ({
		id,
		count: getCatalogue({ categoryId: id }).length,
	}));
	return sortBy<Category>(categories, "count").toReversed();
};

export const getCategoryLink = (categoryId: string) =>
	`/catalogue/categorie/${categoryId}`;

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

type InstrumentGroup = {
	id: keyof typeof instrumentGroups;
	count: number;
};

export const getInstrumentsGroups = () =>
	sortBy<InstrumentGroup>(
		(
			Object.keys(instrumentGroups) as Array<
				keyof typeof instrumentGroups
			>
		).map((id) => ({
			id,
			count: getCatalogue({ instrumentGroupId: id }).length,
		})),
		"count",
	).toReversed();

export const isInstrumentGroup = (instrument: string) =>
	Object.keys(instrumentGroups).includes(instrument);

export const getInstrumentGroupLink = (instrumentGroupId: string) =>
	`/catalogue/instruments/${instrumentGroupId}`;

export const getInstrumentLink = (instrumentId: string) => {
	const instrumentGroup = getInstrumentsGroups().find(({ id }) => {
		const instruments = instrumentGroups[id];
		return instruments?.includes(instrumentId);
	});
	return instrumentGroup && getInstrumentGroupLink(instrumentGroup.id);
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
export const getConcertBySlug = (slug: string) =>
	getConcerts().find((c) => c.slug === slug);

// Disques

export const getDisques = () =>
	sortBy<DisqueWithId>(
		decorate<Disque>(disques, "disques"),
		"annee",
	).toReversed();
export const getDisque = (id: string) => getter<DisqueWithId>(id, getDisques());
export const getDisqueBySlug = (slug: string) =>
	getDisques().find((d) => d.slug === slug);

// Editeurs

export const getEditeurs = () => {
	const editeursWithIds = decorate<Editeur>(editeurs, "editeurs");
	const editeursWithCounts: EditeurWithCount[] = editeursWithIds.map(
		(editeur) => ({
			...editeur,
			count: getCatalogue({ editeurId: editeur.titre }).length,
		}),
	);
	return sortBy<EditeurWithCount>(editeursWithCounts, "count").toReversed();
};

export const getEditeur = (id: string) =>
	getter<EditeurWithId>(id, getEditeurs());

export const getEditeurBySlug = (slug: string) =>
	getEditeurs().find((e) => e.slug === slug);

export const getEditeurByTitle = (title: string) =>
	getEditeurs().find((e) => e.titre === title);

export const getEditeurCatalogLink = (editeur: EditeurWithId) =>
	`/catalogue/editeur/${editeur.slug}`;

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
export const getActualiteBySlug = (slug: string) =>
	getActualites().find((a) => a.slug === slug);

// Liens

export const getLiens = () => liens as LienExterne[];

// Photos

export const getPhotos = () => decorate<Photo>(photos, "photos");

export const getPhoto = (id: string) => getter<PhotoWithId>(id, getPhotos());

// Sections

export const getSectionPath = <T>(sectionId: SectionId) => `/${sectionId}`;

export function capitalizeFirstLetter(s: string) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

// FooterLinks

import footerLinks from "./data/footer_links.yml";

type FooterLinks = {
	id: string;
};
export const getFooterLinks = () => footerLinks as FooterLinks[];

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
	const unknownYear = {
		year: "???",
		items: items.filter((o) => !o.annee),
	};
	return [...itemsByYear, unknownYear];
};

const anim = {
	old: {
		name: "bump",
		duration: "2s",
		easing: "ease-in",
		direction: "reverse",
	},
	new: {
		name: "bump",
		duration: "2s",
		easing: "ease-in-out",
	},
};

export const customTransition = {
	forwards: anim,
	backwards: anim,
};

// export const sections = [
// 	{ id: "concerts", color: "#71a0e2" },
// 	{ id: "catalogue", color: "#8bdacd" },
// 	{ id: "disques", color: "#d6a2bf" },
// 	{ id: "editeurs", color: "#c49c67" },
// 	{ id: "actualites", color: "#aa90c1" },
// 	{ id: "biographie", color: "#e7e082" },
// 	{ id: "association", color: "#88ade5" },
// 	{ id: "liens", color: "#df755d" },
// 	{ id: "media", color: "#72e69e" },
// 	{ id: "contact", color: "#d486b7" },
// ];

// export const sections = [
// 	{ id: "concerts", color: "#1BB4D3" },
// 	{ id: "catalogue", color: "#41AFC5" },
// 	{ id: "disques", color: "#5CAFBF" },
// 	{ id: "editeurs", color: "#79B5C0" },
// 	{ id: "actualites", color: "#93B6BC" },
// 	{ id: "biographie", color: "#72A4AC" },
// 	{ id: "association", color: "#599EAA" },
// 	{ id: "liens", color: "#4792A0" },
// 	{ id: "media", color: "#3A8B9A" },
// 	{ id: "contact", color: "#287B8A" },
// ];

type SectionDefinition = {
	id: SectionId;
	color: string;
	showOnHome?: boolean;
};

export const sections: SectionDefinition[] = [
	{ id: SectionId.CONCERTS, color: "#FB4F4C", showOnHome: true },
	{ id: SectionId.CATALOGUE, color: "#7df665ff", showOnHome: true },
	{ id: SectionId.DISQUES, color: "#FB4F4C", showOnHome: true },
	{ id: SectionId.EDITEURS, color: "#55a5bbff", showOnHome: false },
	{ id: SectionId.ACTUALITES, color: "#5AF0F7", showOnHome: true },
	{ id: SectionId.BIOGRAPHIE, color: "#C27DFF", showOnHome: true },
	{ id: SectionId.PHOTOS, color: "#697BFE", showOnHome: true },
];
export const getSection2 = (sectionId: SectionId) => {
	const section = sections.find((s) => s.id === sectionId);
	if (!section) {
		throw new Error(`Could not find section ${sectionId}`);
	}
	return section;
};

import CatalogueSection from "./components/catalogue/CatalogueSection.astro";
import DisquesSection from "./components/disques/DisquesSection.astro";
import ConcertsSection from "./components/concerts/ConcertsSection.astro";
import ActualitesSection from "./components/actualites/ActualitesSection.astro";
import BiographieSection from "./components/biographie/BiographieSection.astro";
import MediaSection from "./components/media/MediaSection.astro";
import PhotosSection from "./components/photos/PhotosSection.astro";
import { getCollection } from "astro:content";
import { compact, uniq } from "./helpers";

const sectionComponents: { [key in SectionId]?: any } = {
	[SectionId.CATALOGUE]: CatalogueSection,
	[SectionId.CONCERTS]: ConcertsSection,
	[SectionId.DISQUES]: DisquesSection,
	[SectionId.ACTUALITES]: ActualitesSection,
	[SectionId.BIOGRAPHIE]: BiographieSection,
	[SectionId.PHOTOS]: PhotosSection,
};

export const getSectionComponent = (sectionId: SectionId) =>
	sectionComponents[sectionId];

export const strings: TranslationItem[] = fr.strings;

export type TranslationItem = {
	key: string;
	t: string;
};
export const getCurrentLocale = () => "fr-FR";
export const getString = (
	k: string,
	options: {
		kPlural?: string;
		count?: number;
		fallback?: string;
	} = {},
) => {
	const { kPlural, count, fallback } = options;
	const t = strings.find((s) => s.key === k)?.t;
	const tPlural =
		kPlural &&
		count &&
		count > 1 &&
		strings.find((s) => s.key === kPlural)?.t;
	return { t, tPlural };
};
