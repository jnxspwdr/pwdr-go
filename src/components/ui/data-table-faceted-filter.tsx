"use client";

import { RowData } from "@tanstack/react-table";
import { CheckIcon, PlusCircleIcon, type LucideIcon } from "lucide-react";
import { useDataTable } from "~/ui/data-table";
import { Badge } from "~/ui/badge";
import { Button } from "~/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "~/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "~/ui/popover";
import { Separator } from "~/ui/separator";
import { cn } from "cn";

export interface DataTableFacetedFilterOption {
	label: string;
	value: string;
	icon?: LucideIcon;
}

interface DataTableFacetedFilterProps<TData extends RowData> {
	table: ReturnType<typeof useDataTable<TData>>;
	columnId: string;
	title: string;
	options: DataTableFacetedFilterOption[];
}

export const DataTableFacetedFilter = <TData extends RowData>({
	table,
	columnId,
	title,
	options,
}: DataTableFacetedFilterProps<TData>) => {
	const column = table.getColumn(columnId);
	const facets = column?.getFacetedUniqueValues();
	const selectedValues = new Set((column?.getFilterValue() as string[]) ?? []);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm" className="border-dashed">
					<PlusCircleIcon />
					{title}
					{selectedValues.size > 0 && (
						<>
							<Separator orientation="vertical" className="mx-1 h-4" />
							<Badge
								variant="secondary"
								className="rounded-sm px-1 font-normal lg:hidden"
							>
								{selectedValues.size}
							</Badge>
							<div className="hidden gap-1 lg:flex">
								{selectedValues.size > 2 ? (
									<Badge
										variant="secondary"
										className="rounded-sm px-1 font-normal"
									>
										{selectedValues.size} selected
									</Badge>
								) : (
									options
										.filter((option) => selectedValues.has(option.value))
										.map((option) => (
											<Badge
												variant="secondary"
												key={option.value}
												className="rounded-sm px-1 font-normal"
											>
												{option.label}
											</Badge>
										))
								)}
							</div>
						</>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-52 p-0" align="start">
				<Command>
					<CommandInput placeholder={title} />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup>
							{options.map((option) => {
								const isSelected = selectedValues.has(option.value);

								return (
									<CommandItem
										key={option.value}
										onSelect={() => {
											const next = new Set(selectedValues);

											if (isSelected) {
												next.delete(option.value);
											} else {
												next.add(option.value);
											}

											column?.setFilterValue(
												next.size ? Array.from(next) : undefined,
											);
										}}
									>
										<div
											className={cn(
												"flex size-4 items-center justify-center rounded-sm border border-primary",
												isSelected
													? "bg-primary text-primary-foreground"
													: "opacity-50 [&_svg]:invisible",
											)}
										>
											<CheckIcon />
										</div>
										{option.icon && (
											<option.icon className="text-muted-foreground" />
										)}
										<span>{option.label}</span>
										{facets?.get(option.value) != null && (
											<span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
												{facets.get(option.value)}
											</span>
										)}
									</CommandItem>
								);
							})}
						</CommandGroup>
						{selectedValues.size > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										onSelect={() => column?.setFilterValue(undefined)}
										className="justify-center text-center"
									>
										Clear filters
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};
