import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "~/ui/button";
import { Separator } from "~/ui/separator";
import "./globals.css";

export const metadata: Metadata = {
	title: "404 - Page not found",
	description: "The page you are looking for does not exist.",
};

export default async function NotFound() {
	return (
		<div className="fixed inset-0 z-[9999] grid place-content-center bg-background">
			<div className="grid gap-4">
				<div className="inline-flex items-center justify-center gap-2 text-3xl">
					<h1>404</h1>
					<Separator
						className="data-[orientation=vertical]:h-8"
						orientation="vertical"
					/>
					<h2>Page not found</h2>
				</div>
				<p className="text-center">The page you requested could not be found</p>
				<div className="mx-auto flex items-center gap-4">
					<Button className="w-36" variant={"secondary"} asChild>
						<Link href="/sign-in">Sign in</Link>
					</Button>
					<Button className="w-36" asChild>
						<Link href="/dashboard">Go to dashboard</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
