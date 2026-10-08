import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth.api";
import { clearAuthSession, getAuthSession, saveAuthSession } from "@/lib/auth-session";

export const authQueryKeys = {
  currentUser: ["auth", "current-user"] as const,
};

export function useCurrentUserQuery(enabled: boolean) {
  return useQuery({
    queryKey: authQueryKeys.currentUser,
    queryFn: authApi.getCurrentUser,
    enabled,
    retry: false,
  });
}

export function useCheckPartnerMutation() {
  return useMutation({ mutationFn: authApi.checkPartner });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (session) => {
      saveAuthSession(session);
      queryClient.setQueryData(authQueryKeys.currentUser, session.user);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      const session = getAuthSession();
      return session ? authApi.logout(session.refreshToken) : Promise.resolve({ success: true });
    },
    onSettled: () => {
      clearAuthSession();
      queryClient.clear();
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (session) => {
      saveAuthSession(session);
      queryClient.setQueryData(authQueryKeys.currentUser, session.user);
    },
  });
}

export function useVerifyEmailMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      authApi.verifyEmail(email, code),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser });
    },
  });
}

export function useResendVerificationMutation() {
  return useMutation({ mutationFn: authApi.resendVerification });
}
