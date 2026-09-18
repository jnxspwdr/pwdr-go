import { initTRPC, TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import superjson from "superjson";
import { PLANS, planHasFeature, type PlanFeature } from "~/lib/plans";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { member, organization } from "~/server/db/schema";

export const createTRPCContext = async (opts: { headers: Headers }) => {
	const session = await auth.api.getSession({ headers: opts.headers });

	return {
		db,
		session,
		...opts,
	};
};

const t = initTRPC
	.context<Awaited<ReturnType<typeof createTRPCContext>>>()
	.create({
		transformer: superjson,
	});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.session) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	return next({
		ctx: {
			...ctx,
			session: ctx.session,
		},
	});
});

// Resolves the caller's active organization + membership row. Every
// org-scoped router (tickets, devices, reports) builds on this rather than
// protectedProcedure directly.
export const orgProcedure = protectedProcedure.use(async ({ ctx, next }) => {
	const organizationId = ctx.session.session.activeOrganizationId;

	if (!organizationId) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "No active organization for this session",
		});
	}

	const [org, membership] = await Promise.all([
		ctx.db.query.organization.findFirst({
			where: eq(organization.id, organizationId),
		}),
		ctx.db.query.member.findFirst({
			where: and(
				eq(member.organizationId, organizationId),
				eq(member.userId, ctx.session.user.id),
			),
		}),
	]);

	if (!org || !membership) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Not a member of this organization",
		});
	}

	return next({
		ctx: {
			...ctx,
			org,
			member: membership,
		},
	});
});

// Gates a procedure on the caller's org plan including a given feature. Not
// a replacement for orgProcedure — it builds on it, so ctx.org/ctx.member
// are still available downstream.
export const requiresPlanFeature = (feature: PlanFeature) =>
	orgProcedure.use(({ ctx, next }) => {
		if (!planHasFeature(ctx.org.plan, feature)) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: `This feature isn't included in the "${PLANS[ctx.org.plan].label}" plan`,
			});
		}

		return next({ ctx });
	});
