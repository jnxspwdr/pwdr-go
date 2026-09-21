import { faker } from "@faker-js/faker";
import { createPwdrUser, generateUsers } from "~/data/generate-users";
import { generateTickets } from "~/data/generate-tickets";
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

// Every org gets its own "Powder" admin account (distinct user row, org-scoped
// email) rather than one pwdr account holding memberships across orgs — see
// createPwdrUser. Add an org here and it gets its own admin automatically.
const ORG_DEFS = [
	{ name: "Acme Corp", slug: "acme-corp", domain: "acme.com" },
	{ name: "Globex Inc", slug: "globex-inc", domain: "globex.com" },
];

const regularUsers = generateUsers();

// Split the regular (non-pwdr) roster evenly across orgs so tenant isolation
// is actually exercised, not just theoretical.
const orgs = ORG_DEFS.map((def, i) => {
	const share = regularUsers.slice(
		Math.floor((i * regularUsers.length) / ORG_DEFS.length),
		Math.floor(((i + 1) * regularUsers.length) / ORG_DEFS.length),
	);
	const admin = createPwdrUser(def.domain);

	return {
		id: crypto.randomUUID(),
		name: def.name,
		slug: def.slug,
		users: [admin, ...share] as User[],
		adminId: admin.id,
	};
});

const users = orgs.flatMap((org) => org.users);
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
		jobSite: generatedUser.jobSite,
		jobTitle: generatedUser.jobTitle,
		agreement: generatedUser.agreement,
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
