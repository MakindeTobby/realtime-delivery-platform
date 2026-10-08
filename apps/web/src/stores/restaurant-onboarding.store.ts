import { create } from "zustand";
import type { PartnerExistence } from "@/api/auth.api";

export type OnboardingStage = "email" | "account" | "verify" | "restaurant";

type RestaurantOnboardingState = {
  stage: OnboardingStage;
  email: string;
  partner: PartnerExistence | null;
  existingPartnerDialogOpen: boolean;
  setEmail: (email: string) => void;
  setPartnerResult: (result: PartnerExistence) => void;
  continueWithExistingAccount: () => void;
  cancelExistingAccount: () => void;
  setStage: (stage: OnboardingStage) => void;
  reset: () => void;
};

const initialState = {
  stage: "email" as const,
  email: "",
  partner: null,
  existingPartnerDialogOpen: false,
};

export const useRestaurantOnboardingStore = create<RestaurantOnboardingState>()(
  (set) => ({
    ...initialState,
    setEmail: (email) => set({ email }),
    setPartnerResult: (partner) =>
      set({
        partner,
        existingPartnerDialogOpen: partner.exists,
        stage: partner.exists ? "email" : "account",
      }),
    continueWithExistingAccount: () =>
      set({ existingPartnerDialogOpen: false, stage: "account" }),
    cancelExistingAccount: () =>
      set({ partner: null, existingPartnerDialogOpen: false, stage: "email" }),
    setStage: (stage) => set({ stage }),
    reset: () => set(initialState),
  }),
);
