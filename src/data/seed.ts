import fs from "fs";
import path from "path";
import { faker } from "@faker-js/faker";
import { generateUsers } from "~/data/generate-users";
import { generateTickets } from "~/data/generate-tickets";
import { env } from "~/env";

const currentYear = new Date().getFullYear();
const REF_DATE = `${currentYear}-01-01T00:00:00.000Z`;
// needs to || operator instead of ??, otherwise the seed will always be 0
export const FAKER_SEED = env.ENV_FAKER_SEED || faker.seed();
faker.setDefaultRefDate(REF_DATE);
faker.seed(FAKER_SEED);

// console.log(`faker seed: ${FAKER_SEED}`);
// console.log(`environment faker seed: ${env.ENV_FAKER_SEED}`);

// make sure users.json exists and is up to date before generating tickets
await new Promise((res) => {
	res(generateUsers());
}).then(() => {
	generateTickets();
});

fs.appendFileSync(
	path.join(__dirname, "seeds.log"),
	`${new Date().toISOString()} - Last seed used: ${FAKER_SEED}\n`,
);
