import { faker } from "@faker-js/faker";
import { generateUsers } from "~/data/generate-users";
import { generateTickets } from "~/data/generate-tickets";

const currentYear = new Date().getFullYear();
const REF_DATE = `${currentYear}-01-01T00:00:00.000Z`;
faker.setDefaultRefDate(REF_DATE);
faker.seed(5469);

// make sure users.json exists and is up to date before generating tickets
await new Promise((res) => {
	res(generateUsers());
}).then(() => {
	generateTickets();
});
