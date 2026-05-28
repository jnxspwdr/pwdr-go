"use client";

import { atom, useAtomValue, useSetAtom } from "jotai";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import React from "react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "~/ui/breadcrumb";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/ui/dropdown-menu";
import { Skeleton } from "~/ui/skeleton";

type BaseCrumb = {
	title: string;
	href?: string;
};

type CrumbInput = BaseCrumb & {
	children?: BaseCrumb[];
};

type NestedCrumb = BaseCrumb & {
	id: string;
};

type Crumb = BaseCrumb & {
	id: string;
	children?: NestedCrumb[];
};

type Crumbs = Crumb[] | null | undefined;

const crumbsAtom = atom<Crumbs>(undefined);

const BreadcrumbContext = React.createContext<{
	crumbs: Crumbs;
} | null>(null);

export const useCrumbs = (crumbs: CrumbInput[] | null) => {
	const setCrumbs = useSetAtom(crumbsAtom);

	React.useEffect(() => {
		const newCrumbs: Crumbs = crumbs
			? crumbs.map((crumb) => ({
					...crumb,
					id: crypto.randomUUID(),
					children: crumb.children?.map((child) => ({
						...child,
						id: crypto.randomUUID(),
					})),
				}))
			: null;
		setCrumbs(newCrumbs);

		return () => {
			setCrumbs(undefined);
		};
	}, [crumbs, setCrumbs]);
};

export const ServerCrumbs = ({ crumbs }: { crumbs: CrumbInput[] | null }) => {
	useCrumbs(crumbs);
	return null;
};

export const BreadcrumbProvider = ({
	...props
}: Omit<
	React.ComponentPropsWithoutRef<typeof BreadcrumbContext.Provider>,
	"value"
>) => {
	const crumbs = useAtomValue(crumbsAtom);

	return (
		<BreadcrumbContext.Provider
			value={{
				crumbs,
			}}
			{...props}
		/>
	);
};

export const Breadcrumbs = ({
	...props
}: Omit<
	React.ComponentPropsWithoutRef<typeof Breadcrumb>,
	"container" | "id" | "children"
>) => {
	const { crumbs } = React.use(BreadcrumbContext)!;

	return (
		<Breadcrumb {...props}>
			{typeof crumbs === "undefined" ? (
				<Skeleton className="w-20 h-4" />
			) : crumbs === null ? null : (
				<BreadcrumbList>
					{crumbs?.map((crumb) => {
						if (crumb.children && crumb.children.length > 0) {
							return (
								<React.Fragment key={crumb.id}>
									<BreadcrumbSeparator />
									<BreadcrumbItem>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<button className="flex items-center gap-1">
													{crumb.title}
													<ChevronDown className="size-4 group-data-[state=open]/dropdown-menu-trigger:rotate-180 transition-transform" />
												</button>
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												{crumb.children?.map((child) => (
													<DropdownMenuItem
														key={child.id}
														asChild={!!child.href}
													>
														{!!child.href ? (
															<Link href={child.href}>{child.title}</Link>
														) : (
															child.title
														)}
													</DropdownMenuItem>
												))}
											</DropdownMenuContent>
										</DropdownMenu>
									</BreadcrumbItem>
								</React.Fragment>
							);
						}

						return (
							<React.Fragment key={crumb.id}>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									{!!crumb.href ? (
										<BreadcrumbLink asChild>
											<Link href={crumb.href}>{crumb.title}</Link>
										</BreadcrumbLink>
									) : (
										crumb.title
									)}
								</BreadcrumbItem>
							</React.Fragment>
						);
					})}
				</BreadcrumbList>
			)}
		</Breadcrumb>
	);
};
