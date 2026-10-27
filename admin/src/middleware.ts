import { defineMiddleware } from "astro:middleware";
import { readSession, SESSION_COOKIE } from "./lib/session";

// everything except these paths requires being logged in
const PUBLIC_PATHS = ["/login", "/healthz", "/robots.txt"];

export const onRequest = defineMiddleware((context, next) => {
	if (PUBLIC_PATHS.includes(context.url.pathname)) return next();
	const session = readSession(context.cookies.get(SESSION_COOKIE)?.value);
	if (!session) {
		return context.url.pathname.startsWith("/api/")
			? new Response("Non connecté", { status: 401 })
			: context.redirect("/login");
	}
	context.locals.editor = session.name;
	return next();
});
