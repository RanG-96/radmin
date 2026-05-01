import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

function Checkbox({ className = '', ...props }: CheckboxPrimitive.CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      className={`flex h-5 w-5 items-center justify-center rounded border border-[var(--color-border)] bg-transparent transition-colors hover:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-1 data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)] data-[state=checked]:text-white ${className}`}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

interface FormCheckboxProps {
  label?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

function FormCheckbox({ label, id, ...props }: FormCheckboxProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm cursor-pointer">
      <Checkbox id={id} {...props} />
      {label}
    </label>
  );
}

export { Checkbox, FormCheckbox };
export type { FormCheckboxProps };
