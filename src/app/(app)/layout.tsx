import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppHeader } from "~/components/app-header";
import { AppSidebar } from "~/components/app-sidebar";
import { BreadcrumbProvider } from "~/components/breadcrumb-portal";
import { Cmdk } from "~/components/cmdk";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { auth } from "~/server/auth";

export default async function AppLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// The proxy only checks cookie presence; validate against the DB here so a
	// stale cookie lands on /sign-in instead of a shell full of UNAUTHORIZED.
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session) redirect("/sign-in");

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
