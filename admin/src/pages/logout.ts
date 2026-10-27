import type { APIRoute } from "astro";
import { SESSION_COOKIE } from "../lib/session";

export const GET: APIRoute = ({ cookies, redirect }) => {
	cookies.delete(SESSION_COOKIE, { path: "/" });
	return redirect("/login");
};
