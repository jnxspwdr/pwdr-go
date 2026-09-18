"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import React from "react";
import superjson from "superjson";
import type { AppRouter } from "~/server/api/root";
import { createQueryClient } from "~/trpc/query-client";

let clientQueryClientSingleton: QueryClient | undefined;

const getQueryClient = () => {
	// Server: always make a new query client so requests never share state.
	if (typeof window === "undefined") return createQueryClient();

	// Browser: reuse the same client across renders.
	clientQueryClientSingleton ??= createQueryClient();
	return clientQueryClientSingleton;
};

const getBaseUrl = () => {
	if (typeof window !== "undefined") return "";
	return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const trpc = createTRPCReact<AppRouter>();

export function TRPCReactProvider(props: { children: React.ReactNode }) {
	const queryClient = getQueryClient();

	const [trpcClient] = React.useState(() =>
		trpc.createClient({
			links: [
				loggerLink({
					enabled: (op) =>
						process.env.NODE_ENV === "development" ||
						(op.direction === "down" && op.result instanceof Error),
				}),
				httpBatchLink({
					transformer: superjson,
					url: `${getBaseUrl()}/api/trpc`,
				}),
			],
		}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<trpc.Provider client={trpcClient} queryClient={queryClient}>
				{props.children}
			</trpc.Provider>
		</QueryClientProvider>
	);
}
