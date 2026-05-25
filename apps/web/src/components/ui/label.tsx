import { cn } from '@/lib/utils';
import type { LabelHTMLAttributes } from 'react';

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: wrapper generico — htmlFor e definido por quem usa.
    <label
      className={cn(
        'text-xs font-medium uppercase tracking-wider text-steel-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    />
  );
}
