import { formatRelative } from "date-fns";
import Link from "next/link";
import { api } from "~/trpc/server";
import { Badge } from "~/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/card";

export const RecentCasesCard = async () => {
	const tickets = await api.tickets.list({ limit: 5 });

	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent cases</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{tickets.length === 0 && (
					<span className="text-muted-foreground text-sm">No cases yet.</span>
				)}
				{tickets.map((ticket) => (
					<Link
						key={ticket.id}
						href={`/tickets/${ticket.id}`}
						className="flex items-center justify-between gap-4 text-sm hover:underline"
					>
						<span className="flex min-w-0 flex-col">
							<span className="truncate font-medium">{ticket.title}</span>
							<span className="text-muted-foreground text-xs">
								{formatRelative(ticket.updatedAt, new Date())}
							</span>
						</span>
						<Badge>{ticket.status}</Badge>
					</Link>
				))}
			</CardContent>
		</Card>
	);
};
