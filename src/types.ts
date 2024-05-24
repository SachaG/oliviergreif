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
};

export type Concert = {
  date: string;
  titre: string;
  oeuvres?: string[];
  interpretes?: string;
  adresse?: string;
  commentaire?: string;
};
