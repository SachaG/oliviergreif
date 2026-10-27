// Reads and writes repository files, either on GitHub (production) or in the
// local checkout (development, when GITHUB_TOKEN isn't set).
// `sha` identifies the version of a file that was read: saving with an outdated
// sha fails with a ConflictError instead of overwriting someone else's changes.
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { GITHUB_BRANCH, GITHUB_REPO, GITHUB_TOKEN } from "astro:env/server";

export type StoredFile = { name: string; content: string; sha: string };

export class ConflictError extends Error {}

type Storage = {
	label: string;
	readFolder(folder: string): Promise<StoredFile[]>;
	readFile(filePath: string): Promise<StoredFile | undefined>;
	// sha undefined = create a new file, which must not exist yet
	writeFile(filePath: string, content: string, sha: string | undefined, message: string): Promise<void>;
	deleteFile(filePath: string, sha: string, message: string): Promise<void>;
};

const githubStorage = (token: string): Storage => {
	const [owner, name] = GITHUB_REPO.split("/");
	const headers = {
		Authorization: `Bearer ${token}`,
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
	};
	const contentsUrl = (filePath: string) =>
		`https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;

	const send = async (filePath: string, method: "PUT" | "DELETE", body: object) => {
		const res = await fetch(contentsUrl(filePath), {
			method,
			headers,
			body: JSON.stringify({ ...body, branch: GITHUB_BRANCH }),
		});
		// 409: sha doesn't match; 422: creating a file that already exists
		if (res.status === 409 || res.status === 422) throw new ConflictError();
		if (!res.ok) throw new Error(`GitHub ${method} ${filePath}: ${res.status} ${await res.text()}`);
	};

	return {
		label: `GitHub (${GITHUB_REPO}, ${GITHUB_BRANCH})`,
		// one GraphQL request returns every file of the folder with its text
		async readFolder(folder) {
			const res = await fetch("https://api.github.com/graphql", {
				method: "POST",
				headers,
				body: JSON.stringify({
					query: `query($owner: String!, $name: String!, $expression: String!) {
						repository(owner: $owner, name: $name) {
							object(expression: $expression) {
								... on Tree { entries { name oid object { ... on Blob { text } } } }
							}
						}
					}`,
					variables: { owner, name, expression: `${GITHUB_BRANCH}:${folder}` },
				}),
			});
			if (!res.ok) throw new Error(`GitHub GraphQL: ${res.status} ${await res.text()}`);
			const { data } = await res.json();
			const entries: Array<{ name: string; oid: string; object: { text: string } }> =
				data?.repository?.object?.entries ?? [];
			return entries.map((e) => ({ name: e.name, sha: e.oid, content: e.object.text }));
		},
		async readFile(filePath) {
			const res = await fetch(`${contentsUrl(filePath)}?ref=${GITHUB_BRANCH}`, { headers });
			if (res.status === 404) return undefined;
			if (!res.ok) throw new Error(`GitHub GET ${filePath}: ${res.status}`);
			const file = await res.json();
			return {
				name: file.name,
				sha: file.sha,
				content: Buffer.from(file.content, "base64").toString("utf8"),
			};
		},
		writeFile: (filePath, content, sha, message) =>
			send(filePath, "PUT", { message, sha, content: Buffer.from(content).toString("base64") }),
		deleteFile: (filePath, sha, message) => send(filePath, "DELETE", { message, sha }),
	};
};

// the repository root, one level above admin/
const localFilesStorage = (root = path.resolve(process.cwd(), "..")): Storage => {
	const hash = (content: string) => createHash("sha1").update(content).digest("hex");
	const read = async (filePath: string) => {
		try {
			return await fs.readFile(path.join(root, filePath), "utf8");
		} catch {
			return undefined;
		}
	};
	const checkSha = async (filePath: string, sha: string | undefined) => {
		const current = await read(filePath);
		if ((current === undefined) !== (sha === undefined) || (current && hash(current) !== sha)) {
			throw new ConflictError();
		}
	};
	return {
		label: "fichiers locaux",
		async readFolder(folder) {
			const names = await fs.readdir(path.join(root, folder));
			return Promise.all(
				names.map(async (name) => {
					const content = (await read(path.join(folder, name))) ?? "";
					return { name, content, sha: hash(content) };
				}),
			);
		},
		async readFile(filePath) {
			const content = await read(filePath);
			return content === undefined ? undefined : { name: path.basename(filePath), content, sha: hash(content) };
		},
		async writeFile(filePath, content, sha) {
			await checkSha(filePath, sha);
			await fs.writeFile(path.join(root, filePath), content);
		},
		async deleteFile(filePath, sha) {
			await checkSha(filePath, sha);
			await fs.unlink(path.join(root, filePath));
		},
	};
};

export const storage = GITHUB_TOKEN ? githubStorage(GITHUB_TOKEN) : localFilesStorage();
