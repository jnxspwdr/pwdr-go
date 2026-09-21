"use client";

import { ColumnDef } from "@tanstack/react-table";
import { getInitials } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/shared";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/avatar";
import { DataTable, dataTableFeatures, useDataTable } from "~/ui/data-table";
import { DataTableToolbar } from "~/ui/data-table-toolbar";

type User = RouterOutputs["users"]["list"][number];

export const UsersTable = ({ users }: { users: User[] }) => {
	const columns: ColumnDef<typeof dataTableFeatures, User>[] = [
		{
			accessorKey: "image",
			header: "Avatar",
			cell: ({ row }) => (
				<Avatar>
					<AvatarImage src={row.original.image ?? ""} alt={row.original.name} />
					<AvatarFallback>
						{getInitials(row.original.firstName, row.original.lastName)}
					</AvatarFallback>
				</Avatar>
			),
			meta: {
				fitContent: true,
				hideHeader: true,
			},
			enableGlobalFilter: false,
		},
		{
			accessorKey: "name",
			header: "Name",
			meta: {
				primary: true,
				getHref: (cell) => `/users/${cell.row.original.id}`,
			},
		},
	];

	const table = useDataTable({ columns, data: users });

	return (
		<div className="space-y-4">
			<DataTableToolbar
				table={table}
				searchPlaceholder="Search users..."
				exportFileName="users"
			/>
			<DataTable table={table} />
		</div>
	);
};
