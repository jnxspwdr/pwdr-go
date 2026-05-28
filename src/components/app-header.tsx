"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Breadcrumbs } from "~/components/breadcrumb-portal";
import { Button } from "~/components/ui/button";
import { useAppStore } from "~/store.app";
import { Kbd, KbdGroup } from "~/ui/kbd";
import { Separator } from "~/ui/separator";
import { Skeleton } from "~/ui/skeleton";

export const AppHeader = () => {
	const setCmdkIsOpen = useAppStore((state) => state.setCmdkIsOpen);

	const [showBreadcrumbSkeleton, setShowBreadcrumbSkeleton] =
		React.useState(true);
	const setRef = React.useCallback((ref: HTMLDivElement | null) => {
		if (!ref) return;

		const observer = new MutationObserver((mutationList) => {
			for (const mutation of mutationList) {
				if (
					mutation.type === "childList" &&
					ref.querySelector("#breadcrumb-portal-content")
				) {
					setShowBreadcrumbSkeleton(false);
				} else {
					setShowBreadcrumbSkeleton(true);
				}
			}
		});

		observer.observe(ref, { childList: true });
	}, []);

	return (
		<header className="bg-sidebar sticky top-0 z-50 flex w-full items-center">
			<div className="flex h-(--header-height) w-full items-center gap-2 pl-5 pr-2 pt-2">
				<div className="font-medium text-xl">
					pwdr <span className="text-indigo-600 font-bold">GO</span>
				</div>
				<Breadcrumbs />
				<Button
					className="w-48 justify-start has-[>svg]:pr-1.5 text-zinc-500 ml-auto dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50"
					variant={"outline"}
					size={"sm"}
					onClick={() => {
						setCmdkIsOpen(true);
					}}
				>
					<Search />
					Search...
					<KbdGroup className="ml-auto">
						<Kbd>⌘</Kbd>
						<Kbd>K</Kbd>
					</KbdGroup>
				</Button>
				<Button variant={"primary"} size={"icon-sm"} asChild>
					<Link href="/tickets/new">
						<Plus />
					</Link>
				</Button>
			</div>
		</header>
	);
};
