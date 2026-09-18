import { organizationRouter } from "~/server/api/routers/organization";
import { ticketsRouter } from "~/server/api/routers/tickets";
import { usersRouter } from "~/server/api/routers/users";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
	tickets: ticketsRouter,
	organization: organizationRouter,
	users: usersRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
