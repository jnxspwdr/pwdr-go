"use client";

import {
	LayoutDashboard,
	LucideIcon,
	PanelLeftCloseIcon,
	PanelLeftIcon,
	PanelLeftOpenIcon,
	Users,
	Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarTrigger,
	useSidebar,
} from "~/components/ui/sidebar";

const MAIN_NAV_ITEMS: {
	id: number;
	title: string;
	icon: LucideIcon;
	href: string;
}[] = [
	{
		id: 1,
		title: "Dashboard",
		href: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		id: 2,
		title: "Tickets",
		href: "/tickets",
		icon: Wrench,
	},
	{
		id: 3,
		title: "Users",
		href: "/users",
		icon: Users,
	},
];

export const AppSidebar = () => {
	const pathname = usePathname();
	const { state, toggleSidebar } = useSidebar();

	return (
		<Sidebar
			collapsible="icon"
			variant="inset"
			className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
		>
			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu>
						{MAIN_NAV_ITEMS.map((item) => {
							return (
								<SidebarMenuItem key={item.id}>
									<SidebarMenuButton
										asChild
										tooltip={item.title}
										isActive={pathname.startsWith(item.href)}
									>
										<Link href={item.href}>
											<item.icon />
											{item.title}
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							);
						})}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton onClick={() => toggleSidebar()}>
							{state === "expanded" ? (
								<>
									<PanelLeftCloseIcon />
								</>
							) : (
								<>
									<PanelLeftOpenIcon />
								</>
							)}{" "}
							Toggle sidebar
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
};
