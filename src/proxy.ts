import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

// Optimistic check only (cookie presence, not validity) — cheap enough to run
// on every request. It must never redirect *away* from /sign-in: a stale
// cookie (session deleted/expired server-side) would then loop between here
// and the (app) layout. The real session check lives in the (app) layout and
// the sign-in page.
export function proxy(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
	const isSignInRoute = request.nextUrl.pathname === "/sign-in";

	if (!sessionCookie && !isSignInRoute) {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
