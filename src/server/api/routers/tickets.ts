import { TRPCError } from "@trpc/server";
import { format } from "date-fns";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, orgProcedure } from "~/server/api/trpc";
import { tickets } from "~/server/db/schema";
import { TICKET_PRIORITIES } from "~/types/schemas/ticket";

const generateTicketNumber = () => {
	const randomSuffix = Math.floor(Math.random() * 10000)
		.toString()
		.padStart(4, "0");

	return `TICKET-${format(new Date(), "yyyyMMdd")}-${randomSuffix}`;
};

export const ticketsRouter = createTRPCRouter({
	list: orgProcedure.query(({ ctx }) => {
		return ctx.db.query.tickets.findMany({
			where: eq(tickets.organizationId, ctx.org.id),
			with: { reportedBy: true, assignedTo: true },
			orderBy: (tickets, { desc }) => [desc(tickets.updatedAt)],
		});
	}),

	byId: orgProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const ticket = await ctx.db.query.tickets.findFirst({
				where: and(
					eq(tickets.id, input.id),
					eq(tickets.organizationId, ctx.org.id),
				),
				with: { reportedBy: true, assignedTo: true },
			});

			if (!ticket) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return ticket;
		}),

	create: orgProcedure
		.input(
			z.object({
				title: z
					.string()
					.min(4, "Title must be at least 4 characters.")
					.max(128, "Title must be at most 128 characters."),
				description: z
					.string()
					.max(256, "Description must at most be 256 characters."),
				priority: z.enum(TICKET_PRIORITIES),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [ticket] = await ctx.db
				.insert(tickets)
				.values({
					id: crypto.randomUUID(),
					ticketNumber: generateTicketNumber(),
					title: input.title,
					description: input.description,
					priority: input.priority,
					status: "open",
					type: "support incident",
					organizationId: ctx.org.id,
					reportedById: ctx.session.user.id,
				})
				.returning();

			return ticket;
		}),
});
