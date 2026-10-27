import type { APIRoute } from "astro";
import {
	entryPath,
	getCollection,
	getReferenceFields,
	getReferenceOptions,
	isValidId,
	makeId,
	toYaml,
} from "../../../lib/content";
import { ConflictError, storage } from "../../../lib/storage";

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const conflict = () =>
	json({ error: "Cette entrée a été modifiée entre-temps. Rechargez la page pour voir la dernière version." }, 409);

// save an entry; id "new" creates one, named after its French title
export const PUT: APIRoute = async ({ params, request, locals }) => {
	const collection = getCollection(params.collection);
	if (!collection) return json({ error: "Collection inconnue" }, 404);
	if (params.id !== "new" && !isValidId(params.id)) return json({ error: "Identifiant invalide" }, 400);
	const { data, sha } = (await request.json()) as { data: unknown; sha?: string };

	// same validation as the site's build
	const result = collection.schema.safeParse(data);
	if (!result.success) {
		const errors = result.error.issues.map((i) => `${i.path.join(" › ") || "entrée"} : ${i.message}`);
		return json({ errors }, 400);
	}
	const entry = result.data as Record<string, any>;

	// referenced entries (e.g. works of a concert) must exist
	const options = await getReferenceOptions(collection.schema);
	const errors = Object.entries(getReferenceFields(collection.schema)).flatMap(([field, ref]) => {
		const known = new Set(options[ref].map((o) => o.value));
		return ([] as string[])
			.concat(entry[field] ?? [])
			.filter((value) => !known.has(value))
			.map((value) => `${field} : « ${value} » n’existe pas`);
	});
	if (errors.length) return json({ errors }, 400);

	let id = params.id!;
	const isNew = id === "new";
	if (isNew) {
		// add a number if the id is already taken
		const base = makeId(entry.titre?.fr ?? "");
		id = base;
		for (let n = 2; await storage.readFile(entryPath(collection.folder, id)); n++) id = `${base}_${n}`;
	}

	const message = `${collection.label} : ${entry.titre?.fr ?? id} (${isNew ? "ajout" : "modification"} par ${locals.editor})`;
	try {
		await storage.writeFile(entryPath(collection.folder, id), toYaml(entry), isNew ? undefined : sha, message);
	} catch (error) {
		if (error instanceof ConflictError) return conflict();
		throw error;
	}
	return json({ id, sha: (await storage.readFile(entryPath(collection.folder, id)))?.sha });
};

export const DELETE: APIRoute = async ({ params, url, locals }) => {
	const collection = getCollection(params.collection);
	const sha = url.searchParams.get("sha");
	if (!collection || !isValidId(params.id) || !sha) return json({ error: "Requête invalide" }, 400);
	try {
		await storage.deleteFile(
			entryPath(collection.folder, params.id!),
			sha,
			`${collection.label} : ${params.id} (suppression par ${locals.editor})`,
		);
	} catch (error) {
		if (error instanceof ConflictError) return conflict();
		throw error;
	}
	return json({ ok: true });
};
