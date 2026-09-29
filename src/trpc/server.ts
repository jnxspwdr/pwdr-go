import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

const createContext = cache(async () => {
	const heads = new Headers(await headers());
	heads.set("x-trpc-source", "rsc");

	return createTRPCContext({ headers: heads });
});

// Server Components call procedures directly (no HTTP round-trip) via this caller.
// An UNAUTHORIZED result (stale cookie, regenerated DB) redirects instead of
// throwing, so it never reaches Next's error boundary.
export const api = createCaller(createContext, {
	onError: ({ error }) => {
		if (error.code === "UNAUTHORIZED") redirect("/sign-in");
	},
});
