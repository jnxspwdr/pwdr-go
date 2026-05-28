import React from "react";
import { getTickets } from "~/api/get-tickets";
import { ServerCrumbs } from "~/components/breadcrumb-portal";
import { TicketsTable } from "~/components/tickets-table";

export default async function TicketsPage() {
	const tickets = await getTickets();

	return (
		<>
			<ServerCrumbs crumbs={[{ title: "tickets" }]} />
			<React.Suspense fallback={<div>Loading...</div>}>
				<TicketsTable tickets={tickets} />
			</React.Suspense>
		</>
	);
}
