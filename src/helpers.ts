import slugify from "slugify";
import catalogue from "../data/catalogue.yml";
import concerts from "../data/concerts.yml";
import disques from "../data/disques.yml";
import editeurs from "../data/editeurs.yml";
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

export const getPaths = (items: WithId[]) =>
  items.map((item) => ({ params: { id: item.id } }));

// Catalogue

export const getCatalogue = () =>
  (catalogue as Oeuvre[]).map((o) => ({
    ...o,
    id: convertTitle(o.titre),
  })) as Array<OeuvreWithId>;
export const getOeuvre = (id: string) =>
  getter<OeuvreWithId>(id, getCatalogue());

// Concerts

export const getConcerts = () =>
  (concerts as Concert[]).map((o) => ({
    ...o,
    id: convertTitle(o.titre),
  })) as Array<ConcertWithId>;
export const getConcert = (id: string) =>
  getter<ConcertWithId>(id, getConcerts());

// Disques

export const getDisques = () =>
  (disques as Disque[]).map((o) => ({
    ...o,
    id: convertTitle(o.titre),
  })) as Array<DisqueWithId>;
export const getDisque = (id: string) => getter<DisqueWithId>(id, getDisques());

// Editeurs

export const getEditeurs = () =>
  (editeurs as Editeur[]).map((o) => ({
    ...o,
    id: convertTitle(o.titre),
  })) as Array<EditeurWithId>;
export const getEditeur = (id: string) =>
  getter<EditeurWithId>(id, getEditeurs());

// Actualites

export const getActualites = () =>
  (actualites as Actualite[]).map((o) => ({
    ...o,
    id: convertTitle(o.titre),
  })) as Array<ActualiteWithId>;
export const getActualite = (id: string) =>
  getter<ActualiteWithId>(id, getActualites());
