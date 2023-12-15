import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/rpc";
import { type AuthStore, useAuthStore } from "../stores/user.store";
import { api } from "../utils/api";

type UseSessionReturn = {
  user: AuthStore["user"];
  status: AuthStore["status"];
  refresh: () => void;
  signOutMutation: ReturnType<typeof api.auth.signOut.useMutation>;
};

export function useSession(): UseSessionReturn {
  const authStore = useAuthStore();

  const signOutMutation = api.auth.signOut.useMutation({
    onSuccess() {
      authStore.clear();
    },
  });

  const meQuery = api.auth.me.useQuery(undefined, {
    onSuccess(res) {
      authStore.set({
        user: res.user,
        status: "authenticated",
      });
    },
    onError() {
      authStore.set({
        user: null,
        status: "unauthenticated",
      });
    },
    retry(failureCount, error) {
      if (error.shape?.code === TRPC_ERROR_CODES_BY_KEY.FORBIDDEN) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return {
    user: authStore.user,
    status: authStore.status,
    refresh() {
      void meQuery.refetch();
    },
    signOutMutation,
  };
}
