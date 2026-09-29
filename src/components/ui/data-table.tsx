"use client";

import {
	Cell,
	ColumnDef,
	RowData,
	TableFeatures,
	columnFacetingFeature,
	columnFilteringFeature,
	columnVisibilityFeature,
	createFacetedRowModel,
	createFacetedUniqueValues,
	createFilteredRowModel,
	createSortedRowModel,
	filterFn_arrHas,
	filterFn_includesString,
	globalFilteringFeature,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_basic,
	sortFn_datetime,
	sortFn_text,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { cn } from "cn";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/ui/table";

declare module "@tanstack/react-table" {
	interface ColumnMeta<
		TFeatures extends TableFeatures,
		TData extends RowData,
		TValue,
	> {
		columnClassName?: string;
		primary?: boolean;
		fitContent?: boolean;
		hideHeader?: boolean;
		getHref?: (
			cell: Cell<TFeatures, TData, TValue>,
		) => React.ComponentPropsWithoutRef<typeof Link>["href"];
	}
}

export const dataTableFeatures = tableFeatures({
	columnFilteringFeature,
	globalFilteringFeature,
	columnFacetingFeature,
	columnVisibilityFeature,
	rowSortingFeature,
	filteredRowModel: createFilteredRowModel(),
	sortedRowModel: createSortedRowModel(),
	facetedRowModel: createFacetedRowModel(),
	facetedUniqueValues: createFacetedUniqueValues(),
	filterFns: {
		includesString: filterFn_includesString,
		arrHas: filterFn_arrHas,
	},
	sortFns: {
		alphanumeric: sortFn_alphanumeric,
		basic: sortFn_basic,
		datetime: sortFn_datetime,
		text: sortFn_text,
	},
});

export const useDataTable = <TData extends RowData>({
	columns,
	data,
	initialState,
}: {
	columns: ColumnDef<typeof dataTableFeatures, TData>[];
	data: TData[];
	initialState?: { columnVisibility?: Record<string, boolean> };
}) => {
	return useTable({
		features: dataTableFeatures,
		data,
		columns,
		globalFilterFn: "includesString",
		initialState,
	});
};

interface DataTableProps<TData extends RowData> {
	table: ReturnType<typeof useDataTable<TData>>;
}

export const DataTable = <TData extends RowData>({
	table,
}: DataTableProps<TData>) => {
	return (
		<div className="rounded-md border">
			<Table className="[--cell-min-width:--spacing(32)]">
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								const sorted = header.column.getIsSorted();

								return (
									<TableHead
										className={cn(
											"min-w-(--cell-min-width)",
											header.column.columnDef.meta?.fitContent &&
												"w-px min-w-0 whitespace-nowrap",
											// sort button owns the cell padding: whole cell is its click target
											header.column.getCanSort() && "p-0",
											header.column.columnDef.meta?.columnClassName,
										)}
										aria-sort={
											header.column.getCanSort()
												? sorted === "asc"
													? "ascending"
													: sorted === "desc"
														? "descending"
														: "none"
												: undefined
										}
										key={header.id}
									>
										{header.isPlaceholder ||
										header.column.columnDef.meta
											?.hideHeader ? null : header.column.getCanSort() ? (
											<button
												type="button"
												className="flex h-10 w-full items-center gap-1 px-2 text-left font-medium whitespace-nowrap hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset"
												onClick={header.column.getToggleSortingHandler()}
											>
												<table.FlexRender header={header} />
												{{
													asc: <ArrowUpIcon className="size-3.5" />,
													desc: <ArrowDownIcon className="size-3.5" />,
												}[sorted as string] ?? (
													<ArrowUpDownIcon className="size-3.5 opacity-40" />
												)}
											</button>
										) : (
											<table.FlexRender header={header} />
										)}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id}>
								{row.getVisibleCells().map((cell) => {
									return (
										<TableCell
											className={cn(
												"min-w-(--cell-min-width)",
												cell.column.columnDef.meta?.primary && "w-full",
												cell.column.columnDef.meta?.fitContent &&
													"w-px max-w-none min-w-0 text-clip whitespace-nowrap",
												cell.column.columnDef.meta?.columnClassName,
											)}
											key={cell.id}
										>
											{cell.column.columnDef.meta?.getHref ? (
												<Link
													className="hover:underline"
													href={cell.column.columnDef.meta?.getHref(cell)}
												>
													<table.FlexRender cell={cell} />
												</Link>
											) : (
												<table.FlexRender cell={cell} />
											)}
										</TableCell>
									);
								})}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={table.getVisibleLeafColumns().length}
								className="h-24 text-center"
							>
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
};
