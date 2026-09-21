import { LayoutDashboard, type LucideIcon, Users, Wrench } from "lucide-react";

export type NavItem = {
	title: string;
	href: string;
	icon: LucideIcon;
};

// Single source of truth for top-level app pages: drives both the sidebar
// (app-sidebar.tsx) and the "Pages" group in the command palette (cmdk.tsx),
// so a page added/removed here shows up in both without extra wiring.
export const MAIN_NAV_ITEMS: NavItem[] = [
	{
		title: "Dashboard",
		href: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "Tickets",
		href: "/tickets",
		icon: Wrench,
	},
	{
		title: "Users",
		href: "/users",
		icon: Users,
	},
];
