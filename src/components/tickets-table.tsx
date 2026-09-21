"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatRelative } from "date-fns";
import { Clock } from "lucide-react";
import React from "react";
import type { RouterOutputs } from "~/trpc/shared";
import { TICKET_STATUSES } from "~/types/schemas/ticket";
import { Badge } from "~/ui/badge";
import { Checkbox } from "~/ui/checkbox";
import { DataTable, dataTableFeatures, useDataTable } from "~/ui/data-table";
import { DataTableToolbar } from "~/ui/data-table-toolbar";

type Ticket = RouterOutputs["tickets"]["list"][number];

const statusOptions = TICKET_STATUSES.map((status) => ({
	label: status,
	value: status,
}));

export const TicketsTable = ({ tickets }: { tickets: Ticket[] }) => {
	const columns: ColumnDef<typeof dataTableFeatures, Ticket>[] = [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={
						table.getIsAllRowsSelected() ||
						(table.getIsSomeRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
					aria-label="Select all"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
				/>
			),
			meta: { fitContent: true },
			enableHiding: false,
		},
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
				return (
					<Badge>
						<Clock />
						{formatRelative(row.original.updatedAt, new Date())}
					</Badge>
				);
			},
		},
		{
			accessorKey: "status",
			header: "Status",
			filterFn: "arrHas",
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

	const table = useDataTable({ columns, data: tickets });

	return (
		<div className="space-y-4">
			<DataTableToolbar
				table={table}
				searchPlaceholder="Search tickets..."
				filters={[
					{ columnId: "status", title: "Status", options: statusOptions },
				]}
				exportFileName="tickets"
			/>
			<DataTable table={table} />
		</div>
	);
};
