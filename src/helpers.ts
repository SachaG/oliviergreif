import slugify from "slugify";
import catalogue from "../data/catalogue.yml";
import concerts from "../data/concerts.yml";
import type { Concert, Oeuvre } from "./types";

export const convertTitle = (title: string) => slugify(title, { lower: true });

export const getCatalogueWithIds = () =>
  (catalogue as Oeuvre[]).map((o) => ({
    ...o,
    id: convertTitle(o.titre),
  })) as Array<Oeuvre & { id: string }>;

export const getConcertsWithIds = () =>
  (concerts as Concert[]).map((o) => ({
    ...o,
    id: convertTitle(o.titre),
  })) as Array<Concert & { id: string }>;
