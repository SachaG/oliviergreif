export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];

// language of the site's URLs and UI when none is requested
export const defaultLocale: Locale = "en";

// language the content is originally written in; other languages fall back to it
export const sourceLocale: Locale = "fr";

export type Localized<T = string> = { [key in Locale]?: T } & { fr: T };

// a localized value in the requested language, else in the source language
export const localize = <T>(value: Localized<T> | undefined, locale: Locale) =>
	value?.[locale] ?? value?.[sourceLocale];
