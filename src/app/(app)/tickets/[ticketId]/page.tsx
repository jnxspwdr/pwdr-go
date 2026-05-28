import { ServerCrumbs } from "~/components/breadcrumb-portal";

export default async function TicketDetailsPage({
	params,
}: {
	params: Promise<{ ticketId: string }>;
}) {
	const { ticketId } = await params;

	return (
		<div>
			<ServerCrumbs
				crumbs={[{ title: "tickets", href: "/tickets" }, { title: "details" }]}
			/>
			ticket details for {ticketId}
		</div>
	);
}
