import { useFormContext } from "react-hook-form";
import type { OnboardingFormValues } from "../lib/onboarding";
import { TextField } from "@/components/custom/TextField";

type OwnerSectionProps = {
  mode: "email" | "existing" | "new";
  password: string;
  passwordError?: string;
  onPasswordChange: (value: string) => void;
};

export function OwnerSection({
  mode,
  password,
  passwordError,
  onPasswordChange,
}: OwnerSectionProps) {
  const { register, formState } = useFormContext<OnboardingFormValues>();
  const { errors } = formState;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">
          {mode === "email" ? "Start with your email" : "Your account"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {mode === "email"
            ? "We’ll check whether you already have an account before continuing."
            : mode === "existing"
              ? "Sign in to attach this restaurant application to your account."
              : "Create your account to submit a restaurant application."}
        </p>
      </div>

      <TextField
        type="email"
        label="Email"
        error={errors.email?.message}
        {...register("email")}
        placeholder="you@example.com"
        disabled={mode !== "email"}
      />

      {mode === "new" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="First name"
              error={errors.firstName?.message}
              {...register("firstName")}
              placeholder="Ada"
              required
            />
            <TextField
              label="Last name"
              error={errors.lastName?.message}
              {...register("lastName")}
              placeholder="Lovelace"
              required
            />
          </div>
          <TextField
            label="Phone number"
            error={errors.phone?.message}
            {...register("phone")}
            placeholder="+234 800 000 0000"
            type="tel"
            required
          />
        </>
      )}

      {mode !== "email" && (
        <div>
          <TextField
            label="Password"
            type="password"
            autoComplete={mode === "new" ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            error={passwordError}
            placeholder={mode === "new" ? "At least 8 characters" : "Your password"}
            required
          />
        </div>
      )}
    </div>
  );
}
