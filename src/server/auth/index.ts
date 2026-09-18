import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins/email-otp";
import { organization } from "better-auth/plugins/organization";
import { eq } from "drizzle-orm";
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
	databaseHooks: {
		session: {
			create: {
				// Every seeded user belongs to exactly one organization (no org
				// switcher yet), so pin the session to it at creation time instead
				// of resolving it per-request downstream.
				before: async (session) => {
					const [membership] = await db
						.select({ organizationId: schema.member.organizationId })
						.from(schema.member)
						.where(eq(schema.member.userId, session.userId))
						.limit(1);

					if (!membership) return;

					return { data: { activeOrganizationId: membership.organizationId } };
				},
			},
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
		organization({
			// No self-serve org creation flow yet — orgs come from src/data/seed.ts.
			allowUserToCreateOrganization: false,
		}),
	],
});

export type Session = typeof auth.$Infer.Session;
