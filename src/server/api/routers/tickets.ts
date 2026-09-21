import { TRPCError } from "@trpc/server";
import { format } from "date-fns";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, orgProcedure } from "~/server/api/trpc";
import { member, tickets } from "~/server/db/schema";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "~/types/schemas/ticket";

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
				// Ticket is about/assigned to this user (e.g. filed via a user's
				// "Report" action) rather than the general queue.
				assignedToId: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (input.assignedToId) {
				const assignee = await ctx.db.query.member.findFirst({
					where: and(
						eq(member.organizationId, ctx.org.id),
						eq(member.userId, input.assignedToId),
					),
				});

				if (!assignee) {
					throw new TRPCError({ code: "NOT_FOUND" });
				}
			}

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
					assignedToId: input.assignedToId,
				})
				.returning();

			return ticket;
		}),

	setStatus: orgProcedure
		.input(z.object({ id: z.string(), status: z.enum(TICKET_STATUSES) }))
		.mutation(async ({ ctx, input }) => {
			const [ticket] = await ctx.db
				.update(tickets)
				.set({ status: input.status, updatedAt: new Date() })
				.where(
					and(eq(tickets.id, input.id), eq(tickets.organizationId, ctx.org.id)),
				)
				.returning();

			if (!ticket) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return ticket;
		}),

	// Bumps priority one tier (capped at high) and puts the ticket back in
	// progress if it was just sitting open/waiting.
	escalate: orgProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.tickets.findFirst({
				where: and(
					eq(tickets.id, input.id),
					eq(tickets.organizationId, ctx.org.id),
				),
			});

			if (!existing) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			if (existing.status === "closed") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Reopen this ticket before escalating it.",
				});
			}

			const nextPriority =
				existing.priority < TICKET_PRIORITIES.normal
					? TICKET_PRIORITIES.normal
					: TICKET_PRIORITIES.high;

			const [ticket] = await ctx.db
				.update(tickets)
				.set({
					priority: nextPriority,
					status: "in progress",
					updatedAt: new Date(),
				})
				.where(eq(tickets.id, input.id))
				.returning();

			return ticket;
		}),
});
