import type { ReactNode } from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';

interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: FormFieldProps) {
  return (
    <div className="grid gap-1.5">
      {label && (
        <LabelPrimitive.Root
          htmlFor={htmlFor}
          className="text-sm font-medium text-[var(--color-text)]"
        >
          {label}
          {required && <span className="ml-1 text-[var(--color-error)]">*</span>}
        </LabelPrimitive.Root>
      )}
      {children}
      {hint && !error && <p className="text-xs text-[var(--color-text-secondary)]">{hint}</p>}
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
    </div>
  );
}
