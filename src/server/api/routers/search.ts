import { and, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, orgProcedure } from "~/server/api/trpc";
import { member, tickets, user } from "~/server/db/schema";

// Per-entity result cap for the command palette — enough to be useful
// without turning a broad query into a full-list dump.
const RESULT_LIMIT = 5;

// Backs the command palette's live "search individual tickets/users"
// groups (src/components/cmdk.tsx). Adding a new searchable detail page
// means adding a branch here plus a matching entry in cmdk.tsx's
// DETAIL_PAGE_SEARCH_CONFIG — see the recipe in PROJECT.md.
export const searchRouter = createTRPCRouter({
	global: orgProcedure
		.input(z.object({ query: z.string().trim().min(1).max(100) }))
		.query(async ({ ctx, input }) => {
			const pattern = `%${input.query}%`;

			const [ticketResults, userResults] = await Promise.all([
				ctx.db.query.tickets.findMany({
					where: and(
						eq(tickets.organizationId, ctx.org.id),
						or(
							ilike(tickets.title, pattern),
							ilike(tickets.ticketNumber, pattern),
						),
					),
					orderBy: (tickets, { desc }) => [desc(tickets.updatedAt)],
					limit: RESULT_LIMIT,
				}),
				ctx.db
					.select({ user })
					.from(user)
					.innerJoin(member, eq(member.userId, user.id))
					.where(
						and(
							eq(member.organizationId, ctx.org.id),
							or(ilike(user.name, pattern), ilike(user.email, pattern)),
						),
					)
					.limit(RESULT_LIMIT),
			]);

			return {
				tickets: ticketResults,
				users: userResults.map((row) => row.user),
			};
		}),
});
