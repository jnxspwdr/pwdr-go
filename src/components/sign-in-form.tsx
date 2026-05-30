"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Info } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { sendOTPCode, signIn } from "~/api/auth";
import { Button } from "~/ui/button";
import { Checkbox } from "~/ui/checkbox";
import { Field, FieldError, FieldLabel } from "~/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "~/ui/input-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/ui/tooltip";

const signInFormSchema = z.object({
	email: z.email().nonempty("Please enter your email"),
	remember: z.boolean(),
});

export const SignInForm = () => {
	const [step, setStep] = React.useState(0);
	const [code, setCode] = React.useState("");

	const form = useForm<z.infer<typeof signInFormSchema>>({
		resolver: zodResolver(signInFormSchema),
		defaultValues: {
			email: "",
			remember: false,
		},
	});

	const onSubmit = async (data: z.infer<typeof signInFormSchema>) => {
		switch (step) {
			case 0:
				if (await form.trigger("email")) {
					setStep(1);
					sendOTPCode({ email: data.email });
				}
				break;
			case 1:
				if (code === "999999") {
					signIn({
						code,
						email: data.email,
						remember: data.remember,
					});
				}
				break;
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<motion.div
				className="grid gap-4"
				initial={false}
				animate={{
					translateX: step === 0 ? "0px" : "-100%",
					opacity: step === 0 ? 1 : 0,
				}}
			>
				<Controller
					control={form.control}
					name="email"
					render={({ field, fieldState }) => {
						return (
							<Field>
								<FieldLabel htmlFor={`rhf-sign-in-${field.name}`}>
									Email
								</FieldLabel>
								<div className="flex items-center">
									<InputGroup className="rounded-r-none min-w-64">
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
									<Button
										className="rounded-l-none bg-input -ml-px hover:bg-input-accent/100! focus-visible:bg-input-accent/100! focus-visible:z-10"
										variant={"outline"}
										type="submit"
									>
										<ArrowRight />
									</Button>
								</div>
							</Field>
						);
					}}
				/>
				<Controller
					control={form.control}
					name="remember"
					render={({ field, fieldState }) => {
						return (
							<Field className="w-fit" orientation={"horizontal"}>
								<Checkbox
									checked={field.value}
									onCheckedChange={(newChecked) => field.onChange(newChecked)}
									id={`rhf-sign-in-${field.name}`}
									aria-invalid={fieldState.invalid}
									type="button"
								/>
								<FieldLabel
									className="w-fit"
									disableFancy
									htmlFor={`rhf-sign-in-${field.name}`}
								>
									Remember me
								</FieldLabel>
							</Field>
						);
					}}
				/>
			</motion.div>
			<motion.div
				className="grid gap-4"
				initial={false}
				animate={{
					translateX: step === 1 ? "0px" : "100%",
					opacity: step === 1 ? 1 : 0,
				}}
			>
				Hello!
				<Button
					onClick={() => {
						setStep(0);
					}}
				>
					Back
				</Button>
			</motion.div>
			{/* <div className="grid gap-2">
				<Button type="submit" variant={"primary"}>
					Sign in
				</Button>
			</div> */}
		</form>
	);
};
