"use client";

import { RowData } from "@tanstack/react-table";
import { DownloadIcon, XIcon } from "lucide-react";
import React from "react";
import { useDataTable } from "~/ui/data-table";
import {
	DataTableFacetedFilter,
	type DataTableFacetedFilterOption,
} from "~/ui/data-table-faceted-filter";
import { DataTableViewOptions } from "~/ui/data-table-view-options";
import { Button } from "~/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/ui/dropdown-menu";
import { Input } from "~/ui/input";
import { useDebouncedCallback } from "~/hooks/use-debounced-callback";
import { downloadCsv, downloadJson } from "~/lib/export";

interface DataTableToolbarProps<TData extends RowData> {
	table: ReturnType<typeof useDataTable<TData>>;
	searchPlaceholder?: string;
	filters?: {
		columnId: string;
		title: string;
		options: DataTableFacetedFilterOption[];
	}[];
	exportFileName?: string;
	children?: React.ReactNode;
}

export const DataTableToolbar = <TData extends RowData>({
	table,
	searchPlaceholder = "Search...",
	filters = [],
	exportFileName = "export",
	children,
}: DataTableToolbarProps<TData>) => {
	const [search, setSearch] = React.useState(
		(table.state.globalFilter as string) ?? "",
	);
	const setGlobalFilter = useDebouncedCallback((value: unknown) => {
		table.setGlobalFilter(value as string);
	}, 300);

	const selectedRowCount = table.getSelectedRowModel().rows.length;
	const isFiltered =
		table.state.columnFilters.length > 0 || !!table.state.globalFilter;

	const handleReset = () => {
		table.resetColumnFilters();
		table.resetGlobalFilter();
		setSearch("");
	};

	const handleExport = (format: "csv" | "json") => {
		const selectedRows = table.getFilteredSelectedRowModel().rows;
		const rows =
			selectedRows.length > 0 ? selectedRows : table.getFilteredRowModel().rows;
		const columns = table
			.getVisibleLeafColumns()
			.filter((column) => column.getCanHide());

		if (format === "csv") {
			downloadCsv(
				`${exportFileName}.csv`,
				columns.map((column) =>
					typeof column.columnDef.header === "string"
						? column.columnDef.header
						: column.id,
				),
				rows.map((row) => columns.map((column) => row.getValue(column.id))),
			);
		} else {
			downloadJson(
				`${exportFileName}.json`,
				rows.map((row) =>
					Object.fromEntries(
						columns.map((column) => [column.id, row.getValue(column.id)]),
					),
				),
			);
		}
	};

	return (
		<div className="flex flex-wrap items-center justify-between gap-2">
			<div className="flex flex-1 flex-wrap items-center gap-2">
				<Input
					placeholder={searchPlaceholder}
					value={search}
					onChange={(event) => {
						setSearch(event.target.value);
						setGlobalFilter(event.target.value);
					}}
					className="h-8 w-full max-w-64"
				/>
				{filters.map((filter) => (
					<DataTableFacetedFilter
						key={filter.columnId}
						table={table}
						columnId={filter.columnId}
						title={filter.title}
						options={filter.options}
					/>
				))}
				{isFiltered && (
					<Button variant="ghost" size="sm" onClick={handleReset}>
						Reset
						<XIcon />
					</Button>
				)}
			</div>
			<div className="flex items-center gap-2">
				{selectedRowCount > 0 && (
					<span className="text-sm text-muted-foreground">
						{selectedRowCount} selected
					</span>
				)}
				{children}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm">
							<DownloadIcon />
							Export
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onSelect={() => handleExport("csv")}>
							Export as CSV
						</DropdownMenuItem>
						<DropdownMenuItem onSelect={() => handleExport("json")}>
							Export as JSON
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<DataTableViewOptions table={table} />
			</div>
		</div>
	);
};
