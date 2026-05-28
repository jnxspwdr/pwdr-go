import { cookies } from "next/headers";
import { AppHeader } from "~/components/app-header";
import { AppSidebar } from "~/components/app-sidebar";
import { BreadcrumbProvider } from "~/components/breadcrumb-portal";
import { Cmdk } from "~/components/cmdk";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";

export default async function AppLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const sidebarCookieState =
		(await cookies()).get("sidebar_state")?.value !== "false";

	return (
		<BreadcrumbProvider>
			<SidebarProvider
				className="flex flex-col"
				defaultOpen={sidebarCookieState}
			>
				<AppHeader />
				<div className="flex flex-1">
					<AppSidebar />
					<SidebarInset className="@container/inset">{children}</SidebarInset>
				</div>
				<Cmdk />
			</SidebarProvider>
		</BreadcrumbProvider>
	);
}
