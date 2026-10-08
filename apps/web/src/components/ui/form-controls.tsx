"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Radio({ className, label, ...props }: RadioProps) {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="radio"
        className={cn(
          "w-4 h-4 text-green-600 bg-white border-gray-300 focus:ring-green-500 focus:ring-2",
          className
        )}
        {...props}
      />
      {label && (
        <label className="text-sm font-medium text-gray-900">{label}</label>
      )}
    </div>
  );
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Checkbox({ className, label, ...props }: CheckboxProps) {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        className={cn(
          "w-4 h-4 text-green-600 bg-white border-gray-300 rounded focus:ring-green-500 focus:ring-2",
          className
        )}
        {...props}
      />
      {label && (
        <label className="text-sm font-medium text-gray-900">{label}</label>
      )}
    </div>
  );
}

interface ToggleProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  checked = false,
  onCheckedChange,
  disabled,
  className,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
        checked ? "bg-green-600" : "bg-gray-200",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}
