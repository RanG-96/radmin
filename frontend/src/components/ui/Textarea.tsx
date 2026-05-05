import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { FormField } from './FormField';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | null;
  description?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, description, id, required, ...props }, ref) => {
    return (
      <FormField
        label={label}
        htmlFor={id}
        hint={description}
        error={error}
        required={required}
      >
        <textarea
          ref={ref}
          id={id}
          required={required}
          className={`min-h-[96px] w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-1 ${error ? 'border-[var(--color-error)]' : ''} ${className}`}
          {...props}
        />
      </FormField>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
export type { TextareaProps };
