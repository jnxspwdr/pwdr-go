import { faker, SexType } from "@faker-js/faker";
import fs from "fs";
import path from "path";
import { shuffle } from "~/lib/utils";
import { User, userSchema } from "~/types/schemas/user";

const femaleAvatars = [
	"49",
	"48",
	"47",
	"45",
	"44",
	"36",
	"35",
	"32",
	"26",
	"16",
];
const maleAvatars = ["68", "59", "53", "52", "18", "14", "13", "12", "11", "8"];

export const generateUsers = () => {
	console.log("generating users...");

	const femaleUsers = femaleAvatars.map((avatarIndex) => {
		const sex: SexType = "female";

		const firstName = faker.person.firstName(sex);
		const lastName = faker.person.lastName(sex);
		const fullName = faker.person.fullName({
			firstName,
			lastName,
			sex,
		});

		const user: User = {
			id: faker.string.ulid(),
			firstName,
			lastName,
			fullName,
			email: faker.internet.email({
				firstName,
				lastName,
				provider: "pwdr.com",
			}),
			avatar: `https://i.pravatar.cc/512?img=${avatarIndex}`,
			phoneNumber: faker.phone.number({ style: "international" }),
		};

		userSchema.parse(user);

		return user;
	});

	const maleUsers = maleAvatars.map((avatarIndex) => {
		const sex: SexType = "male";

		const firstName = faker.person.firstName(sex);
		const lastName = faker.person.lastName(sex);
		const fullName = faker.person.fullName({
			firstName,
			lastName,
			sex,
		});

		const user: User = {
			id: faker.string.ulid(),
			firstName,
			lastName,
			fullName,
			email: faker.internet.email({
				firstName,
				lastName,
				provider: "pwdr.com",
			}),
			avatar: `https://i.pravatar.cc/512?img=${avatarIndex}`,
			phoneNumber: faker.phone.number({ style: "international" }),
		};

		userSchema.parse(user);

		return user;
	});

	const users = shuffle([...femaleUsers, ...maleUsers]);

	fs.writeFileSync(
		path.join(__dirname, "users.json"),
		JSON.stringify(users, null, 2),
	);

	console.log("users done!");
};
