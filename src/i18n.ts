export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

// BCP 47 tags used for Intl formatting, <html lang>, hreflang…
export const localeCodes: { [key in Locale]: string } = {
	en: "en-US",
	fr: "fr-FR",
};

// labels shown in the language switcher, always in their own language
export const localeNames: { [key in Locale]: string } = {
	en: "English",
	fr: "Français",
};

export const isLocale = (s?: string): s is Locale =>
	locales.includes(s as Locale);

// pass Astro.currentLocale; falls back to the default locale
export const getLocale = (currentLocale?: string): Locale =>
	isLocale(currentLocale) ? currentLocale : defaultLocale;

const localePrefix = new RegExp(`^/(${locales.join("|")})(?=/|$)`);

export const pathHasLocale = (path: string) => localePrefix.test(path);

// "/catalogue" => "/fr/catalogue"
// external URLs, protocol-relative URLs, anchors, files (/images/x.jpg)
// and already-localized paths are left untouched
export const localizePath = (path: string, locale: Locale) => {
	if (
		!path.startsWith("/") ||
		path.startsWith("//") ||
		/\.[a-z0-9]+$/i.test(path) ||
		pathHasLocale(path)
	) {
		return path;
	}
	return `/${locale}${path === "/" ? "/" : path}`;
};

// "/fr/catalogue" => "/catalogue"
export const unlocalizePath = (path: string) =>
	path.replace(localePrefix, "") || "/";

// same page in another locale: "/fr/catalogue" => "/en/catalogue"
export const switchPathLocale = (path: string, locale: Locale) =>
	localizePath(unlocalizePath(path), locale);

// getStaticPaths for pages that only vary by locale
export const getLocaleStaticPaths = () =>
	locales.map((lang) => ({ params: { lang } }));
