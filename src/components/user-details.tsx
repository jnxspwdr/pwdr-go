"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FlagIcon, PencilIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { trpc } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/shared";
import { AGREEMENT_TYPES, JOB_SITES, JOB_TITLES } from "~/types/schemas/user";
import { Badge } from "~/ui/badge";
import { Button } from "~/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/card";
import {
	Field,
	FieldContent,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "~/ui/field";
import { Input } from "~/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/ui/select";

type User = RouterOutputs["users"]["byId"];

const editUserFormSchema = z.object({
	phoneNumber: z.e164("Enter a valid phone number."),
	jobSite: z.enum(JOB_SITES),
	jobTitle: z.enum(JOB_TITLES),
	agreement: z.enum(AGREEMENT_TYPES),
});

export const UserDetails = ({ user }: { user: User }) => {
	const router = useRouter();
	const [isEditing, setIsEditing] = React.useState(false);

	const updateUser = trpc.users.update.useMutation({
		onSuccess: () => {
			setIsEditing(false);
			router.refresh();
		},
	});

	const form = useForm<z.infer<typeof editUserFormSchema>>({
		resolver: zodResolver(editUserFormSchema),
		values: {
			phoneNumber: user.phoneNumber,
			jobSite: user.jobSite as (typeof JOB_SITES)[number],
			jobTitle: user.jobTitle as (typeof JOB_TITLES)[number],
			agreement: user.agreement,
		},
	});

	const handleCancel = () => {
		form.reset();
		setIsEditing(false);
	};

	return (
		<div className="grid items-start gap-6 lg:grid-cols-[1fr_16rem]">
			<Card>
				<CardHeader>
					<CardTitle>{user.name}</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						id="edit-user-form"
						onSubmit={form.handleSubmit((data) =>
							updateUser.mutate({ id: user.id, ...data }),
						)}
					>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="name-input">Name</FieldLabel>
								<Input id="name-input" value={user.name} readOnly />
							</Field>
							<Field>
								<FieldLabel htmlFor="email-input">Email</FieldLabel>
								<Input id="email-input" value={user.email} readOnly />
							</Field>
							<Field>
								<FieldLabel htmlFor="gender-input">Gender</FieldLabel>
								<Input id="gender-input" value={user.gender} readOnly />
							</Field>
							<Field>
								<FieldLabel disableFancy>Pronouns</FieldLabel>
								<FieldContent className="flex-row flex-wrap gap-1">
									{user.pronouns.map((pronoun) => (
										<Badge key={pronoun} variant="outline">
											{pronoun}
										</Badge>
									))}
								</FieldContent>
							</Field>

							<FieldSeparator>Work</FieldSeparator>

							<Controller
								control={form.control}
								name="phoneNumber"
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="phone-input">Phone number</FieldLabel>
										<Input
											{...field}
											id="phone-input"
											readOnly={!isEditing}
											aria-invalid={fieldState.invalid}
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
							<Controller
								control={form.control}
								name="jobTitle"
								render={({ field, fieldState }) =>
									isEditing ? (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel disableFancy htmlFor="job-title-select">
												Job title
											</FieldLabel>
											<Select
												value={field.value}
												onValueChange={field.onChange}
											>
												<SelectTrigger id="job-title-select" className="w-full">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{JOB_TITLES.map((title) => (
														<SelectItem key={title} value={title}>
															{title}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</Field>
									) : (
										<Field>
											<FieldLabel htmlFor="job-title-input">
												Job title
											</FieldLabel>
											<Input
												id="job-title-input"
												value={field.value}
												readOnly
											/>
										</Field>
									)
								}
							/>
							<Controller
								control={form.control}
								name="jobSite"
								render={({ field, fieldState }) =>
									isEditing ? (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel disableFancy htmlFor="job-site-select">
												Job site
											</FieldLabel>
											<Select
												value={field.value}
												onValueChange={field.onChange}
											>
												<SelectTrigger id="job-site-select" className="w-full">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{JOB_SITES.map((site) => (
														<SelectItem key={site} value={site}>
															{site}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</Field>
									) : (
										<Field>
											<FieldLabel htmlFor="job-site-input">Job site</FieldLabel>
											<Input id="job-site-input" value={field.value} readOnly />
										</Field>
									)
								}
							/>
							<Controller
								control={form.control}
								name="agreement"
								render={({ field, fieldState }) =>
									isEditing ? (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel disableFancy htmlFor="agreement-select">
												Agreement
											</FieldLabel>
											<Select
												value={field.value}
												onValueChange={field.onChange}
											>
												<SelectTrigger id="agreement-select" className="w-full">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{AGREEMENT_TYPES.map((agreement) => (
														<SelectItem key={agreement} value={agreement}>
															{agreement}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</Field>
									) : (
										<Field>
											<FieldLabel htmlFor="agreement-input">
												Agreement
											</FieldLabel>
											<Input
												id="agreement-input"
												value={field.value}
												readOnly
											/>
										</Field>
									)
								}
							/>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Actions</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-2">
					{isEditing ? (
						<>
							<Button
								type="submit"
								form="edit-user-form"
								disabled={updateUser.isPending}
							>
								{updateUser.isPending ? "Saving..." : "Save"}
							</Button>
							<Button
								variant="outline"
								onClick={handleCancel}
								disabled={updateUser.isPending}
							>
								Cancel
							</Button>
						</>
					) : (
						<Button variant="outline" onClick={() => setIsEditing(true)}>
							<PencilIcon />
							Edit
						</Button>
					)}
					<Button asChild variant="outline">
						<Link href={`/tickets/new?about=${user.id}`}>
							<FlagIcon />
							Report
						</Link>
					</Button>
					{updateUser.isError && (
						<div className="text-sm text-destructive">
							{updateUser.error.message}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
