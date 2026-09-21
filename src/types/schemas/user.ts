import { z } from "zod";

export const mascPronouns = ["he/him"] as const;
export const femmePronouns = ["she/her"] as const;
export const miscPronouns = ["they/them", "it/its", "any/all"] as const;

export const mascLikeGenders = [
	"Cis male",
	"Cis man",
	"Cisgender male",
	"Cisgender man",
	"Demi-boy",
	"Demi-man",
	"F2M",
	"FTM",
	"Female to male",
	"Female to male trans man",
	"Female to male transgender man",
	"Female to male transsexual man",
	"Intersex man",
	"Man",
	"T* man",
	"Trans male",
	"Trans man",
	"Transmasculine",
	"Transsexual male",
	"Transsexual man",
] as const;

export const femmeLikeGenders = [
	"Cis female",
	"Cis woman",
	"Cisgender",
	"Cisgender female",
	"Cisgender woman",
	"Demi-girl",
	"Demi-woman",
	"Intersex woman",
	"M2F",
	"MTF",
	"Male to female",
	"Male to female trans woman",
	"Male to female transgender woman",
	"Male to female transsexual woman",
	"T* woman",
	"Trans female",
	"Trans woman",
	"Transfemminine",
	"Transgender female",
	"Transsexual female",
	"Transsexual woman",
	"Woman",
] as const;

export const miscGenders = [
	"Agender",
	"Androgyne",
	"Androgynous",
	"Bigender",
	"Demiflux",
	"Demigender",
	"Gender fluid",
	"Gender neutral",
	"Gender nonconforming",
	"Gender questioning",
	"Gender variant",
	"Genderflux",
	"Genderqueer",
	"Hermaphrodite",
	"Intersex",
	"Intersex person",
	"Multigender",
	"Neither",
	"Neutrois",
	"Non-binary",
	"Omnigender",
	"Other",
	"Pangender",
	"Polygender",
	"Trans",
	"Trans person",
	"Transgender person",
	"Transsexual",
	"Transsexual person",
	"Trigender",
	"Two* person",
	"Xenogender",
] as const;

export const JOB_SITES = [
	"Copenhagen",
	"Beijing",
	"New York",
	"London",
	"Berlin",
	"Tokyo",
	"São Paulo",
] as const;

export const JOB_TITLES = [
	"HR Manager",
	"Server Specialist",
	"Support Engineer",
	"Account Manager",
	"Office Manager",
	"IT Technician",
	"Network Administrator",
] as const;

export const AGREEMENT_TYPES = ["full time", "part time", "ad hoc"] as const;

export const userSchema = z.object({
	id: z.ulid(),
	avatar: z.url(),
	firstName: z.string(),
	lastName: z.string().nullable(),
	fullName: z.string(),
	gender: z.literal([...mascLikeGenders, ...femmeLikeGenders, ...miscGenders]),
	pronouns: z.array(
		z.literal([...mascPronouns, ...femmePronouns, ...miscPronouns]),
	),
	email: z.email(),
	phoneNumber: z.e164(),
	jobSite: z.literal(JOB_SITES),
	jobTitle: z.literal(JOB_TITLES),
	agreement: z.literal(AGREEMENT_TYPES),
});

export type User = z.infer<typeof userSchema>;
