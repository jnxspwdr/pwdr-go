"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { Button } from "~/ui/button";
import { Checkbox } from "~/ui/checkbox";
import { Field, FieldError, FieldLabel } from "~/ui/field";
import { Input } from "~/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "~/ui/input-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/ui/tooltip";

const signInFormSchema = z.object({
	email: z.email().nonempty("Please enter your email"),
	password: z.string().nonempty("Please enter your password"),
	remember: z.string().optional(),
});

export const SignInForm = () => {
	const form = useForm<z.infer<typeof signInFormSchema>>({
		resolver: zodResolver(signInFormSchema),
		defaultValues: {
			email: "",
			password: "",
			remember: "",
		},
	});

	const onSubmit = (data: z.infer<typeof signInFormSchema>) => {
		console.log(data);
	};

	return (
		<form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
			<Controller
				control={form.control}
				name="email"
				render={({ field, fieldState }) => {
					return (
						<Field className="min-w-64">
							<FieldLabel htmlFor={`rhf-sign-in-${field.name}`}>
								Email
							</FieldLabel>
							<InputGroup>
								<InputGroupInput
									{...field}
									id={`rhf-sign-in-${field.name}`}
									aria-invalid={fieldState.invalid}
									autoComplete="off"
								/>
								{fieldState.invalid && (
									<InputGroupAddon align={"inline-end"}>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													className="text-destructive hover:text-destructive focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-accent dark:focus-visible:bg-accent/50"
													size={"icon-sm"}
													variant={"ghost"}
												>
													<Info />
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<FieldError errors={[fieldState.error]} />
											</TooltipContent>
										</Tooltip>
									</InputGroupAddon>
								)}
							</InputGroup>
						</Field>
					);
				}}
			/>
			<Controller
				control={form.control}
				name="password"
				render={({ field, fieldState }) => {
					return (
						<Field className="min-w-64">
							<FieldLabel htmlFor={`rhf-sign-in-${field.name}`}>
								Password
							</FieldLabel>
							<InputGroup>
								<InputGroupInput
									{...field}
									id={`rhf-sign-in-${field.name}`}
									aria-invalid={fieldState.invalid}
									type="password"
									autoComplete="off"
								/>
								{fieldState.invalid && (
									<InputGroupAddon align={"inline-end"}>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													className="text-destructive hover:text-destructive focus-visible:bg-accent dark:focus-visible:bg-accent/50 focus-visible:ring-0 focus-visible:ring-offset-0"
													size={"icon-sm"}
													variant={"ghost"}
												>
													<Info />
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<FieldError errors={[fieldState.error]} />
											</TooltipContent>
										</Tooltip>
									</InputGroupAddon>
								)}
							</InputGroup>
						</Field>
					);
				}}
			/>
			<Controller
				control={form.control}
				name="remember"
				render={({ field, fieldState }) => {
					return (
						<Field orientation={"horizontal"}>
							<Checkbox
								{...field}
								id={`rhf-sign-in-${field.name}`}
								aria-invalid={fieldState.invalid}
								type="button"
							/>
							<FieldLabel disableFancy htmlFor={`rhf-sign-in-${field.name}`}>
								Remember me
							</FieldLabel>
						</Field>
					);
				}}
			/>
			<div className="grid gap-2">
				<Button type="submit" variant={"primary"}>
					Sign in
				</Button>
				<Button type="button" variant={"secondary"}>
					Create account
				</Button>
			</div>
		</form>
	);
};
