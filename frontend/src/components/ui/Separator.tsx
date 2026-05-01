import * as SeparatorPrimitive from '@radix-ui/react-separator';

function Separator({ className = '', orientation = 'horizontal', decorative = true, ...props }: SeparatorPrimitive.SeparatorProps) {
  return (
    <SeparatorPrimitive.Root
      decorative={decorative}
      orientation={orientation}
      className={`shrink-0 bg-[var(--color-border)] ${
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px'
      } ${className}`}
      {...props}
    />
  );
}

export { Separator };
