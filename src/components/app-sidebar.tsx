"use client";

import {
	ChevronsUpDownIcon,
	LogOutIcon,
	MonitorIcon,
	MoonIcon,
	PanelLeftCloseIcon,
	PanelLeftOpenIcon,
	SunIcon,
	SunMoonIcon,
	UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
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
import { authClient } from "~/lib/auth-client";
import { MAIN_NAV_ITEMS } from "~/lib/nav";

export const AppSidebar = () => {
	const pathname = usePathname();
	const router = useRouter();
	const { state, toggleSidebar, isMobile } = useSidebar();
	const { theme, setTheme } = useTheme();
	const { data: session } = authClient.useSession();
	const user = session?.user;

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: { onSuccess: () => router.push("/sign-in") },
		});
	};

	const userIdentity = user && (
		<>
			<Avatar className="size-8">
				<AvatarImage src={user.image ?? undefined} alt={user.name} />
				<AvatarFallback>
					{`${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`}
				</AvatarFallback>
			</Avatar>
			<div className="grid flex-1 text-left text-sm leading-tight">
				<span className="truncate font-medium">{user.name}</span>
				<span className="truncate text-xs text-muted-foreground">
					{user.email}
				</span>
			</div>
		</>
	);

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
					{user && (
						<SidebarMenuItem>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<SidebarMenuButton
										size="lg"
										tooltip={user.name}
										className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
									>
										{userIdentity}
										<ChevronsUpDownIcon className="ml-auto size-4" />
									</SidebarMenuButton>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
									side={isMobile ? "bottom" : "right"}
									align="end"
									sideOffset={4}
								>
									<DropdownMenuLabel className="p-0 font-normal">
										<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
											{userIdentity}
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuGroup>
										<DropdownMenuItem asChild>
											<Link href={`/users/${user.id}`}>
												<UserIcon />
												Profile
											</Link>
										</DropdownMenuItem>
										<DropdownMenuSub>
											<DropdownMenuSubTrigger>
												<SunMoonIcon />
												Theme
											</DropdownMenuSubTrigger>
											<DropdownMenuSubContent>
												<DropdownMenuRadioGroup
													value={theme}
													onValueChange={setTheme}
												>
													<DropdownMenuRadioItem value="light">
														<SunIcon />
														Light
													</DropdownMenuRadioItem>
													<DropdownMenuRadioItem value="dark">
														<MoonIcon />
														Dark
													</DropdownMenuRadioItem>
													<DropdownMenuRadioItem value="system">
														<MonitorIcon />
														System
													</DropdownMenuRadioItem>
												</DropdownMenuRadioGroup>
											</DropdownMenuSubContent>
										</DropdownMenuSub>
									</DropdownMenuGroup>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										variant="destructive"
										onSelect={handleSignOut}
									>
										<LogOutIcon />
										Sign out
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</SidebarMenuItem>
					)}
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
