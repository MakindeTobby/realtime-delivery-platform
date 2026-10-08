import { useEffect, useState } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TextField } from "@/components/custom/TextField";
import { useRestaurantOnboardingFlow } from "@/hooks/restaurants/useRestaurantOnboardingFlow";
import { useRestaurantOnboardingStore } from "@/stores/restaurant-onboarding.store";
import { OnboardingStepper, type OnboardingStep } from "./OnboardingStepper";
import { OwnerSection } from "./OwnerSection";
import { RestaurantDetailsSection } from "./RestaurantDetailsSection";
import { ExistingPartnerDialog } from "./ExistingPartnerDialog";
import {
  DEFAULT_ONBOARDING_VALUES,
  onboardingSchema,
  RESTAURANT_FIELDS,
  type OnboardingFormValues,
} from "../lib/onboarding";

const STEPS: OnboardingStep[] = [
  { id: "email", label: "Email" },
  { id: "account", label: "Account" },
  { id: "restaurant", label: "Restaurant" },
];

const resolver = zodResolver(
  onboardingSchema,
) as unknown as Resolver<OnboardingFormValues>;

export function OnboardingWizard() {
  const navigate = useNavigate();
  const flow = useRestaurantOnboardingFlow();
  const initialEmail = useRestaurantOnboardingStore((state) => state.email);
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [passwordError, setPasswordError] = useState<string>();

  const form = useForm<OnboardingFormValues>({
    resolver,
    defaultValues: { ...DEFAULT_ONBOARDING_VALUES, email: initialEmail },
    mode: "onBlur",
  });

  useEffect(() => {
    const user = flow.currentUser;
    if (!user) return;
    form.setValue("email", user.email);
    form.setValue("firstName", user.firstName);
    form.setValue("lastName", user.lastName);
    form.setValue("phone", user.phone ?? "");
  }, [flow.currentUser, form.setValue]);

  useEffect(() => {
    if (flow.completedRestaurant) {
      navigate("/restaurant/dashboard", { replace: true });
    }
  }, [flow.completedRestaurant, navigate]);

  const stepIndex =
    flow.stage === "email" ? 0 : flow.stage === "restaurant" ? 2 : 1;
  const ownerMode =
    flow.stage === "email" ? "email" : flow.accountExists ? "existing" : "new";

  async function handleContinue() {
    flow.setError(undefined);

    if (flow.stage === "email") {
      if (await form.trigger("email")) {
        await flow.checkEmail(form.getValues("email").trim());
      }
      return;
    }

    if (flow.stage === "account") {
      setPasswordError(undefined);
      if (password.length < 8) {
        setPasswordError("Use at least 8 characters for your password.");
        return;
      }

      const values = form.getValues();
      if (!flow.accountExists) {
        const missing = [
          ["firstName", values.firstName?.trim(), "Enter your first name."],
          ["lastName", values.lastName?.trim(), "Enter your last name."],
          ["phone", values.phone?.trim(), "Enter your phone number."],
        ] as const;
        let hasMissing = false;
        for (const [field, value, message] of missing) {
          if (!value) {
            form.setError(field, { type: "required", message });
            hasMissing = true;
          }
        }
        if (hasMissing) return;
      }

      await flow.authenticate(
        {
          firstName: values.firstName?.trim() ?? "",
          lastName: values.lastName?.trim() ?? "",
          phone: values.phone?.trim() ?? "",
        },
        password,
      );
      return;
    }

    if (flow.stage === "verify") {
      if (!/^\d{6}$/.test(verificationCode)) {
        flow.setError("Enter the six-digit verification code.");
        return;
      }
      await flow.verifyEmail(verificationCode);
      return;
    }

    if (await form.trigger(RESTAURANT_FIELDS)) {
      const values = form.getValues();
      await flow.submitRestaurant({
        restaurantName: values.restaurantName,
        cuisineType: values.cuisineType,
        description: values.description,
        address: values.address,
        city: values.city,
      });
    }
  }

  if (flow.isCheckingSession) {
    return (
      <Card>
        <CardContent className="p-8 flex flex-col gap-8 items-center text-center text-muted-foreground">
          <span className="loader"></span>
          Checking your account…
        </CardContent>
      </Card>
    );
  }

  if (flow.completedRestaurant) {
    return (
      <Card>
        <CardContent className="space-y-3 p-8 text-center">
          <h1 className="text-2xl font-semibold">Application submitted</h1>
          <p className="text-muted-foreground">
            {flow.completedRestaurant} is linked to your account and is awaiting
            review.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <OnboardingStepper steps={STEPS} currentStep={stepIndex} />
      <Card className="mt-8">
        <CardContent className="pt-6">
          <FormProvider {...form}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleContinue();
              }}
              className="space-y-8"
            >
              {(flow.stage === "email" || flow.stage === "account") && (
                <OwnerSection
                  mode={ownerMode}
                  password={password}
                  passwordError={passwordError}
                  onPasswordChange={setPassword}
                />
              )}

              {flow.stage === "verify" && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold">Verify your email</h2>
                    <p className="text-sm text-muted-foreground">
                      Enter the six-digit verification code for {flow.email}{" "}
                      before continuing.
                    </p>
                  </div>
                  {flow.verificationNotice && (
                    <p
                      role="status"
                      className="rounded-md bg-muted p-3 text-sm text-muted-foreground"
                    >
                      {flow.verificationNotice}
                    </p>
                  )}
                  <TextField
                    label="Verification code"
                    value={verificationCode}
                    onChange={(event) =>
                      setVerificationCode(
                        event.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                  />
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => void flow.resendCode()}
                    disabled={flow.isSubmitting}
                  >
                    Resend code
                  </Button>
                </div>
              )}

              {flow.stage === "restaurant" && <RestaurantDetailsSection />}

              {flow.error && (
                <div
                  role="alert"
                  className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm"
                >
                  {flow.error}
                </div>
              )}

              <div className="flex justify-between border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    flow.setError(undefined);
                    flow.cancelExistingAccount();
                  }}
                  disabled={
                    flow.isSubmitting ||
                    flow.stage === "email" ||
                    flow.stage === "verify" ||
                    flow.stage === "restaurant"
                  }
                >
                  Back
                </Button>
                <Button type="submit" disabled={flow.isSubmitting}>
                  {flow.isSubmitting
                    ? "Please wait…"
                    : flow.stage === "email"
                      ? "Continue"
                      : flow.stage === "account"
                        ? flow.accountExists
                          ? "Sign in"
                          : "Create account"
                        : flow.stage === "verify"
                          ? "Verify email"
                          : "Submit restaurant"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>

      <ExistingPartnerDialog
        open={flow.existingPartnerDialogOpen}
        email={flow.email}
        partner={flow.partner}
        onContinue={flow.continueWithExistingAccount}
        onCancel={flow.cancelExistingAccount}
      />
    </div>
  );
}
