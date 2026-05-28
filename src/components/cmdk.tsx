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
} from "lucide-react";
import Link from "next/link";
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
import { useAppStore } from "~/store.app";

export const Cmdk = () => {
	const open = useAppStore((state) => state.cmdkIsOpen);
	const setOpen = useAppStore((state) => state.setCmdkIsOpen);
	const [cmdkInput, setCmdkInput] = React.useState("");

	const [linkIsSelected, setLinkIsSelected] = React.useState(false);
	const listRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		// ugly hack to ensure the listRef stuff works properly
		new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
			if (listRef.current) {
				setLinkIsSelected(
					!!listRef.current
						.querySelector("[data-selected=true]")
						?.getAttribute("href")
				);
			}
		});
	}, [open, cmdkInput]);

	React.useEffect(() => {
		if (listRef.current) {
			setLinkIsSelected(
				!!listRef.current
					.querySelector("[data-selected=true]")
					?.getAttribute("href")
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
						?.getAttribute("href")
				);
			} else if (ev.key === "ArrowUp") {
				ev.preventDefault();
				setLinkIsSelected(
					!!listRef.current
						.querySelector("[data-selected=true]")
						?.getAttribute("href")
				);
			}
		};

		const handleOpenPage = (ev: KeyboardEvent) => {
			if (!linkIsSelected || !listRef.current) return;

			const selectedItem = listRef.current.querySelector(
				"[data-selected=true]"
			);
			const selectedLink =
				selectedItem?.nodeName === "A" && selectedItem?.hasAttribute("href")
					? (selectedItem as HTMLAnchorElement)
					: null;

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
			} else if (selectedLink && ev.key === "Enter") {
				ev.preventDefault();
				selectedLink.click();
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

	return (
		<CommandDialog
			open={open}
			onOpenChange={(open) => {
				setOpen(open);
			}}
		>
			<CommandInput
				value={cmdkInput}
				onValueChange={setCmdkInput}
				placeholder="Type a command or search..."
			/>
			<CommandList ref={listRef}>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup>
					<CommandItem asChild>
						<Link href="/tickets">
							<Wrench />
							<span>Tickets</span>
						</Link>
					</CommandItem>
					<CommandItem>
						<Smile />
						<span>Search Emoji</span>
					</CommandItem>
					<CommandItem>
						<Calculator />
						<span>Calculator</span>
					</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Settings">
					<CommandItem asChild>
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
