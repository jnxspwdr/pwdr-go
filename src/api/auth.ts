"use server";

import { redirect } from "next/navigation";
import z from "zod";
import { localFetch } from "~/lib/local-fetch";
import { randInt } from "~/lib/utils";
import { authStore } from "~/store.auth";
import { userSchema } from "~/types/schemas/user";

const USE_STATIC_OTP_CODE = true;
const STATIC_OTP_CODE = "999999";

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
		console.log("here");

		const code = USE_STATIC_OTP_CODE
			? STATIC_OTP_CODE
			: Array.from({ length: 6 })
					.map(() => randInt({ min: 0, max: 9 }))
					.join();

		if (!USE_STATIC_OTP_CODE) {
			console.log("SIGN IN OTP CODE");
			console.log(code);
			console.log("SIGN IN OTP CODE");
		}
		authStore.setState({ code, email });
	}
};

const signInPropsSchema = z.object({
	email: z.email(),
	code: z.string().min(6).max(6),
});

export const signIn = async (args: z.infer<typeof signInPropsSchema>) => {
	signInPropsSchema.parse(args);
	const { code: codeArg, email: emailArg } = args;

	const data = await localFetch("users.json");
	const users = z.array(userSchema).parse(JSON.parse(data));

	const { code, email } = authStore.getState();

	if (codeArg === code && emailArg === email) {
		console.log(users.find((v) => v.email === email));
		authStore.setState({
			user: users.find((v) => v.email === email),
		});
		redirect("/dashboard");
	}
};
