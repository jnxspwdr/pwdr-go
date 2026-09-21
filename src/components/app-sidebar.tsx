"use client";

import {
	PanelLeftCloseIcon,
	PanelLeftIcon,
	PanelLeftOpenIcon,
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
import { authClient } from "~/lib/auth-client";
import { MAIN_NAV_ITEMS } from "~/lib/nav";

export const AppSidebar = () => {
	const pathname = usePathname();
	const { state, toggleSidebar } = useSidebar();
	const { data: session } = authClient.useSession();
	const user = session?.user;

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
								<SidebarMenuItem key={item.href}>
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
						<SidebarMenuButton size={"lg"}>{user?.firstName}</SidebarMenuButton>
					</SidebarMenuItem>
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
