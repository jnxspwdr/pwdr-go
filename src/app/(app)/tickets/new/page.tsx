"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useCrumbs } from "~/components/breadcrumb-portal";
import { TICKET_PRIORITIES } from "~/types/schemas/ticket";
import { Button } from "~/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from "~/ui/field";
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
					onSubmit={form.handleSubmit(
						(data: z.infer<typeof newTicketFormSchema>) => {
							console.log(data);
						},
					)}
				>
					<FieldGroup>
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
							<Button type="submit">Create ticket</Button>
						</Field>
					</FieldGroup>
				</form>
			</div>
		</>
	);
}
