import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { TICKET_STATUSES, TICKET_TYPES } from "~/types/schemas/ticket";

// --- better-auth core tables ---------------------------------------------
// Field names (JS keys) follow better-auth's canonical schema, since that's
// what the drizzle adapter looks up by. Column names are snake_case.

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	image: text("image"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),

	// app-specific fields, exposed to better-auth via `user.additionalFields`
	firstName: text("first_name").notNull(),
	lastName: text("last_name"),
	gender: text("gender").notNull(),
	pronouns: jsonb("pronouns").$type<string[]>().notNull(),
	phoneNumber: text("phone_number").notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// --- app tables ------------------------------------------------------------

export const ticketStatusEnum = pgEnum("ticket_status", TICKET_STATUSES);
export const ticketTypeEnum = pgEnum("ticket_type", TICKET_TYPES);

export const tickets = pgTable("tickets", {
	id: text("id").primaryKey(),
	ticketNumber: text("ticket_number").notNull().unique(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	priority: integer("priority").notNull(),
	status: ticketStatusEnum("status").notNull(),
	type: ticketTypeEnum("type").notNull(),
	reportedById: text("reported_by_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	assignedToId: text("assigned_to_id").references(() => user.id, {
		onDelete: "set null",
	}),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const ticketsRelations = relations(tickets, ({ one }) => ({
	reportedBy: one(user, {
		fields: [tickets.reportedById],
		references: [user.id],
		relationName: "reportedTickets",
	}),
	assignedTo: one(user, {
		fields: [tickets.assignedToId],
		references: [user.id],
		relationName: "assignedTickets",
	}),
}));
