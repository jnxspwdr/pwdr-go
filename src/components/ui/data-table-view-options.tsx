"use client";

import { RowData } from "@tanstack/react-table";
import { SlidersHorizontalIcon } from "lucide-react";
import { useDataTable } from "~/ui/data-table";
import { Button } from "~/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/ui/dropdown-menu";

interface DataTableViewOptionsProps<TData extends RowData> {
	table: ReturnType<typeof useDataTable<TData>>;
}

export const DataTableViewOptions = <TData extends RowData>({
	table,
}: DataTableViewOptionsProps<TData>) => {
	const columns = table
		.getAllLeafColumns()
		.filter((column) => column.getCanHide());

	if (columns.length === 0) {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm">
					<SlidersHorizontalIcon />
					View
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-44">
				<DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{columns.map((column) => (
					<DropdownMenuCheckboxItem
						key={column.id}
						checked={column.getIsVisible()}
						onCheckedChange={(value) => column.toggleVisibility(!!value)}
						onSelect={(event) => event.preventDefault()}
						className="capitalize"
					>
						{typeof column.columnDef.header === "string"
							? column.columnDef.header
							: column.id}
					</DropdownMenuCheckboxItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
