import * as React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CircleAlert } from "lucide-react";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  /** pass a string to show an error message; truthy boolean shows only styles */
  error?: string | boolean;
  containerClassName?: string;
  /** show "x / maxLength" in the bottom-right if maxLength is provided */
  showCounter?: boolean;
  /** auto-resize on input (grows up to maxRows if provided) */
  autoResize?: boolean;
  maxRows?: number;
};
// components/shared/textarea-field.tsx (only the changed bits)

export const TextareaField = React.forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      id,
      label,
      hint,
      error,
      className,
      containerClassName,
      required,
      showCounter = false,
      autoResize = false,
      maxRows,
      onInput,
      maxLength,
      ...props
    },
    ref,
  ) => {
    const textareaId = id ?? React.useId();
    const helpId = `${textareaId}-help`;
    const errorId = `${textareaId}-error`;
    const hasError = !!error;

    const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

    // Compose refs: ensure RHF's register(ref) sees the DOM node
    const setRefs = (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
          node;
    };

    const handleInput: React.InputEventHandler<HTMLTextAreaElement> = (e) => {
      if (autoResize && innerRef.current) {
        const el = innerRef.current;
        el.style.height = "0px";
        el.style.height = `${Math.min(
          el.scrollHeight,
          maxRows ? maxRows * 24 + 22 : Number.POSITIVE_INFINITY,
        )}px`;
      }
      onInput?.(e);
    };

    const length =
      typeof props.value === "string"
        ? props.value.length
        : typeof props.defaultValue === "string"
          ? props.defaultValue.length
          : 0;

    return (
      <div className={cn("w-full", containerClassName)}>
        {label ? (
          <Label
            htmlFor={textareaId}
            className="mb-2 block text-sm font-normal text-slate-700"
          >
            {label}
            {required ? <span className="ml-0.5 text-red-600">*</span> : null}
          </Label>
        ) : null}

        <div className="relative">
          <Textarea
            id={textareaId}
            ref={setRefs}
            aria-invalid={hasError || undefined}
            aria-describedby={cn(
              hint ? helpId : undefined,
              hasError ? errorId : undefined,
            )}
            onInput={handleInput}
            className={cn(
              "px-4 py-2 text-base placeholder:text-[#667085]",
              "focus-visible:ring-2",
              hasError &&
                "border-red-300 bg-red-50 text-red-900 placeholder:text-red-400 focus-visible:ring-red-500 focus-visible:border-red-500",
              (hasError || (showCounter && maxLength)) && "pr-10",
              className,
            )}
            {...props}
          />

          {hasError && (
            <CircleAlert
              aria-hidden
              className="pointer-events-none absolute right-3 top-2 h-4 w-4 text-red-500"
            />
          )}

          {showCounter && maxLength ? (
            <span
              className={cn(
                "pointer-events-none absolute bottom-2 right-3 text-[11px]",
                hasError ? "text-red-700/80" : "text-muted-foreground",
              )}
            >
              {length} / {maxLength}
            </span>
          ) : null}
        </div>

        {hasError && typeof error === "string" ? (
          <p id={errorId} role="alert" className="mt-1 text-sm text-red-600">
            {error}
          </p>
        ) : hint ? (
          <p id={helpId} className="mt-2 text-sm text-slate-500">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

TextareaField.displayName = "TextareaField";
