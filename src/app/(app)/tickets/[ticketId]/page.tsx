import { notFound } from "next/navigation";
import { ServerCrumbs } from "~/components/breadcrumb-portal";
import { TicketDetails } from "~/components/ticket-details";
import { api } from "~/trpc/server";

export default async function TicketDetailsPage({
	params,
}: {
	params: Promise<{ ticketId: string }>;
}) {
	const { ticketId } = await params;

	const ticket = await api.tickets.byId({ id: ticketId }).catch(() => null);

	if (!ticket) notFound();

	return (
		<>
			<ServerCrumbs
				crumbs={[
					{ title: "tickets", href: "/tickets" },
					{ title: ticket.ticketNumber },
				]}
			/>
			<TicketDetails ticket={ticket} />
		</>
	);
}
