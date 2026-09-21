import { faker, SexType } from "@faker-js/faker";
import { FAKER_SEED } from "~/data/seed";
import { shuffle } from "~/lib/utils";
import {
	AGREEMENT_TYPES,
	femmeLikeGenders,
	femmePronouns,
	JOB_SITES,
	JOB_TITLES,
	mascLikeGenders,
	mascPronouns,
	miscGenders,
	miscPronouns,
	User,
	userSchema,
} from "~/types/schemas/user";

const femmeAvatars = [
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
const mascAvatars = ["68", "59", "53", "52", "18", "14", "13", "12", "11", "8"];

const weightedFemmeLikeGenders = femmeLikeGenders.map((gender) => {
	return {
		value: gender,
		weight: gender.toLocaleLowerCase().includes("cis") ? 4 : 1,
	};
});

const weightedMascLikeGenders = mascLikeGenders.map((gender) => {
	return {
		value: gender,
		weight: gender.toLocaleLowerCase().includes("cis") ? 4 : 1,
	};
});

const weightedMiscGenders = miscGenders.map((gender) => {
	return {
		value: gender,
		weight: 1,
	};
});

export const generateUsers = (): User[] => {
	console.log(`generating users with seed: ${FAKER_SEED}`);

	const femmeUsers = femmeAvatars.map((avatarIndex) => {
		const sex: SexType = "female";

		const firstName = faker.person.firstName(sex);
		const lastName = faker.person.lastName(sex);
		const fullName = faker.person.fullName({
			firstName,
			lastName,
			sex,
		});
		const gender = faker.helpers.arrayElement([
			...weightedFemmeLikeGenders,
			...weightedMiscGenders,
		]).value;
		const pronouns = faker.helpers.arrayElements(
			gender.toLocaleLowerCase().includes("cis")
				? femmePronouns
				: [...femmePronouns, ...miscPronouns],
			{
				min: 1,
				max: 2,
			},
		);

		const user: User = {
			id: faker.string.ulid(),
			firstName,
			lastName,
			fullName,
			gender,
			pronouns,
			// lowercased: better-auth normalizes emails to lowercase for lookups,
			// so a mixed-case stored value would silently never match on sign-in
			email: faker.internet
				.email({ firstName, lastName, provider: "pwdr.com" })
				.toLowerCase(),
			avatar: `https://i.pravatar.cc/512?img=${avatarIndex}`,
			phoneNumber: faker.phone.number({ style: "international" }),
			jobSite: faker.helpers.arrayElement(JOB_SITES),
			jobTitle: faker.helpers.arrayElement(JOB_TITLES),
			agreement: faker.helpers.arrayElement(AGREEMENT_TYPES),
		};

		userSchema.parse(user);

		return user;
	});

	const mascUsers = mascAvatars.map((avatarIndex) => {
		const sex: SexType = "male";

		const firstName = faker.person.firstName(sex);
		const lastName = faker.person.lastName(sex);
		const fullName = faker.person.fullName({
			firstName,
			lastName,
			sex,
		});

		const gender = faker.helpers.arrayElement([
			...weightedMascLikeGenders,
			...weightedMiscGenders,
		]).value;
		const pronouns = faker.helpers.arrayElements(
			gender.toLocaleLowerCase().includes("cis")
				? mascPronouns
				: [...mascPronouns, ...miscPronouns],
			{
				min: 1,
				max: 2,
			},
		);

		const user: User = {
			id: faker.string.ulid(),
			firstName,
			lastName,
			fullName,
			gender,
			pronouns,
			// lowercased: better-auth normalizes emails to lowercase for lookups,
			// so a mixed-case stored value would silently never match on sign-in
			email: faker.internet
				.email({ firstName, lastName, provider: "pwdr.com" })
				.toLowerCase(),
			avatar: `https://i.pravatar.cc/512?img=${avatarIndex}`,
			phoneNumber: faker.phone.number({ style: "international" }),
			jobSite: faker.helpers.arrayElement(JOB_SITES),
			jobTitle: faker.helpers.arrayElement(JOB_TITLES),
			agreement: faker.helpers.arrayElement(AGREEMENT_TYPES),
		};

		userSchema.parse(user);

		return user;
	});

	const users = shuffle([...femmeUsers, ...mascUsers]);

	console.log(`generated ${users.length} users!`);

	return users;
};

// "Powder" is a distinct admin account per organization (not one account
// shared across orgs), so each org gets its own login —
// e.g. jnxspwdr@acme.com, jnxspwdr@globex.com — rather than pwdr needing
// multiple memberships/an org switcher to be admin everywhere.
export const createPwdrUser = (emailDomain: string): User => {
	const pwdrFirstName = "Powder";
	const pwdr: User = {
		id: faker.string.ulid(),
		firstName: pwdrFirstName,
		lastName: null,
		fullName: pwdrFirstName,
		gender: "Agender",
		pronouns: ["they/them", "any/all"],
		email: `jnxspwdr@${emailDomain}`,
		avatar: "https://imgur.com/gallery/jinx-pfp-v3-256-eWBdJWx#S0FXGEn",
		phoneNumber: faker.phone.number({ style: "international" }),
		jobSite: faker.helpers.arrayElement(JOB_SITES),
		jobTitle: "HR Manager",
		agreement: "full time",
	};

	userSchema.parse(pwdr);

	return pwdr;
};
