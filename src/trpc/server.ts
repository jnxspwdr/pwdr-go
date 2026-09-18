import "server-only";

import { headers } from "next/headers";
import { cache } from "react";
import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

const createContext = cache(async () => {
	const heads = new Headers(await headers());
	heads.set("x-trpc-source", "rsc");

	return createTRPCContext({ headers: heads });
});

// Server Components call procedures directly (no HTTP round-trip) via this caller.
export const api = createCaller(createContext);
