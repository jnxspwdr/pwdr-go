import { z } from "zod";

export const TICKET_STATUSES = [
	"open", // open/unacknowledged. means the support team hasn't seen it yet.
	"in progress", // in progress. means the support team is actively working on it.
	"closed", // closed/completed. means the support team is done working on it.
	"waiting", // waiting. means the support team is waiting for reply from the customer/company that made the ticket.
] as const;

export const TICKET_TYPES = [
	"support incident", // apps not working as expected, bugs, etc.
	"purchase request", // "please buy this new laptop for Sarah Globex", "we need a new phone for John Acme", etc.
	"work order", // "this server needs an update", "our phones need new firmware", etc.
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
	organizationId: z.string(),
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
