import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import type { RegisterAccount } from "@/api/auth.api";
import type { RestaurantApplication } from "@/api/restaurants.api";
import {
  useCheckPartnerMutation,
  useCurrentUserQuery,
  useLoginMutation,
  useRegisterMutation,
  useResendVerificationMutation,
  useVerifyEmailMutation,
} from "@/hooks/auth/useAuth";
import { useRestaurantOnboardingMutation } from "@/hooks/restaurants/useRestaurantOnboarding";
import { clearAuthSession, getAccessToken } from "@/lib/auth-session";
import { getApiErrorMessage } from "@/lib/api-error";
import { useRestaurantOnboardingStore } from "@/stores/restaurant-onboarding.store";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return getApiErrorMessage(error, fallback);
  }
  return fallback;
}

export function useRestaurantOnboardingFlow() {
  const currentUserQuery = useCurrentUserQuery(Boolean(getAccessToken()));
  const checkPartnerMutation = useCheckPartnerMutation();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const resendVerificationMutation = useResendVerificationMutation();
  const verifyEmailMutation = useVerifyEmailMutation();
  const onboardRestaurantMutation = useRestaurantOnboardingMutation();

  const {
    stage,
    email,
    partner,
    existingPartnerDialogOpen,
    setEmail,
    setPartnerResult,
    continueWithExistingAccount,
    cancelExistingAccount,
    setStage,
    reset,
  } = useRestaurantOnboardingStore();

  const [error, setError] = useState<string>();
  const [verificationNotice, setVerificationNotice] = useState<string>();
  const [completedRestaurant, setCompletedRestaurant] = useState<string>();

  useEffect(() => {
    const user = currentUserQuery.data;
    if (!user) return;
    setEmail(user.email);
    setStage(user.emailVerified ? "restaurant" : "verify");
  }, [currentUserQuery.data, setEmail, setStage]);

  useEffect(() => {
    if (!currentUserQuery.isError) return;
    clearAuthSession();
    reset();
  }, [currentUserQuery.isError, reset]);

  const isSubmitting =
    checkPartnerMutation.isPending ||
    loginMutation.isPending ||
    registerMutation.isPending ||
    resendVerificationMutation.isPending ||
    verifyEmailMutation.isPending ||
    onboardRestaurantMutation.isPending;

  async function checkEmail(enteredEmail: string) {
    setError(undefined);
    setVerificationNotice(undefined);
    setEmail(enteredEmail);
    try {
      setPartnerResult(await checkPartnerMutation.mutateAsync(enteredEmail));
    } catch (cause) {
      setError(getErrorMessage(cause, "We couldn't check that email. Please try again."));
    }
  }

  async function authenticate(
    account: Omit<RegisterAccount, "password" | "email">,
    password: string,
  ) {
    setError(undefined);
    setVerificationNotice(undefined);
    const accountExists = Boolean(partner?.exists);
    try {
      const session = accountExists
        ? await loginMutation.mutateAsync({ email, password })
        : await registerMutation.mutateAsync({ ...account, email, password });

      const canApply = session.user.roles.some((role) =>
        ["CUSTOMER", "RESTAURANT_OWNER"].includes(role),
      );
      if (!canApply) {
        setError("This account cannot submit a restaurant application. Sign in with a customer or restaurant-owner account.");
        return;
      }

      if (session.user.emailVerified) {
        setStage("restaurant");
      } else {
        let delivery = session.verificationDelivery;
        if (accountExists) {
          delivery = await resendVerificationMutation
            .mutateAsync(email)
            .catch(() => ({ status: 'unavailable' as const }));
        }
        setVerificationNotice(getVerificationNotice(delivery?.status));
        setStage("verify");
      }
    } catch (cause) {
      setError(
        getErrorMessage(
          cause,
          accountExists
            ? "We couldn't sign you in. Check your password and try again."
            : "We couldn't create your account. Please try again.",
        ),
      );
    }
  }

  async function verifyEmail(code: string) {
    setError(undefined);
    try {
      await verifyEmailMutation.mutateAsync({ email, code });
      setVerificationNotice(undefined);
      setStage("restaurant");
    } catch (cause) {
      setError(getErrorMessage(cause, "We couldn't verify that code. Please check it and try again."));
    }
  }

  async function resendCode() {
    setError(undefined);
    try {
      const result = await resendVerificationMutation.mutateAsync(email);
      setVerificationNotice(getVerificationNotice(result.status));
    } catch (cause) {
      setError(getErrorMessage(cause, "We couldn't request another verification code."));
    }
  }

  async function submitRestaurant(application: RestaurantApplication) {
    setError(undefined);
    try {
      await onboardRestaurantMutation.mutateAsync(application);
      setCompletedRestaurant(application.restaurantName);
    } catch (cause) {
      setError(getErrorMessage(cause, "We couldn't submit your restaurant application. Please try again."));
    }
  }

  return {
    stage,
    email,
    partner,
    accountExists: Boolean(partner?.exists),
    existingPartnerDialogOpen,
    currentUser: currentUserQuery.data,
    isCheckingSession: Boolean(getAccessToken()) && currentUserQuery.isLoading,
    isSubmitting,
    error,
    verificationNotice,
    completedRestaurant,
    checkEmail,
    authenticate,
    verifyEmail,
    resendCode,
    submitRestaurant,
    setError,
    setEmail,
    setStage,
    continueWithExistingAccount,
    cancelExistingAccount,
  };
}

function getVerificationNotice(
  status: 'sent' | 'development' | 'unavailable' | 'already-verified' | 'cooldown' | undefined,
) {
  switch (status) {
    case 'sent':
      return 'We sent a verification code to your email. It expires in 10 minutes.';
    case 'development':
      return 'Email delivery is not configured. In development, the code is written to the API server log.';
    case 'cooldown':
      return 'A code was requested recently. Check your inbox or wait a minute before requesting another.';
    case 'already-verified':
      return 'This email is already verified. You can continue.';
    default:
      return 'We could not send a verification code. Check the email service configuration or try again later.';
  }
}
