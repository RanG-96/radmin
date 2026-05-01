import { forwardRef, type InputHTMLAttributes } from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    return (
      <div className="grid gap-1.5">
        {label && (
          <LabelPrimitive.Root htmlFor={id} className="text-sm font-medium text-[var(--color-text)]">
            {label}
          </LabelPrimitive.Root>
        )}
        <input
          ref={ref}
          id={id}
          className={`h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-1 ${error ? 'border-[var(--color-error)]' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
