import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CircleAlert } from "lucide-react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string | boolean;
  containerClassName?: string;
};

export const TextField = React.forwardRef<HTMLInputElement, Props>(
  (
    {
      id,
      label,
      hint,
      error,
      className,
      containerClassName,
      required,
      ...inputProps
    },
    ref,
  ) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const helpId = `${inputId}-help`;
    const errorId = `${inputId}-error`;
    const hasError = !!error;
    const isFileInput = inputProps.type === "file";

    return (
      <div className={cn("w-full", containerClassName)}>
        {label ? (
          <Label htmlFor={inputId} className="mb-2 block text-sm font-normal">
            {label}
            {required ? <span className="ml-0.5 text-red-600">*</span> : null}
          </Label>
        ) : null}

        <div className="relative">
          <input
            {...inputProps}
            id={inputId}
            ref={ref}
            aria-invalid={hasError || undefined}
            aria-describedby={cn(
              hint ? helpId : undefined,
              hasError ? errorId : undefined,
            )}
            className={cn(
              "w-full text-sm rounded-md border px-3 h-11",

              // File input styles
              isFileInput && [
                "cursor-pointer",
                "file:mr-3",
                "file:h-full",
                "file:border-0",
                "file:border-r",
                "file:px-3",
                "file:bg-muted",
                "file:text-sm",
                "file:font-medium",
                "file:text-foreground",
                "file:cursor-pointer",
              ],

              // Error styles
              hasError && [
                "border-red-300",
                "bg-red-50",
                "text-red-900",
                "placeholder:text-red-400",
                "focus-visible:ring-red-500",
                "focus-visible:border-red-500",
              ],

              // Only add right padding when showing the error icon
              hasError && !isFileInput ? "pr-10" : undefined,

              className,
            )}
          />

          {hasError && !isFileInput && (
            <CircleAlert
              aria-hidden
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500"
            />
          )}
        </div>

        {hasError && typeof error === "string" ? (
          <p id={errorId} role="alert" className="mt-1 text-xs text-red-600">
            {error}
          </p>
        ) : hint ? (
          <p id={helpId} className="mt-2 text-xs text-slate-500">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

TextField.displayName = "TextField";
