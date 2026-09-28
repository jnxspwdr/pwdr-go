"use client";

import { format } from "date-fns";
import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { trpc } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/shared";
import { TICKET_PRIORITIES } from "~/types/schemas/ticket";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "~/ui/alert-dialog";
import { Badge } from "~/ui/badge";
import { Button } from "~/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/card";
import { Field, FieldContent, FieldGroup, FieldLabel } from "~/ui/field";
import { Input } from "~/ui/input";
import { Textarea } from "~/ui/textarea";

type Ticket = RouterOutputs["tickets"]["byId"];

const priorityLabel = (priority: number) => {
	const entry = Object.entries(TICKET_PRIORITIES).find(
		([, value]) => value === priority,
	);

	return entry?.[0] ?? String(priority);
};

const statusVariant = (
	status: Ticket["status"],
): React.ComponentPropsWithoutRef<typeof Badge>["variant"] => {
	switch (status) {
		case "closed":
			return "secondary";
		case "in progress":
			return "info";
		case "waiting":
			return "warn";
		case "open":
			return "success";
	}
};

export const TicketDetails = ({ ticket }: { ticket: Ticket }) => {
	const router = useRouter();

	const setStatus = trpc.tickets.setStatus.useMutation({
		onSuccess: () => router.refresh(),
	});
	const escalate = trpc.tickets.escalate.useMutation({
		onSuccess: () => router.refresh(),
	});

	const isPending = setStatus.isPending || escalate.isPending;
	const isClosed = ticket.status === "closed";
	const closeLabel = ticket.type === "support incident" ? "Close" : "Complete";
	const fullyEscalated =
		ticket.priority >= TICKET_PRIORITIES.high &&
		ticket.status === "in progress";

	return (
		<div className="grid items-start gap-6 lg:grid-cols-[1fr_16rem]">
			<Card>
				<CardHeader>
					<CardTitle>{ticket.title}</CardTitle>
				</CardHeader>
				<CardContent>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="ticket-number-input">
								Ticket number
							</FieldLabel>
							<Input
								id="ticket-number-input"
								value={ticket.ticketNumber}
								readOnly
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="description-textarea">
								Description
							</FieldLabel>
							<Textarea
								id="description-textarea"
								value={ticket.description}
								readOnly
								className="min-h-24"
							/>
						</Field>

						<Field orientation="responsive">
							<FieldLabel disableFancy>Status</FieldLabel>
							<FieldContent>
								<Badge variant={statusVariant(ticket.status)}>
									{ticket.status}
								</Badge>
							</FieldContent>
						</Field>
						<Field orientation="responsive">
							<FieldLabel disableFancy>Type</FieldLabel>
							<FieldContent>
								<Badge variant="secondary">{ticket.type}</Badge>
							</FieldContent>
						</Field>
						<Field orientation="responsive">
							<FieldLabel disableFancy>Priority</FieldLabel>
							<FieldContent>
								<Badge variant="outline">
									{priorityLabel(ticket.priority)}
								</Badge>
							</FieldContent>
						</Field>

						<Field>
							<FieldLabel htmlFor="reported-by-input">Reported by</FieldLabel>
							<Input
								id="reported-by-input"
								value={ticket.reportedBy.name}
								readOnly
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="assigned-to-input">Assigned to</FieldLabel>
							<Input
								id="assigned-to-input"
								value={ticket.assignedTo?.name ?? "Unassigned"}
								readOnly
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="created-at-input">Created</FieldLabel>
							<Input
								id="created-at-input"
								value={format(ticket.createdAt, "PPp")}
								readOnly
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="updated-at-input">Last active</FieldLabel>
							<Input
								id="updated-at-input"
								value={format(ticket.updatedAt, "PPp")}
								readOnly
							/>
						</Field>
					</FieldGroup>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Actions</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-2">
					{isClosed ? (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="outline" disabled={isPending}>
									<RotateCcwIcon />
									Reopen
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Reopen this ticket?</AlertDialogTitle>
									<AlertDialogDescription>
										Sets the status back to open so it shows up in the active
										queue again.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={() =>
											setStatus.mutate({ id: ticket.id, status: "open" })
										}
									>
										Reopen
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					) : (
						<>
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button disabled={isPending}>{closeLabel}</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											{closeLabel} this ticket?
										</AlertDialogTitle>
										<AlertDialogDescription>
											Marks it as closed. You can reopen it later if needed.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction
											onClick={() =>
												setStatus.mutate({ id: ticket.id, status: "closed" })
											}
										>
											{closeLabel}
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>

							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										variant="outline"
										disabled={isPending || fullyEscalated}
									>
										<TriangleAlertIcon />
										Escalate
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Escalate this ticket?</AlertDialogTitle>
										<AlertDialogDescription>
											Bumps the priority up a tier and moves it to in progress.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction
											onClick={() => escalate.mutate({ id: ticket.id })}
										>
											Escalate
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</>
					)}
					{(setStatus.isError || escalate.isError) && (
						<div className="text-sm text-destructive">
							{(setStatus.error ?? escalate.error)?.message}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
