import { faker } from "@faker-js/faker";
import { generateTickets } from "~/data/generate-tickets";
import { generateUsers } from "~/data/generate-users";
import { env } from "~/env";
import { db } from "~/server/db";
import {
	member as memberTable,
	organization as organizationTable,
	tickets as ticketsTable,
	user as userTable,
} from "~/server/db/schema";
import { User } from "~/types/schemas/user";

const currentYear = new Date().getFullYear();
const REF_DATE = `${currentYear}-01-01T00:00:00.000Z`;
// needs to || operator instead of ??, otherwise the seed will always be 0
export const FAKER_SEED = env.ENV_FAKER_SEED || faker.seed();
faker.setDefaultRefDate(REF_DATE);
faker.seed(FAKER_SEED);

const users = generateUsers();

// Split the roster across two organizations so tenant isolation is actually
// exercised, not just theoretical. "Powder" always lands in the first org
// (as its admin) so manual sign-in testing with jnxspwdr@pwdr.com stays
// predictable regardless of the faker seed.
const pwdr = users.find((generatedUser) => generatedUser.email === "jnxspwdr@pwdr.com");
if (!pwdr) throw new Error("expected generateUsers() to always include the pwdr user");

const rest = users.filter((generatedUser) => generatedUser.id !== pwdr.id);
const midpoint = Math.ceil(rest.length / 2);
const globexUsers = rest.slice(midpoint);

const orgs: {
	id: string;
	name: string;
	slug: string;
	users: User[];
	adminId: string;
}[] = [
	{
		id: crypto.randomUUID(),
		name: "Acme Corp",
		slug: "acme-corp",
		users: [pwdr, ...rest.slice(0, midpoint)],
		adminId: pwdr.id,
	},
	{
		id: crypto.randomUUID(),
		name: "Globex Inc",
		slug: "globex-inc",
		users: globexUsers,
		adminId: globexUsers[0].id,
	},
];

const tickets = orgs.flatMap((org) => generateTickets(org.users, org.id, 50));

// Clear existing rows so re-running this script doesn't hit unique constraint
// violations. Deletion order follows FK dependencies (tickets/member first);
// session/account/verification cascade-delete off `user`.
await db.delete(ticketsTable);
await db.delete(memberTable);
await db.delete(organizationTable);
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

await db.insert(organizationTable).values(
	orgs.map((org) => ({
		id: org.id,
		name: org.name,
		slug: org.slug,
	})),
);

await db.insert(memberTable).values(
	orgs.flatMap((org) =>
		org.users.map((orgUser) => ({
			id: crypto.randomUUID(),
			organizationId: org.id,
			userId: orgUser.id,
			role: orgUser.id === org.adminId ? "admin" : "member",
		})),
	),
);

await db.insert(ticketsTable).values(tickets);

console.log(
	`seeded ${orgs.length} organizations, ${users.length} users, and ${tickets.length} tickets`,
);
process.exit(0);
