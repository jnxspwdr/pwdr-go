"use client";

import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "~/components/ui/sidebar";
import { NavUser } from "~/components/nav-user";
import { MAIN_NAV_ITEMS } from "~/lib/nav";

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
				<NavUser />
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
