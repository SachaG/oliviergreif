export type WithId = {
	id: string;
	parentSlug: string;
	slug: string;
};

export enum MusicServiceId {
	APPLE_MUSIC = "apple_music",
	SPOTIFY = "spotify",
	YOUTUBE = "youtube",
}

export type MusicService = {
	id: MusicServiceId;
	url: string;
	titre?: string;
};

export type Lien = {
	id?: string;
	url: string;
	titre?: string;
};

export type Oeuvre = {
	id: string;
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
	categorie?: string;
	ecouter?: MusicService[];
};
export type OeuvreWithId = Oeuvre & WithId;

export type Concert = {
	id: string;
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
	id: string;
	titre: string;
	oeuvres?: string[];
	date_disque?: string;
	annee?: number;
	interpretes_disque?: string;
	commentaire?: string;
	maison?: string;
	image?: string;
	ref?: string;
	ecouter?: MusicService[];
	liens?: Lien[];
	acheter?: Lien[];
};
export type DisqueWithId = Disque & WithId;

export type Editeur = {
	id: string;
	titre: string;
	url?: string;
	adresse?: string;
	commentaire?: string;
};
export type EditeurWithId = Editeur & WithId;

export type EditeurWithCount = EditeurWithId & { count: number };

export type Actualite = {
	id: string;
	rawDate: number;
	date: Date;
	annee?: number;
	titre: string;
	texte: string;
};
export type ActualiteWithId = Actualite & WithId;

export type LienExterne = {
	texte: string;
};

export type Photo = {
	id: string;
	titre: string;
	image: string;
};

export type PhotoWithId = Photo & WithId;
