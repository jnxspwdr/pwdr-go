import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { createTRPCRouter, orgProcedure } from "~/server/api/trpc";
import { member } from "~/server/db/schema";

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
});
