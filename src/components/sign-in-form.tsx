"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { sendOTPCode, signIn } from "~/api/auth";
import { Button } from "~/ui/button";
import { Checkbox } from "~/ui/checkbox";
import { Field, FieldError, FieldLabel } from "~/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "~/ui/input-group";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "~/ui/input-otp";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/ui/tooltip";

const signInFormSchema = z.object({
	email: z.email().nonempty("Please enter your email"),
	code: z.string().min(6).max(6),
});

export const SignInForm = () => {
	const [step, setStep] = React.useState(0);
	const otpRef = React.useRef<HTMLInputElement>(null);

	const form = useForm<z.infer<typeof signInFormSchema>>({
		resolver: zodResolver(signInFormSchema),
		defaultValues: {
			email: "",
			code: "",
		},
	});

	const validateEmailStep = async () => {
		if (await form.trigger("email")) {
			setStep(1);
			sendOTPCode({ email: form.getValues("email") });
			otpRef.current?.focus();
		}
	};

	const onSubmit = async (data: z.infer<typeof signInFormSchema>) => {
		signIn({
			code: data.code,
			email: data.email,
		});
	};

	return (
		<div className="grid gap-6 max-w-80">
			<form className="relative" onSubmit={form.handleSubmit(onSubmit)}>
				<motion.div
					className="grid gap-4"
					initial={false}
					animate={{
						translateX: step === 0 ? "0px" : "-100%",
						opacity: step === 0 ? 1 : 0,
					}}
					transition={{
						ease: "easeInOut",
					}}
				>
					<div className="space-y-2 pb-4">
						<h1 className="text-2xl">
							Sign in to{" "}
							<span className="font-medium">
								pwdr <span className="text-indigo-600 font-bold">GO</span>
							</span>
						</h1>
						<div>
							Enter your email below and
							<br />
							we&apos;ll send you an OTP code to sign in with!
						</div>
					</div>
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
												onKeyDown={(ev) => {
													if (ev.key === "Enter") {
														ev.preventDefault();
														void validateEmailStep();
													}
												}}
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
											onClick={() => validateEmailStep()}
										>
											<ArrowRight />
										</Button>
									</div>
								</Field>
							);
						}}
					/>
				</motion.div>
				<motion.div
					className="grid gap-4 inset-0 absolute justify-center"
					initial={false}
					animate={{
						translateX: step === 1 ? "0px" : "100%",
						opacity: step === 1 ? 1 : 0,
					}}
					transition={{
						ease: "easeInOut",
					}}
				>
					<div className="space-y-2">
						<h1 className="text-2xl">
							Sign in to{" "}
							<span className="font-medium">
								pwdr <span className="text-indigo-600 font-bold">GO</span>
							</span>
						</h1>
						<div>Enter the OTP code we sent below</div>
					</div>
					<Controller
						control={form.control}
						name="code"
						render={({ field }) => {
							return (
								<InputOTP
									containerClassName="w-fit mx-auto"
									maxLength={6}
									value={field.value}
									onChange={(newValue) => field.onChange(newValue)}
									ref={otpRef}
								>
									<InputOTPGroup>
										<InputOTPSlot index={0} />
										<InputOTPSlot index={1} />
										<InputOTPSlot index={2} />
										<InputOTPSlot index={3} />
										<InputOTPSlot index={4} />
										<InputOTPSlot index={5} />
									</InputOTPGroup>
								</InputOTP>
							);
						}}
					/>
					<div className="flex items-center gap-2">
						<Button
							className="flex-1"
							onClick={() => setStep(0)}
							variant={"secondary"}
						>
							<ArrowLeft /> Back
						</Button>
						<Button className="flex-1" variant={"primary"} type="submit">
							Sign in
						</Button>
					</div>
				</motion.div>
				{/* <div className="grid gap-2">
					<Button type="submit" variant={"primary"}>
						Sign in
					</Button>
				</div> */}
			</form>
		</div>
	);
};
