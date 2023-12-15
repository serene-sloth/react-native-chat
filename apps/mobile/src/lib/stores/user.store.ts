import { type StoreApi, create } from "zustand";
import { type MeOutput } from "@org/api-contracts";

export type AuthStore = {
  status: "authenticated" | "loading" | "unauthenticated";
  user: MeOutput["user"] | null;
  clear: () => void;
  set: StoreApi<AuthStore>["setState"];
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  status: "loading",
  clear: () => {
    set({ user: null, status: "unauthenticated" });
  },
  set: (newData) => {
    set(newData);
  },
}));
