import { faker } from "@faker-js/faker";
import { format } from "date-fns";
import { FAKER_SEED } from "~/data/seed";
import {
	Ticket,
	TICKET_PRIORITIES,
	TICKET_STATUSES,
	TICKET_TYPES,
	ticketSchema,
} from "~/types/schemas/ticket";
import { User } from "~/types/schemas/user";

export const generateTickets = (
	users: User[],
	organizationId: string,
	count = 100,
): Ticket[] => {
	console.log(`generating tickets with seed: ${FAKER_SEED}`);

	const tickets = Array.from({ length: count }, () => {
		const createdAt = faker.date.past();
		const pickedUsers = faker.helpers.arrayElements(users, {
			min: 2,
			max: 2,
		});

		const ticket: Ticket = {
			id: faker.string.ulid(),
			ticketNumber: `TICKET-${format(createdAt, "yyyyMMdd")}-${faker.number
				.int({
					min: 1,
					max: 9999,
				})
				.toString()
				.padStart(4, "0")}`,
			title: faker.hacker.phrase().replace("!", ""),
			description: faker.lorem.paragraphs(2),
			priority: faker.datatype.boolean()
				? faker.helpers.objectValue(TICKET_PRIORITIES)
				: TICKET_PRIORITIES.normal,
			status: faker.helpers.arrayElement(TICKET_STATUSES),
			type: faker.helpers.arrayElement(TICKET_TYPES),
			organizationId,
			reportedById: pickedUsers[0].id,
			assignedToId: faker.datatype.boolean() ? pickedUsers[1].id : null,
			createdAt,
			updatedAt: faker.date.recent(),
		};

		ticketSchema.parse(ticket);

		return ticket;
	});

	console.log(`generated ${tickets.length} tickets!`);

	return tickets;
};
