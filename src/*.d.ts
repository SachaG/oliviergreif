// import type { Concert, Oeuvre } from "./types";

type Oeuvre = {
	opus: string;
	titre: string;
	date_comp?: number;
	nb_pages?: number;
	duree?: string;
	texte?: string;
	editeur?: string;
	creation?: string;
	commentaire?: string;
};

type Concert = {
	date: string;
	titre: string;
	oeuvres?: string[];
	interpretes?: string;
	adresse?: string;
	commentaire?: string;
};

// Specify the file extension you want to import
declare module "*.yml" {
	const value: any; // Add type definitions here if desired
	export default value;
}

declare module "../data/catalogue.yml" {
	const value: Oeuvre[]; // Add type definitions here if desired
	export default value;
}

declare module "../data/concerts.yml" {
	const value: Concert[]; // Add type definitions here if desired
	export default value;
}
