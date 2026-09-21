import { notFound } from "next/navigation";
import { ServerCrumbs } from "~/components/breadcrumb-portal";
import { api } from "~/trpc/server";
import { Badge } from "~/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/card";

export default async function TicketDetailsPage({
	params,
}: {
	params: Promise<{ ticketId: string }>;
}) {
	const { ticketId } = await params;

	const ticket = await api.tickets.byId({ id: ticketId });

	if (!ticket) notFound();

	return (
		<>
			<ServerCrumbs
				crumbs={[
					{ title: "tickets", href: "/tickets" },
					{ title: ticket.ticketNumber },
				]}
			/>
			<Card>
				<CardHeader>
					<CardTitle>{ticket.title}</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4">
					<div className="flex gap-2">
						<Badge>{ticket.status}</Badge>
						<Badge variant={"secondary"}>{ticket.type}</Badge>
					</div>
					<p className="whitespace-pre-wrap">{ticket.description}</p>
					<div className="text-sm text-muted-foreground">
						Reported by {ticket.reportedBy.name}
						{ticket.assignedTo
							? ` · Assigned to ${ticket.assignedTo.name}`
							: null}
					</div>
				</CardContent>
			</Card>
		</>
	);
}
