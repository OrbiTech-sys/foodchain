import { CircleAlert } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "onChange" | "value"> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helpText?: string;
  optional?: boolean;
}

/** Label above, help or error below. Error text replaces help text and is tied to the input for screen readers. */
export function TextField({ id, label, value, onChange, error, helpText, optional, className, required, ...props }: TextFieldProps) {
  const describedBy = error ? `${id}-error` : helpText ? `${id}-help` : undefined;
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="label">
        {label}
        {optional ? <span className="font-normal text-muted"> (optional)</span> : null}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy}
        className="input"
        {...props}
      />
      {/* The slot keeps its height when empty so an appearing error never pushes the form down. */}
      <div className="min-h-6">
        {error ? (
          <p id={`${id}-error`} className="error-text">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {error}
          </p>
        ) : helpText ? (
          <p id={`${id}-help`} className="help">
            {helpText}
          </p>
        ) : null}
      </div>
    </div>
  );
}
