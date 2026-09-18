import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins/email-otp";
import { env } from "~/env";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";

export const auth = betterAuth({
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	// This is a fixed-roster internal tool (users are seeded, see src/data/seed.ts) —
	// nobody self-registers through the sign-in form.
	user: {
		additionalFields: {
			firstName: { type: "string", required: true, input: false },
			lastName: { type: "string", required: false, input: false },
			gender: { type: "string", required: true, input: false },
			pronouns: { type: "string[]", required: true, input: false },
			phoneNumber: { type: "string", required: true, input: false },
		},
	},
	plugins: [
		emailOTP({
			otpLength: 6,
			disableSignUp: true,
			async sendVerificationOTP({ email, otp, type }) {
				// No email provider is wired up yet — log instead of sending.
				console.log(`[auth] ${type} OTP for ${email}: ${otp}`);
			},
		}),
	],
});

export type Session = typeof auth.$Infer.Session;
