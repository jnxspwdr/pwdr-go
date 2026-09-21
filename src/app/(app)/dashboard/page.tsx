import Image from "next/image";
import { ServerCrumbs } from "~/components/breadcrumb-portal";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/card";

export default async function DashboardPage() {
	return (
		<>
			<ServerCrumbs crumbs={[{ title: "dashboard" }]} />
			<div className="grid grid-cols-1 gap-(--card-gap) [--card-gap:--spacing(4)] @2xl:grid-cols-2">
				<div className="flex flex-col gap-(--card-gap)">
					<Card>
						<CardHeader>
							<CardTitle>Card 1</CardTitle>
						</CardHeader>
						<CardContent>foo bar</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Card 2</CardTitle>
						</CardHeader>
						<CardContent>foo bar</CardContent>
					</Card>
				</div>
				<div className="flex flex-col gap-(--card-gap)">
					<Card>
						<CardHeader>
							<CardTitle>Card 3</CardTitle>
						</CardHeader>
						<CardContent>foo bar</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Card 4</CardTitle>
						</CardHeader>
						<CardContent>foo bar</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
}
