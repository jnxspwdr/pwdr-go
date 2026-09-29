import { asc, eq } from "drizzle-orm";
import { createTRPCRouter, orgProcedure } from "~/server/api/trpc";
import { orgOptions } from "~/server/db/schema";
import { AGREEMENT_TYPES } from "~/types/schemas/user";

export const organizationRouter = createTRPCRouter({
	current: orgProcedure.query(({ ctx }) => ({
		id: ctx.org.id,
		name: ctx.org.name,
		plan: ctx.org.plan,
	})),

	// Pick-list values for user fields. Agreement types = built-ins plus the
	// org's custom ones.
	options: orgProcedure.query(async ({ ctx }) => {
		const rows = await ctx.db
			.select({ kind: orgOptions.kind, value: orgOptions.value })
			.from(orgOptions)
			.where(eq(orgOptions.organizationId, ctx.org.id))
			.orderBy(asc(orgOptions.value));

		const valuesOf = (kind: (typeof rows)[number]["kind"]) =>
			rows.filter((r) => r.kind === kind).map((r) => r.value);

		return {
			jobSites: valuesOf("job_site"),
			jobTitles: valuesOf("job_title"),
			agreementTypes: [...AGREEMENT_TYPES, ...valuesOf("agreement")],
		};
	}),
});
