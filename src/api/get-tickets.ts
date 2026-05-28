"use server";

import z from "zod";
import { ticketSchema } from "~/types/schemas/ticket";
import { localFetch } from "~/lib/local-fetch";

export const getTickets = async () => {
	const data = await localFetch("tickets.json");

	const tickets = JSON.parse(data);

	return z.array(ticketSchema).parse(tickets);
};
