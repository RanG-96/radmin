import * as SelectPrimitive from '@radix-ui/react-select';
import * as LabelPrimitive from '@radix-ui/react-label';

function Select({ children, ...props }: SelectPrimitive.SelectProps) {
  return <SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>;
}

function SelectTrigger({ className = '', children, ...props }: SelectPrimitive.SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      className={`flex h-10 w-full items-center justify-between rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-1 data-[placeholder]:text-[var(--color-text-secondary)] ${className}`}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({ className = '', children, position = 'popper', ...props }: SelectPrimitive.SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={`z-50 max-h-60 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] shadow-md data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1 ${className}`}
        position={position}
        sideOffset={4}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({ className = '', children, ...props }: SelectPrimitive.SelectItemProps) {
  return (
    <SelectPrimitive.Item
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-[var(--color-bg-secondary)] focus:bg-[var(--color-bg-secondary)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2 flex items-center">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectLabel({ className = '', ...props }: SelectPrimitive.SelectLabelProps) {
  return <SelectPrimitive.Label className={`px-2 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] ${className}`} {...props} />;
}

function SelectSeparator({ className = '', ...props }: SelectPrimitive.SelectSeparatorProps) {
  return <SelectPrimitive.Separator className={`-mx-1 my-1 h-px bg-[var(--color-border)] ${className}`} {...props} />;
}

function SelectGroup({ ...props }: SelectPrimitive.SelectGroupProps) {
  return <SelectPrimitive.Group {...props} />;
}

interface FormSelectProps {
  label?: string;
  error?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  id?: string;
}

function FormSelect({ label, error, placeholder = 'Select...', options, value, onValueChange, disabled, id }: FormSelectProps) {
  return (
    <div className="grid gap-1.5">
      {label && (
        <LabelPrimitive.Root htmlFor={id} className="text-sm font-medium text-[var(--color-text)]">
          {label}
        </LabelPrimitive.Root>
      )}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={id} className={error ? 'border-[var(--color-error)]' : ''}>
          <SelectPrimitive.Value placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
    </div>
  );
}

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectGroup,
  FormSelect,
};
export type { FormSelectProps };
