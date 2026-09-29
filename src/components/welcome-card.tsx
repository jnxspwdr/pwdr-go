import { BriefcaseIcon, MailIcon } from "lucide-react";
import { getInitials } from "~/lib/utils";
import type { Session } from "~/server/auth";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/card";

export const WelcomeCard = ({ user }: { user: Session["user"] }) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Welcome {user.firstName}</CardTitle>
			</CardHeader>
			<CardContent className="flex items-center gap-4">
				<Avatar size="lg">
					<AvatarImage src={user.image ?? ""} alt={user.name} />
					<AvatarFallback>
						{getInitials(user.firstName, user.lastName)}
					</AvatarFallback>
				</Avatar>
				<div className="text-muted-foreground flex flex-col gap-1 text-sm">
					<span className="flex items-center gap-2">
						<MailIcon className="size-4" />
						{user.email}
					</span>
					<span className="flex items-center gap-2">
						<BriefcaseIcon className="size-4" />
						{user.jobSite} · {user.agreement}
					</span>
				</div>
			</CardContent>
		</Card>
	);
};
