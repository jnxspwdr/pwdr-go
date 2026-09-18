import { faker } from "@faker-js/faker";
import { generateTickets } from "~/data/generate-tickets";
import { generateUsers } from "~/data/generate-users";
import { env } from "~/env";
import { db } from "~/server/db";
import { tickets as ticketsTable, user as userTable } from "~/server/db/schema";

const currentYear = new Date().getFullYear();
const REF_DATE = `${currentYear}-01-01T00:00:00.000Z`;
// needs to || operator instead of ??, otherwise the seed will always be 0
export const FAKER_SEED = env.ENV_FAKER_SEED || faker.seed();
faker.setDefaultRefDate(REF_DATE);
faker.seed(FAKER_SEED);

const users = generateUsers();
const tickets = generateTickets(users);

// Clear existing rows so re-running this script doesn't hit unique constraint
// violations. session/account/verification cascade-delete off `user`.
await db.delete(ticketsTable);
await db.delete(userTable);

await db.insert(userTable).values(
	users.map((generatedUser) => ({
		id: generatedUser.id,
		name: generatedUser.fullName,
		email: generatedUser.email,
		emailVerified: true,
		image: generatedUser.avatar,
		firstName: generatedUser.firstName,
		lastName: generatedUser.lastName,
		gender: generatedUser.gender,
		pronouns: generatedUser.pronouns,
		phoneNumber: generatedUser.phoneNumber,
	})),
);

await db.insert(ticketsTable).values(tickets);

console.log(`seeded ${users.length} users and ${tickets.length} tickets`);
process.exit(0);
