import { z } from "zod";
import { userSchema } from "~/types/schemas/user";

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
];

export const TICKET_PRIORITIES = {
	low: 10,
	normal: 20,
	high: 30,
} as const;

export const ticketSchema = z.object({
	id: z.ulid(),
	ticketNumber: z.string(),
	title: z.string(),
	description: z.string(),
	priority: z.enum(TICKET_PRIORITIES),
	status: z.literal(TICKET_STATUSES),
	type: z.literal(TICKET_TYPES),
	reportedBy: userSchema.pick({
		id: true,
		fullName: true,
		avatar: true,
	}),
	assignedTo: userSchema
		.pick({
			id: true,
			fullName: true,
			avatar: true,
		})
		.nullable(),
	createdAt: z.iso.datetime({ offset: true }),
	updatedAt: z.iso.datetime({ offset: true }),
});

export type Ticket = z.infer<typeof ticketSchema>;
