import {
	defaultShouldDehydrateQuery,
	MutationCache,
	QueryCache,
	QueryClient,
} from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import superjson from "superjson";

// Client-side counterpart to the redirect in `server.ts`: a session that dies
// mid-use sends the browser to /sign-in instead of leaving failed queries.
const redirectIfUnauthorized = (error: unknown) => {
	if (
		typeof window !== "undefined" &&
		error instanceof TRPCClientError &&
		error.data?.code === "UNAUTHORIZED"
	) {
		window.location.assign("/sign-in");
	}
};

export const createQueryClient = () =>
	new QueryClient({
		queryCache: new QueryCache({ onError: redirectIfUnauthorized }),
		mutationCache: new MutationCache({ onError: redirectIfUnauthorized }),
		defaultOptions: {
			queries: {
				staleTime: 30 * 1000,
			},
			dehydrate: {
				serializeData: superjson.serialize,
				shouldDehydrateQuery: (query) =>
					defaultShouldDehydrateQuery(query) ||
					query.state.status === "pending",
			},
			hydrate: {
				deserializeData: superjson.deserialize,
			},
		},
	});
