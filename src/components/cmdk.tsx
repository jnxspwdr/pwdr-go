"use client";

import {
	ArrowDownUp,
	Calculator,
	CornerDownLeft,
	CreditCard,
	Settings,
	Smile,
	User,
	Wrench,
	type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import {
	CommandDialog,
	CommandEmpty,
	CommandFooter,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "~/components/ui/command";
import { Separator } from "~/components/ui/separator";
import { MAIN_NAV_ITEMS } from "~/lib/nav";
import { useAppStore } from "~/store.app";
import { trpc } from "~/trpc/react";

// Minimum characters typed before we hit the search endpoint — short
// prefixes are rarely useful and would just spam the DB.
const SEARCH_MIN_LENGTH = 2;
// How long to wait after the user stops typing before searching.
const SEARCH_DEBOUNCE_MS = 150;

// A single result group in the palette's live search section (e.g.
// "Tickets", "Users"). Generic over the item shape so each call site below
// stays fully typed — see DETAIL_PAGE_SEARCH_GROUPS for how new detail
// pages register here.
function SearchResultGroup<T extends { id: string }>({
	heading,
	icon: Icon,
	items,
	getHref,
	getLabel,
	getSublabel,
}: {
	heading: string;
	icon: LucideIcon;
	items: T[] | undefined;
	getHref: (item: T) => string;
	getLabel: (item: T) => string;
	getSublabel?: (item: T) => string | undefined;
}) {
	const router = useRouter();

	if (!items || items.length === 0) return null;

	return (
		<CommandGroup heading={heading}>
			{items.map((item) => (
				<CommandItem
					key={item.id}
					asChild
					value={`${heading}-${item.id}`}
					// cmdk's own selection is the single source of truth for which
					// item Enter should open — routing off it (rather than reading
					// the currently-`data-selected` DOM node after the fact) avoids
					// navigating to a stale selection.
					onSelect={() => router.push(getHref(item))}
				>
					<Link href={getHref(item)}>
						<Icon />
						<span>{getLabel(item)}</span>
						{getSublabel && (
							<CommandShortcut>{getSublabel(item)}</CommandShortcut>
						)}
					</Link>
				</CommandItem>
			))}
		</CommandGroup>
	);
}

export const Cmdk = () => {
	const router = useRouter();
	const open = useAppStore((state) => state.cmdkIsOpen);
	const setOpen = useAppStore((state) => state.setCmdkIsOpen);
	const [cmdkInput, setCmdkInput] = React.useState("");
	const [debouncedQuery, setDebouncedQuery] = React.useState("");

	const [linkIsSelected, setLinkIsSelected] = React.useState(false);
	const listRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const handle = setTimeout(() => {
			setDebouncedQuery(cmdkInput.trim());
		}, SEARCH_DEBOUNCE_MS);

		return () => clearTimeout(handle);
	}, [cmdkInput]);

	const { data: searchResults } = trpc.search.global.useQuery(
		{ query: debouncedQuery },
		{ enabled: open && debouncedQuery.length >= SEARCH_MIN_LENGTH },
	);

	React.useEffect(() => {
		// ugly hack to ensure the listRef stuff works properly
		new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
			if (listRef.current) {
				setLinkIsSelected(
					!!listRef.current
						.querySelector("[data-selected=true]")
						?.getAttribute("href"),
				);
			}
		});
	}, [open, cmdkInput, searchResults]);

	React.useEffect(() => {
		if (listRef.current) {
			setLinkIsSelected(
				!!listRef.current
					.querySelector("[data-selected=true]")
					?.getAttribute("href"),
			);
		}

		const handleKbdShortcut = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();

				setOpen((open) => !open);
			}
		};

		const handleNavigation = (ev: KeyboardEvent) => {
			if (!listRef.current) return;

			if (ev.key === "ArrowDown") {
				ev.preventDefault();
				setLinkIsSelected(
					!!listRef.current
						.querySelector("[data-selected=true]")
						?.getAttribute("href"),
				);
			} else if (ev.key === "ArrowUp") {
				ev.preventDefault();
				setLinkIsSelected(
					!!listRef.current
						.querySelector("[data-selected=true]")
						?.getAttribute("href"),
				);
			}
		};

		const handleOpenPage = (ev: KeyboardEvent) => {
			if (!linkIsSelected || !listRef.current) return;

			const selectedItem = listRef.current.querySelector(
				"[data-selected=true]",
			);
			const selectedLink =
				selectedItem?.nodeName === "A" && selectedItem?.hasAttribute("href")
					? (selectedItem as HTMLAnchorElement)
					: null;

			// Plain Enter is handled by each CommandItem's own onSelect (cmdk
			// dispatches that only to whichever item it currently considers
			// selected, so it can't open a stale item the way reading
			// `[data-selected=true]` back out of the DOM here could).
			if (selectedLink && (ev.ctrlKey || ev.metaKey) && ev.key === "Enter") {
				ev.preventDefault();
				const prevTargetAtr = selectedLink.getAttribute("target");
				selectedLink.setAttribute("target", "_blank");
				selectedLink.click();
				if (prevTargetAtr) {
					selectedLink.setAttribute("target", prevTargetAtr);
				} else {
					selectedLink.removeAttribute("target");
				}
			}
		};

		document.addEventListener("keydown", handleKbdShortcut);
		document.addEventListener("keydown", handleNavigation);
		document.addEventListener("keydown", handleOpenPage);
		return () => {
			document.removeEventListener("keydown", handleKbdShortcut);
			document.removeEventListener("keydown", handleNavigation);
			document.removeEventListener("keydown", handleOpenPage);
		};
	}, [setOpen, linkIsSelected]);

	const showSearchResults = debouncedQuery.length >= SEARCH_MIN_LENGTH;

	return (
		<CommandDialog
			open={open}
			onOpenChange={(open) => {
				setOpen(open);
				if (!open) {
					setCmdkInput("");
					setDebouncedQuery("");
				}
			}}
		>
			<CommandInput
				value={cmdkInput}
				onValueChange={setCmdkInput}
				placeholder="Type a command or search..."
			/>
			<CommandList ref={listRef}>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="Pages">
					{MAIN_NAV_ITEMS.map((item) => (
						<CommandItem
							key={item.href}
							asChild
							onSelect={() => router.push(item.href)}
						>
							<Link href={item.href}>
								<item.icon />
								<span>{item.title}</span>
							</Link>
						</CommandItem>
					))}
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup>
					<CommandItem>
						<Smile />
						<span>Search Emoji</span>
					</CommandItem>
					<CommandItem>
						<Calculator />
						<span>Calculator</span>
					</CommandItem>
				</CommandGroup>
				{showSearchResults && (
					<>
						<CommandSeparator />
						<SearchResultGroup
							heading="Tickets"
							icon={Wrench}
							items={searchResults?.tickets}
							getHref={(ticket) => `/tickets/${ticket.id}`}
							getLabel={(ticket) => ticket.title}
							getSublabel={(ticket) => ticket.ticketNumber}
						/>
						<SearchResultGroup
							heading="Users"
							icon={User}
							items={searchResults?.users}
							getHref={(user) => `/users/${user.id}`}
							getLabel={(user) => user.name}
							getSublabel={(user) => user.email}
						/>
					</>
				)}
				<CommandSeparator />
				<CommandGroup heading="Settings">
					<CommandItem asChild onSelect={() => router.push("/profile")}>
						<Link href="/profile">
							<User />
							<span>Profile</span>
							<CommandShortcut>⌘P</CommandShortcut>
						</Link>
					</CommandItem>
					<CommandItem>
						<CreditCard />
						<span>Billing</span>
						<CommandShortcut>⌘B</CommandShortcut>
					</CommandItem>
					<CommandItem>
						<Settings />
						<span>Settings</span>
						<CommandShortcut>⌘S</CommandShortcut>
					</CommandItem>
				</CommandGroup>
			</CommandList>
			<CommandFooter className="flex items-center gap-2">
				<CommandShortcut>
					<ArrowDownUp />
					<Separator orientation="vertical" />
					Navigate
				</CommandShortcut>
				<CommandShortcut>
					<CornerDownLeft />
					<Separator orientation="vertical" />
					{linkIsSelected ? "Open page" : "Select"}
				</CommandShortcut>
				{linkIsSelected && (
					<>
						<CommandShortcut>
							<div>Ctrl</div>
							<div>+</div>
							<CornerDownLeft />
							<Separator orientation="vertical" />
							Open in new tab
						</CommandShortcut>
					</>
				)}
			</CommandFooter>
		</CommandDialog>
	);
};
