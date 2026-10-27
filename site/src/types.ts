export type WithId = {
	id: string;
};

export type WithSlug = WithId & {
	parentSlug?: string;
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

// a reference to a catalogue item, as stored in other collections
export type OeuvreReference = { id: string; collection?: string };

export type Oeuvre = {
	id: string;
	opus: string;
	titre: string;
	annee?: number;
	nb_pages?: number;
	duree?: string;
	texte?: string;
	partitionUrl?: string;
	editeur?: string;
	creation?: string;
	commentaire?: string;
	formation?: string;
	instruments?: string[];
	categorie?: string;
	ecouter?: MusicService[];
};
export type OeuvreWithId = Oeuvre & WithSlug;

// a concert as rendered, with its text fields in the requested language
export type Concert = {
	id: string;
	date: Date;
	// start time, 24-hour "HH:MM"
	heure?: string;
	annee?: number;
	titre: string;
	oeuvres?: OeuvreReference[];
	interpretes?: string;
	adresse?: string;
	commentaire?: string;
};
export type ConcertWithId = Concert & WithSlug;

export type Disque = {
	id: string;
	titre: string;
	oeuvres?: OeuvreReference[];
	date_disque?: string;
	annee?: number;
	interpretes_disque?: string;
	commentaire?: string;
	maison?: string;
	maisonUrl?: string;
	image?: string;
	ref?: string;
	ecouter?: MusicService[];
	liens?: Lien[];
	acheter?: Lien[];
	articles?: Lien[];
};
export type DisqueWithId = Disque & WithSlug;

export type Editeur = {
	id: string;
	titre: string;
	url?: string;
	adresse?: string;
	commentaire?: string;
};
export type EditeurWithId = Editeur & WithSlug;

export type EditeurWithCount = EditeurWithId & { count: number };

// a news item as rendered, with its text fields in the requested language
export type Actualite = {
	id: string;
	date: Date;
	annee?: number;
	titre: string;
	texte: string;
};
export type ActualiteWithId = Actualite & WithSlug;

export type LienExterne = {
	id: string;
	texte: string;
};

export type Photo = {
	id: string;
	titre: string;
	image: string;
};

export type PhotoWithId = Photo & WithSlug;
