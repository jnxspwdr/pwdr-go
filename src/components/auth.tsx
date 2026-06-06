import React from "react";
import { User } from "~/types/schemas/user";

const authContext = React.createContext<{
	signedIn: boolean;
	user: User;

	signOut: () => void;
} | null>(null);
