"use server";

import z from "zod";
import { localFetch } from "~/lib/local-fetch";
import { userSchema } from "~/types/schemas/user";
import { redirect } from "next/navigation";
import { faker } from "@faker-js/faker";
import { randInt } from "~/lib/utils";
import { authStore } from "~/store.auth";

const USE_STATIC_OTP_CODE = true;

const sendOTPCodePropsSchema = z.object({
	email: z.email(),
});

export const sendOTPCode = async (
	args: z.infer<typeof sendOTPCodePropsSchema>,
) => {
	sendOTPCodePropsSchema.parse(args);
	const { email } = args;

	const data = await localFetch("users.json");
	const users = z.array(userSchema).parse(JSON.parse(data));

	if (users.some((v) => v.email === email)) {
		const code = USE_STATIC_OTP_CODE
			? "999999"
			: String().padEnd(6, String(randInt({ min: 0, max: 9 })));

		console.log("SIGN IN OTP CODE");
		console.log(code);
		console.log("SIGN IN OTP CODE");

		authStore.setState({ code, email });
	}
};

const signInPropsSchema = z.object({
	email: z.email(),
	code: z.string().min(6).max(6),
	remember: z.boolean(),
});

export const signIn = async (args: z.infer<typeof signInPropsSchema>) => {
	signInPropsSchema.parse(args);
	const { code: codeArg, email: emailArg, remember } = args;

	const data = await localFetch("users.json");
	const users = z.array(userSchema).parse(JSON.parse(data));

	const { code, email } = authStore.getState();

	if (codeArg === code && emailArg === email) {
		authStore.setState({
			user: users.find((v) => v.email === email),
			remember,
		});
	}
};
