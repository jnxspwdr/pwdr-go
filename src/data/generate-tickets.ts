import fs from "fs";
import path from "path";
import { faker } from "@faker-js/faker";
import {
	Ticket,
	TICKET_PRIORITIES,
	TICKET_STATUSES,
	TICKET_TYPES,
	ticketSchema,
} from "~/types/schemas/ticket";
import { format } from "date-fns";
import users from "~/data/users.json";
import { FAKER_SEED } from "~/data/seed";

export const generateTickets = () => {
	console.log(`generating tickets with seed: ${FAKER_SEED}`);

	const tickets = Array.from({ length: 100 }, () => {
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
			reportedBy: {
				id: pickedUsers[0].id,
				fullName: pickedUsers[0].fullName,
				avatar: pickedUsers[0].avatar,
			},
			assignedTo: faker.datatype.boolean()
				? {
						id: pickedUsers[1].id,
						fullName: pickedUsers[1].fullName,
						avatar: pickedUsers[1].avatar,
					}
				: null,
			createdAt: createdAt.toISOString(),
			updatedAt: faker.date.recent().toISOString(),
		};

		ticketSchema.parse(ticket);

		return ticket;
	});

	fs.writeFileSync(
		path.join(__dirname, "tickets.json"),
		JSON.stringify(tickets, null, 2),
	);

	console.log("done generating tickets!");
};
