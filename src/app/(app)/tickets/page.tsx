import React from "react";
import { ServerCrumbs } from "~/components/breadcrumb-portal";
import { TicketsTable } from "~/components/tickets-table";
import { api } from "~/trpc/server";

export default async function TicketsPage() {
	const tickets = await api.tickets.list();

	return (
		<>
			<ServerCrumbs crumbs={[{ title: "tickets" }]} />
			<React.Suspense fallback={<div>Loading...</div>}>
				<TicketsTable tickets={tickets} />
			</React.Suspense>
		</>
	);
}
