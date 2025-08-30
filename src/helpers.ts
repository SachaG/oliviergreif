import slugify from "slugify";
import type { WithId } from "./types";

// see https://youmightnotneed.com/lodash#intersection
export const intersection = (arr: any[], ...args: any[]) =>
	arr.filter((item) => args.every((arr) => arr.includes(item)));

export const convertTitle = (title: string = "") =>
	slugify(title.replaceAll("°", "_").replaceAll("/", ""), {
		lower: true,
		remove: /[*+~.()'"!:@]/g,
	});

export function truncateWords(text: string, maxWords: number) {
	// Trim leading/trailing whitespace and split the text into an array of words
	const words = text.trim().split(/\s+/);

	// If the number of words is already less than or equal to maxWords, return the original text
	if (words.length <= maxWords) {
		return text;
	}

	// Take the first 'maxWords' and join them back with a space
	const truncatedText = words.slice(0, maxWords).join(" ");

	// Add the ellipsis if truncation occurred
	return `${truncatedText}…`;
}

export const pluralize = (s: string, n: number) => (n > 1 ? `${s}s` : s);

// see https://youmightnotneed.com/lodash#uniq
export const uniq = <T>(a: T[]) => [...new Set(a)];

// see https://youmightnotneed.com/lodash#uniq
export const compact = <T>(a: T[]) =>
	a.filter((item) => item !== undefined && item !== null);

export const getItemsStaticPaths = (items: WithId[]) =>
	items.map((item) => ({ params: { id: getItemSlug(item) } }));

export const getItemSlug = (item: WithId) =>
	item.slug || item.id.replaceAll("_", "-");

export const getItemIdFromSlug = (slug: string) => slug.replaceAll("-", "_");

export const getDomain = (url: string) => {
	const domain = new URL(url);
	let hostname = domain.hostname;
	hostname = domain.hostname.replace("www.", "");
	return hostname;
};
