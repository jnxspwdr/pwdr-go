import { z } from "zod";

export const TICKET_STATUSES = [
	"open",
	"in progress",
	"closed",
	"waiting",
] as const;

export const TICKET_TYPES = [
	"support incident",
	"purchase request",
	"work order",
] as const;

export const TICKET_PRIORITIES = {
	low: 10,
	normal: 20,
	high: 30,
} as const;

// Mirrors the `tickets` table (src/server/db/schema.ts). `reportedBy`/`assignedTo`
// are joined from the `user` table at query time rather than stored denormalized.
export const ticketSchema = z.object({
	id: z.ulid(),
	ticketNumber: z.string(),
	title: z.string(),
	description: z.string(),
	priority: z.enum(TICKET_PRIORITIES),
	status: z.literal(TICKET_STATUSES),
	type: z.literal(TICKET_TYPES),
	reportedById: z.string(),
	assignedToId: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type Ticket = z.infer<typeof ticketSchema>;

export const ticketParticipantSchema = z.object({
	id: z.string(),
	name: z.string(),
	image: z.string().nullable(),
});

export type TicketParticipant = z.infer<typeof ticketParticipantSchema>;
