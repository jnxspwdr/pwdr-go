"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserRoundIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useCrumbs } from "~/components/breadcrumb-portal";
import { trpc } from "~/trpc/react";
import { TICKET_PRIORITIES } from "~/types/schemas/ticket";
import { Badge } from "~/ui/badge";
import { Button } from "~/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "~/ui/field";
import { Input } from "~/ui/input";
import { Textarea } from "~/ui/textarea";

const newTicketFormSchema = z.object({
	title: z
		.string()
		.min(4, "Title must be at least 4 characters.")
		.max(128, "Title must be at most 128 characters."),
	description: z
		.string()
		.max(256, "Description must at most be 256 characters."),
	priority: z.enum(TICKET_PRIORITIES),
});

export default function NewTicketPage() {
	useCrumbs([
		{ title: "tickets", href: "/tickets" },
		{
			title: "foo",
			children: [
				{
					title: "dashboard",
					href: "/dashboard",
				},
			],
		},
		{ title: "new" },
	]);

	const router = useRouter();
	const searchParams = useSearchParams();
	const aboutUserId = searchParams.get("about");

	const aboutUser = trpc.users.byId.useQuery(
		{ id: aboutUserId ?? "" },
		{ enabled: !!aboutUserId },
	);

	const createTicket = trpc.tickets.create.useMutation({
		onSuccess: (ticket) => {
			router.push(`/tickets/${ticket.id}`);
		},
	});

	const form = useForm<z.infer<typeof newTicketFormSchema>>({
		resolver: zodResolver(newTicketFormSchema),
		defaultValues: {
			title: "",
			description: "",
			priority: 20,
		},
	});

	return (
		<>
			<div className="@container">
				<form
					onSubmit={form.handleSubmit((data) => {
						createTicket.mutate({
							...data,
							assignedToId: aboutUserId ?? undefined,
						});
					})}
				>
					<FieldGroup>
						{aboutUser.data && (
							<Field>
								<Badge variant="secondary" className="w-fit">
									<UserRoundIcon />
									Reporting: {aboutUser.data.name}
								</Badge>
							</Field>
						)}
						<Controller
							control={form.control}
							name="title"
							render={({ field, fieldState }) => {
								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="title-input">Title</FieldLabel>
										<Input
											{...field}
											id="title-input"
											aria-invalid={fieldState.invalid}
											placeholder="Chrome crashes on launch..."
											autoComplete="off"
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								);
							}}
						/>
						<Controller
							control={form.control}
							name="description"
							render={({ field, fieldState }) => {
								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="description-textarea">
											Description
										</FieldLabel>
										<Textarea
											{...field}
											id="description-textarea"
											aria-invalid={fieldState.invalid}
											placeholder="Whenever I launch Chrome, it crashes after reaching my home page..."
											autoComplete="off"
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								);
							}}
						/>
						<Field>
							<Button type="submit" disabled={createTicket.isPending}>
								{createTicket.isPending ? "Creating..." : "Create ticket"}
							</Button>
							{createTicket.isError && (
								<div className="text-sm text-destructive">
									{createTicket.error.message}
								</div>
							)}
						</Field>
					</FieldGroup>
				</form>
			</div>
		</>
	);
}
