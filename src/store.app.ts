import { create } from "zustand";

type AppState = {
	cmdkIsOpen: boolean;
};

type AppActions = {
	setCmdkIsOpen: (arg0: boolean | ((prev: boolean) => boolean)) => void;
};

export const useAppStore = create<AppState & AppActions>()((set) => ({
	cmdkIsOpen: false,
	setCmdkIsOpen: (arg0) => {
		set((state) => ({
			cmdkIsOpen: typeof arg0 === "boolean" ? arg0 : !state.cmdkIsOpen,
		}));
	},
}));
