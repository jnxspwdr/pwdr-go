"use client";

import { ColumnDef } from "@tanstack/react-table";
import { differenceInDays, format, formatRelative, parseISO } from "date-fns";
import { Clock } from "lucide-react";
import React from "react";
import { Ticket } from "~/types/schemas/ticket";
import { Badge } from "~/ui/badge";
import { DataTable } from "~/ui/data-table";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/ui/tooltip";

export const TicketsTable = ({ tickets }: { tickets: Ticket[] }) => {
	const columns: ColumnDef<Ticket>[] = [
		{
			accessorKey: "title",
			header: "Title",
			meta: {
				primary: true,
				getHref: (cell) => `/tickets/${cell.row.original.id}`,
			},
		},
		{
			accessorKey: "updatedAt",
			header: "Last active",
			cell: ({ row }) => {
				const value = parseISO(row.original.updatedAt);

				return (
					<Badge>
						<Clock />
						{formatRelative(value, new Date())}
					</Badge>
				);
			},
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => {
				const value = row.original.status;
				const variant: React.ComponentPropsWithoutRef<typeof Badge>["variant"] =
					value === "closed"
						? "secondary"
						: value === "in progress"
							? "info"
							: value === "waiting"
								? "warn"
								: value === "open"
									? "success"
									: "secondary";

				return <Badge variant={variant}>{value}</Badge>;
			},
		},
	];

	return <DataTable columns={columns} data={tickets} />;
};
