import * as AvatarPrimitive from '@radix-ui/react-avatar';

function Avatar({ className = '', ...props }: AvatarPrimitive.AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
      {...props}
    />
  );
}

function AvatarImage({ className = '', ...props }: AvatarPrimitive.AvatarImageProps) {
  return <AvatarPrimitive.Image className={`aspect-square h-full w-full ${className}`} {...props} />;
}

function AvatarFallback({ className = '', ...props }: AvatarPrimitive.AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      className={`flex h-full w-full items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-sm font-medium text-[var(--color-primary)] ${className}`}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
