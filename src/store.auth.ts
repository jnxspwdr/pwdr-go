import z from "zod";
import { create } from "zustand";
import { User, userSchema } from "~/types/schemas/user";

type AuthState = {
	signedIn: boolean;
	user: User | null;
	code: string;
	email: string;
};

type AuthActions = {
	setSignedIn: (arg0: boolean | ((prev: boolean) => boolean)) => void;
	setUser: (user: User) => void;
};

export const authStore = create<AuthState & AuthActions>()((set) => ({
	signedIn: false,
	setSignedIn: (arg0) => {
		set((state) => ({
			signedIn: typeof arg0 === "boolean" ? arg0 : !state.signedIn,
		}));
	},

	user: null,
	setUser: () => {
		set((state) => ({
			user: userSchema.parse(state),
		}));
	},

	code: "",
	email: "",
}));
