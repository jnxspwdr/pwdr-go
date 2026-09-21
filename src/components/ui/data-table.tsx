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
	filterFn_arrHas,
	filterFn_includesString,
	globalFilteringFeature,
	rowSelectionFeature,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
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
	rowSelectionFeature,
	filteredRowModel: createFilteredRowModel(),
	facetedRowModel: createFacetedRowModel(),
	facetedUniqueValues: createFacetedUniqueValues(),
	filterFns: {
		includesString: filterFn_includesString,
		arrHas: filterFn_arrHas,
	},
});

export const useDataTable = <TData extends RowData>({
	columns,
	data,
}: {
	columns: ColumnDef<typeof dataTableFeatures, TData>[];
	data: TData[];
}) => {
	return useTable({
		features: dataTableFeatures,
		data,
		columns,
		globalFilterFn: "includesString",
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
								return (
									<TableHead
										className={cn(
											"min-w-(--cell-min-width)",
											header.column.columnDef.meta?.fitContent &&
												"w-px min-w-0 whitespace-nowrap",
											header.column.columnDef.meta?.columnClassName,
										)}
										key={header.id}
									>
										{header.isPlaceholder ||
										header.column.columnDef.meta?.hideHeader ? null : (
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
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() ? "selected" : undefined}
							>
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
