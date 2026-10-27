// One shared password, no user accounts: logging in sets a signed cookie
// holding the editor's name (used in commit messages) and an expiry date.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { ADMIN_PASSWORD, SESSION_SECRET } from "astro:env/server";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // seconds

type Session = { name: string; exp: number };

// the password is part of the key, so changing it signs everyone out
const sign = (payload: string) =>
	createHmac("sha256", `${SESSION_SECRET}:${ADMIN_PASSWORD}`).update(payload).digest("base64url");

const sameText = (a: string, b: string) => {
	const hash = (s: string) => createHash("sha256").update(s).digest();
	return timingSafeEqual(hash(a), hash(b));
};

export const checkPassword = (password: string) => sameText(password, ADMIN_PASSWORD);

export const createSession = (name: string) => {
	const session: Session = { name, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE };
	const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
	return `${payload}.${sign(payload)}`;
};

export const readSession = (cookie: string | undefined): Session | undefined => {
	const [payload, signature] = cookie?.split(".") ?? [];
	if (!payload || !signature || !sameText(signature, sign(payload))) return undefined;
	const session: Session = JSON.parse(Buffer.from(payload, "base64url").toString());
	return session.exp > Date.now() / 1000 ? session : undefined;
};

// at most 10 failed logins per IP address every 15 minutes (kept in memory)
const failures = new Map<string, { count: number; since: number }>();
const WINDOW = 15 * 60 * 1000;

export const isThrottled = (ip: string) => {
	const f = failures.get(ip);
	return !!f && Date.now() - f.since < WINDOW && f.count >= 10;
};
export const recordFailure = (ip: string) => {
	const f = failures.get(ip);
	failures.set(ip, f && Date.now() - f.since < WINDOW ? { ...f, count: f.count + 1 } : { count: 1, since: Date.now() });
};
export const clearFailures = (ip: string) => failures.delete(ip);
