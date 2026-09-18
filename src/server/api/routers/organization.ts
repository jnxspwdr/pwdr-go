import { createTRPCRouter, orgProcedure } from "~/server/api/trpc";

export const organizationRouter = createTRPCRouter({
	current: orgProcedure.query(({ ctx }) => ({
		id: ctx.org.id,
		name: ctx.org.name,
		plan: ctx.org.plan,
	})),
});
