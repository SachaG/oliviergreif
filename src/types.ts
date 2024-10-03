export type WithId = {
	id: string;
	parentSlug: string;
};

export type Oeuvre = {
	opus: string;
	titre: string;
	annee?: number;
	nb_pages?: number;
	duree?: string;
	texte?: string;
	editeur?: string;
	creation?: string;
	commentaire?: string;
	formation?: string;
	instruments?: string[];
};
export type OeuvreWithId = Oeuvre & WithId;

export type Concert = {
	rawDate: string;
	date: Date;
	annee?: number;
	titre: string;
	oeuvres?: string[];
	interpretes?: string;
	adresse?: string;
	commentaire?: string;
};
export type ConcertWithId = Concert & WithId;

export type Disque = {
	titre: string;
	oeuvres?: string[];
	date_disque?: string;
	annee?: number;
	interpretes_disque?: string;
	commentaire?: string;
	maison?: string;
};
export type DisqueWithId = Disque & WithId;

export type Editeur = {
	titre: string;
	url?: string;
	adresse?: string;
	commentaire?: string;
};
export type EditeurWithId = Editeur & WithId;

export type Actualite = {
	rawDate: number;
	date: Date;
	annee?: number;
	titre: string;
	texte: string;
};
export type ActualiteWithId = Actualite & WithId;

export type Lien = {
	texte: string;
};
