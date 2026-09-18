import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

// Optimistic check only (cookie presence, not validity) — cheap enough to run
// on every request. Anything that actually needs the session (server
// components, protected tRPC procedures) re-verifies it against the DB.
export function proxy(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
	const isSignInRoute = request.nextUrl.pathname === "/sign-in";

	if (!sessionCookie && !isSignInRoute) {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}

	if (sessionCookie && isSignInRoute) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
