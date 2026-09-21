import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { createTRPCRouter, orgProcedure } from "~/server/api/trpc";
import { member, user } from "~/server/db/schema";
import { AGREEMENT_TYPES, JOB_SITES, JOB_TITLES } from "~/types/schemas/user";

export const usersRouter = createTRPCRouter({
	list: orgProcedure.query(async ({ ctx }) => {
		const memberships = await ctx.db.query.member.findMany({
			where: eq(member.organizationId, ctx.org.id),
			with: { user: true },
		});

		return memberships.map((m) => m.user);
	}),

	byId: orgProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const membership = await ctx.db.query.member.findFirst({
				where: and(
					eq(member.userId, input.id),
					eq(member.organizationId, ctx.org.id),
				),
				with: { user: true },
			});

			if (!membership) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return membership.user;
		}),

	// Only the HR/operational fields are editable here — name, email, gender,
	// and pronouns are identity fields (name/email tied to better-auth's own
	// session/login) and stay read-only on the details page.
	update: orgProcedure
		.input(
			z.object({
				id: z.string(),
				phoneNumber: z.e164(),
				jobSite: z.enum(JOB_SITES),
				jobTitle: z.enum(JOB_TITLES),
				agreement: z.enum(AGREEMENT_TYPES),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const membership = await ctx.db.query.member.findFirst({
				where: and(
					eq(member.userId, input.id),
					eq(member.organizationId, ctx.org.id),
				),
			});

			if (!membership) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const [updated] = await ctx.db
				.update(user)
				.set({
					phoneNumber: input.phoneNumber,
					jobSite: input.jobSite,
					jobTitle: input.jobTitle,
					agreement: input.agreement,
					updatedAt: new Date(),
				})
				.where(eq(user.id, input.id))
				.returning();

			return updated;
		}),
});
