import { forwardRef, type InputHTMLAttributes } from 'react';
import { FormField } from './FormField';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  description?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, description, id, required, ...props }, ref) => {
    return (
      <FormField
        label={label}
        htmlFor={id}
        hint={description}
        error={error}
        required={required}
      >
        <input
          ref={ref}
          id={id}
          required={required}
          className={`h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-1 ${error ? 'border-[var(--color-error)]' : ''} ${className}`}
          {...props}
        />
      </FormField>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
