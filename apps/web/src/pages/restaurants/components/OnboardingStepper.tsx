import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type OnboardingStep = { id: string; label: string };

type Props = {
  steps: OnboardingStep[];
  currentStep: number; // 0-indexed
};

export function OnboardingStepper({ steps, currentStep }: Props) {
  return (
    <ol className="flex w-full items-start">
      {steps.map((step, index) => {
        const isDone = index < currentStep;
        const isActive = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <li key={step.id} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  isDone && "border-primary bg-primary text-primary-foreground",
                  isActive && "border-primary text-primary",
                  !isDone && !isActive && "border-border text-muted-foreground",
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "h-0.5 flex-1 transition-colors",
                    isDone ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                "mt-2 text-center text-xs font-medium",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
