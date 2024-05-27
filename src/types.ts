export type WithId = {
	id: string;
	parentSlug: string;
};

export type Oeuvre = {
	opus: string;
	titre: string;
	date_comp?: number;
	nb_pages?: number;
	duree?: string;
	texte?: string;
	editeur?: string;
	creation?: string;
	commentaire?: string;
	formation?: string;
};
export type OeuvreWithId = Oeuvre & WithId;

export type Concert = {
	date: string;
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
	interpretes_disque?: string;
	commentaire?: string;
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
	date: number;
	titre: string;
	texte: string;
};
export type ActualiteWithId = Actualite & WithId;
